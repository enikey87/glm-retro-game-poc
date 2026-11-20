// 紅龍傳說 · Legend of the Red Dragon — entry point
import Phaser from 'phaser'
import { GAME_W, GAME_H, save } from './constants.js'
import { BootScene } from './BootScene.js'
import { TitleScene } from './TitleScene.js'
import { GameScene } from './GameScene.js'
import { UIScene } from './UIScene.js'
import { EndScene } from './EndScene.js'
import { FXScene } from './FXScene.js'

const params = new URLSearchParams(window.location.search)

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#050308',
  pixelArt: true,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, GameScene, UIScene, EndScene, FXScene],
}

const game = new Phaser.Game(config)
window.__game = game

// debug flags (?auto=1&boss=1&demo=1&god=1)
game.registry.set('hi', save.hiscore)
game.registry.set('crt', save.crt)
game.registry.set('muted', false)
if (params.has('auto')) game.registry.set('debugAuto', true)
if (params.has('boss')) game.registry.set('debugBoss', true)
if (params.has('demo')) game.registry.set('demo', true)
if (params.has('god')) game.registry.set('god', true)
const px0 = parseInt(params.get('x'), 10)
if (Number.isFinite(px0)) {
  game.registry.set('debugX', px0)
  game.registry.set('debugAuto', true)
  game.registry.set('debugBoss', true) // suppress enemies before the boss arena
}
