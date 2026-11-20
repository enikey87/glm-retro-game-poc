// ── HUD overlay: NES-style lives/score + boss bars + cards ──────────────────
import Phaser from 'phaser'
import { GAME_W, GAME_H, P } from './constants.js'

export class UIScene extends Phaser.Scene {
  constructor() { super('UI') }

  create() {
    const reg = this.registry
    this.add.rectangle(8, 8, 180, 26, 0x000000, 0.22).setOrigin(0, 0)
    this.add.rectangle(GAME_W - 188, 8, 180, 26, 0x000000, 0.22).setOrigin(0, 0)

    // score
    this.scoreText = this.add.bitmapText(GAME_W - 16, 12, 'pfont', '', 16).setOrigin(1, 0)
    this.hiText = this.add.bitmapText(GAME_W - 16, 34, 'pfont', '', 11).setOrigin(1, 0).setTint(0xcbb98f)

    // lives + hearts
    this.lifeIcons = []
    this.heartIcons = []

    // coins
    this.add.image(24, 62, 'coin1').setScale(0.9)
    this.coinText = this.add.bitmapText(38, 55, 'pfont', '×0', 14).setTint(0xf6c24a)

    // combo
    this.comboText = this.add.bitmapText(70, 86, 'pfont', '', 26).setTint(0xf6c24a).setOrigin(0, 0.5).setAlpha(0)
    this.comboBar = this.add.rectangle(72, 102, 0, 4, 0xf6c24a).setOrigin(0, 0.5).setAlpha(0.8)

    // spirit timer
    this.spiritBarBg = this.add.rectangle(24, 128, 130, 10, 0x000000, 0.5).setOrigin(0, 0.5).setVisible(false)
    this.spiritBar = this.add.rectangle(26, 128, 126, 6, 0xf6c24a).setOrigin(0, 0.5).setVisible(false)
    this.spiritLabel = this.add.bitmapText(24, 116, 'pfont', 'DRAGON SPIRIT', 11).setTint(0xf6c24a).setVisible(false)

    // toast message
    this.msgText = this.add.bitmapText(GAME_W / 2, 46, 'pfont', '', 16).setOrigin(0.5).setTint(0xf7ead0).setAlpha(0)

    // segment title card
    this.segBand = this.add.rectangle(GAME_W / 2, GAME_H / 2 - 60, GAME_W, 0, 0x000000, 0.72)
    this.segKanji = this.add.text(GAME_W / 2, GAME_H / 2 - 84, '', {
      fontFamily: '"Noto Serif SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei", serif',
      fontSize: '42px', color: '#f6c24a', stroke: '#1a0a10', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0)
    this.segName = this.add.bitmapText(GAME_W / 2, GAME_H / 2 - 34, 'pfont', '', 15).setOrigin(0.5).setTint(0xf7ead0).setAlpha(0)

    // boss intro card
    this.bossCard = this.add.container(0, 0).setVisible(false)
    this.bossTop = this.add.rectangle(GAME_W / 2, 40, GAME_W, 80, 0x050308, 0.94)
    this.bossBot = this.add.rectangle(GAME_W / 2, GAME_H - 40, GAME_W, 80, 0x050308, 0.94)
    this.bossKanji = this.add.text(GAME_W / 2, GAME_H / 2 - 60, '', {
      fontFamily: '"Noto Serif SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei", serif',
      fontSize: '76px', color: '#ff3b2a', stroke: '#f6c24a', strokeThickness: 8,
    }).setOrigin(0.5)
    this.bossSub = this.add.bitmapText(GAME_W / 2, GAME_H / 2 + 4, 'pfont', '', 18).setOrigin(0.5).setTint(0xf7ead0)
    this.bossWarn = this.add.bitmapText(GAME_W / 2, GAME_H / 2 + 44, 'pfont', '· WARNING ·', 22).setOrigin(0.5).setTint(0xff5a3a)
    this.bossCard.add([this.bossTop, this.bossBot, this.bossKanji, this.bossSub, this.bossWarn])

    // boss hp bar
    this.bossBarWrap = this.add.container(GAME_W / 2, GAME_H - 26).setVisible(false)
    this.bossBarBg = this.add.rectangle(0, 0, 380, 16, 0x1a0a12, 0.9).setStrokeStyle(2, 0x8c1626)
    this.bossBarFill = this.add.rectangle(-189, 0, 378, 12, 0xc23a1e).setOrigin(0, 0.5)
    this.bossBarName = this.add.bitmapText(0, -15, 'pfont', '', 13).setOrigin(0.5).setTint(0xf7ead0)
    const notches = []
    for (let i = 1; i < 10; i++) notches.push(this.add.rectangle(-189 + i * 37.8, 0, 2, 14, 0x0a0508, 0.85))
    this.bossBarWrap.add([this.bossBarBg, this.bossBarFill, ...notches, this.bossBarName])

    // wire registry — changedata-KEY emits (parent, value, previous)
    const events = this.registry.events
    this._handlers = []
    const wire = (key, fn) => {
      const h = (_parent, value) => fn(value)
      events.on('changedata-' + key, h)
      this._handlers.push(['changedata-' + key, h])
    }
    wire('score', () => this.refreshScore())
    wire('hi', () => this.refreshScore())
    wire('lives', () => this.refreshLives())
    wire('hearts', () => this.refreshHearts())
    wire('coins', () => this.refreshCoins())
    wire('combo', () => this.refreshCombo())
    wire('msg', (v) => this.showToast(v))
    wire('segment', (v) => this.showSegment(v))
    wire('bossIntro', (v) => this.showBossIntro(v))
    wire('bossHp', () => this.refreshBossBar())
    wire('bossMax', () => this.refreshBossBar())
    this.events.on('shutdown', () => {
      for (const [ev, fn] of this._handlers) events.off(ev, fn)
      this._handlers = []
    })

    this.refreshScore()
    this.refreshLives()
    this.refreshHearts()
    this.refreshCoins()
    this.comboT = 0
  }

  update(time, delta) {
    // combo bar drains
    if (this.registry.get('combo') > 0) {
      const g = this.scene.get('Game')
      if (g && g.comboT !== undefined && g.combo > 0) {
        this.comboBar.width = 86 * Phaser.Math.Clamp(g.comboT / 3, 0, 1)
      }
    }
    // spirit bar
    const st = this.registry.get('spiritT') || 0
    this.spiritBarBg.setVisible(st > 0)
    this.spiritBar.setVisible(st > 0)
    this.spiritLabel.setVisible(st > 0)
    if (st > 0) this.spiritBar.width = 126 * Phaser.Math.Clamp(st / P.SPIRIT_T, 0, 1)
  }

  refreshScore() {
    const s = String(this.registry.get('score') || 0).padStart(6, '0')
    this.scoreText.setText('SCORE ' + s)
    const hi = Math.max(this.registry.get('hi') || 0, this.registry.get('score') || 0)
    this.hiText.setText('HI ' + String(hi).padStart(6, '0'))
  }

  refreshLives() {
    this.lifeIcons.forEach((i) => i.destroy())
    this.lifeIcons = []
    const n = Math.max(0, this.registry.get('lives') ?? 3)
    for (let i = 0; i < Math.min(n, 6); i++) {
      this.lifeIcons.push(this.add.image(24 + i * 24, 21, 'monk-head').setScale(0.9))
    }
    if (n > 6) this.lifeIcons.push(this.add.bitmapText(24 + 6 * 24, 14, 'pfont', '+' + (n - 6), 12).setTint(0xf7ead0))
  }

  refreshHearts() {
    this.heartIcons.forEach((i) => i.destroy())
    this.heartIcons = []
    const n = this.registry.get('hearts') ?? 3
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(30 + i * 22, 44, 'heart').setScale(0.85)
      if (i >= n) h.setAlpha(0.18).setTint(0x333333)
      this.heartIcons.push(h)
    }
  }

