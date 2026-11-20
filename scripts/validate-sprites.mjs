// Validates all sprite maps: uniform row lengths + only chars present in the
// palette. Run: npm run sprites:check  (also part of CI)
import * as S from '../src/spritedata.js'

const TABLE = {
  MONK: 'PAL_MONK', MONK_HEAD: 'PAL_MONK',
  DEMON: 'PAL_DEMON', HOUND: 'PAL_HOUND', IMP: 'PAL_IMP',
  TURRET: 'PAL_TURRET', BRUTE: 'PAL_BRUTE', BAT: 'PAL_BAT',
  GUARDIAN: 'PAL_GUARDIAN', BOSS: 'PAL_BOSS',
  SCROLL: 'PAL_ITEM', COIN: 'PAL_ITEM', HEART: 'PAL_ITEM', SPIRIT: 'PAL_ITEM',
  SPIKE: 'PAL_HAZ', LANTERN: 'PAL_HAZ', BANNER: 'PAL_HAZ', GRASS: 'PAL_HAZ',
  GATE: 'PAL_HAZ', BRAZIER: 'PAL_HAZ', DRAGONHEAD: 'PAL_HAZ', RUBBLE: 'PAL_HAZ',
}

let errors = 0
function check(name, map, pal) {
  const w = map[0].length
  const palKeys = new Set(['.', ...Object.keys(pal)])
  map.forEach((row, y) => {
    if (row.length !== w) { console.error(`✗ ${name} row ${y}: width ${row.length}, expected ${w} → "${row}"`); errors++ }
    for (const ch of row) {
      if (!palKeys.has(ch)) { console.error(`✗ ${name} row ${y}: unknown char "${ch}"`); errors++ }
    }
  })
  console.log(`✓ ${name} (${w}×${map.length})`)
}

for (const [exportName, palName] of Object.entries(TABLE)) {
  const data = S[exportName]
  const pal = S[palName]
  if (Array.isArray(data)) check(exportName, data, pal)
  else for (const [frame, map] of Object.entries(data)) check(`${exportName}.${frame}`, map, pal)
}

if (errors) { console.error(`\n${errors} sprite data error(s)`); process.exit(1) }
console.log('\nAll sprite maps valid.')
