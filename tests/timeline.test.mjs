// Unit checks for the piecewise scroll timeline: node tests/timeline.test.mjs
import assert from 'node:assert/strict';
import { buildTimeline } from '../assets/js/timeline.js';
import content from '../content/site.js';

const fps = 20;
const beats = content.flight.beats;
const end = Math.max(...beats.map((b) => b.to));
const tl = buildTimeline(beats, { fps, frameCount: Math.round(end * fps) + 1, fadeVh: content.flight.fadeVh });

// Every beat reaches its intended frames at its edges.
for (const s of tl.segments) {
  assert.equal(tl.frameAt(s.startVh + 1e-9), Math.round(s.from * fps), `${s.id} start`);
  assert.equal(tl.frameAt(s.endVh - 1e-9), Math.round(s.to * fps), `${s.id} end`);
  if (s.from === s.to) assert.equal(tl.frameAt((s.startVh + s.endVh) / 2), Math.round(s.from * fps), `${s.id} hold`);
}
// Monotonic: scrolling forward never goes back in the clip.
let prev = -1;
for (let v = 0; v <= tl.totalVh; v += 0.01) { const f = tl.frameAt(v); assert.ok(f >= prev, `monotonic at ${v}`); prev = f; }
assert.equal(tl.frameAt(tl.totalVh), Math.round(end * fps), 'final frame');

// First chapter visible at rest, last holds at the end, one chapter at a time.
const first = content.chapters[0].id;
const last = content.chapters[content.chapters.length - 1].id;
assert.equal(tl.chapterOpacity(first, 0), 1, 'first chapter at rest');
assert.equal(tl.chapterOpacity(last, tl.totalVh), 1, 'last chapter holds');
for (let v = 0; v <= tl.totalVh; v += 0.02) {
  const visible = content.chapters.filter((c) => tl.chapterOpacity(c.id, v) > 0.5);
  assert.ok(visible.length <= 1, `overlap at ${v.toFixed(2)}vh: ${visible.map((c) => c.id)}`);
}
// Transition beats carry no copy.
for (const s of tl.segments.filter((s) => !s.chapter)) {
  const mid = (s.startVh + s.endVh) / 2;
  for (const c of content.chapters) assert.ok(tl.chapterOpacity(c.id, mid) === 0, `${c.id} hidden during ${s.id}`);
}
// Each chapter reaches full opacity during its span.
for (const sp of tl.spans) assert.equal(tl.chapterOpacity(sp.chapter, (sp.startVh + sp.endVh) / 2), 1, `${sp.chapter} full`);

console.log(`✓ timeline OK — ${tl.segments.length} beats, ${tl.totalVh.toFixed(1)} vh, ${tl.spans.length} chapitres`);
