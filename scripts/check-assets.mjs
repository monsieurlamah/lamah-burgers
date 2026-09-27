// Verifies the frame manifest and every path it references, plus the files
// the site links to. Usage: node scripts/check-assets.mjs [media/frames/manifest.json]
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import content from '../content/site.js';

const root = new URL('..', import.meta.url).pathname;
const manifestPath = process.argv[2] || content.media.manifest;
let errors = 0;
const fail = (m) => { errors++; console.error('✗', m); };
const ok = (m) => console.log('✓', m);

for (const f of ['index.html', 'assets/css/tokens.css', 'assets/css/site.css', 'assets/js/main.js', 'assets/brand/logo-horizontal-dark.svg', 'assets/brand/logo-horizontal-light.svg', 'assets/brand/logo-stacked-dark.svg', 'assets/brand/logo-mark.svg', 'assets/brand/logo-badge.svg']) {
  existsSync(join(root, f)) ? null : fail(`fichier manquant : ${f}`);
}

// Timeline sanity
const beats = content.flight.beats;
const chapters = new Set(content.chapters.map((c) => c.id));
for (const b of beats) {
  if (!(b.vh > 0)) fail(`beat ${b.id} : vh doit être > 0`);
  if (b.to < b.from) fail(`beat ${b.id} : to < from`);
  if (b.chapter && !chapters.has(b.chapter)) fail(`beat ${b.id} : chapitre inconnu « ${b.chapter} »`);
}
for (let i = 1; i < beats.length; i++) if (beats[i].from !== beats[i - 1].to) console.warn(`! beat ${beats[i].id} ne reprend pas où ${beats[i - 1].id} s'arrête (${beats[i - 1].to}s → ${beats[i].from}s)`);
ok(`timeline : ${beats.length} beats, ${beats.reduce((s, b) => s + b.vh, 0).toFixed(1)} hauteurs d'écran de défilement épinglé`);

const mPath = join(root, manifestPath);
if (!existsSync(mPath)) {
  console.warn(`! pas de manifeste (${manifestPath}) — le site affiche le décor provisoire du vol`);
} else {
  const m = JSON.parse(readFileSync(mPath, 'utf8'));
  if (m.status === 'pending') {
    console.warn(`! manifeste en attente (${manifestPath}) — le site affiche le décor provisoire du vol`);
    if (errors) { console.error(`${errors} erreur(s)`); process.exit(1); }
    process.exit(0);
  }
  for (const k of ['version', 'fps', 'count', 'pattern', 'poster']) if (m[k] == null) fail(`manifeste : champ « ${k} » manquant`);
  const dir = dirname(mPath);
  const name = (i) => m.pattern.replace(/%0(\d+)d/, (_, w) => String(i + (m.startNumber ?? 0)).padStart(Number(w), '0'));
  const sources = m.sources?.length ? m.sources : [{ dir: '' }];
  for (const s of sources) {
    let missing = 0; let bytes = 0;
    for (let i = 0; i < m.count; i++) {
      const f = join(dir, s.dir || '', name(i));
      if (!existsSync(f)) missing++; else bytes += statSync(f).size;
    }
    missing ? fail(`${s.dir || '.'} : ${missing} images manquantes sur ${m.count}`) : ok(`${s.dir || '.'} : ${m.count} images, ${(bytes / 1048576).toFixed(1)} Mo (moy. ${(bytes / m.count / 1024).toFixed(0)} Ko)`);
    if (existsSync(join(dir, s.dir || '', name(m.count)))) fail(`${s.dir || '.'} : images au-delà de count=${m.count}`);
  }
  existsSync(join(dir, m.poster)) ? ok(`poster : ${m.poster}`) : fail(`poster manquant : ${m.poster}`);
  const maxT = Math.max(...beats.map((b) => b.to));
  const dur = m.count / m.fps;
  if (maxT > dur + 0.05) fail(`la timeline va jusqu'à ${maxT}s mais le film dure ${dur.toFixed(2)}s`);
  else ok(`durée du film ${dur.toFixed(2)}s ≥ fin de timeline ${maxT}s`);
  for (const c of content.chapters) if (c.still > dur) fail(`chapitre ${c.id} : still ${c.still}s hors du film`);
}
if (errors) { console.error(`${errors} erreur(s)`); process.exit(1); }
