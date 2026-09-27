// Builds the Lamah Burger vector logo masters (outlined type, no font dependency).
// Usage: node design/logo/build-logo.cjs <fonts-dir>
// Fonts (Google Fonts, OFL): Bricolage Grotesque 800 condensed opsz 96, Instrument Serif Italic.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const fontsDir = process.argv[2];
const out = path.resolve(__dirname, '../../assets/brand');
const load = (f) => { const b = fs.readFileSync(path.join(fontsDir, f)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const display = load('bric-800-cond-96.ttf');
const serif = load('instr-serif-italic.ttf');

const C = { gold: '#F1A51F', ember: '#C8401E', ink: '#14100D', cream: '#F6EEDF' };

// The mark: a stacked burger reduced to three shapes (bun, patty, base) + three seeds.
function mark(x, y, s, { bun = C.gold, patty = C.ember, seed = C.ink } = {}) {
  const k = s / 120;
  const t = (px, py) => `${(x + px * k).toFixed(2)} ${(y + py * k).toFixed(2)}`;
  const bunPath = `M${t(12, 56)} C${t(12, 28)} ${t(34, 12)} ${t(60, 12)} C${t(86, 12)} ${t(108, 28)} ${t(108, 56)} C${t(108, 59)} ${t(106, 61)} ${t(103, 61)} L${t(17, 61)} C${t(14, 61)} ${t(12, 59)} ${t(12, 56)} Z`;
  const seeds = [[42, 32, -28], [60, 24, 0], [78, 32, 28]].map(([cx, cy, r]) =>
    `<ellipse cx="${(x + cx * k).toFixed(2)}" cy="${(y + cy * k).toFixed(2)}" rx="${(3.2 * k).toFixed(2)}" ry="${(6 * k).toFixed(2)}" transform="rotate(${r} ${(x + cx * k).toFixed(2)} ${(y + cy * k).toFixed(2)})" fill="${seed}"/>`).join('');
  const pattyRect = `<rect x="${(x + 6 * k).toFixed(2)}" y="${(y + 67 * k).toFixed(2)}" width="${(108 * k).toFixed(2)}" height="${(17 * k).toFixed(2)}" rx="${(8.5 * k).toFixed(2)}" fill="${patty}"/>`;
  const basePath = `M${t(12, 90)} L${t(108, 90)} L${t(108, 97)} C${t(108, 103)} ${t(103, 108)} ${t(97, 108)} L${t(23, 108)} C${t(17, 108)} ${t(12, 103)} ${t(12, 97)} Z`;
  return `<g class="mark"><path d="${bunPath}" fill="${bun}"/>${seeds}${pattyRect}<path d="${basePath}" fill="${bun}"/></g>`;
}

function textPath(font, str, x, baseline, size, fill, tracking = 0) {
  let cursor = x; let d = '';
  const glyphs = [...str].map((ch) => font.charToGlyph(ch));
  glyphs.forEach((g, i) => {
    d += g.getPath(cursor, baseline, size).toPathData(2);
    cursor += g.advanceWidth * (size / font.unitsPerEm) + tracking;
    if (i < glyphs.length - 1) cursor += font.getKerningValue(g, glyphs[i + 1]) * (size / font.unitsPerEm);
  });
  return { d, width: cursor - x - tracking, fill };
}

function capHeight(font, size) { return (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) * size / font.unitsPerEm; }

function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" role="img" aria-labelledby="t"><title id="t">${title}</title>${body}</svg>\n`;
}

function lockups(theme) {
  const word = theme === 'dark' ? C.cream : C.ink; // wordmark colour on dark / light backgrounds
  const accent = theme === 'dark' ? C.gold : C.ember; // gold lacks contrast on cream
  const seed = theme === 'dark' ? C.ink : C.ink;
  const files = {};

  // Horizontal lockup: mark | LAMAH Burger
  {
    const size = 120; const cap = capHeight(display, size);
    const markS = cap * 1.32; const pad = 0;
    const baseline = markS * 0.5 + cap / 2 + 2;
    const mx = pad, my = baseline - cap / 2 - markS / 2 - 2;
    const lam = textPath(display, 'LAMAH', markS + 26, baseline, size, word, 1);
    const bur = textPath(serif, 'Burger', markS + 26 + lam.width + 14, baseline, size * 0.62, accent);
    const w = markS + 26 + lam.width + 14 + bur.width + 4;
    files[`logo-horizontal-${theme}.svg`] = svg(w, markS + 4,
      mark(mx, my + 2, markS, { seed }) + `<path d="${lam.d}" fill="${word}"/><path d="${bur.d}" fill="${accent}"/>`, 'Lamah Burger');
  }
  // Stacked lockup: mark over LAMAH over Burger
  {
    const size = 120; const cap = capHeight(display, size);
    const lam = textPath(display, 'LAMAH', 0, 0, size, word, 1);
    const markS = 150; const w = Math.max(lam.width, markS) + 8;
    const my = 0; const b1 = markS + 30 + cap;
    const lamC = textPath(display, 'LAMAH', (w - lam.width) / 2, b1, size, word, 1);
    const bur0 = textPath(serif, 'Burger', 0, 0, size * 0.62, accent);
    const b2 = b1 + size * 0.62 * 0.95;
    const burC = textPath(serif, 'Burger', (w - bur0.width) / 2, b2, size * 0.62, accent);
    files[`logo-stacked-${theme}.svg`] = svg(w, b2 + 22,
      mark((w - markS) / 2, my, markS, { seed }) + `<path d="${lamC.d}" fill="${word}"/><path d="${burC.d}" fill="${accent}"/>`, 'Lamah Burger');
  }
  return files;
}

const files = { ...lockups('dark'), ...lockups('light') };
files['logo-mark.svg'] = svg(120, 120, mark(0, 0, 120), 'Lamah Burger');
// Mark on an ember roundel for app icons / favicons
files['logo-badge.svg'] = svg(120, 120, `<rect width="120" height="120" rx="28" fill="${C.ink}"/>` + mark(18, 20, 84), 'Lamah Burger');
// Single-colour wordmark for header use (fill=currentColor)
{
  const size = 120; const cap = capHeight(display, size);
  const markS = cap * 1.32; const baseline = markS * 0.5 + cap / 2 + 2;
  const lam = textPath(display, 'LAMAH', markS + 26, baseline, size, 'currentColor', 1);
  const bur = textPath(serif, 'Burger', markS + 26 + lam.width + 14, baseline, size * 0.62, 'currentColor');
  const w = markS + 26 + lam.width + 14 + bur.width + 4;
  files['logo-horizontal-currentcolor.svg'] = svg(w, markS + 4,
    mark(0, 2, markS, { bun: 'currentColor', patty: 'currentColor', seed: 'var(--logo-seed, #14100D)' }).replace('class="mark"', 'class="mark"') +
    `<path d="${lam.d}" fill="currentColor"/><path d="${bur.d}" fill="currentColor"/>`, 'Lamah Burger');
}

fs.mkdirSync(out, { recursive: true });
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(out, name), content);
console.log('wrote', Object.keys(files).join(', '));
