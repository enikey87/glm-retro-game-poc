// ── All sprite art: 16-wide-ish char maps + palettes ────────────────────────
// Every char = one art pixel ('.' = transparent). Rendered at 3× by pixel.js.
// Silhouettes/proportions kept NES-readable; color richness comes from the
// extended palette + jitter + runtime glow/particles.

export const PAL_MONK = {
  K: 0x181016, // outline
  S: 0xf6c98f, // skin
  s: 0xcf9257, // skin shade
  O: 0xef6a1f, // robe orange
  o: 0xb14410, // robe shade
  R: 0x8c1626, // sash dark red
  C: 0xf7ead0, // cream trim
  W: 0xf5f1e2, // staff white
  G: 0xf6c24a, // gold bead
}

// 16×16 monk, facing right, white staff
export const MONK = {
  idle: [
    '......KKKK......',
    '.....KSSSSK..G..',
    '.....KsSKSK..W..',
    '.....KsSSSK..W..',
    '....KRCCCCRK.W..',
    '...KOOOOOOOOKW..',
    '...KOoOOOOOOSW..',
    '...KOROOOOOOOW..',
    '...KOOROOOOOOW..',
    '...KOOORROOOOW..',
    '...KOOOOOOOOOW..',
    '...KoOOOOOOOoW..',
    '....KCCCCCK.W...',
    '.....S..S....W..',
    '.....s..s....W..',
    '.............W..',
  ],
  walk1: [
    '......KKKK......',
    '.....KSSSSK..G..',
    '.....KsSKSK..W..',
    '.....KsSSSK..W..',
    '....KRCCCCRK.W..',
    '...KOOOOOOOOKW..',
    '...KOoOOOOOOSW..',
    '..KOROOOOOOOOW..',
    '..KOOROOOOOOOW..',
    '..KOOORROOOOOW..',
    '..KOOOOOOOOOOW..',
    '..KoOOOOOOOOoW..',
    '...KCCCCCCCCK...',
    '....S.....S..W..',
    '...s.......sW...',
    '.............W..',
  ],
  walk2: [
    '......KKKK......',
    '.....KSSSSK..G..',
    '.....KsSKSK..W..',
    '.....KsSSSK..W..',
    '....KRCCCCRK.W..',
    '...KOOOOOOOOKW..',
    '...KOoOOOOOOSW..',
    '...KOROOOOOOOW..',
    '...KOOROOOOOOW..',
    '...KOOORROOOOW..',
    '...KOOOOOOOOOW..',
    '...KoOOOOOOOoW..',
    '....KCCCCCK.W...',
    '......SS.....W..',
    '......ss....W...',
    '.............W..',
  ],
  jump: [
    '......KKKK......',
    '.....KSSSSK..G..',
    '.....KsSKSK..W..',
    '.....KsSSSK..W..',
    '....KRCCCCRK.W..',
    '...KOOOOOOOOKW..',
    '..SKOoOOOOOOSW..',
    '..SKOROOOOOOOW..',
    '...KOOROOOOOOW..',
    '...KOOORROOOOW..',
    '...KOOOOOOOOOW..',
    '...KoOOOOOOOoW..',
    '....KCCCCCK.WW..',
    '....KsSSsSK.W...',
    '....K..K.....W..',
    '.............W..',
  ],
  atk1: [
    '......KKKK......',
    '.....KSSSSK.....',
    '.....KsSKSK.....',
    '.....KsSSSK.....',
    '....KRCCCCRK....',
    '...KOOOOOOOOK...',
    '...KOoOOOOOWWWWW',
    '...KOROOOOOSW...',
    '...KOOROOOOO....',
    '...KOOORROOO....',
    '...KOOOOOOOO....',
    '...KoOOOOOOOo...',
    '....KCCCCCK.....',
    '.....S..S.......',
    '.....s..s.......',
    '................',
  ],
  atk2: [
    '......KKKK......',
    '.....KSSSSK.....',
    '.....KsSKSK.....',
    '.....KsSSSK.....',
    '....KRCCCCRK....',
    '...KOOOOOOOOK...',
    '...KOoOOOOOSW...',
    '...KOROOOOOOOW..',
    '...KOOROOOOOO.W.',
    '...KOOORROOO..W.',
    '...KOOOOOOOO....',
    '...KoOOOOOOOo...',
    '....KCCCCCK.....',
    '.....S..S.......',
    '.....s..s.......',
    '................',
  ],
  atk3: [
    '......KKKK......',
    '.....KSSSSK.....',
    '.....KsSKSK.....',
    '.....KsSSSK.....',
    '....KRCCCCRK....',
    '...KOOOOOOOOK...',
    '...KOoOOOOOOK...',
    '...KOROOOOOOK...',
    '...KOOROOOOOOK..',
    '...KOOORROOOWWWW',
    '...KOOOOOOOOSW..',
    '...KoOOOOOOOo...',
    '...KCCCCCCCCK...',
    '....S......S....',
    '....s......s....',
    '................',
  ],
  sit: [
    '................',
    '......KKKK......',
    '.....KSSSSK.....',
    '.....KsSKSK.....',
    '.....KsSSSK.....',
    '....KRCCCCRK....',
    '...KOOOOOOOOK...',
    '...KOoOOOOOoK...',
    '..KOOROOOROOOK..',
    '..KOOOROOOROOK..',
    '..KOOOOOOOOOOK..',
    '.KoOOOOOOOOOOoK.',
    '.KCCCCWWWWWCCCK.',
    '.KSsWWWWWWWWsSK.',
    '..KK........KK..',
    '................',
  ],
}

