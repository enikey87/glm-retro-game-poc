// ── Global constants ────────────────────────────────────────────────────────
export const GAME_W = 960
export const GAME_H = 540

// one art "pixel" is drawn as a PX×PX block — chunky NES grid
export const PX = 3

// y of the walkable wall top
export const GROUND_Y = 452

export const SEG_W = 3400
export const SEGMENTS = [
  { key: 'dawn',  kanji: '第一章', sub: '破曉', name: 'DAWN ON THE WALL',   sky: 'sky-dawn',  tint: 0xb9a68f, dark: 0.0 },
  { key: 'dusk',  kanji: '第二章', sub: '黃昏', name: 'DUSK OF THE HORDE',  sky: 'sky-dusk',  tint: 0xd97a4a, dark: 0.25 },
  { key: 'night', kanji: '第三章', sub: '長夜', name: 'THE LONG NIGHT',     sky: 'sky-night', tint: 0x6a5a80, dark: 0.75 },
  { key: 'boss',  kanji: '終章',   sub: '魔將', name: 'THE DEMON SHOGUN',   sky: 'sky-boss',  tint: 0x8a2a3a, dark: 0.9 },
]
export const WORLD_W = SEG_W * SEGMENTS.length

// player physics (tuned by hand)
export const P = {
  SPEED: 265,
  ACCEL: 2300,
  AIR_ACCEL: 1500,
  DRAG: 2100,
  AIR_DRAG: 500,
  GRAVITY: 1650,
  MAX_FALL: 900,
  JUMP_V: -560,
  DJUMP_V: -500,
  COYOTE: 0.10,
  BUFFER: 0.13,
  DASH_V: 590,
  DASH_T: 0.16,
  DASH_CD: 0.42,
  ATK_DUR: 0.24,
  ATK_ACTIVE: 0.13,
  ATK_CD: 0.32,
  COMBO_WINDOW: 0.42,
  CHARGE_STEP: 0.42,
  IFRAMES: 1.25,
  SPIRIT_T: 12,
}

// shared palette anchors
export const CLR = {
  black: 0x0a0710,
  red: 0x8c1626,
  darkRed: 0x5a0e18,
  blood: 0xa11c22,
  ember: 0xef6a1f,
  gold: 0xf6c24a,
  goldDeep: 0xc28a1e,
  cream: 0xf7ead0,
  creamDim: 0xcbb98f,
  skin: 0xf6c98f,
  stone: 0x4a4550,
  stoneDark: 0x2a2732,
}

// depth layers
export const D = {
  sky: -100, stars: -99, moon: -98,
  mountainFar: -90, mountainNear: -85, fogBack: -80,
  wall: -60, tower: -55, merlon: -50,
  decor: -40, gate: -38,
  pickup: -20,
  enemy: -10,
  player: 0,
  fx: 20,
  particle: 30,
  fg: 40, fogFront: 45,
}

export const save = {
  get hiscore() { return +(localStorage.getItem('rd-hiscore') || 0) },
  set hiscore(v) { localStorage.setItem('rd-hiscore', String(v)) },
  get crt() { return localStorage.getItem('rd-crt') === '1' },
  set crt(v) { localStorage.setItem('rd-crt', v ? '1' : '0') },
}
