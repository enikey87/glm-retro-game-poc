// ── Boot: generate every texture procedurally, then show the studio stamp ──
import { GAME_W, GAME_H } from './constants.js'
import { generateTextures } from './textures.js'
import { buildRetroFont } from './font.js'
import { chip } from './audio.js'

const CJK = '"Noto Serif SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei", serif'

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot') }

  create() {
    generateTextures(this)
    buildRetroFont(this)
    this.scene.launch('FX')

    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x050308).setOrigin(0, 0)

    // spinning dragon coin as the studio mark
    const coin = this.add.image(GAME_W / 2, GAME_H / 2 - 26, 'coin1').setScale(2.2)
    const frames = ['coin1', 'coin2', 'coin3', 'coin2']
    let fi = 0
    this.time.addEvent({ delay: 140, repeat: -1, callback: () => { fi = (fi + 1) % 4; coin.setTexture(frames[fi]) } })
    this.add.image(GAME_W / 2, GAME_H / 2 - 26, 'glow').setScale(3).setTint(0xf6c24a).setAlpha(0.3).setBlendMode('ADD')

    this.add.text(GAME_W / 2, GAME_H / 2 + 44, '赤龍軟件', {
      fontFamily: CJK, fontSize: '28px', color: '#f7ead0', stroke: '#1a0a10', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.9)
    this.add.bitmapText(GAME_W / 2, GAME_H / 2 + 82, 'pfont', 'RED DRAGON SOFTWARE', 13).setOrigin(0.5).setTint(0xcbb98f)
    this.add.bitmapText(GAME_W / 2, GAME_H / 2 + 106, 'pfont', 'SHANGHAI · 1994', 10).setOrigin(0.5).setTint(0x8c7a68)

    this.cameras.main.fadeIn(150)
    this.time.delayedCall(950, () => {
      this.cameras.main.fade(280, 5, 3, 8)
      this.time.delayedCall(300, () => this.scene.start('Title'))
    })
  }
}
