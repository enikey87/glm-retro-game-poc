// ── Enemy roster: 6 regular types + stone guardian (mini-boss) + demon shogun
import Phaser from 'phaser'
import { chip } from './audio.js'

const DEFS = {
  demon:   { tex: ['demon1', 'demon2'], hp: 2, score: 150, gravity: false, size: [38, 26], drop: 0.1, color: 0xa11c22 },
  hound:   { tex: ['hound1', 'hound2'], texCharge: 'hound3', hp: 3, score: 200, gravity: true, size: [46, 26], drop: 0.12, color: 0x8c1626 },
  imp:     { tex: ['imp1', 'imp2'], hp: 1, score: 100, gravity: true, size: [24, 27], drop: 0.08, color: 0xc23a1e },
  turret:  { tex: ['turret1'], texFire: 'turret2', hp: 4, score: 300, gravity: false, size: [34, 46], drop: 0.25, color: 0x4a4550 },
  brute:   { tex: ['brute1', 'brute2'], hp: 6, score: 500, gravity: true, size: [34, 46], drop: 0.3, color: 0x7a1420 },
  bat:     { tex: ['bat1', 'bat2'], hp: 1, score: 80, gravity: false, size: [18, 14], drop: 0, color: 0x3a2450 },
  guardian:{ tex: ['guardian1', 'guardian2'], hp: 26, score: 1500, gravity: true, size: [60, 52], drop: 1, color: 0x5a5462, boss: true },
  shogun:  { tex: ['boss1', 'boss2'], hp: 56, score: 5000, gravity: true, size: [56, 66], drop: 1, color: 0x8c1226, boss: true },
}

