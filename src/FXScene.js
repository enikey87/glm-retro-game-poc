// ── FXScene: always-on-top CRT overlay + global sound/toggle keys ───────────
import Phaser from 'phaser'
import { GAME_W, GAME_H, save } from './constants.js'
import { chip } from './audio.js'

export class FXScene extends Phaser.Scene {
  constructor() { super('FX') }

  create() {
    this.crt = this.add.image(GAME_W / 2, GAME_H / 2, 'crt')
      .setDisplaySize(GAME_W, GAME_H).setScrollFactor(0).setDepth(1000)
      .setVisible(this.registry.get('crt'))
    if (!this.registry.get('crt')) this.crt.setVisible(false)

    this.muteIcon = this.add.bitmapText(GAME_W - 10, GAME_H - 22, 'pfont', '', 11)
      .setOrigin(1, 0.5).setTint(0xcbb98f).setAlpha(0.8).setDepth(1001)

    this.input.keyboard.on('keydown-T', () => {
      const v = !this.crt.visible
      this.crt.setVisible(v)
      this.registry.set('crt', v)
      save.crt = v
      chip.play('ui')
    })
    this.input.keyboard.on('keydown-M', () => {
      chip.ensure()
      const v = !chip.muted
      chip.setMuted(v)
      this.registry.set('muted', v)
      chip.play('ui')
    })
    this.registry.events.on('changedata-muted', (_k, v) => {
      this.muteIcon.setText(v ? 'SOUND OFF · M' : '')
    })
  }
}
