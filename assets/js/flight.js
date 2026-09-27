// Fly-through controller: pinned canvas stage driven by native scroll.
// Scroll position → piecewise timeline → frame index → canvas.
// Copy is ordinary HTML layered above the canvas; hidden chapters are inert.

import { buildTimeline, clamp } from './timeline.js';
import { FrameStore } from './frames.js';

export function startFlight({ root, flight, manifest, manifestUrl, mode }) {
  const stage = root.querySelector('.flight__stage');
  const canvas = root.querySelector('.flight__canvas');
  const poster = root.querySelector('.flight__poster');
  const chapterEls = [...root.querySelectorAll('.chapter')];
  const progressBar = root.querySelector('.flight__progress-bar');
  const sceneLabel = root.querySelector('.flight__scene');
  const ctx = canvas.getContext('2d', { alpha: false });

  const hasFrames = Boolean(manifest);
  root.dataset.frames = hasFrames ? 'ready' : 'missing';

  const fps = manifest?.fps ?? 20;
  const frameCount = manifest?.count ?? Math.round(Math.max(...flight.beats.map((b) => b.to)) * fps) + 1;
  const tl = buildTimeline(flight.beats, { fps, frameCount, fadeVh: flight.fadeVh });
  root.style.setProperty('--travel', tl.totalVh);

  if (mode === 'static') {
    setupStatic({ root, chapterEls, manifest, manifestUrl, fps });
    return { timeline: tl, mode };
  }

  let store = null;
  let base = '';
  let source = null;
  if (hasFrames) {
    base = new URL('.', new URL(manifestUrl, location.href)).href;
    source = pickSource(manifest, stage);
    const small = matchMedia('(max-width: 760px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    store = new FrameStore({
      count: manifest.count,
      urlFor: (i) => frameUrl(base, manifest, source, i),
      onReady: () => schedule(),
      maxBitmaps: small ? 14 : 24,
      maxBlobs: small ? 200 : 360,
      concurrency: small ? 4 : 6,
    });
    if (manifest.poster) poster.src = `${base}${manifest.poster}?v=${encodeURIComponent(manifest.version)}`;
  }

  const state = { v: -1, lastV: 0, dir: 1, drawn: -1, w: 0, h: 0, focus: 0.5, raf: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = stage.getBoundingClientRect();
    const w = Math.round(r.width * dpr);
    const h = Math.round(r.height * dpr);
    if (w !== state.w || h !== state.h) {
      state.w = canvas.width = w;
      state.h = canvas.height = h;
      state.drawn = -1; // canvas cleared: force a redraw
    }
    schedule();
  }

  function progressVh() {
    const r = root.getBoundingClientRect();
    const travel = root.offsetHeight - stage.offsetHeight;
    const p = travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
    return p * tl.totalVh;
  }

  function render() {
    state.raf = 0;
    const v = progressVh();
    if (v !== state.lastV) state.dir = v > state.lastV ? 1 : -1;
    state.lastV = v;

    // Copy
    let active = null;
    for (const el of chapterEls) {
      const o = tl.chapterOpacity(el.dataset.chapter, v);
      el.style.opacity = o.toFixed(3);
      el.style.setProperty('--shift', `${((1 - o) * 18).toFixed(1)}px`);
      const hidden = o < 0.05;
      if (hidden !== el.hasAttribute('inert')) {
        el.toggleAttribute('inert', hidden);
        el.setAttribute('aria-hidden', String(hidden));
      }
      if (o > 0.5) active = el;
    }
    const seg = tl.segmentAt(v);
    root.dataset.beat = seg.id;
    root.dataset.chapter = active?.dataset.chapter ?? '';
    if (progressBar) progressBar.style.transform = `scaleX(${(v / tl.totalVh).toFixed(4)})`;
    if (sceneLabel) {
      const label = active?.dataset.scene ?? '';
      if (sceneLabel.textContent !== label) sceneLabel.textContent = label;
    }

    // Frames
    if (!store) return;
    const target = tl.frameAt(v);
    root.dataset.frame = String(target);
    store.request(target, state.dir);
    const focus = tl.focusAt(v);
    const best = store.best(target);
    if (best && (best.index !== state.drawn || Math.abs(focus - state.focus) > 0.002)) {
      draw(best.bitmap, focus);
      state.drawn = best.index;
      state.focus = focus;
      root.dataset.drawn = String(best.index);
      if (!root.classList.contains('is-playing')) root.classList.add('is-playing');
    }
  }

  function draw(bmp, focusX) {
    const { w, h } = state;
    const scale = Math.max(w / bmp.width, h / bmp.height);
    const dw = bmp.width * scale;
    const dh = bmp.height * scale;
    ctx.drawImage(bmp, (w - dw) * focusX, (h - dh) / 2, dw, dh);
  }

  function schedule() {
    if (!state.raf) state.raf = requestAnimationFrame(render);
  }

  // Only work while the stage is near the viewport.
  let near = false;
  const io = new IntersectionObserver(([e]) => {
    near = e.isIntersecting;
    if (near) schedule();
  }, { rootMargin: '100% 0px' });
  io.observe(root);
  addEventListener('scroll', () => near && schedule(), { passive: true });
  new ResizeObserver(resize).observe(stage);
  resize();
  render();

  // Debug hook used by tests: frame and chapter for a given scroll position.
  root.flight = { timeline: tl, store, manifest, progressVh, scrollToVh };
  function scrollToVh(vh) {
    const travel = root.offsetHeight - stage.offsetHeight;
    const top = root.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (vh / tl.totalVh) * travel, behavior: 'instant' });
  }
  return { timeline: tl, mode, scrollToVh };
}

// Reduced-motion / constrained-device fallback: every chapter over a still.
function setupStatic({ root, chapterEls, manifest, manifestUrl, fps }) {
  root.classList.add('flight--static');
  const base = manifest ? new URL('.', new URL(manifestUrl, location.href)).href : '';
  const source = manifest ? pickSource(manifest, root) : null;
  for (const el of chapterEls) {
    el.removeAttribute('inert');
    el.removeAttribute('aria-hidden');
    el.style.opacity = '';
    const still = Number(el.dataset.still || 0);
    if (manifest) {
      const i = clamp(Math.round(still * fps), 0, manifest.count - 1);
      el.style.setProperty('--still', `url("${frameUrl(base, manifest, source, i)}")`);
    }
  }
}

export async function loadManifest(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    const m = await res.json();
    if (!m.count || !m.fps || !m.pattern) return null;
    return m;
  } catch {
    return null;
  }
}

function pickSource(m, el) {
  const sources = (m.sources?.length ? m.sources : [{ dir: '', width: m.width, height: m.height }]).slice().sort((a, b) => a.width - b.width);
  const need = el.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2) * 0.85;
  return sources.find((s) => s.width >= need) ?? sources[sources.length - 1];
}

export function frameUrl(base, m, source, i) {
  const n = i + (m.startNumber ?? 0);
  const name = m.pattern.replace(/%0(\d+)d/, (_, w) => String(n).padStart(Number(w), '0'));
  const dir = source?.dir ? `${source.dir}/` : '';
  return `${base}${dir}${name}?v=${encodeURIComponent(m.version ?? '1')}`;
}
