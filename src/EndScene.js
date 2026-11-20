// ── End: GAME OVER / VICTORY as a Famicom cartridge on the shelf ────────────
import Phaser from 'phaser'
import { GAME_W, GAME_H, save } from './constants.js'
import { chip } from './audio.js'

const CJK = '"Noto Serif SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei", serif'

export class EndScene extends Phaser.Scene {
  constructor() { super('End') }

  init(data) { this.win = !!data.win }

  create() {
    this.add.rectangle(0, 0, GAME_W, GAME_H, this.win ? 0x120a04 : 0x0a0408).setOrigin(0, 0)
    this.add.image(0, 0, 'sky-night').setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H).setAlpha(0.5)

    // embers — gold on victory, dying red on defeat
    this.add.particles(0, 0, 'ember', {
      x: { min: 0, max: GAME_W }, y: GAME_H + 10,
      speedY: { min: -50, max: -16 }, speedX: { min: -12, max: 12 },
      lifespan: 5200, scale: { start: 0.9, end: 0 }, alpha: { start: 0.7, end: 0 },
      tint: this.win ? [0xf6c24a, 0xffd23e] : [0xa11c22, 0x5a0e18], blendMode: 'ADD', frequency: 200,
    })

    // ── the cartridge ──
    const cx = GAME_W / 2, cy = 268
    const cart = this.add.container(cx, cy)
    const shell = this.add.rectangle(0, 0, 260, 300, 0x8a8494).setStrokeStyle(6, 0x5a5462)
    const shellDark = this.add.rectangle(0, -138, 268, 24, 0x6a6472)
    const label = this.add.rectangle(0, -12, 224, 184, 0x8c1626).setStrokeStyle(4, 0xf6c24a)
    const labelArt = this.add.image(0, -52, 'coin1').setScale(3.2)
    const labelTitle = this.add.text(0, 16, '紅龍傳說', {
      fontFamily: CJK, fontSize: '34px', color: '#f6c24a', stroke: '#2a060c', strokeThickness: 6,
    }).setOrigin(0.5)
    const labelSub = this.add.bitmapText(0, 46, 'pfont', 'LEGEND OF THE', 11).setOrigin(0.5).setTint(0xf7ead0)
    const labelSub2 = this.add.bitmapText(0, 60, 'pfont', 'RED DRAGON', 11).setOrigin(0.5).setTint(0xf7ead0)
    const labelCopy = this.add.bitmapText(0, 76, 'pfont', '(C)1994 RED DRAGON SOFTWARE', 9).setOrigin(0.5).setTint(0xe8d8b0)
    const notches = []
    for (let i = 0; i < 7; i++) notches.push(this.add.rectangle(-90 + i * 30, 118, 18, 26, 0x6a6472))
    cart.add([shell, shellDark, label, labelArt, labelTitle, labelSub, labelSub2, labelCopy, ...notches])
    cart.setScale(0).setAngle(-6)
    this.tweens.add({ targets: cart, scale: 1, angle: 0, duration: 560, ease: 'Back.easeOut' })

    const glow = this.add.image(cx, cy, 'glow').setScale(7, 5).setTint(this.win ? 0xf6c24a : 0x8c1626).setAlpha(0.28).setBlendMode('ADD')
    this.tweens.add({ targets: glow, alpha: 0.45, duration: 1100, yoyo: true, repeat: -1 })

    // ── title text ──
    if (this.win) {
      this.add.text(GAME_W / 2, 62, '勝利', {
        fontFamily: CJK, fontSize: '58px', color: '#f6c24a', stroke: '#4a0a12', strokeThickness: 10,
      }).setOrigin(0.5)
      this.add.bitmapText(GAME_W / 2, 102, 'pfont', 'VICTORY · THE WALL STANDS', 16).setOrigin(0.5).setTint(0xf7ead0)
    } else {
      this.add.text(GAME_W / 2, 62, '終', {
        fontFamily: CJK, fontSize: '58px', color: '#c23a1e', stroke: '#2a060c', strokeThickness: 10,
      }).setOrigin(0.5)
      this.add.bitmapText(GAME_W / 2, 102, 'pfont', 'GAME OVER · THE WALL HAS FALLEN', 16).setOrigin(0.5).setTint(0xcbb98f)
    }

    // ── stats ──
    const r = this.registry.get('result') || {}
    const score = this.registry.get('score') || 0
    const newHi = score >= save.hiscore && score > 0
    const lines = []
    lines.push('SCORE ' + String(score).padStart(6, '0'))
    if (this.win) {
      lines.push('SCROLLS ' + (r.scrolls ?? 0) + '/' + (r.scrollsTotal ?? 0))
      lines.push('DRAGON COINS ' + (r.coins ?? 0) + '/7')
      const t = r.time ?? 0
      lines.push('TIME ' + String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'))
    }
    const stats = this.add.bitmapText(GAME_W / 2, 448, 'pfont', lines.join('·'), 16).setOrigin(0.5).setTint(0xf7ead0)
    const hiText = this.add.bitmapText(GAME_W / 2, 472, 'pfont', newHi ? '· NEW HI SCORE ·' : 'HI ' + String(save.hiscore).padStart(6, '0'), 13)
      .setOrigin(0.5).setTint(newHi ? 0xffb52a : 0xcbb98f)
    if (newHi) this.tweens.add({ targets: hiText, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 })

    if (this.win) {
      this.add.bitmapText(GAME_W / 2, 496, 'pfont', 'RED DRAGON SOFTWARE 1994 · REMASTERED 2026 · THANKS FOR PLAYING', 10).setOrigin(0.5).setTint(0x8c7a68)
    }

    const press = this.add.bitmapText(GAME_W / 2, GAME_H - 26, 'pfont', '· PRESS ENTER ·', 16).setOrigin(0.5).setTint(0xf7ead0)
    this.tweens.add({ targets: press, alpha: 0.15, duration: 520, yoyo: true, repeat: -1 })

    const back = () => {
      chip.ensure()
      chip.play('ui')
      this.cameras.main.fade(300, 5, 3, 8)
      this.time.delayedCall(320, () => this.scene.start('Title'))
    }
    this.input.keyboard.once('keydown-ENTER', back)
    this.input.once('pointerdown', back)
    this.cameras.main.fadeIn(400)

    if (this.registry.get('debugAuto')) this.time.delayedCall(600, back)
  }
}