  refreshCoins() {
    this.coinText.setText('×' + (this.registry.get('coins') || 0))
  }

  refreshCombo() {
    const c = this.registry.get('combo') || 0
    if (c >= 2) {
      this.comboText.setText('COMBO ×' + c).setAlpha(1)
      this.comboBar.setAlpha(0.8)
      this.tweens.killTweensOf(this.comboText)
      this.comboText.setScale(1.5)
      this.tweens.add({ targets: this.comboText, scale: 1, duration: 180, ease: 'Back.easeOut' })
      this.comboText.setTint(c >= 6 ? 0xff5a3a : c >= 3 ? 0xffb52a : 0xf6c24a)
    } else {
      this.comboText.setAlpha(0)
      this.comboBar.setAlpha(0)
    }
  }

  showToast(msg) {
    if (!msg) return
    this.msgText.setText(msg).setAlpha(1).setScale(1.4)
    this.tweens.killTweensOf(this.msgText)
    this.tweens.add({ targets: this.msgText, scale: 1, duration: 140 })
    this.tweens.add({ targets: this.msgText, alpha: 0, delay: 1400, duration: 500 })
  }

  showSegment(seg) {
    if (!seg) return
    this.segKanji.setText(seg.kanji + ' · ' + seg.sub)
    this.segName.setText(seg.name)
    this.tweens.killTweensOf([this.segBand, this.segKanji, this.segName])
    this.segBand.height = 0
    this.segKanji.setAlpha(0).y = GAME_H / 2 - 70
    this.segName.setAlpha(0)
    this.tweens.add({ targets: this.segBand, height: 130, duration: 220 })
    this.tweens.add({ targets: [this.segKanji, this.segName], alpha: 1, duration: 300, delay: 120 })
    this.tweens.add({ targets: this.segKanji, y: GAME_H / 2 - 84, duration: 300, delay: 120, ease: 'Back.easeOut' })
    this.tweens.add({ targets: [this.segBand, this.segKanji, this.segName], alpha: 0, delay: 2100, duration: 400 })
  }