// HUD icon: monk head 8×6
export const MONK_HEAD = [
  '..KKKK..',
  '.KSSSSK.',
  '.KsSKSK.',
  '.KsSSSK.',
  '.KRCCRK.',
  '.KOOOOK.',
]

export const PAL_DEMON = {
  K: 0x180a10,
  D: 0xa11c22, // body
  d: 0x6b0f14, // shade
  e: 0x4a0a0e, // deep shade
  C: 0xf7ead0, // horns/claws cream
  E: 0xffd23e, // eyes
  F: 0xff7a2a, // inner fire
}

// flying demon 16×12, two wing frames
export const DEMON = {
  fly1: [
    '.K..........K...',
    'KdK........KdK..',
    'KddK..CC..KddK..',
    '.KddCKDDKCKddK..',
    '.KdDKDDDDKDKdK..',
    '..KDDDEEDDDDEK..',
    '..KDDEDEDEDDEK..',
    '...KDDDDDDDDK...',
    '...KDdDDdDDdK...',
    '....KDDDDDDK....',
    '.....KC.CK......',
    '................',
  ],
  fly2: [
    '................',
    '.........CC.....',
    '....CC..KDDK....',
    '.KddDKCKDDDDK...',
    'KdddDKDDDDDDDK..',
    'KddDDDEEDDDDEK..',
    '.KDDDEDEDEDDEK..',
    '..KKDDDDDDDDK...',
    '....KDdDDdDDK...',
    '.....KDDDDDK....',
    '......KC.CK.....',
    '................',
  ],
}

export const PAL_HOUND = {
  K: 0x160a0c,
  D: 0x8c1626, // hellhound dark red
  d: 0x5a0e18,
  e: 0x38060c,
  E: 0xffb52a, // eyes
  C: 0xf7ead0, // teeth
  F: 0xff7a2a, // ember mouth
}

