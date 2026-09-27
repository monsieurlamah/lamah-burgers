// Frame store for the fly-through image sequence.
//
// Two tiers keep memory bounded:
//   • compressed blobs (cheap), fetched by priority around the requested frame,
//     biased in the scroll direction, plus sparse keyframes for fast jumps;
//   • decoded ImageBitmaps (expensive), only in a small window around the
//     requested frame. Evicted bitmaps are closed.
// Obsolete fetches are aborted; failed fetches retry a bounded number of times.

export class FrameStore {
  constructor({ count, urlFor, onReady, concurrency = 6, maxBlobs = 360, maxBitmaps = 24, ahead = 24, behind = 6, decodeAhead = 6, decodeBehind = 2, keyframeEvery = 12 }) {
    Object.assign(this, { count, urlFor, onReady, concurrency, maxBlobs, maxBitmaps, ahead, behind, decodeAhead, decodeBehind, keyframeEvery });
    this.blobs = new Map(); // index -> Blob
    this.bitmaps = new Map(); // index -> ImageBitmap
    this.decoding = new Map(); // index -> Promise
    this.inflight = new Map(); // index -> AbortController
    this.failures = new Map(); // index -> attempts
    this.retryAt = new Map(); // index -> timestamp
    this.target = 0;
    this.dir = 1;
    this.wanted = [];
    this.keyframes = [];
    for (let i = 0; i < count; i += keyframeEvery) this.keyframes.push(i);
    if (this.keyframes[this.keyframes.length - 1] !== count - 1) this.keyframes.push(count - 1);
    this.keyset = new Set(this.keyframes);
    this.destroyed = false;
  }

  // Declare the frame the viewer needs now and the scroll direction (+1 / -1).
  request(target, dir) {
    if (this.destroyed) return;
    this.target = target;
    if (dir) this.dir = dir;
    const d = this.dir;
    const list = [target];
    for (let k = 1; k <= Math.max(this.ahead, this.behind); k++) {
      if (k <= this.ahead) list.push(target + d * k);
      if (k <= this.behind) list.push(target - d * k);
    }
    // Keyframes nearest the target first, so a fast jump always has a nearby image.
    const keys = [...this.keyframes].sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    this.wanted = [...list.filter((i) => i >= 0 && i < this.count), ...keys];
    const wantedSet = new Set(this.wanted.slice(0, list.length + 8));

    // Abort fetches that are no longer near the target (keyframes may finish).
    for (const [i, ctrl] of this.inflight) {
      if (!wantedSet.has(i) && !this.keyset.has(i)) {
        ctrl.abort();
        this.inflight.delete(i);
      }
    }
    this.pump();
    this.decodeWindow();
  }

  pump() {
    if (this.destroyed) return;
    const now = performance.now();
    for (const i of this.wanted) {
      if (this.inflight.size >= this.concurrency) break;
      if (this.blobs.has(i) || this.inflight.has(i)) continue;
      if ((this.failures.get(i) || 0) >= 3) continue;
      if ((this.retryAt.get(i) || 0) > now) continue;
      this.fetch(i);
    }
  }

  async fetch(i) {
    const ctrl = new AbortController();
    this.inflight.set(i, ctrl);
    try {
      const res = await fetch(this.urlFor(i), { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (this.destroyed) return;
      this.blobs.set(i, blob);
      this.evictBlobs();
      if (this.inDecodeWindow(i)) this.decode(i);
      else if (!this.bitmaps.size) this.onReady?.(i); // nothing on screen yet: let best() decode it
    } catch (err) {
      if (err.name !== 'AbortError') {
        const n = (this.failures.get(i) || 0) + 1;
        this.failures.set(i, n);
        this.retryAt.set(i, performance.now() + 400 * 2 ** n);
        setTimeout(() => this.pump(), 400 * 2 ** n + 10);
      }
    } finally {
      if (this.inflight.get(i) === ctrl) this.inflight.delete(i);
      this.pump();
    }
  }

  inDecodeWindow(i) {
    const off = (i - this.target) * this.dir;
    return off >= -this.decodeBehind && off <= this.decodeAhead;
  }

  decodeWindow() {
    for (let off = -this.decodeBehind; off <= this.decodeAhead; off++) {
      const i = this.target + off * this.dir;
      if (this.blobs.has(i)) this.decode(i);
    }
  }

  decode(i) {
    if (this.bitmaps.has(i) || this.decoding.has(i)) return;
    const blob = this.blobs.get(i);
    if (!blob) return;
    const p = createImageBitmap(blob)
      .then((bmp) => {
        this.decoding.delete(i);
        if (this.destroyed) return bmp.close();
        this.bitmaps.set(i, bmp);
        this.evictBitmaps();
        if (this.bitmaps.has(i)) this.onReady?.(i);
      })
      .catch(() => {
        this.decoding.delete(i);
        this.blobs.delete(i); // corrupt data: allow a refetch
      });
    this.decoding.set(i, p);
  }

  // Best bitmap to show for `target`: exact, else the nearest decoded frame.
  // If nothing decoded is close, decode the nearest cached blob.
  best(target, maxDistance = 40) {
    if (this.bitmaps.has(target)) return { index: target, bitmap: this.bitmaps.get(target) };
    let bestI = -1;
    let bestD = Infinity;
    for (const i of this.bitmaps.keys()) {
      const d = Math.abs(i - target);
      if (d < bestD) { bestD = d; bestI = i; }
    }
    if (bestD > 2) {
      let blobI = -1;
      let blobD = Infinity;
      for (const i of this.blobs.keys()) {
        const d = Math.abs(i - target);
        if (d < blobD) { blobD = d; blobI = i; }
      }
      if (blobI >= 0 && blobD < bestD) this.decode(blobI);
    }
    if (bestI >= 0 && bestD <= maxDistance) return { index: bestI, bitmap: this.bitmaps.get(bestI) };
    return bestI >= 0 ? { index: bestI, bitmap: this.bitmaps.get(bestI), far: true } : null;
  }

  evictBitmaps() {
    while (this.bitmaps.size > this.maxBitmaps) {
      const far = this.farthest(this.bitmaps.keys());
      this.bitmaps.get(far).close();
      this.bitmaps.delete(far);
    }
  }

  evictBlobs() {
    if (this.blobs.size <= this.maxBlobs) return;
    const candidates = [...this.blobs.keys()].filter((i) => !this.keyset.has(i));
    while (this.blobs.size > this.maxBlobs && candidates.length) {
      const far = this.farthest(candidates);
      candidates.splice(candidates.indexOf(far), 1);
      this.blobs.delete(far);
    }
  }

  farthest(keys) {
    let far = -1;
    let d = -1;
    for (const i of keys) {
      const di = Math.abs(i - this.target);
      if (di > d) { d = di; far = i; }
    }
    return far;
  }

  stats() {
    return { blobs: this.blobs.size, bitmaps: this.bitmaps.size, inflight: this.inflight.size, failed: [...this.failures.values()].filter((n) => n >= 3).length };
  }

  destroy() {
    this.destroyed = true;
    for (const c of this.inflight.values()) c.abort();
    for (const b of this.bitmaps.values()) b.close();
    this.inflight.clear();
    this.bitmaps.clear();
    this.blobs.clear();
  }
}
