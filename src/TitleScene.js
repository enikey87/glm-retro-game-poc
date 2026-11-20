// ── Title: the "lost 1994 cartridge" boot screen ────────────────────────────
import Phaser from 'phaser'
import { GAME_W, GAME_H, GROUND_Y, save } from './constants.js'
import { chip } from './audio.js'

const CJK = '"Noto Serif SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei", serif'

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title') }

  create() {
    // night backdrop
    this.add.image(-4, -4, 'sky-night').setOrigin(0, 0).setDisplaySize(GAME_W + 8, GAME_H + 8)
    const stars = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'stars').setOrigin(0, 0).setAlpha(0.9)
    const moonGlow = this.add.image(770, 110, 'glow').setScale(5).setTint(0xf6c24a).setAlpha(0.5).setBlendMode('ADD')
    const moon = this.add.image(770, 110, 'moon').setAlpha(0.95)
    const mtnFar = this.add.tileSprite(0, 40, GAME_W, 340, 'mtn-far').setOrigin(0, 0)
    const mtnNear = this.add.tileSprite(0, 140, GAME_W, 300, 'mtn-near').setOrigin(0, 0)
    this.add.image(240, GROUND_Y - 40, 'tower').setOrigin(0.5, 1).setAlpha(0.85)
    this.add.image(880, GROUND_Y - 10, 'tower').setOrigin(0.5, 1).setAlpha(0.7).setScale(0.8)

    // the wall
    this.add.tileSprite(0, GROUND_Y, GAME_W, 12, 'cap').setOrigin(0, 0)
    this.add.tileSprite(0, GROUND_Y + 12, GAME_W, 120, 'brick').setOrigin(0, 0)
    this.add.tileSprite(0, GROUND_Y + 132, GAME_W, GAME_H, 'brick-deep').setOrigin(0, 0)
    for (let mx = 30; mx < GAME_W; mx += 74) {
      this.add.tileSprite(mx, GROUND_Y - 33, 40, 33, 'brick').setOrigin(0, 0)
      this.add.tileSprite(mx, GROUND_Y - 38, 40, 6, 'cap').setOrigin(0, 0)
    }
    for (let i = 0; i < 14; i++) {
      const g = this.add.sprite(40 + i * 70, GROUND_Y - 2, i % 2 ? 'grass1' : 'grass2').setOrigin(0.5, 1)
      this.tweens.add({ targets: g, rotation: Math.sin(i) * 0.12, duration: 600 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    const banner = this.add.sprite(180, GROUND_Y - 78, 'banner1').setOrigin(0.5, 0)
    this.tweens.add({ targets: banner, rotation: 0.16, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.add.rectangle(180, GROUND_Y, 6, 78, 0x2a1e18).setOrigin(0.5, 1)
    this.add.sprite(520, GROUND_Y - 78, 'banner2').setOrigin(0.5, 0)
    this.add.rectangle(520, GROUND_Y, 6, 78, 0x2a1e18).setOrigin(0.5, 1)

    // the monk, waiting
    const monk = this.add.sprite(640, GROUND_Y - 24, 'monk-idle').setScale(1)
    this.time.addEvent({ delay: 400, repeat: -1, callback: () => monk.setTexture(monk.texture.key === 'monk-idle' ? 'monk-walk1' : 'monk-idle') })

    // embers
    this.add.particles(0, 0, 'ember', {
      x: { min: 0, max: GAME_W }, y: GAME_H + 10,
      speedY: { min: -60, max: -20 }, speedX: { min: -15, max: 15 },
      lifespan: 5000, scale: { start: 0.9, end: 0 }, alpha: { start: 0.8, end: 0 },
      tint: [0xff7a2a, 0xf6c24a], blendMode: 'ADD', frequency: 160,
    })

    // ── logo ──
    const logo = this.add.text(GAME_W / 2, 148, '紅龍傳說', {
      fontFamily: CJK, fontSize: '92px', color: '#f6c24a',
      stroke: '#4a0a12', strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 6, color: 'rgba(239,106,31,0.6)', fill: true, blur: 12 },
    }).setOrigin(0.5).setScale(0)
    this.tweens.add({ targets: logo, scale: 1, duration: 620, delay: 150, ease: 'Back.easeOut' })
    const logoGlow = this.add.image(GAME_W / 2, 148, 'glow').setScale(6, 2).setTint(0xef6a1f).setAlpha(0.25).setBlendMode('ADD')
    this.tweens.add({ targets: logoGlow, alpha: 0.42, duration: 1200, yoyo: true, repeat: -1 })

    this.add.bitmapText(GAME_W / 2, 212, 'pfont', "LEGEND OF THE RED DRAGON", 20).setOrigin(0.5).setTint(0xf7ead0)
    this.add.bitmapText(GAME_W / 2, 240, 'pfont', '(C)1994 RED DRAGON SOFTWARE · SHANGHAI', 11).setOrigin(0.5).setTint(0xcbb98f)
    this.add.bitmapText(GAME_W / 2, 258, 'pfont', 'LIMITED RUN OF 5000 CARTRIDGES · REMASTERED 2026', 11).setOrigin(0.5).setTint(0x8c7a68)

    const hi = save.hiscore
    if (hi > 0) this.add.bitmapText(GAME_W / 2, 288, 'pfont', 'HI SCORE ' + String(hi).padStart(6, '0'), 14).setOrigin(0.5).setTint(0xf6c24a)

    // press start
    const press = this.add.bitmapText(GAME_W / 2, 348, 'pfont', '· PRESS ENTER ·', 22).setOrigin(0.5).setTint(0xf7ead0)
    this.tweens.add({ targets: press, alpha: 0.15, duration: 520, yoyo: true, repeat: -1 })

    // controls
    this.add.bitmapText(GAME_W / 2, GAME_H - 96, 'pfont', '←→/AD MOVE · SPACE JUMP ×2 · SHIFT DASH', 12).setOrigin(0.5).setTint(0x9a8f78)
    this.add.bitmapText(GAME_W / 2, GAME_H - 74, 'pfont', 'J STAFF COMBO · K HOLD+RELEASE SPIRIT BLAST', 12).setOrigin(0.5).setTint(0x9a8f78)
    this.add.bitmapText(GAME_W / 2, GAME_H - 52, 'pfont', 'P PAUSE · T CRT FILTER · M SOUND', 12).setOrigin(0.5).setTint(0x9a8f78)

    // shooting star
    this.time.addEvent({ delay: 3400, repeat: -1, callback: () => {
      const y = Phaser.Math.Between(30, 130)
      const star = this.add.rectangle(Phaser.Math.Between(200, GAME_W), y, 14, 2, 0xf7ead0)
      this.tweens.add({ targets: star, x: star.x - 240, y: y + 90, alpha: 0, duration: 700, onComplete: () => star.destroy() })
    } })

    // input
    const start = () => {
      chip.ensure()
      chip.play('start')
      this.cameras.main.fade(360, 5, 3, 8)
      this.time.delayedCall(380, () => this.scene.start('Game'))
    }
    this.input.keyboard.once('keydown-ENTER', start)
    this.input.keyboard.once('keydown-SPACE', start)
    this.input.once('pointerdown', start)

    // auto-start (debug/CI)
    if (this.registry.get('debugAuto')) this.time.delayedCall(250, start)

    // slow parallax drift
    this._drift = { far: mtnFar, near: mtnNear, stars, v: 0 }
  }

  update(_time, delta) {
    if (!this._drift) return
    this._drift.v += delta * 0.006
    this._drift.far.tilePositionX = this._drift.v
    this._drift.near.tilePositionX = this._drift.v * 1.8
    this._drift.stars.tilePositionX = this._drift.v * 0.3
  }
}