let ENEMY_N = 0

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type, opts = {}) {
    const def = DEFS[type]
    super(scene, x, y, def.tex[0])
    this.__id = ++ENEMY_N
    this.def = def
    this.type = type
    this.hp = opts.hp ?? def.hp
    this.maxHp = this.hp
    this.isDead = false
    this._t = 0
    this._state = 'idle'
    this._vx = 0
    this._shots = -1
    this._animT = 0
    this._animFlip = false
    this._phase = 1
    this.baseY = y
    this.sine = Math.random() * Math.PI * 2
    this.arena = opts.arena || null

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(def.boss ? -9 : -10)
    // body bottom-aligned to the sprite feet
    this.body.setSize(def.size[0], def.size[1])
    this.body.setOffset((this.width - def.size[0]) / 2, this.height - def.size[1])
    this.body.setAllowGravity(def.gravity)
    this.body.setImmovable(true)
    if (opts.scale) this.setScale(opts.scale)
  }

  get player() { return this.scene.player }

  hurt(dmg, fromX, { melee = false } = {}) {
    if (this.isDead) return 'dead'
    // brute shield: blocks melee from the front
    if (this.type === 'brute' && melee) {
      const front = Math.sign(fromX - this.x) === (this.flipX ? -1 : 1)
      if (front) {
        chip.play('clank')
        this.scene.burstSparks(this.x + Math.sign(fromX - this.x) * 20, this.y - 10, 0xf6c24a, 8)
        this.setTintFill(0xffffff)
        this.scene.time.delayedCall(60, () => !this.isDead && this.clearTint())
        return 'blocked'
      }
    }
    this.hp -= dmg
    chip.play('hitEnemy')
    this.setTintFill(0xffffff)
    this.scene.time.delayedCall(70, () => !this.isDead && this.clearTint())
    this.scene.burstSparks(this.x, this.y - this.height * 0.25, 0xffd23e, 6)
    if (this.def.gravity && this.type !== 'turret') {
      this.body.velocity.x = Math.sign(this.x - fromX) * 130
      if (this.type === 'imp' || this.type === 'bat') this.body.velocity.y = -120
    }
    if (this.def.boss) {
      this.scene.registry.set('bossHp', Math.max(0, this.hp))
      chip.play('bosshit')
    }
    if (this.hp <= 0) { this.die(); return 'dead' }
    return 'hurt'
  }

  die() {
    if (this.isDead) return
    this.isDead = true
    chip.play(this.def.boss ? 'bigDie' : 'enemyDie')
    this.scene.burstSparks(this.x, this.y - this.height * 0.25, this.def.color, this.def.boss ? 60 : 18)
    this.scene.burstDust(this.x, this.y, this.def.boss ? 24 : 8, 0x6a5a6a)
    if (this.def.boss) {
      this.scene.cameras.main.shake(500, 0.012)
      this.scene.registry.set('bossHp', 0)
    }
    if (this.def.drop > 0 && Math.random() < this.def.drop) {
      this.scene.spawnPickup('heart', this.x, this.y - 20)
    }
    this.scene.onEnemyKilled(this)
    this.body.enable = false
    // little death hop + fade
    this.scene.tweens.add({
      targets: this,
      y: this.y - 26,
      alpha: 0,
      angle: Phaser.Math.Between(-40, 40),
      duration: 380,
      onComplete: () => this.destroy(),
    })
  }

  facePlayer() {
    const p = this.player
    if (p && Math.abs(p.x - this.x) > 8) this.setFlipX(p.x < this.x)
  }

  distToPlayer() {
    const p = this.player
    return p ? Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) : 1e9
  }

  animate2(dt, speed = 0.18) {
    this._animT += dt
    if (this._animT > speed) { this._animT = 0; this._animFlip = !this._animFlip }
    const tex = this.def.tex[this._animFlip ? 1 : 0] || this.def.tex[0]
    this.setTexture(tex)
  }

  update(dt) {
    if (this.isDead || !this.body) return
    // cull far-away updates
    if (Math.abs(this.x - this.scene.cameras.main.scrollX - 480) > 900) return
    this['_ai_' + this.type]?.(dt)
  }

  // ── flyer: sine wave drift toward the monk ────────────────────────────────
  _ai_demon(dt) {
    this.sine += dt * 2.4
    this._t += dt
    const p = this.player
    if (p) {
      const dir = Math.sign(p.x - this.x)
      this._vx = Phaser.Math.Linear(this._vx, dir * 55, dt * 1.5)
      const targetY = p.y - 40
      this.body.velocity.y = Math.sin(this.sine) * 70 + Phaser.Math.Clamp((targetY - this.y) * 0.6, -40, 40)
      this.setFlipX(dir < 0)
    } else this.body.velocity.y = Math.sin(this.sine) * 70
    this.body.velocity.x = this._vx
    this.animate2(dt, 0.16)
  }

  // ── hound: patrol → telegraph → charge ────────────────────────────────────
  _ai_hound(dt) {
    const p = this.player
    const b = this.body
    if (this._state === 'idle') {
      this._vx = this._vx || 70
      b.velocity.x = this._vx
      if (this.body.blocked.right) this._vx = -70
      if (this.body.blocked.left) this._vx = 70
      this.setFlipX(this._vx < 0)
      if (p && Math.abs(p.x - this.x) < 320 && Math.abs(p.y - this.y) < 80) {
        this._state = 'telegraph'
        this._t = 0
        this.setFlipX(p.x < this.x)
      }
      this.setTexture(this.def.tex[this._animFlip ? 1 : 0])
      this.animate2(dt, 0.14)
    } else if (this._state === 'telegraph') {
      this._t += dt
      b.velocity.x = 0
      this.setTint(Math.floor(this._t * 12) % 2 ? 0xff5a3a : 0xffffff)
      this.setTexture(this.def.texCharge)
      if (this._t > 0.5) {
        this.clearTint()
        this._state = 'charge'
        this._t = 0
        this._dir = this.flipX ? -1 : 1
        chip.play('dash')
        this.scene.burstDust(this.x - this._dir * 20, this.y + 16, 8, 0x9a8f78)
      }
    } else if (this._state === 'charge') {
      this._t += dt
      b.velocity.x = this._dir * 400
      this.setTexture(this.def.texCharge)
      if (Math.random() < 0.4) this.scene.burstDust(this.x - this._dir * 20, this.y + 18, 2, 0x5a4a3a, 0.5)
      if (this._t > 0.85 || this.body.blocked.left || this.body.blocked.right) {
        this._state = 'tired'
        this._t = 0
        if (this.body.blocked.left || this.body.blocked.right) this.scene.burstSparks(this.x + this._dir * 20, this.y, 0xffd23e, 8)
      }
    } else { // tired
      this._t += dt
      b.velocity.x *= 0.9
      this.setTexture(this.def.tex[0])
      if (this._t > 1) { this._state = 'idle'; this._vx = this.flipX ? -70 : 70 }
    }
  }

  // ── imp: hops toward the monk ─────────────────────────────────────────────
  _ai_imp(dt) {
    this._t += dt
    const b = this.body
    b.velocity.x *= 0.98
    const p = this.player
    if (this._t > 1.05 && b.blocked.down && p) {
      this._t = 0
      const dir = Math.sign(p.x - this.x) || 1
      b.velocity.x = dir * 165
      b.velocity.y = -430
      this.setFlipX(dir < 0)
    }
    this.animate2(dt, 0.22)
  }

  // ── turret: static statue, spits fireballs ────────────────────────────────
  _ai_turret(dt) {
    const p = this.player
    if (!p) return
    const d = Math.abs(p.x - this.x)
    this.facePlayer()
    if (this._state === 'idle') {
      this.setTexture(this.def.tex[0])
      if (d < 460 && Math.abs(p.y - this.y) < 200) {
        this._state = 'telegraph'
        this._t = 0
      }
    } else if (this._state === 'telegraph') {
      this._t += dt
      this.setTint(Math.floor(this._t * 14) % 2 ? 0xff7a2a : 0xffffff)
      if (this._t > 0.55) {
        this.clearTint()
        this._state = 'fire'
        this._shotT = 0
        this._shots = 0
      }
    } else if (this._state === 'fire') {
      this.setTexture(this.def.texFire)
      this._shotT += dt
      if (this._shotT > 0.28 && this._shots < 3 && d < 520) {
        this._shotT = 0
        this._shots++
        const dir = Math.sign(p.x - this.x) || 1
        const dx = p.x - this.x
        const dy = p.y - (this.y - 12)
        const n = Math.hypot(dx, dy) || 1
        const sp = 250
        this.scene.spawnFireball(this.x + dir * 16, this.y - 14, (dx / n) * sp, (dy / n) * sp - 40, {})
        chip.play('fireball')
      }
      if (this._shots >= 3) {
        this._state = 'cool'
        this._t = 0
        this.setTexture(this.def.tex[0])
      }
    } else { // cool
      this._t += dt
      if (this._t > 1.6) this._state = 'idle'
    }
  }

  // ── brute: slow advance, melee-proof from the front ───────────────────────
  _ai_brute(dt) {
    const p = this.player
    if (!p) return
    this.facePlayer()
    const dir = this.flipX ? -1 : 1
    this.body.velocity.x = dir * 42
    this.animate2(dt, 0.3)
    if (Math.random() < 0.02) this.scene.burstDust(this.x - dir * 16, this.y + 20, 1, 0x6a5a4a, 0.5)
  }

  // ── bat: fast erratic homing flutter ──────────────────────────────────────
  _ai_bat(dt) {
    const p = this.player
    this.sine += dt * 9
    const b = this.body
    if (p) {
      const dx = p.x - this.x, dy = p.y - 30 - this.y
      const n = Math.hypot(dx, dy) || 1
      b.velocity.x = Phaser.Math.Linear(b.velocity.x, (dx / n) * 130 + Math.sin(this.sine * 0.7) * 60, dt * 2.4)
      b.velocity.y = Phaser.Math.Linear(b.velocity.y, (dy / n) * 130 + Math.sin(this.sine) * 80, dt * 2.4)
    }
    this.animate2(dt, 0.09)
  }

  // ── stone guardian (mini-boss) ────────────────────────────────────────────
  _ai_guardian(dt) {
    const p = this.player
    if (!p) return
    const b = this.body
    this._t += dt
    if (this._state === 'idle') {
      b.velocity.x *= 0.8
      this.setTexture(this.def.tex[0])
      this.facePlayer()
      if (this._t > 0.8) { this._state = 'crouch'; this._t = 0 }
    } else if (this._state === 'crouch') {
      b.velocity.x = 0
      this.setTint(Math.floor(this._t * 10) % 2 ? 0xffd23e : 0xffffff)
      if (this._t > 0.6) {
        this.clearTint()
        this._state = 'leap'
        this._t = 0
        const dx = p.x - this.x
        b.velocity.x = Phaser.Math.Clamp(dx / 0.85, -420, 420)
        b.velocity.y = -640
        chip.play('roar')
        this.scene.burstDust(this.x, this.y + 30, 12, 0x9a8f78)
      }
    } else if (this._state === 'leap') {
      this.setTexture(this.def.tex[1])
      if (b.blocked.down && this._t > 0.25) {
        this._state = 'land'
        this._t = 0
        this.scene.cameras.main.shake(220, 0.008)
        this.scene.burstDust(this.x, this.y + 28, 20, 0x8f8a96)
        this.scene.fxRing(this.x, this.y + 24, 0xf7ead0, 0.8)
        this.scene.spawnWave(this.x - 40, this.y + 20, -1)
        this.scene.spawnWave(this.x + 40, this.y + 20, 1)
      }
    } else if (this._state === 'land') {
      b.velocity.x *= 0.7
      if (this._t > 0.5) {
        this._state = 'breath'
        this._t = 0
        this._shots = 0
      }
    } else if (this._state === 'breath') {
      this.setTexture(this.def.tex[1])
      b.velocity.x = 0
      this.facePlayer()
      if (this._t > this._shots * 0.35 + 0.4) {
        this._shots++
        const dir = Math.sign(p.x - this.x) || 1
        for (const spread of [-0.35, 0, 0.35]) {
          const ang = spread + (this.flipX ? Math.PI : 0)
          this.scene.spawnFireball(this.x + dir * 30, this.y - 16, Math.cos(ang) * 240 * dir, Math.sin(ang) * 240 - 60, { tex: 'rock', grav: 700 })
        }
        chip.play('fireball')
        if (this._shots >= 2) { this._state = 'idle'; this._t = 0 }
      }
    }
  }

  // ── 鬼将軍 — the Demon Shogun (final boss) ────────────────────────────────
  _enter(state) {
    this._state = state
    this._t = 0
    this._shots = -1
    this._dashing = false
    this._slamInit = false
    this._summoned = false
  }

  _ai_shogun(dt) {
    const p = this.player
    if (!p || this._paused) return
    const b = this.body
    this._t += dt
    const phase = this.hp > this.maxHp * 0.66 ? 1 : this.hp > this.maxHp * 0.33 ? 2 : 3
    if (phase !== this._phase) {
      this._phase = phase
      this._enter('roar')
      chip.play('roar')
      this.scene.cameras.main.shake(300, 0.01)
      this.scene.burstSparks(this.x, this.y - 30, 0xff5a1a, 30)
      this.setTint(phase === 3 ? 0xff8a6a : 0xffffff)
      this.scene.time.delayedCall(400, () => !this.isDead && (phase === 3 ? this.setTint(0xffb0a0) : this.clearTint()))
      this.scene.registry.set('bossPhase', phase)
      return
    }
    const speedMul = phase === 1 ? 1 : phase === 2 ? 1.25 : 1.55

    const pick = () => {
      const moves = ['volley', 'slam']
      if (phase >= 2) moves.push('dash', 'summon')
      if (phase >= 3) moves.push('rain', 'dash')
      return moves[Math.floor(Math.random() * moves.length)]
    }

    if (this._state === 'idle') {
      this.setTexture(this.def.tex[0])
      this.facePlayer()
      const dir = this.flipX ? -1 : 1
      b.velocity.x = dir * (this.type === 'shogun' ? 115 : 46) * speedMul
      if (this._t > 1.1 / speedMul) this._enter(pick())
    } else if (this._state === 'roar') {
      b.velocity.x = 0
      if (this._t > 0.9) this._enter('idle')
    } else if (this._state === 'volley') {
      b.velocity.x = 0
      this.setTexture(this.def.tex[1])
      this.facePlayer()
      const shots = phase >= 3 ? 7 : 5
      const i = Math.floor(this._t / 0.22)
      if (i < shots && i !== this._shots) {
        this._shots = i
        const ang0 = Math.atan2(p.y - 20 - this.y, p.x - this.x)
        const ang = ang0 + (i - (shots - 1) / 2) * 0.22
        const sp = 270 + phase * 22
        this.scene.spawnFireball(this.x, this.y - 26, Math.cos(ang) * sp, Math.sin(ang) * sp, { grav: 120 })
        chip.play('fireball')
      }
      if (this._t > shots * 0.22 + 0.5) this._enter('idle')
    } else if (this._state === 'slam') {
      if (!this._slamInit) {
        this._slamInit = true
        b.velocity.x = Phaser.Math.Clamp((p.x - this.x) / 0.8, -520, 520)
        b.velocity.y = -720
        this.setTexture(this.def.tex[1])
      }
      if (b.blocked.down && this._t > 0.3) {
        this.scene.cameras.main.shake(280, 0.012)
        this.scene.burstSparks(this.x, this.y + 10, 0xff7a2a, 24)
        this.scene.burstDust(this.x, this.y + 22, 18, 0x6a5a6a)
        this.scene.spawnWave(this.x - 50, this.y + 14, -1, 340)
        this.scene.spawnWave(this.x + 50, this.y + 14, 1, 340)
        if (phase >= 2) {
          for (let i = 0; i < 5; i++) this.scene.time.delayedCall(i * 120, () => this.scene.spawnRock(p.x + Phaser.Math.Between(-260, 260)))
        }
        this._enter('idle')
      }
    } else if (this._state === 'dash') {
      if (this._t < 0.5) {
        b.velocity.x = 0
        this.setTintFill(Math.floor(this._t * 16) % 2 ? 0xff5a1a : 0xffffff)
      } else if (!this._dashing) {
        this._dashing = true
        this.clearTint()
        const dir = Math.sign(p.x - this.x) || 1
        this.setFlipX(dir < 0)
        b.velocity.x = dir * 560 * speedMul
        b.velocity.y = -60
        chip.play('dash')
      } else {
        this.setTexture(this.def.tex[1])
        if (Math.random() < 0.6) this.scene.burstSparks(this.x, this.y - 10, 0xff5a1a, 2)
        if (this._t > 0.5 + 0.55) this._enter('idle')
      }
    } else if (this._state === 'summon') {
      b.velocity.x = 0
      this.setTexture(this.def.tex[1])
      if (this._t > 0.5 && !this._summoned) {
        this._summoned = true
        for (let i = 0; i < 3; i++) {
          this.scene.time.delayedCall(i * 150, () => {
            this.scene.spawnEnemy('bat', this.x + Phaser.Math.Between(-160, 160), this.y - 190)
            this.scene.burstSparks(this.x, this.y - 150, 0x3a2450, 10)
          })
        }
        chip.play('warning')
      }
      if (this._t > 1.2) this._enter('idle')
    } else if (this._state === 'rain') {
      b.velocity.x = 0
      this.setTexture(this.def.tex[1])
      if (this._t < 0.6) this.setTint(Math.floor(this._t * 12) % 2 ? 0xff2a1a : 0xffffff)
      else {
        this.clearTint()
        const i = Math.floor((this._t - 0.6) / 0.14)
        if (i < 9 && i !== this._shots) {
          this._shots = i
          const a = this.scene.arena
          const x = a ? Phaser.Math.Between(a.x1 + 60, a.x2 - 60) : this.x
          this.scene.spawnFireball(x, this.scene.cameras.main.scrollY + 20, 0, 240, { grav: 260 })
        }
        if (this._t > 0.6 + 9 * 0.14 + 0.4) this._enter('idle')
      }
    }
    if (this.arena) this.x = Phaser.Math.Clamp(this.x, this.arena.x1 + 40, this.arena.x2 - 40)
  }
}