// hellhound 18×11 (low + long), 2 run frames
export const HOUND = {
  run1: [
    '..................',
    '....KK............',
    '...KDDK...KK......',
    '...KDEDK.KDDKK....',
    'KK..KDDDDDDDDDKK..',
    'KDK.KDDDDDDDDDDDK.',
    'KDDDDDDdDDdDDDDDK.',
    '.KDDDDDDDDDDDDDDK.',
    '..KDKCKDDDDDDDDK..',
    '..KCK..KDK...KDK..',
    '...K....KK.....K..',
  ],
  run2: [
    '..................',
    '....KK............',
    '...KDDK...KK......',
    '...KDEDK.KDDKK....',
    'KK..KDDDDDDDDDKK..',
    'KDK.KDDDDDDDDDDDK.',
    'KDDDDDDdDDdDDDDDK.',
    '.KDDDDDDDDDDDDDDK.',
    '..KDDKDDDDDDDDK...',
    '...KCK.KDDK..KDK..',
    '...K....KCK...K...',
  ],
  // charging: mouth open, ember breath
  charge: [
    '..................',
    '....KK............',
    '...KDDK...KK......',
    '...KDEDK.KDDKK....',
    'KK..KDDDDDDDDDKKF.',
    'KDK.KDDDDDDDDDKFF.',
    'KDDDDDDdDDdDDDDFF.',
    '.KDDDDDDDDDDDDDKF.',
    '..KDKCKDDDDDDDDK..',
    '..KCK..KDK...KDK..',
    '...K....KK.....K..',
  ],
}

export const PAL_IMP = {
  K: 0x160a10,
  D: 0xc23a1e, // imp brighter red-orange
  d: 0x84200e,
  E: 0xffd23e,
  C: 0xf7ead0,
}

// imp 11×11, 2 hop frames
export const IMP = {
  hop1: [
    '.C.......C.',
    '.KC.....CK.',
    '..KDDDDDK..',
    '.KDDEEDEDK.',
    '.KDDDDDdDK.',
    '..KDDDDDK..',
    '.CKDDDDDKC.',
    '.KDKDDDKDK.',
    '..KDK.KDK..',
    '..KDK.KDK..',
    '...K...K...',
  ],
  hop2: [
    '...........',
    '.C.......C.',
    '.KC.....CK.',
    '..KDDDDDK..',
    '.KDDEEDEDK.',
    '.KDDDDDdDK.',
    '..KDDDDDK..',
    '.CKDDDDDKC.',
    '.KDKDDDKDK.',
    '..KDK.KDK..',
    '..K...K....',
  ],
}

export const PAL_TURRET = {
  K: 0x14101a,
  B: 0x4a4550, // stone
  b: 0x2a2732,
  L: 0x8f8a96, // stone light
  D: 0x8c1626, // demon face red
  E: 0xffb52a, // glowing eye/mouth
  F: 0xff7a2a,
  G: 0xf6c24a, // gold crest
}

// turret statue 14×18: stone demon head on plinth
export const TURRET = {
  idle: [
    '.....GGGG.....',
    '....KBBBBK....',
    '...KBLLLLBK...',
    '...KBDDDDbK...',
    '..KBDKDDKDbK..',
    '..KBDEEDEDbK..',
    '..KBDDDDDDbK..',
    '..KBDKKKKDbK..',
    '...KBDDDDbK...',
    '...KbKDDKbK...',
    '....KBBBBK....',
    '...KBBbbBBK...',
    '..KBbKBBKbBK..',
    '..KBbKBBKbBK..',
    '..KBbKbbKbBK..',
    '..KKKKKKKKKK..',
    '...KbK..KbK...',
    '...KKK..KKK...',
  ],
  fire: [
    '.....GGGG.....',
    '....KBBBBK....',
    '...KBLLLLBK...',
    '...KBDDDDbK...',
    '..KBDKDDKDbK..',
    '..KBEEFEEbK...',
    '..KBDDFFDDbK..',
    '..KBDKFFKDbK..',
    '...KBDDDDbK...',
    '...KbKDDKbK...',
    '....KBBBBK....',
    '...KBBbbBBK...',
    '..KBbKBBKbBK..',
    '..KBbKBBKbBK..',
    '..KBbKbbKbBK..',
    '..KKKKKKKKKK..',
    '...KbK..KbK...',
    '...KKK..KKK...',
  ],
}

export const PAL_BRUTE = {
  K: 0x140c10,
  D: 0x7a1420, // armor
  d: 0x4e0a14,
  G: 0xf6c24a, // gold trim
  g: 0xc28a1e,
  E: 0xff3b2a, // visor
  C: 0xf7ead0, // tusks
  s: 0x3a2a3a, // skin dark
}

