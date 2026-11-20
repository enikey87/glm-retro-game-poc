// ── The Monk ─────────────────────────────────────────────────────────────────
import Phaser from 'phaser'
import { P, CLR } from './constants.js'
import { chip } from './audio.js'

const FRAMES = {
  idle: 'monk-idle', walk1: 'monk-walk1', walk2: 'monk-walk2',
  jump: 'monk-jump', atk1: 'monk-atk1', atk2: 'monk-atk2', atk3: 'monk-atk3',
  sit: 'monk-sit',
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monk-idle')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(0)
    this.body.setSize(22, 42).setOffset(13, 5)
    this.setCollideWorldBounds(false)
    this.body.setMaxVelocity(P.SPEED * 2.4, P.MAX_FALL)

    this.facing = 1
    this.dead = false
    this.invulnT = 0
    this.coyoteT = 0
    this.bufferT = 0
    this.jumps = 0
    this.wasGround = true

    // dash
    this.dashT = 0
    this.dashCd = 0
    this.airDashed = false

    // melee
    this.atkT = 0        // time left in current attack
    this.atkPhase = 0    // 1..3 combo step, 0 = idle
    this.atkCd = 0
    this.comboWindowT = 0
    this.attackId = 0    // increments per swing — enemies use it to avoid double hits

    // charged blast
    this.chargeT = 0
    this.chargeHeld = false

    // dragon spirit
    this.spiritT = 0

    this._frameT = 0
    this._stepT = 0
    this._ghostT = 0

    // fx handles (created by GameScene)
    this.dustFx = null
    this.chargeOrb = null
  }

  get chargeLevel() {
    if (this.chargeT <= 0) return 0
    return Math.min(3, 1 + Math.floor(this.chargeT / P.CHARGE_STEP))
  }

  grounded() { return this.body.blocked.down || this.body.touching.down }

  // ── input & physics ────────────────────────────────────────────────────────
  control(dt) {
    const k = this.scene.keys
    const demo = this.scene.registry.get('demo')
    let left = k.left.isDown || k.a.isDown
    let right = k.right.isDown || k.d.isDown
    let jumpPressed = Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(k.up) || Phaser.Input.Keyboard.JustDown(k.w) || Phaser.Input.Keyboard.JustDown(k.z)
    let atkPressed = Phaser.Input.Keyboard.JustDown(k.atk) || Phaser.Input.Keyboard.JustDown(k.x)
    let blastHeld = k.blast.isDown || k.c.isDown
    let dashPressed = Phaser.Input.Keyboard.JustDown(k.dash) || Phaser.Input.Keyboard.JustDown(k.l) || Phaser.Input.Keyboard.JustDown(k.v)

    if (demo) {
      const bot = this.demoBrain(dt)
      left = bot.left; right = bot.right; jumpPressed = bot.jump || jumpPressed
      atkPressed = bot.atk || atkPressed
      blastHeld = bot.blast
      dashPressed = bot.dash || dashPressed
    }

    const onGround = this.grounded()
    const dir = (right ? 1 : 0) - (left ? 1 : 0)

    // dash overrides horizontal control
    if (this.dashT > 0) {
      this.body.setAllowGravity(false)
      this.setVelocity(this.facing * P.DASH_V, 0)
    } else {
      this.body.setAllowGravity(true)
      const charging = this.chargeT > 0
      const maxV = P.SPEED * (charging ? 0.45 : 1)
      const accel = onGround ? P.ACCEL : P.AIR_ACCEL
      if (dir !== 0) {
        this.facing = dir
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, dir * maxV, Math.min(1, (accel / P.SPEED) * dt * 4))
      } else {
        const drag = onGround ? P.DRAG : P.AIR_DRAG
        this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, 0, Math.min(1, (drag / P.SPEED) * dt * 4))
      }
    }

    // variable-height jump: cut velocity when releasing while rising
    if (this.body.velocity.y < 0 && !(k.space.isDown || k.up.isDown || k.w.isDown || k.z.isDown) && !demo) {
      this.body.velocity.y *= 0.86
    }

    // coyote & buffer
    this.coyoteT = onGround ? P.COYOTE : Math.max(0, this.coyoteT - dt)
    if (jumpPressed) this.bufferT = P.BUFFER
    else this.bufferT = Math.max(0, this.bufferT - dt)

    if (this.bufferT > 0) {
      if (this.coyoteT > 0) {
        this.doJump(P.JUMP_V, false)
      } else if (this.jumps < 2 && this.dashT <= 0) {
        this.doJump(P.DJUMP_V, true)
      }
    }

    if (dashPressed && this.dashCd <= 0 && !this.airDashed && this.dashT <= 0) {
      if (!onGround) this.airDashed = true
      this.doDash()
    }

    // melee
    if (atkPressed && this.atkCd <= 0 && this.dashT <= 0) {
      this.attackId++
      this.atkPhase = this.comboWindowT > 0 ? (this.atkPhase % 3) + 1 : 1
      this.atkT = P.ATK_DUR
      this.atkCd = P.ATK_CD
      this.comboWindowT = P.COMBO_WINDOW
      chip.play('slash' + this.atkPhase)
      this.scene.onPlayerAttack(this.atkPhase, this.facing)
    }

    // charge blast
    if (blastHeld && this.dashT <= 0 && this.atkT <= 0) {
      this.chargeT += dt
      this.chargeHeld = true
    } else if (this.chargeHeld) {
      const lvl = this.chargeLevel
      if (lvl > 0) this.scene.onPlayerBlast(lvl, this.facing)
      this.chargeT = 0
      this.chargeHeld = false
    }
  }

  doJump(v, isDouble) {
    this.bufferT = 0
    this.coyoteT = 0
    if (!isDouble) this.jumps = 1
    else this.jumps = 2
    this.setVelocityY(v)
    chip.play(isDouble ? 'djump' : 'jump')
    this.scene.burstDust(this.x, this.y + 20, isDouble ? 8 : 5, isDouble ? 0xf7ead0 : 0x9a8f78)
    if (isDouble) this.scene.fxRing(this.x, this.y + 14, 0xf6c24a, 0.5)
  }

  doDash() {
    this.dashT = P.DASH_T
    this.dashCd = P.DASH_CD
    this.invulnT = Math.max(this.invulnT, P.DASH_T + 0.04)
    chip.play('dash')
    this.scene.burstDust(this.x - this.facing * 14, this.y + 12, 10, 0xf7ead0)
  }

  // ── attack geometry (checked by GameScene vs enemies) ─────────────────────
  attackActive() { return this.atkT > P.ATK_DUR - P.ATK_ACTIVE }

  attackRect() {
    const big = this.atkPhase === 3
    const w = big ? 62 : 48
    const h = big ? 54 : 46
    const cx = this.x + this.facing * (w / 2 + 6)
    const cy = this.y + 2
    return new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h)
  }

  // ── damage ─────────────────────────────────────────────────────────────────
  hurt(dmg, fromX, isFall = false) {
    if (this.dead || this.invulnT > 0) return false
    if (this.scene.registry.get('god')) return false
    chip.play('hurt')
    this.invulnT = P.IFRAMES
    this.scene.cameras.main.shake(120, 0.008)
    this.scene.cameras.main.flash(90, 120, 10, 20)
    this.scene.comboBreak()
    const dir = Math.sign(this.x - fromX) || 1
    this.setVelocity(dir * 240, -280)
    this.scene.burstSparks(this.x, this.y, 0xff4030, 14)
    return this.scene.damagePlayer(dmg, isFall)
  }

  heal() {
    this.invulnT = 0.6
    chip.play('heart')
  }

  addSpirit() {
    this.spiritT = P.SPIRIT_T
    chip.play('power')
    this.scene.cameras.main.flash(120, 246, 194, 74)
  }

  // ── per-frame ──────────────────────────────────────────────────────────────
  update(dt) {
    if (this.dead) return
    this.invulnT = Math.max(0, this.invulnT - dt)
    this.dashT = Math.max(0, this.dashT - dt)
    this.dashCd = Math.max(0, this.dashCd - dt)
    this.atkT = Math.max(0, this.atkT - dt)
    this.atkCd = Math.max(0, this.atkCd - dt)
    this.comboWindowT = Math.max(0, this.comboWindowT - dt)
    if (this.comboWindowT <= 0 && this.atkT <= 0) this.atkPhase = 0
    this.spiritT = Math.max(0, this.spiritT - dt)

    if (this.dashT <= 0) this.body.setAllowGravity(true)

    const onGround = this.grounded()
    if (onGround) {
      this.jumps = 0
      this.airDashed = false
      if (!this.wasGround) {
        // landing
        this.scene.burstDust(this.x, this.y + 20, 8, 0x9a8f78)
        this.scene.cameras.main.shake(50, 0.002)
      }
    }
    this.wasGround = onGround

    if (!this.dead) this.control(dt)
    this.animate(dt)

    // charge orb visual
    const lvl = this.chargeLevel
    if (lvl > 0 && this.chargeOrb) {
      this.chargeOrb.setVisible(true)
      this.chargeOrb.setPosition(this.x + this.facing * 26, this.y - 2)
      this.chargeOrb.setScale(0.4 + lvl * 0.35)
      this.chargeOrb.setAlpha(0.75 + 0.25 * Math.sin(this.scene.time.now / 60))
    } else if (this.chargeOrb) {
      this.chargeOrb.setVisible(false)
    }

    // spirit trail + dash ghosts
    this._ghostT -= dt
    if ((this.spiritT > 0 || this.dashT > 0) && this._ghostT <= 0) {
      this._ghostT = 0.05
      const ghost = this.scene.add.image(this.x, this.y, this.texture.key)
        .setFlipX(this.flipX).setDepth(-1).setAlpha(0.5)
      ghost.setTint(this.spiritT > 0 ? 0xf6c24a : 0xf7ead0)
      this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 260, onComplete: () => ghost.destroy() })
    }
    if (this.spiritT > 0) {
      this.setTint(0xffd98a)
      if (Math.random() < 0.35) this.scene.fxEmitter?.emitParticleAt(this.x + Phaser.Math.Between(-14, 14), this.y + Phaser.Math.Between(-20, 20))
    } else if (this.invulnT > 0) {
      this.setTint(0xffb0a0)
      this.setAlpha(Math.sin(this.scene.time.now / 40) > 0 ? 1 : 0.35)
    } else {
      this.clearTint()
      this.setAlpha(1)
    }
  }

  animate(dt) {
    if (this.atkT > 0) {
      this.setTexture(FRAMES['atk' + Math.min(3, this.atkPhase)])
      this.setFlipX(this.facing < 0)
      return
    }
    const onGround = this.grounded()
    const moving = Math.abs(this.body.velocity.x) > 30
    if (!onGround) {
      this.setTexture(FRAMES.jump)
    } else if (moving) {
      this._frameT += dt
      if (this._frameT > 0.12) { this._frameT = 0; this._walkFlip = !this._walkFlip }
      this.setTexture(this._walkFlip ? FRAMES.walk1 : FRAMES.walk2)
      this._stepT -= dt
      if (this._stepT <= 0) {
        this._stepT = 0.22
        this.scene.burstDust(this.x - this.facing * 12, this.y + 20, 2, 0x6a6258, 0.4)
      }
    } else {
      this.setTexture(FRAMES.idle)
    }
    this.setFlipX(this.facing < 0)
  }

  // ── demo-mode bot (attract mode / automated testing) ───────────────────────
  demoBrain(dt) {
    this._botT = (this._botT || 0) - dt
    if (this._botT <= 0) {
      this._botT = 0.4
      const s = this.scene
      // probe: is there ground ~70px ahead?
      const ahead = this.x + this.facing * 70
      let groundAhead = false
      for (const plat of s.platformBodies) {
        if (ahead > plat.x && ahead < plat.x + plat.width && Math.abs(plat.y - (this.y + 30)) < 90) { groundAhead = true; break }
      }
      const enemyNear = s.enemies?.getChildren().some((e) => !e.isDead && Math.abs(e.x - this.x) < 200 && Math.abs(e.y - this.y) < 80)
      this._bot = {
        right: this.facing > 0,
        left: this.facing < 0,
        jump: this.body.blocked.left || this.body.blocked.right || (!groundAhead && this.grounded()) || Math.random() < 0.1,
        atk: enemyNear || Math.random() < 0.3,
        blast: Math.random() < 0.15,
        dash: Math.random() < 0.06,
      }
    }
    return this._bot || { right: true }
  }
}
