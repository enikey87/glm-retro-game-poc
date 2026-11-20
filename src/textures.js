// ── Generated (non-pixel-map) textures: tiles, parallax, FX, overlays ────────
import * as ART from './spritedata.js'
import { makePixTex } from './pixel.js'
import { GAME_W, GAME_H } from './constants.js'

function canvasTex(scene, key, w, h, draw) {
  const tex = scene.textures.createCanvas(key, w, h)
  const ctx = tex.getContext()
  ctx.clearRect(0, 0, w, h)
  draw(ctx, w, h)
  tex.refresh()
  return tex
}

function radial(ctx, cx, cy, r, stops) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  for (const [t, c] of stops) g.addColorStop(t, c)
  return g
}

// ── brick tiles ──────────────────────────────────────────────────────────────
function drawBricks(ctx, w, h, base, mortar, hi, seed = 1) {
  ctx.fillStyle = mortar
  ctx.fillRect(0, 0, w, h)
  const bh = Math.floor(h / 2)
  const bw = Math.floor(w / 2)
  const rows = Math.ceil(h / bh)
  for (let r = 0; r < rows; r++) {
    const off = r % 2 === 0 ? 0 : -Math.floor(bw / 2)
    for (let c = -1; c < Math.ceil(w / bw) + 1; c++) {
      const x = c * bw + off + 1
      const y = r * bh + 1
      // deterministic shade variation per brick
      const s = ((c * 73 + r * 131 + seed * 7) % 17) / 17
      ctx.fillStyle = shade(base, 0.88 + s * 0.24)
      ctx.fillRect(x, y, bw - 2, bh - 2)
      ctx.fillStyle = hi
      ctx.fillRect(x, y, bw - 2, 1)
    }
  }
}

function shade(hex, f) {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * f))
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * f))
  const b = Math.min(255, Math.round((hex & 255) * f))
  return `rgb(${r},${g},${b})`
}