// armored brute 15×18, 2 frames
export const BRUTE = {
  walk1: [
    '.....KKKKK.....',
    '....KDDDDDK....',
    '...KDGGGGgDK...',
    '...KDKKKKKDK...',
    '...KDsEEEsDK...',
    '...KDDKKKDDK...',
    '..KCCDDDDDCCK..',
    '..KDKDDDDDKDK..',
    '.KDDKDGgDKDDK..',
    '.KDKKDDDKKDKK..',
    '.KDKKDDDKKDKK..',
    '.KsK.KDDK.KsK..',
    '.KsK.KDDK.KsK..',
    '.KKK.KDDK.KKK..',
    '.....KDDDK.....',
    '....KDDKDDK....',
    '....KdK.KdK....',
    '....KKK.KKK....',
  ],
  walk2: [
    '.....KKKKK.....',
    '....KDDDDDK....',
    '...KDGGGGgDK...',
    '...KDKKKKKDK...',
    '...KDsEEEsDK...',
    '...KDDKKKDDK...',
    '..KCCDDDDDCKK..',
    '..KDKDDDDDKDK..',
    '.KDDKDGgDKDDK..',
    '.KDKKDDDKKDKK..',
    '.KDKKDDDKKDKK..',
    '.KsK.KDDK.KsK..',
    '.KsK.KDDK.KsK..',
    '.KKK.KDDK.KKK..',
    '.....KDDDK.....',
    '....KDDKDDK....',
    '.....KdKdK.....',
    '.....KKKKK.....',
  ],
}

export const PAL_BAT = {
  K: 0x120a16,
  V: 0x3a2450, // bat purple-dark
  v: 0x241436,
  E: 0xffd23e,
}

// bat 9×7, 2 frames
export const BAT = {
  f1: [
    'K.......K',
    'KVK...KVK',
    'KVVKVKVVK',
    '.KVVVVVVK',
    '..KVEVEK.',
    '...KVK...',
    '....V....',
  ],
  f2: [
    '.........',
    '.........',
    'KKV...VKK',
    'KVVVKVVVK',
    '.KVVVVVK.',
    '..KVEVK..',
    '...KVK...',
  ],
}

export const PAL_GUARDIAN = {
  K: 0x141018,
  B: 0x5a5462, // stone body
  b: 0x36313e,
  L: 0xb8b2c0, // stone light (bright face)
  G: 0xf6c24a, // gold mane
  g: 0xc28a1e,
  E: 0xff7a2a, // ember eyes/mouth
  C: 0xf7ead0, // teeth
}

// stone lion guardian (mini-boss) 26×20, 2 frames
export const GUARDIAN = {
  idle: [
    '..........KKKKK.........',
    '........KBBBBBBK........',
    '.......KBLLLLLBBK.......',
    '......KBLLBBBBBBBK......',
    '.....KBGGGGGGGGBBBK.....',
    '....KBGGGGGGGGGGBBBK....',
    '...KBGGGGGGGGGGGBBBBK...',
    '..KBGGGKEEEEKGGGGBBBBK..',
    '..KBGGKEEEEEEKGGGBBBBBK.',
    '.KBGGGKEEEEEEKGGGBBBBBK.',
    '.KBGGGGKEEEEKGGGGGBBBBK.',
    '.KBGGGGGKKKGGGGGGGBBBK..',
    '.KBGGGGGGGGGGGGGGGBBK...',
    '..KBGGGGGGGGGGGGGBBK....',
    '...KBBGGGGGGGGGBBBK.....',
    '....KBBBBBBBBBBBK.......',
    '...KBBbKCCCCCKbBBK......',
    '..KBbKKKCCCCKKKKbBK.....',
    '..KbK..KKKKKK..KbK......',
    '..KKK..........KKK......',
  ],
  roar: [
    '..........KKKKK.........',
    '........KBBBBBBK........',
    '.......KBLLLLLBBK.......',
    '......KBLLBBBBBBBK......',
    '.....KBGGGGGGGGBBBK.....',
    '....KBGGGGGGGGGGBBBK....',
    '...KBGGGGGGGGGGGBBBBK...',
    '..KBGGGKEEEEKGGGGBBBBK..',
    '..KBGGKEEEEEEKGGGBBBBBK.',
    '.KBGGGKEEEEEEKGGGBBBBBK.',
    '.KBGGGGKEEEEKGGGGGKBBBK.',
    '.KBGGGGGKKKGGGGGGKK.....',
    '.KBGGGGGGGGGGGGGGKBK....',
    '..KBGGGGGGGGGGGGKBBK....',
    '...KBBGGGGGGGGGKBBBK....',
    '....KBBBBBBBBBBBBBK.....',
    '...KBBbKEEEEEEKbBBK.....',
    '..KBbKKKCCKCCKKKKbBK....',
    '..KbK..KKKKKKKK..KbK....',
    '..KKK..........KKKK.....',
  ],
}

