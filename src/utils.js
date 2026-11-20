// ── Small shared helpers ────────────────────────────────────────────────────

// deterministic RNG (mulberry32) so the level layout is identical every run
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class R {
  constructor(seed) { this.f = mulberry32(seed) }
  next() { return this.f() }
  range(a, b) { return a + this.f() * (b - a) }
  int(a, b) { return Math.floor(this.range(a, b + 1)) }
  pick(arr) { return arr[Math.floor(this.f() * arr.length)] }
  chance(p) { return this.f() < p }
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t

export function hexLerp(c1, c2, t) {
  const r = Math.round(lerp((c1 >> 16) & 255, (c2 >> 16) & 255, t))
  const g = Math.round(lerp((c1 >> 8) & 255, (c2 >> 8) & 255, t))
  const b = Math.round(lerp(c1 & 255, c2 & 255, t))
  return (r << 16) | (g << 8) | b
}

export function hexToString(c) { return '#' + c.toString(16).padStart(6, '0') }

export function dist2(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by
  return dx * dx + dy * dy
}