// ── parallax mountains, tileable ─────────────────────────────────────────────
function mountainTex(scene, key, w, h, color, rim, jag, seed) {
  canvasTex(scene, key, w, h, (ctx) => {
    let s = seed
    const rnd = () => { s = (s * 16807 + 17) % 2147483647; return s / 2147483647 }
    const n = 14
    const pts = []
    for (let i = 0; i <= n; i++) {
      const peak = rnd() > 0.55
      pts.push({ x: (i / n) * w, y: peak ? h * (0.25 + rnd() * 0.3) : h * (0.55 + rnd() * 0.3) })
    }
    pts[n].y = pts[0].y // seamless tiling
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (const p of pts) ctx.lineTo(p.x, p.y)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
    // gold rim light along the ridge — the "remaster" touch
    ctx.strokeStyle = rim
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (const p of pts) ctx.lineTo(p.x, p.y)
    ctx.stroke()
    // subtle vertical gradient darkening toward the bottom
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    const g = ctx.createLinearGradient(0, h * 0.5, 0, h)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// ── CRT overlay (scanlines + aperture + vignette) ────────────────────────────
function crtTex(scene) {
  canvasTex(scene, 'crt', 480, 270, (ctx, w, h) => {
    // scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)
    // RGB aperture grille
    for (let x = 0; x < w; x += 3) {
      ctx.fillStyle = 'rgba(255,60,60,0.045)'
      ctx.fillRect(x, 0, 1, h)
      ctx.fillStyle = 'rgba(60,255,120,0.045)'
      ctx.fillRect(x + 1, 0, 1, h)
      ctx.fillStyle = 'rgba(80,120,255,0.045)'
      ctx.fillRect(x + 2, 0, 1, h)
    }
    // vignette
    ctx.fillStyle = radial(ctx, w / 2, h / 2, h * 0.95, [
      [0.55, 'rgba(0,0,0,0)'],
      [1, 'rgba(0,0,0,0.5)'],
    ])
    ctx.fillRect(0, 0, w, h)
  })
}

// ── sky gradients ────────────────────────────────────────────────────────────
const SKIES = {
  'sky-dawn': ['#241631', '#4a2a44', '#8a4a4e', '#c97a4a', '#e8a05c'],
  'sky-dusk': ['#160b20', '#3a1630', '#7a2434', '#b84a2a', '#d97a3a'],
  'sky-night': ['#040209', '#0c0616', '#1a0e26', '#2a1436', '#381a40'],
  'sky-boss': ['#080107', '#1c0510', '#380a18', '#520e1c', '#64121e'],
}

function skyTex(scene, key, stops) {
  canvasTex(scene, key, 32, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// ── everything ───────────────────────────────────────────────────────────────
export function generateTextures(scene) {
  // pixel-art sprites
  for (const [key, map] of Object.entries(ART.MONK)) makePixTex(scene, 'monk-' + key, map, ART.PAL_MONK)
  makePixTex(scene, 'monk-head', ART.MONK_HEAD, ART.PAL_MONK)
  makePixTex(scene, 'demon1', ART.DEMON.fly1, ART.PAL_DEMON)
  makePixTex(scene, 'demon2', ART.DEMON.fly2, ART.PAL_DEMON)
  makePixTex(scene, 'hound1', ART.HOUND.run1, ART.PAL_HOUND)
  makePixTex(scene, 'hound2', ART.HOUND.run2, ART.PAL_HOUND)
  makePixTex(scene, 'hound3', ART.HOUND.charge, ART.PAL_HOUND)
  makePixTex(scene, 'imp1', ART.IMP.hop1, ART.PAL_IMP)
  makePixTex(scene, 'imp2', ART.IMP.hop2, ART.PAL_IMP)
  makePixTex(scene, 'turret1', ART.TURRET.idle, ART.PAL_TURRET)
  makePixTex(scene, 'turret2', ART.TURRET.fire, ART.PAL_TURRET)
  makePixTex(scene, 'brute1', ART.BRUTE.walk1, ART.PAL_BRUTE)
  makePixTex(scene, 'brute2', ART.BRUTE.walk2, ART.PAL_BRUTE)
  makePixTex(scene, 'bat1', ART.BAT.f1, ART.PAL_BAT)
  makePixTex(scene, 'bat2', ART.BAT.f2, ART.PAL_BAT)
  makePixTex(scene, 'guardian1', ART.GUARDIAN.idle, ART.PAL_GUARDIAN)
  makePixTex(scene, 'guardian2', ART.GUARDIAN.roar, ART.PAL_GUARDIAN)
  makePixTex(scene, 'boss1', ART.BOSS.idle, ART.PAL_BOSS)
  makePixTex(scene, 'boss2', ART.BOSS.attack, ART.PAL_BOSS)
  makePixTex(scene, 'scroll', ART.SCROLL, ART.PAL_ITEM)
  makePixTex(scene, 'coin1', ART.COIN.f1, ART.PAL_ITEM)
  makePixTex(scene, 'coin2', ART.COIN.f2, ART.PAL_ITEM)
  makePixTex(scene, 'heart', ART.HEART, ART.PAL_ITEM)
  makePixTex(scene, 'spirit', ART.SPIRIT, ART.PAL_ITEM)
  makePixTex(scene, 'spike', ART.SPIKE, ART.PAL_HAZ)
  makePixTex(scene, 'lantern', ART.LANTERN, ART.PAL_HAZ)
  makePixTex(scene, 'banner1', ART.BANNER.f1, ART.PAL_HAZ)
  makePixTex(scene, 'banner2', ART.BANNER.f2, ART.PAL_HAZ)
  makePixTex(scene, 'grass1', ART.GRASS.f1, ART.PAL_HAZ)
  makePixTex(scene, 'grass2', ART.GRASS.f2, ART.PAL_HAZ)
  makePixTex(scene, 'gate', ART.GATE, ART.PAL_HAZ)
  makePixTex(scene, 'brazier', ART.BRAZIER, ART.PAL_HAZ)
  makePixTex(scene, 'dragonhead', ART.DRAGONHEAD, ART.PAL_HAZ)
  makePixTex(scene, 'rubble', ART.RUBBLE, ART.PAL_HAZ)

  // tiles
  canvasTex(scene, 'brick', 24, 24, (ctx, w, h) => drawBricks(ctx, w, h, '#4a4452', '#262230', '#5c5568', 1))
  canvasTex(scene, 'brick-deep', 24, 24, (ctx, w, h) => drawBricks(ctx, w, h, '#332e3c', '#1c1824', '#403a4a', 3))
  canvasTex(scene, 'cap', 24, 12, (ctx, w, h) => {
    ctx.fillStyle = '#8f8578'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c4b8a2'
    ctx.fillRect(0, 0, w, 3)
    ctx.fillStyle = '#6b6258'
    ctx.fillRect(0, h - 3, w, 3)
    ctx.fillStyle = '#a89c8a'
    ctx.fillRect(6, 3, 2, h - 6)
    ctx.fillRect(16, 3, 2, h - 6)
  })
  // small floating/collapsing platform tile (cap + brick), 64×26
  canvasTex(scene, 'plat64', 64, 26, (ctx, w, h) => {
    ctx.fillStyle = '#8f8578'
    ctx.fillRect(0, 0, w, 12)
    ctx.fillStyle = '#c4b8a2'
    ctx.fillRect(0, 0, w, 3)
    ctx.fillStyle = '#6b6258'
    ctx.fillRect(0, 9, w, 3)
    ctx.fillStyle = '#4a4452'
    ctx.fillRect(0, 12, w, h - 12)
    ctx.fillStyle = '#5c5568'
    ctx.fillRect(0, 12, w, 2)
    ctx.fillStyle = '#332e3c'
    ctx.fillRect(18, 15, 2, 8)
    ctx.fillRect(42, 15, 2, 8)
  })

  // breakable: brick + cracks (2 damage stages)
  for (const [key, n] of [['brick-crack1', 1], ['brick-crack2', 2]]) {
    canvasTex(scene, key, 24, 24, (ctx, w, h) => {
      drawBricks(ctx, w, h, '#4a4452', '#262230', '#5c5568', 7)
      ctx.strokeStyle = '#151020'
      ctx.lineWidth = 2
      ctx.beginPath()
      if (n === 1) {
        ctx.moveTo(4, 2); ctx.lineTo(10, 12); ctx.lineTo(6, 22)
      } else {
        ctx.moveTo(4, 2); ctx.lineTo(10, 12); ctx.lineTo(6, 22)
        ctx.moveTo(20, 0); ctx.lineTo(15, 10); ctx.lineTo(19, 23)
        ctx.moveTo(10, 12); ctx.lineTo(15, 10)
      }
      ctx.stroke()
    })
  }

  // parallax mountains
  mountainTex(scene, 'mtn-far', 960, 340, '#2a1a30', 'rgba(214,158,94,0.5)', 0, 12345)
  mountainTex(scene, 'mtn-near', 960, 300, '#170e1e', 'rgba(230,170,100,0.65)', 1, 54321)

  // distant watchtower silhouette
  canvasTex(scene, 'tower', 110, 210, (ctx, w, h) => {
    ctx.fillStyle = '#1e1526'
    ctx.fillRect(10, 30, w - 20, h - 30)
    // crenellations
    for (let i = 0; i < 5; i++) ctx.fillRect(10 + i * 20, 18, 12, 16)
    ctx.fillRect(2, 26, w - 4, 10)
    // lit windows
    ctx.fillStyle = 'rgba(246,194,74,0.8)'
    ctx.fillRect(w / 2 - 3, 60, 6, 10)
    ctx.fillRect(w / 2 - 3, 110, 6, 10)
    ctx.fillRect(w / 2 - 3, 160, 6, 10)
    // weathered stone base (subtle, no big black blocks)
    ctx.fillStyle = 'rgba(20,14,26,0.30)'
    ctx.fillRect(10, h - 46, w - 20, 46)
    ctx.fillStyle = 'rgba(20,14,26,0.16)'
    ctx.fillRect(10, h - 90, w - 20, 44)
    ctx.fillStyle = 'rgba(143,138,150,0.25)'
    ctx.fillRect(14, h - 44, 6, 40)
    ctx.fillRect(w - 20, h - 44, 6, 40)
  })

  // moon
  canvasTex(scene, 'moon', 120, 120, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, r = w / 2 - 4
    ctx.fillStyle = '#f7e6b0'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e2cb8e'
    for (const [x, y, cr] of [[38, 40, 9], [70, 62, 6], [52, 82, 11], [82, 38, 4], [34, 68, 5]]) {
      ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#fdf2cd'
    ctx.beginPath(); ctx.arc(cx - 14, cy - 16, r * 0.55, 0, Math.PI * 2); ctx.fill()
  })

  // soft white radial glow (tinted at runtime)
  canvasTex(scene, 'glow', 128, 128, (ctx, w, h) => {
    ctx.fillStyle = radial(ctx, w / 2, h / 2, w / 2, [
      [0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)'],
    ])
    ctx.fillRect(0, 0, w, h)
  })

  // stars tile
  canvasTex(scene, 'stars', 480, 270, (ctx, w, h) => {
    let s = 999
    const rnd = () => { s = (s * 16807 + 3) % 2147483647; return s / 2147483647 }
    for (let i = 0; i < 90; i++) {
      const x = rnd() * w, y = rnd() * h * 0.8, b = 0.3 + rnd() * 0.7
      ctx.fillStyle = `rgba(247,234,208,${b})`
      ctx.fillRect(x, y, 2, 2)
      if (b > 0.85) { ctx.fillRect(x - 2, y, 6, 2); ctx.fillRect(x, y - 2, 2, 6) }
    }
  })

  // fog wisp
  canvasTex(scene, 'fog', 260, 90, (ctx, w, h) => {
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * w, y = h / 2 + (Math.random() - 0.5) * h * 0.5
      const r = 20 + Math.random() * 40
      ctx.fillStyle = radial(ctx, x, y, r, [[0, 'rgba(200,180,200,0.10)'], [1, 'rgba(200,180,200,0)']])
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
  })

  // chunky particles (white, tinted at runtime)
  for (const [key, s] of [['px2', 2], ['px3', 3], ['px4', 4]]) {
    const g = scene.make.graphics({ add: false })
    g.fillStyle(0xffffff, 1)
    g.fillRect(0, 0, s, s)
    g.generateTexture(key, s, s)
    g.destroy()
  }
  // ember: bright core + warm rim
  const ge = scene.make.graphics({ add: false })
  ge.fillStyle(0xff7a2a, 1); ge.fillRect(0, 0, 9, 9)
  ge.fillStyle(0xffd23e, 1); ge.fillRect(2, 2, 5, 5)
  ge.fillStyle(0xfff6dd, 1); ge.fillRect(3, 3, 3, 3)
  ge.generateTexture('ember', 9, 9)
  ge.destroy()
  // spark: 4-point star
  canvasTex(scene, 'spark', 17, 17, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(w / 2 - 1, 0, 2, h)
    ctx.fillRect(0, h / 2 - 1, w, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillRect(w / 2 - 3, h / 2 - 3, 6, 6)
  })
  // shockwave ring
  canvasTex(scene, 'ring', 128, 128, (ctx, w, h) => {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 10
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 56, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 16
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 48, 0, Math.PI * 2); ctx.stroke()
  })

  // slash crescent (melee arc)
  canvasTex(scene, 'slash', 72, 72, (ctx, w, h) => {
    const cx = 8, cy = h / 2
    ctx.fillStyle = 'rgba(247,234,208,0.95)'
    ctx.beginPath()
    ctx.arc(cx, cy, 62, -1.05, 1.05)
    ctx.arc(cx, cy, 30, 1.05, -1.05, true)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(246,194,74,0.9)'
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(cx, cy, 62, -0.95, 0.95); ctx.stroke()
  })

  // spirit blast orb
  canvasTex(scene, 'orb', 44, 44, (ctx, w, h) => {
    ctx.fillStyle = radial(ctx, w / 2, h / 2, w / 2, [
      [0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,230,150,0.95)'],
      [0.55, 'rgba(246,194,74,0.55)'], [1, 'rgba(246,194,74,0)'],
    ])
    ctx.fillRect(0, 0, w, h)
  })
  // demon fireball
  canvasTex(scene, 'fireball', 40, 40, (ctx, w, h) => {
    ctx.fillStyle = radial(ctx, w / 2, h / 2, w / 2, [
      [0, 'rgba(255,240,200,1)'], [0.3, 'rgba(255,122,42,0.95)'],
      [0.6, 'rgba(200,30,20,0.6)'], [1, 'rgba(120,10,10,0)'],
    ])
    ctx.fillRect(0, 0, w, h)
  })
  // falling rock
  canvasTex(scene, 'rock', 20, 20, (ctx, w, h) => {
    ctx.fillStyle = '#4a4550'
    ctx.beginPath()
    ctx.moveTo(3, 7); ctx.lineTo(9, 2); ctx.lineTo(17, 5); ctx.lineTo(19, 14); ctx.lineTo(10, 19); ctx.lineTo(3, 15)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#2a2732'
    ctx.fillRect(8, 8, 5, 4)
    ctx.fillStyle = '#8f8a96'
    ctx.fillRect(9, 3, 4, 2)
  })

  // skies
  for (const [key, stops] of Object.entries(SKIES)) skyTex(scene, key, stops)

  // CRT overlay
  crtTex(scene)
}