export const PAL_BOSS = {
  K: 0x10060e,
  D: 0x8c1226, // armor dark red
  d: 0x56081a,
  G: 0xf6c24a, // gold
  g: 0xc28a1e,
  C: 0xf7ead0, // horns cream
  c: 0xcbb98f,
  E: 0xffd23e, // eyes
  F: 0xff5a1a, // fire
  s: 0x2a1a2a, // skin shadow
}

// 鬼将軍 — the Demon Shogun (final boss) 26×26, 2 frames
export const BOSS = {
  idle: [
    '..C..................C....',
    '..KC................CK....',
    '...KC....KKKKKK....CK.....',
    '...KCK..KDDDDDDK..KCK.....',
    '....KCKKDDGGGGDDKKCK......',
    '.....KKDDGKKEKKGDDKK......',
    '.....KDDDDKEEEEKDDDDK.....',
    '....KDDDDDKEEEKDDDDDK.....',
    '....KDDDDDDKKKDDDDDDK.....',
    '...KDDsKKDDDDDDDKKsDDK....',
    '...KDsKKDDdDDDdDDKKsDK....',
    '..KDDKDDDDDDDDDdDDDKDDK...',
    '..KDGKDDDDDDDDDDDDDKGDK...',
    '..KGGKDDDKGGGGKDDDDKGGK...',
    '..KKKKDDDKGDDGKDDDDKKKK...',
    '....KDDDDKGGGGKDDDDDK.....',
    '....KDDDDDGGGDDDDDDDK.....',
    '....KDDdDDDDDDDDdDDDK.....',
    '...KDDDDDDdDDdDDDDDDDK....',
    '..KDDKKDDDDDDDDDDKKDDK....',
    '..KDK.KDDDKKKKDDDK.KDK....',
    '..KKK.KDDDK..KDDDK.KKK....',
    '......KDDDK..KDDDK........',
    '......KDDDK..KDDDK........',
    '.......KDK....KDK.........',
    '.......KKK....KKK.........',
  ],
  attack: [
    '..C..................C....',
    '..KC................CK....',
    '...KC....KKKKKK....CK.....',
    '...KCK..KDDDDDDK..KCK.....',
    '....KCKKDDGGGGDDKKCK......',
    '.....KKDDGKKEKKGDDKK......',
    '.....KDDDDKEEEEKDDDDK.....',
    '....KDDDDDKEEEKDDDDDK.....',
    '....KDDDDDDKKKDDDDDDK.....',
    '.CC.KDDsKKDDDDDKKsDDK.....',
    'CKDKKDsKKDDdDDdKKsDKKCC...',
    'KDDDKDDDDDDDDDdDDDKDDDDK..',
    '.KDGKDDDDDDDDDDDDDKGDK....',
    '..KKKDDDKGGGGKDDDDKKK.....',
    '....KDDDKGDDGKDDDDDK......',
    '....KDDDDKGGGGKDDDDDK.....',
    '....KDDDDDGGGDDDDDDDK.....',
    '....KDDdDDDDDDDDdDDDK.....',
    '...KDDDDDDdDDdDDDDDDDK....',
    '..KDDKKDDDDDDDDDDKKDDK....',
    '..KDK.KDDDKKKKDDDK.KDK....',
    '..KKK.KDDDK..KDDDK.KKK....',
    '......KDDDK..KDDDK........',
    '......KDDDK..KDDDK........',
    '.......KDK....KDK.........',
    '.......KKK....KKK.........',
  ],
}

