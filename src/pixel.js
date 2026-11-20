// ── Chunky pixel-art renderer ───────────────────────────────────────────────
// Sprites are described as char maps + palettes; each art "pixel" becomes a
// PX×PX block. A deterministic per-pixel brightness jitter adds subtle texture
// (the "modern remaster" grain on top of the NES grid).

import { PX } from './constants.js'

function jitterColor(hex, amt, seed) {
  if (amt <= 0) return hex
  // hash → deterministic factor in [1-amt, 1+amt]
  let h = (seed * 73856093) ^ 19349663
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  const f = 1 + (((h >>> 0) % 1000) / 1000 - 0.5) * 2 * amt
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * f))
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * f))
  const b = Math.min(255, Math.round((hex & 255) * f))
  return (r << 16) | (g << 8) | b
}

export function drawMap(g, map, pal, scale = PX, ox = 0, oy = 0, jitter = 0) {
  for (let y = 0; y < map.length; y++) {
    const row = map[y]
    for (let x = 0; x < row.length; x++) {
      const c = pal[row[x]]
      if (!c) continue
      g.fillStyle(jitter ? jitterColor(c, jitter, x * 131 + y * 977) : c, 1)
      g.fillRect(ox + x * scale, oy + y * scale, scale, scale)
    }
  }
}

// map: array of equal-length strings; pal: { char: 0xRRGGBB }
export function makePixTex(scene, key, map, pal, { scale = PX, jitter = 0.05 } = {}) {
  const g = scene.make.graphics({ add: false })
  drawMap(g, map, pal, scale, 0, 0, jitter)
  g.generateTexture(key, map[0].length * scale, map.length * scale)
  g.destroy()
  return key
}

// several maps side by side in a row (for simple sprite sheets)
export function makeRowTex(scene, key, maps, pal, { scale = PX, jitter = 0.05 } = {}) {
  const h = Math.max(...maps.map((m) => m.length))
  const w = maps.reduce((s, m) => s + m[0].length, 0)
  const g = scene.make.graphics({ add: false })
  let ox = 0
  for (const m of maps) {
    drawMap(g, m, pal, scale, ox, 0, jitter)
    ox += m[0].length * scale
  }
  g.generateTexture(key, w * scale, h * scale)
  g.destroy()
  return key
}