  showBossIntro(v) {
    if (!v) return
    this.bossKanji.setText(v.name + (v.miniboss ? '' : ''))
    this.bossSub.setText(v.sub + (v.miniboss ? '' : ' · FINAL CHAPTER'))
    this.bossCard.setVisible(true).setAlpha(0)
    this.bossWarn.setAlpha(0)
    this.tweens.add({ targets: this.bossCard, alpha: 1, duration: 150 })
    this.bossKanji.setScale(2.4)
    this.tweens.add({ targets: this.bossKanji, scale: 1, duration: 380, ease: 'Back.easeOut' })
    this.tweens.add({ targets: this.bossWarn, alpha: 1, duration: 120, yoyo: true, repeat: 5 })
    this.time.delayedCall(2300, () => {
      this.tweens.add({ targets: this.bossCard, alpha: 0, duration: 300, onComplete: () => this.bossCard.setVisible(false) })
    })
    this.refreshBossBar()
  }

  refreshBossBar() {
    const hp = this.registry.get('bossHp')
    const max = this.registry.get('bossMax')
    if (hp === undefined || hp < 0 || !max) { this.bossBarWrap.setVisible(false); return }
    this.bossBarWrap.setVisible(true)
    const intro = this.registry.get('bossIntro')
    const name = this.registry.get('bossPhase') >= 3 && intro && !intro.miniboss ? 'THE DEMON SHOGUN · RAGE' : (intro?.sub || 'BOSS')
    this.bossBarName.setText(name)
    const f = Phaser.Math.Clamp(hp / max, 0, 1)
    this.bossBarFill.width = 378 * f
    this.bossBarFill.setFillStyle(f < 0.33 ? 0xff3b2a : f < 0.66 ? 0xe8621f : 0xc23a1e)
  }
}
