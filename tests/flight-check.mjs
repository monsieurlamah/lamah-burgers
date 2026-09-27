// Browser check of the fly-through at desktop and phone sizes.
// Usage: node tests/flight-check.mjs [baseUrl] [--frames=dev]
// Needs Playwright (npm i -D playwright, or a global install) and a running server
// (npm start). Screenshots land in tests/screenshots/.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import content from '../content/site.js';

let pw;
try { pw = await import('playwright'); } catch { pw = createRequire(`${execSync('npm root -g').toString().trim()}/`)('playwright'); }
const { chromium } = pw;

const base = process.argv.find((a) => a.startsWith('http')) || 'http://localhost:8080/';
const framesArg = process.argv.find((a) => a.startsWith('--frames='))?.split('=')[1];
const query = framesArg ? `?frames=${framesArg}&motion=full` : '?motion=full';
const shots = new URL('./screenshots/', import.meta.url).pathname;
mkdirSync(shots, { recursive: true });

const viewports = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
];

let failures = 0;
const check = (cond, msg) => { if (!cond) { failures++; console.error('  ✗', msg); } };

const browser = await chromium.launch();
for (const vp of viewports) {
  console.log(`\n── ${vp.name} ${vp.viewport.width}×${vp.viewport.height}`);
  const page = await browser.newPage({ ...vp });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(base + query, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
  const framesState = await page.$eval('#vol', (el) => el.dataset.frames);
  console.log(`  frames: ${framesState}`);

  // Rest state: first chapter visible without scrolling.
  const rest = await page.$eval('.chapter', (el) => ({ o: +getComputedStyle(el).opacity, inert: el.hasAttribute('inert') }));
  check(rest.o > 0.99 && !rest.inert, 'premier chapitre visible au repos');
  await page.screenshot({ path: `${shots}${vp.name}-00-rest.png` });

  // Every beat: start / middle / end reach the intended frame and chapter.
  let beatIdx = 0;
  for (const b of content.flight.beats) {
    beatIdx++;
    for (const [label, t] of [['start', 0.02], ['mid', 0.5], ['end', 0.98]]) {
      const res = await page.evaluate(async ({ id, t }) => {
        const root = document.querySelector('#vol');
        const seg = root.flight.timeline.segments.find((s) => s.id === id);
        root.flight.scrollToVh(seg.startVh + seg.vh * t);
        const t0 = performance.now();
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        while (root.dataset.frames === 'ready' && root.dataset.drawn !== root.dataset.frame && performance.now() - t0 < 4000) await new Promise((r) => setTimeout(r, 30));
        const visible = [...root.querySelectorAll('.chapter')].filter((c) => +c.style.opacity > 0.5 && !c.hasAttribute('inert')).map((c) => c.dataset.chapter);
        return { beat: root.dataset.beat, frame: +root.dataset.frame, drawn: +root.dataset.drawn, visible, ms: Math.round(performance.now() - t0), expected: Math.round((seg.from + (seg.to - seg.from) * t) * root.flight.manifest?.fps || 0) };
      }, { id: b.id, t });
      check(res.beat === b.id, `${b.id}/${label}: beat actif ${res.beat}`);
      if (framesState === 'ready') {
        check(res.drawn === res.frame, `${b.id}/${label}: image ${res.frame} affichée (affichée : ${res.drawn}, ${res.ms} ms)`);
        check(Math.abs(res.frame - res.expected) <= 1, `${b.id}/${label}: image ${res.frame} ≈ attendue ${res.expected}`);
      }
      if (label === 'mid') {
        const want = b.chapter ? [b.chapter] : [];
        check(JSON.stringify(res.visible) === JSON.stringify(want), `${b.id}: chapitre visible ${JSON.stringify(res.visible)} ≠ ${JSON.stringify(want)}`);
        await page.screenshot({ path: `${shots}${vp.name}-${String(beatIdx).padStart(2, '0')}-${b.id}.png` });
        console.log(`  ${b.id.padEnd(14)} image ${String(res.frame).padStart(3)} · texte ${res.visible.join(',') || '—'} · ${res.ms} ms`);
      }
    }
  }

  // Final hold: bottom of the pinned travel keeps the last chapter and frame.
  const end = await page.evaluate(() => { const r = document.querySelector('#vol'); r.flight.scrollToVh(r.flight.timeline.totalVh); return new Promise((ok) => setTimeout(() => ok({ beat: r.dataset.beat, chapter: r.dataset.chapter }), 300)); });
  check(end.chapter === content.chapters.at(-1).id, `fin : chapitre ${end.chapter}`);

  // Ordinary wheel scrolling forwards then backwards through the whole flight.
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  const lag = [];
  const travel = await page.evaluate(() => { const r = document.querySelector('#vol'); return r.offsetHeight - r.querySelector('.flight__stage').offsetHeight; });
  const step = 120;
  for (const dir of [1, -1]) {
    for (let y = 0; y < travel; y += step) {
      if (vp.isMobile) await page.evaluate((d) => scrollBy(0, d), step * dir); else await page.mouse.wheel(0, step * dir);
      await page.waitForTimeout(16);
      lag.push(await page.$eval('#vol', (r) => Math.abs((+r.dataset.frame || 0) - (+r.dataset.drawn || 0))));
    }
  }
  if (framesState === 'ready') {
    const sorted = lag.slice().sort((a, b) => a - b);
    console.log(`  défilement molette aller-retour : écart image demandée/affichée médian ${sorted[Math.floor(sorted.length / 2)]}, p95 ${sorted[Math.floor(sorted.length * 0.95)]}, max ${sorted.at(-1)}`);
  }
  const back = await page.$eval('#vol', (r) => r.dataset.beat);
  check(back === content.flight.beats[0].id, `retour en haut : beat ${back}`);

  // No horizontal scroll anywhere on the page.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `pas de défilement horizontal (débord ${overflow}px)`);

  // Keyboard: Tab never lands inside a hidden chapter.
  await page.evaluate(() => scrollTo(0, 0));
  let badFocus = 0;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    badFocus += await page.evaluate(() => (document.activeElement?.closest('.chapter[inert]') ? 1 : 0));
  }
  check(badFocus === 0, 'focus clavier hors des chapitres masqués');

  // Header legibility over light sections.
  await page.evaluate(() => document.querySelector('#menu').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(250);
  const over = await page.$eval('.site-header', (h) => h.dataset.over);
  check(over === 'light', `en-tête en mode clair sur la carte (${over})`);
  await page.screenshot({ path: `${shots}${vp.name}-menu.png` });
  await page.screenshot({ path: `${shots}${vp.name}-full.png`, fullPage: false });

  // Skip link jumps past the flight.
  await page.evaluate(() => scrollTo(0, 0));
  await page.click('.flight__skip');
  await page.waitForTimeout(150);
  const afterSkip = await page.evaluate(() => Math.abs(document.querySelector('#menu').getBoundingClientRect().top) < 120);
  check(afterSkip, 'le lien « Passer la visite » mène à la carte');

  // Demo form never pretends to send.
  await page.fill('#f-name', 'Test');
  await page.fill('#f-phone', '600000000');
  await page.fill('#f-date', new Date(Date.now() + 864e5).toISOString().slice(0, 10));
  await page.click('.form button[type="submit"]');
  const status = await page.$eval('.form__status', (s) => s.textContent);
  check(content.contact.formEndpoint || /démonstration/i.test(status), `formulaire en mode démo : « ${status} »`);

  check(errors.length === 0, `erreurs console : ${errors.join(' | ')}`);
  await page.close();

  // Reduced motion fallback: chapters stacked over stills, no pinned travel.
  const rm = await browser.newPage({ ...vp, reducedMotion: 'reduce' });
  await rm.goto(base + (framesArg ? `?frames=${framesArg}` : ''), { waitUntil: 'networkidle' });
  await rm.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
  const stat = await rm.evaluate(() => ({ mode: document.documentElement.dataset.motion, visible: [...document.querySelectorAll('.chapter')].every((c) => getComputedStyle(c).opacity === '1' && !c.hasAttribute('inert')) }));
  check(stat.mode === 'static' && stat.visible, `mouvement réduit : tous les chapitres visibles (${JSON.stringify(stat)})`);
  await rm.screenshot({ path: `${shots}${vp.name}-reduced-motion.png`, fullPage: true });
  await rm.close();
}
await browser.close();
console.log(failures ? `\n${failures} échec(s)` : '\n✓ tous les contrôles passent');
process.exit(failures ? 1 : 0);