export const PAL_ITEM = {
  K: 0x181016,
  C: 0xf7ead0, // paper
  c: 0xcbb98f,
  R: 0x8c1626, // ribbon
  G: 0xf6c24a, // gold
  g: 0xc28a1e,
  W: 0xfff6dd,
  D: 0xa11c22,
  P: 0xff9a5a, // inner glow
}

// wisdom scroll 12×12
export const SCROLL = [
  '...KKKKKK...',
  '..KGGKKGGK..',
  '.KGCCCCCCGK.',
  '.KCCCRCCCCCK',
  '.KCCRCCRCCCK',
  '.KCCRCCRCCCK',
  '.KCCCCRCCCCK',
  '.KCCRRRRCCCK',
  '.KGCCCCCCGK.',
  '..KGGKKGGK..',
  '...KKKKKK...',
  '............',
]

// golden dragon coin 10×10 — 3 rotation frames
export const COIN = {
  f1: [
    '...KKKK...',
    '..KGGGGK..',
    '.KGWGGGGK.',
    '.KGGDDGGGK',
    'KGGDGGDGGK',
    'KGGDGGDGGK',
    'KGGGGDDGGK',
    '.KGGGGGGK.',
    '..KgggGK..',
    '...KKKK...',
  ],
  f2: [
    '...KKKK...',
    '..KGggGK..',
    '.KGWgGgGK.',
    '.KGgDDgGgK',
    'KgGgDDgGgK',
    'KgGgDDgGgK',
    'KgGgDDgGgK',
    '.KGgDDgGK.',
    '..KGggGK..',
    '...KKKK...',
  ],
  f3: [
    '...KKKK...',
    '..KGGGGK..',
    '.KGWGGGGK.',
    '.KGGDDGGGK',
    'KGGDGGDGGK',
    'KGGDGGDGGK',
    'KGGGGDDGGK',
    '.KGGGGGGK.',
    '..KgggGK..',
    '...KKKK...',
  ],
}

// heart pickup 8×7
export const HEART = [
  '.KK.KK..',
  'KRRKRRK.',
  'KRWRRRK.',
  'KRRRRRK.',
  '.KRRRK..',
  '..KRK...',
  '...K....',
]

// dragon spirit orb 12×12
export const SPIRIT = [
  '....KKKK....',
  '..KKGGGGKK..',
  '.KGGWWWWGGK.',
    '.KGWWGGWWGK.',
  'KGWWGGGGWWGK',
  'KGWGGDDGGWGK',
  'KGWGGDDGGWGK',
  'KGWWGGGGWWGK',
  '.KGWWGGWWGK.',
  '.KGGWWWWGGK.',
  '..KKGGGGKK..',
  '....KKKK....',
]

export const PAL_HAZ = {
  K: 0x14101a,
  C: 0xf2e8d2, // bone spikes (bright)
  c: 0xb5a98c,
  B: 0x4a4550,
  b: 0x2a2732,
  R: 0xb01e30,
  G: 0xf6c24a,
  g: 0xc28a1e,
  F: 0xff7a2a,
  E: 0xffd23e,
  V: 0x2a3a2a, // vines/moss
  v: 0x1a2a1c,
  P: 0xffc9a0, // paper
  D: 0x6b0f14,
}

// spike strip 8×6 (tiles horizontally)
export const SPIKE = [
  '.K..K..K',
  '.KC.KC.K',
  '.KCKKCKK',
  'KcKcKcKc',
  'KcKcKcKc',
  'KKKKKKKK',
]

