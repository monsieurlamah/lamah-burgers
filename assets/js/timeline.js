// Piecewise scroll timeline: each beat maps its own scroll interval (in viewport
// heights) to its own interval of the master clip (in seconds). A beat whose
// `from` equals `to` is a hold on a single frame. Pure functions, no DOM.

export function buildTimeline(beats, { fps, frameCount, fadeVh = 0.3 }) {
  let acc = 0;
  const segments = beats.map((b) => {
    const seg = { ...b, startVh: acc, endVh: acc + b.vh };
    acc += b.vh;
    return seg;
  });
  const totalVh = acc;

  // Consecutive beats carrying the same chapter form one chapter span.
  const spans = [];
  for (const s of segments) {
    const last = spans[spans.length - 1];
    if (s.chapter && last && last.chapter === s.chapter && last.endVh === s.startVh) last.endVh = s.endVh;
    else if (s.chapter) spans.push({ chapter: s.chapter, startVh: s.startVh, endVh: s.endVh });
  }
  const firstChapter = spans[0]?.chapter;
  const lastChapter = spans[spans.length - 1]?.chapter;

  function segmentAt(v) {
    if (v <= 0) return segments[0];
    for (const s of segments) if (v < s.endVh) return s;
    return segments[segments.length - 1];
  }

  function timeAt(v) {
    const s = segmentAt(v);
    const t = s.vh > 0 ? clamp((v - s.startVh) / s.vh, 0, 1) : 0;
    return s.from + (s.to - s.from) * t;
  }

  function frameAt(v) {
    return clamp(Math.round(timeAt(v) * fps), 0, frameCount - 1);
  }

  function focusAt(v) {
    const s = segmentAt(v);
    const i = segments.indexOf(s);
    const next = segments[i + 1];
    const a = s.focusX ?? 0.5;
    const b = next?.focusX ?? a;
    const t = s.vh > 0 ? clamp((v - s.startVh) / s.vh, 0, 1) : 0;
    return a + (b - a) * smooth(t);
  }

  // Opacity of a chapter at scroll position v. The first chapter is fully
  // visible at rest; the last one holds at the end.
  function chapterOpacity(id, v) {
    let best = 0;
    for (const sp of spans) {
      if (sp.chapter !== id) continue;
      const len = sp.endVh - sp.startVh;
      const fade = Math.min(fadeVh, len / 3);
      const fadeIn = sp.chapter === firstChapter && sp.startVh === 0 ? 1 : ramp(v, sp.startVh, sp.startVh + fade);
      const fadeOut = sp.chapter === lastChapter && sp.endVh === totalVh ? 1 : 1 - ramp(v, sp.endVh - fade, sp.endVh);
      best = Math.max(best, Math.min(fadeIn, fadeOut));
    }
    return best;
  }

  // Start of a chapter in viewport heights (for "jump to scene" links).
  function chapterStart(id) {
    return spans.find((sp) => sp.chapter === id)?.startVh ?? 0;
  }

  return { totalVh, segments, spans, segmentAt, timeAt, frameAt, focusAt, chapterOpacity, chapterStart };
}

export function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function ramp(v, a, b) {
  if (b <= a) return v >= b ? 1 : 0;
  return smooth(clamp((v - a) / (b - a), 0, 1));
}