// lantern 10×16
export const LANTERN = [
    '....KK....',
    '...KGgK...',
    '....KK....',
    '...KbbK...',
    '..KbRRbK..',
    '.KbRFFRbK.',
    '.KRFFFFRK.',
    '.KRFFFFRK.',
    '.KbRFFRbK.',
    '.KbRFFRbK.',
    '..KbRRbK..',
    '...KbbK...',
    '...KGgK...',
    '....KK....',
    '....K.....',
    '..........',
]

// banner 8×15, 2 wave frames
export const BANNER = {
  f1: [
    'KKKKKKKK',
    'KGGRRRGK',
    '.KRRRRRK',
    '.KRRRRRK',
    '.KRCCRRK',
    '.KRCCRRK',
    '.KRRRRRK',
    '.KRRRRRK',
    '..KRRRK.',
    '..KRRK..',
    '..KRK...',
    '...K....',
    '........',
    '........',
    '........',
  ],
  f2: [
    'KKKKKKKK',
    'KGGRRRGK',
    '.KRRRRRK',
    '.KRRRRRK',
    '.KRRRRRK',
    '.KRCCRRK',
    '.KRCCRRK',
    '..KRRRK.',
    '..KRRRK.',
    '..KRRK..',
    '...KRK..',
    '...K....',
    '........',
    '........',
    '........',
  ],
}

// grass tuft 12×6, 2 sway frames
export const GRASS = {
  f1: [
    '.V...V...V..',
    '.Vv..Vv..Vv.',
    'VvV..Vv.VvV.',
    'VvVv.VvVvVv.',
    'vVvVvvVvvVv.',
    'vvvvvvvvvvvv',
  ],
  f2: [
    '..V...V...V.',
    '.vV..vV..vV.',
    '.VvV.Vv..VvV',
    '.VvVvVvVvVv.',
    '.vVvVvvVvvVv',
    '.vvvvvvvvvvv',
  ],
}

// checkpoint gate 24×30
export const GATE = [
  '....KKKKKKKKKKKKKKKK....',
  '...KRRRRRRRRRRRRRRRRK...',
  '..KRRGGGGGGGGGGGGGGRRK..',
  '..KRGGKKKKKKKKKKKKGGRK..',
  '..KRGK............KGRK..',
  '..KRGK....KKKK....KGRK..',
  '..KRGK...KGGGGK...KGRK..',
  '..KRGK...KGRRGK...KGRK..',
  '..KRGK...KGRRGK...KGRK..',
  '..KRGK...KGGGGK...KGRK..',
  '..KRGK....KKKK....KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGK............KGRK..',
  '..KRGGKKKKKKKKKKKKGGRK..',
  '..KRRGGGGGGGGGGGGGGRRK..',
  '..KRRRRRRRRRRRRRRRRRRK..',
  '...KRRRRRRRRRRRRRRRRK...',
  '....KKKKKKKKKKKKKKKK....',
  '........................',
  '........................',
]

// brazier 12×12
export const BRAZIER = [
  '............',
  '............',
  '...KKKKKK...',
  '..KEEKEEEK..',
  '..KFEKEEFK..',
  '...KKKKKK...',
  '....KGGK....',
  '...KGggGK...',
  '...KGggGK...',
  '....KGGK....',
  '...KKKKKK...',
  '............',
]

// fire trap: dragon head on the wall 16×11
export const DRAGONHEAD = [
  '....KKKK........',
    '...KGGGGK.......',
  '..KGKbbKGKK.....',
  '..KGKbKKGGGKK...',
  '.KGKEbKbbbbbGK..',
  '.KGKEbKKKKKKDGK.',
  '.KGGKKKCCCCKDDGK',
  '..KGGKKCKKCKDDDK',
  '...KGGKKKKKKDDD.',
  '....KGGKKKKDD...',
  '.....KKKKKKK....',
]

// rubble chunk 8×6
export const RUBBLE = [
  '..KKK...',
  '.KBbBK..',
  'KBbBbBK.',
  'KbBBbBbK',
  '.KbBbBK.',
  '..KKKK..',
]
