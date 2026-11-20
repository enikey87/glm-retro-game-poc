// ── GameScene: the Great Wall, four segments, hazards, boss, all the juice ──
import Phaser from 'phaser'
import { GAME_W, GAME_H, GROUND_Y, SEG_W, SEGMENTS, WORLD_W, P, D, save } from './constants.js'
import { R } from './utils.js'
import { chip } from './audio.js'
import { Player } from './Player.js'
import { Enemy } from './enemies.js'

export class GameScene extends Phaser.Scene {
  constructor() { super('Game') }

  create() {
    this.physics.world.gravity.y = P.GRAVITY
    this.physics.world.setBounds(0, -300, WORLD_W, GAME_H + 600)
    this.registry.set({ score: 0, lives: 3, hearts: 3, coins: 0, scrolls: 0, scrollsTotal: 0, combo: 0, bossHp: -1, bossMax: 1, bossPhase: 1, spiritT: 0, msg: '', segment: null, bossIntro: null })
    this.startTime = this.time.now

    this.keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W',
      space: 'SPACE', z: 'Z',
      atk: 'J', x: 'X', blast: 'K', c: 'C',
      dash: 'SHIFT', l: 'L', v: 'V',
    })
    this.input.keyboard.on('keydown', () => chip.ensure())

    // groups
    this.platforms = this.physics.add.staticGroup()
    this.spikes = this.physics.add.staticGroup()
    this.breakables = this.physics.add.staticGroup()
    this.collapse = this.physics.add.group({ allowGravity: false, immovable: true })
    this.enemies = this.physics.add.group({ runChildUpdate: false })
    this.eProj = this.physics.add.group({ allowGravity: false })
    this.pProj = this.physics.add.group({ allowGravity: false })
    this.pickups = this.physics.add.group({ allowGravity: false })
    this.waves = this.physics.add.group({ allowGravity: false })
    this.rocks = this.physics.add.group()
    this.platformBodies = []
    this.lanterns = []
    this.jets = []
    this.windZones = []
    this.banners = []
    this.grasses = []
    this.checkpoints = []
    this.seals = []

    this.buildBackground()
    this.buildLevel()

    // player
    const debugX = this.registry.get('debugX')
    const startX = debugX ?? (this.registry.get('debugBoss') ? 10420 : 120)
    this.player = new Player(this, startX, GROUND_Y - 40)
    this.checkpoint = { x: startX, y: GROUND_Y - 40 }

    // fx handles
    this.player.chargeOrb = this.add.image(0, 0, 'orb').setVisible(false).setDepth(D.fx).setScale(0.5)
    this.fxEmitter = this.add.particles(0, 0, 'ember', {
      speed: { min: 10, max: 40 }, lifespan: 400, scale: { start: 0.8, end: 0 },
      tint: 0xf6c24a, emitting: false, blendMode: 'ADD',
    }).setDepth(D.particle)
    this.ambient = this.add.particles(0, 0, 'ember', {
      speedY: { min: -30, max: -8 }, speedX: { min: -14, max: 14 }, lifespan: 2600,
      scale: { start: 0.7, end: 0 }, alpha: { start: 0.7, end: 0 }, emitting: false, blendMode: 'ADD',
    }).setDepth(D.fg)

    this.buildColliders()

    // camera
    const cam = this.cameras.main
    cam.setBounds(0, 0, WORLD_W, GAME_H)
    cam.startFollow(this.player, true, 0.09, 0.1)
    cam.setDeadzone(60, 160)
    cam.fadeIn(400)
    if (this.registry.get('debugBoss')) cam.centerOn(startX, 300)

    // state
    this.combo = 0
    this.comboT = 0
    this.nextLifeAt = 5000
    this.segIndex = -1
    this.freezeT = 0
    this.pausedFlag = false
    this.minibossSpawned = false
    this.bossSpawned = false
    this.shrine = null
    this.arena = null
    this.finished = false
    this._ambT = 0
    this._meleeHits = new Set()

    this.input.keyboard.on('keydown-P', () => this.togglePause())

    this.scene.launch('UI')
    this.events.on('shutdown', () => {
      chip.stopMusic()
      this.scene.stop('UI')
    })

    chip.startMusic('stage')

    if (this.registry.get('demo')) {
      // attract-mode bot: generous lives instead of god mode, so pits still respawn it
      this.registry.set('lives', 99)
    }
  }

  togglePause() {
    this.pausedFlag = !this.pausedFlag
    this.children.getAll().forEach((c) => { if (c._pauseUi) c.destroy() })
    if (this.pausedFlag) {
      this.physics.world.pause()
      this.add.image(GAME_W / 2, GAME_H / 2, 'glow').setScale(7).setTint(0x000000).setAlpha(0.65).setScrollFactor(0).setDepth(500)._pauseUi = true
      const t1 = this.add.text(GAME_W / 2, GAME_H / 2 - 16, 'PAUSED', { fontFamily: 'monospace', fontSize: '30px', color: '#f7ead0' }).setOrigin(0.5).setScrollFactor(0).setDepth(501)
      const t2 = this.add.text(GAME_W / 2, GAME_H / 2 + 22, 'P · RESUME    M · SOUND    T · CRT', { fontFamily: 'monospace', fontSize: '12px', color: '#cbb98f' }).setOrigin(0.5).setScrollFactor(0).setDepth(501)
      t1._pauseUi = t2._pauseUi = true
    } else {
      this.physics.world.resume()
    }
  }

  // ── background ─────────────────────────────────────────────────────────────
  buildBackground() {
    this.skyImgs = {}
    for (const s of SEGMENTS) {
      this.skyImgs[s.key] = this.add.image(-4, -4, s.sky)
        .setOrigin(0, 0).setDisplaySize(GAME_W + 8, GAME_H + 8)
        .setScrollFactor(0).setDepth(D.sky).setAlpha(0)
    }
    this.skyImgs[SEGMENTS[0].key].setAlpha(1)

    this.stars = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'stars')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(D.stars).setAlpha(0)

    this.moonGlow = this.add.image(140, 105, 'glow').setScale(5.2).setTint(0xf6c24a).setAlpha(0.55).setScrollFactor(0).setDepth(D.moon).setBlendMode('ADD')
    this.moon = this.add.image(140, 105, 'moon').setScrollFactor(0).setDepth(D.moon).setAlpha(0.9)

    this.mtnFar = this.add.tileSprite(0, 0, GAME_W, 340, 'mtn-far').setOrigin(0, 0).setScrollFactor(0).setDepth(D.mountainFar)
    this.mtnNear = this.add.tileSprite(0, 90, GAME_W, 300, 'mtn-near').setOrigin(0, 0).setScrollFactor(0).setDepth(D.mountainNear)
    this.fogBack = this.add.tileSprite(0, 330, GAME_W, 160, 'fog').setOrigin(0, 0).setScrollFactor(0).setDepth(D.fogBack).setAlpha(0.5)

    // distant towers along the wall
    this.bgTowers = []
    for (let x = 500; x < WORLD_W; x += 1750) {
      this.bgTowers.push(this.add.image(x, GROUND_Y + 150, 'tower').setOrigin(0.5, 1).setDepth(D.tower).setAlpha(0.85).setScrollFactor(0.85))
    }
    this.add.rectangle(0, GROUND_Y + 90, WORLD_W, GAME_H - GROUND_Y + 200, 0x000000, 0.25).setOrigin(0, 0).setDepth(D.wall + 1.5)

    this.fogFront = this.add.tileSprite(0, 300, GAME_W, 200, 'fog').setOrigin(0, 0).setScrollFactor(0).setDepth(D.fogFront).setAlpha(0.22)
  }

  // ── level construction ─────────────────────────────────────────────────────
  solid(x, y, w, h) {
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h)
    r.setVisible(false)
    this.physics.add.existing(r, true)
    this.platforms.add(r)
    return r
  }

  groundSpan(x1, x2, top = GROUND_Y) {
    const w = x2 - x1
    this.add.tileSprite(x1, top, w, 12, 'cap').setOrigin(0, 0).setDepth(D.wall + 2)
    this.add.tileSprite(x1, top + 12, w, 110, 'brick').setOrigin(0, 0).setDepth(D.wall)
    this.add.tileSprite(x1, top + 122, w, GAME_H - top + 200, 'brick-deep').setOrigin(0, 0).setDepth(D.wall)
    this.solid(x1, top, w, 220)
    this.platformBodies.push({ x: x1, y: top, width: w })
    for (let mx = x1 + 14; mx < x2 - 44; mx += 74) {
      this.add.tileSprite(mx, top - 33, 40, 33, 'brick').setOrigin(0, 0).setDepth(D.merlon)
      this.add.tileSprite(mx, top - 38, 40, 6, 'cap').setOrigin(0, 0).setDepth(D.merlon)
    }
  }

  floatingPlatform(x, y, w = 96) {
    this.add.tileSprite(x, y, w, 12, 'cap').setOrigin(0, 0).setDepth(D.wall + 2)
    this.add.tileSprite(x, y + 12, w, 14, 'brick').setOrigin(0, 0).setDepth(D.wall)
    this.solid(x, y, w, 26)
    this.platformBodies.push({ x, y, width: w })
  }

  spikePit(x1, x2) {
    // full-depth dark backdrop so no sky leaks through below
    this.add.rectangle((x1 + x2) / 2, GROUND_Y + 150, x2 - x1 + 16, 340, 0x06040c, 0.97).setDepth(D.wall - 1)
    this.add.rectangle((x1 + x2) / 2, GROUND_Y + 20, x2 - x1 + 16, 90, 0x0d0918, 0.55).setDepth(D.wall - 1)
    for (let x = x1; x < x2 - 20; x += 24) {
      this.spikes.create(x + 12, GROUND_Y + 68, 'spike').setDepth(D.wall + 2).setScale(1.5)
    }
  }

  collapsingPlat(x, y) {
    const p = this.collapse.create(x + 32, y + 13, 'plat64')
    p.setDepth(D.wall + 2)
    p.body.setImmovable(true).setAllowGravity(false)
    p.state = 'idle'
    p.origY = y + 13
    this.platformBodies.push({ x, y, width: 64 })
    return p
  }

  breakableWall(x, contents) {
    const b = this.breakables.create(x, GROUND_Y - 36, 'brick-crack1')
    b.setDepth(D.wall + 3).setScale(2, 3)
    b.body.setSize(48, 72)
    b.hp = 2
    b.contents = contents
  }

  bannerPole(x, h = 78) {
    this.add.rectangle(x, GROUND_Y, 6, h, 0x2a1e18).setOrigin(0.5, 1).setDepth(D.decor)
    const b = this.add.sprite(x, GROUND_Y - h + 10, 'banner1').setOrigin(0.5, 0).setDepth(D.decor)
    b.phase = Math.random() * Math.PI * 2
    this.banners.push(b)
  }

  grassTuft(x) {
    const g = this.add.sprite(x, GROUND_Y - 2, Math.random() < 0.5 ? 'grass1' : 'grass2').setOrigin(0.5, 1).setDepth(D.decor)
    g.phase = Math.random() * Math.PI * 2
    this.grasses.push(g)
  }

  arch(x, y, opts = {}) {
    const poleH = opts.high ? 215 : 160
    this.add.rectangle(x - 74, y, 14, poleH, 0x332e3c).setOrigin(0.5, 1).setDepth(D.decor)
    this.add.rectangle(x + 74, y, 14, poleH, 0x332e3c).setOrigin(0.5, 1).setDepth(D.decor)
    this.add.rectangle(x, y - poleH + 7, 162, 14, 0x3a3542).setOrigin(0.5).setDepth(D.decor)
    const n = opts.lanterns || 1
    for (let i = 0; i < n; i++) {
      const lx = x + (n === 1 ? 0 : i === 0 ? -34 : 34)
      const sprite = this.add.sprite(lx, y - poleH + 100, 'lantern').setDepth(D.decor + 1)
      const glow = this.add.sprite(lx, y - poleH + 100, 'glow').setScale(opts.deadly ? 2.1 : 1.7).setTint(0xff9a4a).setAlpha(0.5).setBlendMode('ADD').setDepth(D.decor)
      const links = []
      for (let j = 0; j < 6; j++) links.push(this.add.rectangle(lx, y - poleH + 20, 5, 11, 0x6a6480).setOrigin(0.5).setDepth(D.decor))
      this.lanterns.push({
        pivotX: lx, pivotY: y - poleH + 14, len: opts.deadly ? 96 : 54,
        amp: opts.deadly ? 0.95 : 0.55, speed: opts.deadly ? 1.7 : 1.1,
        phase: i * Math.PI, deadly: !!opts.deadly, sprite, glow, links,
      })
    }
  }

  brazier(x) {
    this.add.image(x, GROUND_Y - 18, 'brazier').setDepth(D.decor)
    this.add.particles(x, GROUND_Y - 44, 'ember', {
      speedY: { min: -70, max: -30 }, speedX: { min: -12, max: 12 },
      lifespan: 700, scale: { start: 0.9, end: 0 }, frequency: 110,
      tint: [0xff7a2a, 0xffd23e], blendMode: 'ADD',
    }).setDepth(D.particle)
    this.add.image(x, GROUND_Y - 46, 'glow').setScale(2.2).setTint(0xff8a3a).setAlpha(0.3).setBlendMode('ADD').setDepth(D.decor)
  }

  checkpointGate(x) {
    const g = this.add.image(x, GROUND_Y, 'gate').setOrigin(0.5, 1).setDepth(D.gate).setTint(0x777788)
    this.checkpoints.push({ x, gate: g, active: false })
  }

  firejet(x, dir) {
    const head = this.add.image(x, GROUND_Y - 18, 'dragonhead').setDepth(D.decor).setFlipX(dir < 0).setScale(1.25)
    const glow = this.add.image(x + dir * 14, GROUND_Y - 20, 'glow').setScale(1).setTint(0xff7a2a).setAlpha(0.22).setBlendMode('ADD').setDepth(D.decor)
    this.jets.push({ x, dir, t: Math.random() * 3, head, glow, state: 'idle', bursts: 0 })
  }

  windZone(x1, x2, dir, power) {
    const emitter = this.add.particles((x1 + x2) / 2, GROUND_Y - 90, 'grass1', {
      speedX: { min: dir * 120, max: dir * 320 }, speedY: { min: -30, max: 30 },
      lifespan: 1400, scale: { start: 0.7, end: 0.3 }, alpha: { start: 0.8, end: 0 },
      tint: 0x9a8f6a, emitting: false, rotate: { min: 0, max: 360 },
    }).setDepth(D.fg)
    this.windZones.push({ x1, x2, dir, power, period: 5.2, dur: 2.6, emitter })
  }

  spawnPickup(type, x, y) {
    const tex = { scroll: 'scroll', coin: 'coin1', heart: 'heart', spirit: 'spirit', life: 'monk-head' }[type]
    const p = this.pickups.create(x, y, tex)
    p.type = type
    p.setDepth(D.pickup)
    if (type === 'scroll' || type === 'spirit' || type === 'coin') {
      const tint = type === 'spirit' ? 0xf6c24a : type === 'coin' ? 0xf6c24a : 0xffd98a
      p.glow = this.add.sprite(x, y, 'glow').setScale(type === 'coin' ? 1.1 : 1.6).setTint(tint).setAlpha(0.32).setBlendMode('ADD').setDepth(D.pickup - 1)
    }
    if (type !== 'heart' && type !== 'life') {
      this.tweens.add({ targets: p, y: y - 9, duration: 900 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 500 })
    }
    return p
  }

  spawnEnemy(type, x, y, opts = {}) {
    if (this.registry.get('debugBoss') && type !== 'shogun' && type !== 'guardian' && x < 10300) return null
    const e = new Enemy(this, x, y, type, opts)
    this.enemies.add(e)
    return e
  }

  // ── the level ──────────────────────────────────────────────────────────────
  buildLevel() {
    const rng = new R(20261120)

    // ==== SEGMENT 1 · DAWN (0..3400) ====
    this.groundSpan(0, 760)
    this.spikePit(760, 905)
    this.groundSpan(905, 1500)
    this.floatingPlatform(1030, 380, 100)
    this.spikePit(1500, 1700)
    this.groundSpan(1700, 2400)
    this.groundSpan(1985, 2165, GROUND_Y - 110)
    this.floatingPlatform(1900, GROUND_Y - 52, 70)
    this.floatingPlatform(2230, GROUND_Y - 52, 70)
    this.spikePit(2400, 2600)
    this.groundSpan(2600, 3400)

    this.breakableWall(1250, ['coin', 'coin', 'coin'])
    this.floatingPlatform(1520, 250, 80)
    this.spawnPickup('life', 1560, 205)

    this.arch(1010, GROUND_Y, { high: true })
    this.bannerPole(420); this.bannerPole(1480); this.bannerPole(2850); this.bannerPole(3330)
    this.brazier(3300)
    this.checkpointGate(3260)

    for (const [sx, sy] of [[500, 408], [565, 408], [630, 408], [790, 370], [833, 350], [876, 370],
      [1080, 336], [1560, 366], [1600, 346], [1640, 366], [2075, 300], [2520, 366], [2560, 346], [2600, 366],
      [2870, 408], [2930, 408]]) this.spawnPickup('scroll', sx, sy)
    this.spawnPickup('coin', 2075, 240)

    this.spawnEnemy('imp', 1100, GROUND_Y - 40)
    this.spawnEnemy('imp', 1380, GROUND_Y - 40)
    this.spawnEnemy('hound', 1850, GROUND_Y - 30)
    this.spawnEnemy('demon', 2150, 360)
    this.spawnEnemy('imp', 2290, GROUND_Y - 40)
    this.spawnEnemy('hound', 2960, GROUND_Y - 30)
    this.spawnEnemy('demon', 3130, 380)

    // ==== SEGMENT 2 · DUSK (3400..6800) ====
    this.groundSpan(3400, 3900)
    this.spikePit(3900, 4100)
    this.collapsingPlat(3950, 408); this.collapsingPlat(4030, 388)
    this.groundSpan(4100, 4700)
    this.spikePit(4700, 4950)
    this.collapsingPlat(4760, 400); this.collapsingPlat(4860, 380)
    this.groundSpan(4950, 5600)
    this.groundSpan(5090, 5270, GROUND_Y - 110)
    this.floatingPlatform(5005, GROUND_Y - 52, 70)
    this.floatingPlatform(5335, GROUND_Y - 52, 70)
    this.spikePit(5600, 5800)
    this.groundSpan(5800, 6800)

    this.breakableWall(3650, ['heart', 'scroll'])
    this.bannerPole(3620); this.bannerPole(5520); this.bannerPole(6780)
    this.brazier(5980); this.brazier(6620)
    this.arch(6100, GROUND_Y, { high: true })
    this.checkpointGate(6740)

    for (const [sx, sy] of [[3560, 408], [3950, 366], [4000, 346], [4050, 366], [4760, 356], [4860, 336],
      [5180, 300], [5450, 408], [5520, 408], [5650, 366], [5700, 346], [5750, 366],
      [6060, 408], [6170, 408]]) this.spawnPickup('scroll', sx, sy)
    this.spawnPickup('coin', 4860, 330)

    this.spawnEnemy('brute', 3560, GROUND_Y - 50)
    this.spawnEnemy('turret', 4330, GROUND_Y - 66)
    this.spawnEnemy('hound', 4560, GROUND_Y - 30)
    this.spawnEnemy('demon', 4740, 330)
    this.spawnEnemy('bat', 4820, 300); this.spawnEnemy('bat', 4890, 260); this.spawnEnemy('bat', 4860, 340)
    this.spawnEnemy('hound', 5060, GROUND_Y - 30)
    this.spawnEnemy('turret', 5180, GROUND_Y - 138)
    this.spawnEnemy('imp', 5450, GROUND_Y - 40)
    this.spawnEnemy('imp', 5560, GROUND_Y - 40)
    this.spawnEnemy('brute', 5900, GROUND_Y - 50)

    // ==== SEGMENT 3 · NIGHT (6800..10200) ====
    this.groundSpan(6800, 7300)
    this.spikePit(7300, 7500)
    this.groundSpan(7500, 7650)
    this.spikePit(7650, 7950)
    this.groundSpan(7950, 8600)
    this.spikePit(8600, 8800)
    this.groundSpan(8800, 9500)
    this.spikePit(9500, 9700)
    this.collapsingPlat(9540, 400); this.collapsingPlat(9630, 380)
    this.groundSpan(9700, 10200)
    this.checkpointGate(8830)

    this.arch(7740, GROUND_Y, { deadly: true, lanterns: 2 })
    this.arch(7885, GROUND_Y, { deadly: true, lanterns: 2 })
    this.firejet(8120, -1)
    this.firejet(8370, -1)
    this.firejet(9960, -1)
    this.windZone(6900, 7700, -1, 640)
    this.windZone(9200, 9900, 1, 420)

    this.bannerPole(6900); this.bannerPole(7620); this.bannerPole(9050)
    this.brazier(10120)

    this.floatingPlatform(9080, 330, 80)
    this.floatingPlatform(9210, 240, 80)
    this.spawnPickup('spirit', 9250, 195)
    this.spawnPickup('coin', 9110, 285)
    this.breakableWall(8950, ['scroll', 'heart'])
    this.floatingPlatform(9860, 300, 80)
    this.spawnPickup('heart', 9900, 255)
    this.spawnPickup('scroll', 9940, 255)

    for (const [sx, sy] of [[6920, 408], [6985, 408], [7350, 366], [7400, 346], [7450, 366],
      [7700, 330], [7800, 310], [7900, 330], [8100, 408], [8640, 366], [8690, 346], [8740, 366],
      [9030, 408], [9290, 408], [9550, 356], [9650, 336], [9880, 408], [10000, 408]]) this.spawnPickup('scroll', sx, sy)

    this.spawnEnemy('bat', 7060, 320); this.spawnEnemy('bat', 7130, 270); this.spawnEnemy('bat', 7100, 360)
    this.spawnEnemy('demon', 7360, 340)
    this.spawnEnemy('brute', 8060, GROUND_Y - 50)
    this.spawnEnemy('demon', 8270, 330)
    this.spawnEnemy('imp', 8520, GROUND_Y - 40)
    this.spawnEnemy('bat', 9120, 300); this.spawnEnemy('bat', 9200, 250); this.spawnEnemy('bat', 9160, 340)
    this.spawnEnemy('brute', 8920, GROUND_Y - 50)
    this.spawnEnemy('turret', 9320, GROUND_Y - 66)
    this.spawnEnemy('demon', 9470, 350)
    this.spawnEnemy('imp', 10020, GROUND_Y - 40)

    // ==== SEGMENT 4 · BOSS ARENA (10200..13600) ====
    this.groundSpan(10200, 13600)
    this.bannerPole(10330); this.bannerPole(11890)
    this.brazier(10560); this.brazier(11700)
    this.spawnPickup('spirit', 10330, 396)
    this.spawnPickup('scroll', 10400, 408)
    this.spawnPickup('coin', 10590, 396)
    this.checkpointGate(10530)

    for (let x = 60; x < WORLD_W - 1200; x += 95) {
      if (rng.chance(0.55)) this.grassTuft(x + rng.int(-20, 20))
    }

    this.registry.set('scrollsTotal', this.pickups.getChildren().filter((p) => p.type === 'scroll').length)
  }

  // ── physics wiring ─────────────────────────────────────────────────────────
  buildColliders() {
    const pv = this.player
    this.physics.add.collider(pv, this.platforms)
    this.physics.add.collider(pv, this.collapse, (pl, cp) => {
      if (cp.body.touching.up) this.onCollapseStand(cp)
    })
    this.physics.add.collider(pv, this.breakables)
    this.physics.add.collider(this.enemies, this.platforms, null, (e) => e.body.allowGravity || e.type === 'turret')
    this.physics.add.collider(this.rocks, this.platforms, (rock) => this.burstRock(rock))

    this.physics.add.overlap(pv, this.spikes, () => {
      if (pv.hurt(1, pv.x + Phaser.Math.Between(-30, 30))) {
        pv.setVelocityY(-580)
        this.burstSparks(pv.x, pv.y + 20, 0xd8ccb2, 8)
      }
    })
    this.physics.add.overlap(pv, this.enemies, (pl, e) => {
      if (!e.isDead) pv.hurt(1, e.x)
    })
    this.physics.add.overlap(pv, this.eProj, (pl, f) => {
      if (!f.dead) { this.explodeFireball(f); pv.hurt(1, f.x) }
    })
    this.physics.add.overlap(pv, this.waves, (pl, w) => {
      if (w.active) pv.hurt(1, w.x)
    })
    this.physics.add.overlap(pv, this.rocks, (pl, r) => {
      if (r.active) { this.burstRock(r); pv.hurt(1, r.x) }
    })
    this.physics.add.overlap(pv, this.pickups, (pl, p) => this.collectPickup(p))
    this.physics.add.collider(this.eProj, this.platforms, (f) => this.explodeFireball(f))
    this.physics.add.collider(this.pProj, this.platforms, (o) => this.burstOrb(o))
    this.physics.add.overlap(this.pProj, this.enemies, (o, e) => {
      if (e.isDead || o.dead) return
      if (o.hitSet.has(e.__id)) return
      o.hitSet.add(e.__id)
      const res = e.hurt(o.dmg, o.x)
      if (res === 'blocked') { this.killOrb(o); return }
      if (!o.pierce) { o.dead = true; this.killOrb(o) }
    })
  }

  // ── combat callbacks ───────────────────────────────────────────────────────
  onPlayerAttack(phase, facing) {
    const x = this.player.x + facing * 26
    const y = this.player.y
    const slash = this.add.image(x, y, 'slash').setDepth(D.fx).setFlipX(facing < 0).setBlendMode('ADD')
    slash.setAngle(phase === 1 ? -14 : phase === 2 ? 18 : 0)
    this.tweens.add({
      targets: slash, scale: phase === 3 ? 1.5 : 1.15, alpha: 0,
      duration: 170, onComplete: () => slash.destroy(),
    })
    if (this.player.spiritT > 0) this.fireOrb(1, facing, this.player.x, this.player.y - 4)
    this.cameras.main.shake(40, 0.0012)
  }

  onPlayerBlast(lvl, facing) {
    chip.play('blast' + lvl)
    this.fireOrb(lvl, facing, this.player.x + facing * 22, this.player.y - 4)
    this.player.setVelocityX(this.player.body.velocity.x - facing * (40 + lvl * 30))
    if (lvl >= 2) this.cameras.main.shake(90 + lvl * 30, 0.004)
    this.burstSparks(this.player.x + facing * 26, this.player.y - 4, 0xf6c24a, 6 + lvl * 4)
  }

  fireOrb(lvl, facing, x, y) {
    const o = this.pProj.create(x, y, 'orb')
    o.setDepth(D.fx).setBlendMode('ADD').setScale(0.45 + lvl * 0.28)
    o.dmg = lvl >= 3 ? 3 : lvl
    o.pierce = lvl >= 3
    o.dead = false
    o.hitSet = new Set()
    o.body.setAllowGravity(false)
    o.body.setVelocity(facing * (400 + lvl * 90), 0)
    o.body.setSize(20 + lvl * 8, 20 + lvl * 8)
    o.trail = this.time.addEvent({
      delay: 26, repeat: -1, callback: () => {
        if (!o.active || o.dead) { o.trail.remove(); return }
        this.fxEmitter.emitParticleAt(o.x, o.y)
      },
    })
    this.time.delayedCall(1700, () => this.killOrb(o))
    return o
  }

  killOrb(o) {
    if (!o.active) return
    o.trail?.remove()
    o.destroy()
  }

  burstOrb(o) {
    if (!o.active) return
    this.burstSparks(o.x, o.y, 0xf6c24a, 8)
    this.killOrb(o)
  }

  spawnFireball(x, y, vx, vy, { tex = 'fireball', grav = 0, size = 26 } = {}) {
    const f = this.eProj.create(x, y, tex)
    f.setDepth(D.fx).setBlendMode('ADD')
    f.body.setAllowGravity(grav > 0)
    if (grav > 0) f.body.setGravityY(grav - P.GRAVITY)
    f.body.setVelocity(vx, vy)
    f.body.setSize(size, size)
    f.dead = false
    return f
  }

  explodeFireball(f) {
    if (!f.active || f.dead) return
    f.dead = true
    this.burstSparks(f.x, f.y, 0xff7a2a, 10)
    this.burstDust(f.x, f.y, 4, 0x6b0f14)
    f.destroy()
  }

  spawnWave(x, y, dir, speed = 300) {
    const w = this.waves.create(x, y, 'ring')
    w.setDepth(D.fx + 1).setOrigin(0.5, 0.9).setScale(0.35, 0.4).setTint(0xffd23e).setBlendMode('ADD')
    w.body.setAllowGravity(false)
    w.body.setVelocity(dir * speed, 0)
    w.body.setSize(40, 46)
    this.tweens.add({ targets: w, scaleX: 0.6, alpha: 0.15, duration: 900 })
    this.time.delayedCall(1300, () => w.destroy())
  }

  spawnRock(x) {
    const r = this.rocks.create(x, this.cameras.main.scrollY - 30, 'rock')
    r.setDepth(D.fx)
    r.body.setSize(18, 18)
    r.body.setVelocity(Phaser.Math.Between(-40, 40), 120)
  }

  burstRock(r) {
    if (!r.active) return
    this.burstDust(r.x, r.y, 8, 0x4a4550)
    this.burstSparks(r.x, r.y, 0x8f8a96, 5)
    r.destroy()
  }

  // ── pickups ────────────────────────────────────────────────────────────────
  collectPickup(p) {
    if (!p.active) return
    switch (p.type) {
      case 'scroll': {
        chip.play('scroll')
        this.addCombo()
        this.addScore(250, p.x, p.y)
        this.registry.inc('scrolls')
        this.burstSparks(p.x, p.y, 0xf7ead0, 12)
        break
      }
      case 'coin': {
        chip.play('coin')
        this.registry.inc('coins')
        this.addScore(1000, p.x, p.y)
        this.burstSparks(p.x, p.y, 0xf6c24a, 20)
        this.cameras.main.flash(70, 246, 194, 74)
        if (this.registry.get('coins') >= 7) {
          this.addScore(5000, p.x, p.y - 30)
          this.registry.set('msg', 'ALL 7 DRAGON COINS! +5000')
          chip.play('secret')
        }
        break
      }
      case 'heart': {
        if (this.registry.get('hearts') >= 3) {
          this.addScore(200, p.x, p.y)
          chip.play('pickup')
        } else {
          this.registry.inc('hearts')
          this.player.heal()
          this.registry.set('msg', 'HEART RESTORED')
        }
        this.burstSparks(p.x, p.y, 0xff5a5a, 10)
        break
      }
      case 'spirit': {
        this.player.addSpirit()
        this.registry.set('msg', 'DRAGON SPIRIT! 龍魂')
        this.burstSparks(p.x, p.y, 0xf6c24a, 30)
        break
      }
      case 'life': {
        chip.play('oneup')
        this.registry.inc('lives')
        this.registry.set('msg', '1UP!')
        this.burstSparks(p.x, p.y, 0xf7ead0, 16)
        break
      }
    }
    p.glow?.destroy()
    p.destroy()
  }

  // ── score / combo ──────────────────────────────────────────────────────────
  addScore(base, x, y, showMult = true) {
    const mult = Math.max(1, this.combo)
    const pts = base * mult
    const score = this.registry.get('score') + pts
    this.registry.set('score', score)
    if (score > save.hiscore) { save.hiscore = score; this.registry.set('hi', score) }
    if (score >= this.nextLifeAt) {
      this.nextLifeAt += 10000
      this.registry.inc('lives')
      this.registry.set('msg', '1UP!')
      chip.play('oneup')
    }
    if (x !== undefined) this.scorePopup(`+${pts}${showMult && mult > 1 ? ' ×' + mult : ''}`, x, y)
  }

  addCombo() {
    this.combo = Math.min(8, this.combo + 1)
    this.comboT = 3
    this.registry.set('combo', this.combo)
  }

  comboBreak() {
    this.combo = 0
    this.comboT = 0
    this.registry.set('combo', 0)
  }

  onEnemyKilled(e) {
    this.addCombo()
    this.addScore(e.def.score, e.x, e.y - 20)
    if (e.type === 'guardian') this.onMinibossDown(e)
    if (e.type === 'shogun') this.onBossDown(e)
  }

  scorePopup(text, x, y, tint = 0xf7ead0) {
    const t = this.add.bitmapText(x, y, 'pfont', text, 16).setOrigin(0.5).setDepth(D.fx + 2).setTint(tint)
    this.tweens.add({ targets: t, y: y - 34, duration: 700, ease: 'Cubic.easeOut' })
    this.tweens.add({ targets: t, alpha: 0, duration: 750, onComplete: () => t.destroy() })
  }

  // ── damage / lives ─────────────────────────────────────────────────────────
  damagePlayer(dmg, isFall = false) {
    if (this.registry.get('god')) return false
    const hearts = this.registry.get('hearts') - dmg
    this.registry.set('hearts', hearts)
    if (hearts > 0 && !isFall) return true
    this.loseLife()
    return true
  }

  loseLife() {
    const lives = this.registry.get('lives') - 1
    this.registry.set('lives', lives)
    this.registry.set('hearts', 0)
    if (lives < 0) { this.gameOver(); return }
    chip.play('die')
    this.respawn()
  }

  respawn() {
    const cam = this.cameras.main
    this.player.dead = true
    this.player.body.moves = false
    this.burstSparks(this.player.x, this.player.y, 0xef6a1f, 24)
    cam.fade(400, 10, 5, 10)
    cam.once('camerafadeoutcomplete', () => {
      this.player.setPosition(this.checkpoint.x, this.checkpoint.y)
      this.player.setVelocity(0, 0)
      this.player.body.moves = true
      this.player.dead = false
      this.player.invulnT = 2
      this.registry.set('hearts', 3)
      cam.fadeIn(350)
    })
  }

  gameOver() {
    if (this.finished) return
    this.finished = true
    chip.stopMusic()
    chip.play('die')
    this.burstSparks(this.player.x, this.player.y, 0xef6a1f, 40)
    this.cameras.main.shake(300, 0.01)
    this.time.delayedCall(900, () => {
      this.cameras.main.fade(600, 5, 2, 8)
      this.time.delayedCall(650, () => this.scene.start('End', { win: false }))
    })
  }

  victory() {
    if (this.finished) return
    this.finished = true
    chip.stopMusic()
    chip.play('secret')
    this.registry.set('msg', '')
    const time = Math.round((this.time.now - this.startTime) / 1000)
    this.registry.set('result', {
      score: this.registry.get('score'),
      scrolls: this.registry.get('scrolls'),
      scrollsTotal: this.registry.get('scrollsTotal'),
      coins: this.registry.get('coins'),
      time,
    })
    this.cameras.main.flash(300, 246, 194, 74)
    this.time.delayedCall(700, () => {
      this.cameras.main.fade(700, 246, 194, 74)
      this.time.delayedCall(750, () => this.scene.start('End', { win: true }))
    })
  }

  // ── fx helpers ─────────────────────────────────────────────────────────────
  burstDust(x, y, count = 8, color = 0x9a8f78) {
    const em = this.add.particles(x, y, 'px3', {
      speed: { min: 30, max: 130 }, angle: { min: 200, max: 340 },
      lifespan: { min: 200, max: 450 }, scale: { start: 1.4, end: 0 },
      tint: color, alpha: { start: 0.7, end: 0 }, gravityY: 300, emitting: false,
    }).setDepth(D.particle)
    em.explode(count)
    this.time.delayedCall(700, () => em.destroy())
  }

  burstSparks(x, y, color = 0xffd23e, count = 12) {
    const em = this.add.particles(x, y, 'spark', {
      speed: { min: 60, max: 300 }, lifespan: { min: 200, max: 500 },
      scale: { start: 0.7, end: 0 }, tint: color, alpha: { start: 1, end: 0 },
      blendMode: 'ADD', rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(D.particle)
    em.explode(count)
    const em2 = this.add.particles(x, y, 'px2', {
      speed: { min: 80, max: 360 }, lifespan: { min: 250, max: 550 },
      scale: { start: 1.2, end: 0 }, tint: color, alpha: { start: 1, end: 0 },
      blendMode: 'ADD', gravityY: 500, emitting: false,
    }).setDepth(D.particle)
    em2.explode(count)
    this.time.delayedCall(800, () => { em.destroy(); em2.destroy() })
  }

  fxRing(x, y, tint = 0xf6c24a, scale = 0.6) {
    const r = this.add.image(x, y, 'ring').setTint(tint).setBlendMode('ADD').setScale(scale * 0.3).setDepth(D.fx)
    this.tweens.add({ targets: r, scale: scale * 1.6, alpha: 0, duration: 380, onComplete: () => r.destroy() })
  }

  // ── per-frame ──────────────────────────────────────────────────────────────
  update(time, delta) {
    if (this.pausedFlag) return
    const dt = Math.min(delta / 1000, 0.05)
    const cam = this.cameras.main
    const pv = this.player

    if (this.freezeT > 0) {
      this.freezeT -= dt
      this.updateParallax(cam, time)
      if (this.freezeT <= 0) {
        pv.body.moves = true
        this._pendingBossSpawn?.()
      }
      return
    }

    pv.update(dt)
    for (const e of this.enemies.getChildren()) e.update(dt)

    // melee hits
    if (pv.attackActive()) {
      const rect = pv.attackRect()
      for (const e of this.enemies.getChildren()) {
        if (e.isDead || this._meleeHits.has(pv.attackId * 100000 + e.__id)) continue
        if (Phaser.Geom.Intersects.RectangleToRectangle(rect, e.getBounds())) {
          this._meleeHits.add(pv.attackId * 100000 + e.__id)
          const res = e.hurt(pv.atkPhase === 3 ? 2 : 1, pv.x, { melee: true })
          if (res === 'blocked') pv.setVelocityX(-pv.facing * 200)
          this.burstSparks(e.x - pv.facing * 10, e.y - 10, 0xf7ead0, 5)
          this.cameras.main.shake(50, 0.003)
        }
      }
      for (const f of this.eProj.getChildren()) {
        if (f.dead) continue
        if (Phaser.Geom.Intersects.RectangleToRectangle(rect, f.getBounds())) {
          this.explodeFireball(f)
          this.fireOrb(2, pv.facing, f.x, f.y)
          this.addScore(50, f.x, f.y - 20, false)
          chip.play('slash1')
        }
      }
      for (const b of this.breakables.getChildren()) {
        if (!b.active || b.hp <= 0) continue
        if (Phaser.Geom.Intersects.RectangleToRectangle(rect, b.getBounds())) this.hitBreakable(b)
      }
    }
    // blasts break breakables
    for (const o of this.pProj.getChildren()) {
      if (!o.active || o.dead) continue
      for (const b of this.breakables.getChildren()) {
        if (!b.active || b.hp <= 0) continue
        if (Phaser.Math.Distance.BetweenPoints(o, b) < 44) {
          this.hitBreakable(b)
          if (!o.pierce) this.killOrb(o)
        }
      }
    }

    // combo decay
    if (this.comboT > 0) {
      this.comboT -= dt
      if (this.comboT <= 0) this.comboBreak()
    }

    // pit death
    if (pv.y > GAME_H + 140 && !pv.dead && !this.registry.get('god')) {
      chip.play('fall')
      pv.invulnT = 0
      this.loseLife()
    }

    // fireball cleanup
    for (const f of this.eProj.getChildren()) {
      if (!f.active) continue
      if (f.y > GAME_H + 80 || f.x < cam.scrollX - 150 || f.x > cam.scrollX + GAME_W + 150) this.explodeFireball(f)
    }

    this.updateHazards(dt, time)
    this.updateCheckpoints()
    this.updateTriggers()
    this.updateParallax(cam, time)
    this.updateSegment()

    // ambient particles
    this._ambT -= dt
    if (this._ambT <= 0) {
      this._ambT = 0.1
      const seg = SEGMENTS[Math.max(0, this.segIndex)]
      const tints = { dawn: [0xffe8b0], dusk: [0xff7a2a, 0xffd23e], night: [0xd8ffb0, 0xf7ead0], boss: [0xff5a1a, 0xffd23e] }[seg?.key || 'dawn']
      if (this.ambient.setParticleTint) this.ambient.setParticleTint(tints)
      this.ambient.emitParticleAt(cam.scrollX + Math.random() * GAME_W, GAME_H - Math.random() * 210)
    }

    if (this.shrine && !this.finished && Phaser.Math.Distance.Between(pv.x, pv.y, this.shrine.x, this.shrine.y) < 80) this.victory()

    this.registry.set('spiritT', pv.spiritT)
  }

  hitBreakable(b) {
    b.hp--
    chip.play('crack')
    this.burstDust(b.x, b.y, 8, 0x4a4550)
    this.cameras.main.shake(60, 0.003)
    if (b.hp === 1) b.setTexture('brick-crack2')
    if (b.hp <= 0) {
      chip.play('collapse')
      b.body.enable = false
      this.burstSparks(b.x, b.y, 0xf7ead0, 12)
      this.burstDust(b.x, b.y, 16, 0x8f8a96)
      this.tweens.add({ targets: b, alpha: 0, y: b.y + 20, duration: 260, onComplete: () => b.destroy() })
      let dy = b.y - 14
      for (const c of b.contents) {
        this.spawnPickup(c, b.x, dy)
        dy -= 32
      }
      this.registry.set('msg', 'SECRET FOUND! 秘密')
      chip.play('secret')
    }
  }

  onCollapseStand(cp) {
    if (cp.state !== 'idle') return
    cp.state = 'shake'
    chip.play('crack')
    this.tweens.add({
      targets: cp, x: cp.x + 3, duration: 55, yoyo: true, repeat: 7,
      onComplete: () => {
        cp.state = 'fall'
        cp.body.enable = false
        chip.play('collapse')
        this.burstDust(cp.x, cp.y + 12, 10, 0x8f8a96)
        this.tweens.add({
          targets: cp, y: cp.y + 340, alpha: 0, duration: 520,
          onComplete: () => {
            this.time.delayedCall(2600, () => {
              cp.state = 'idle'
              cp.alpha = 1
              cp.y = cp.origY
              cp.body.enable = true
              cp.body.reset(cp.x, cp.origY)
            })
          },
        })
      },
    })
  }

  updateHazards(dt, time) {
    for (const L of this.lanterns) {
      const a = Math.sin(time / 1000 * L.speed + L.phase) * L.amp
      const sx = Math.sin(a) * L.len
      const sy = Math.cos(a) * L.len
      const x = L.pivotX + sx, y = L.pivotY + sy
      L.sprite.setPosition(x, y).setRotation(a)
      L.glow.setPosition(x, y - 6).setAlpha(0.28 + 0.1 * Math.sin(time / 90))
      for (let j = 0; j < 6; j++) {
        const t = (j + 1) / 7
        L.links[j].setPosition(L.pivotX + sx * t, L.pivotY + sy * t).setRotation(a)
      }
      if (L.deadly && !this.player.dead && this.player.invulnT <= 0) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) < 32) this.player.hurt(1, x)
      }
    }
    const windy = this.windZones.some((z) => this.player.x > z.x1 && this.player.x < z.x2 && (time / 1000) % z.period < z.dur)
    for (const b of this.banners) b.rotation = Math.sin(time / 700 + b.phase) * (windy ? 0.55 : 0.14)
    for (const g of this.grasses) g.rotation = Math.sin(time / 500 + g.phase) * 0.1

    for (const j of this.jets) {
      j.t += dt
      const cyc = j.t % 3.4
      if (cyc < 1.6) {
        if (j.state !== 'idle') { j.state = 'idle'; j.head.clearTint() }
      } else if (cyc < 2.1) {
        if (j.state !== 'tele') { j.state = 'tele'; chip.play('ui') }
        j.head.setTint(Math.floor(cyc * 14) % 2 ? 0xff7a2a : 0xffffff)
      } else {
        if (j.state !== 'fire') { j.state = 'fire'; j.bursts = 0 }
        const bi = Math.floor((cyc - 2.1) / 0.16)
        if (bi < 4 && bi !== j.bursts) {
          j.bursts = bi
          this.spawnFireball(j.x + j.dir * 24, GROUND_Y - 20, j.dir * 330, 0, { size: 22 })
          chip.play('fireball')
        }
      }
    }

    for (const z of this.windZones) {
      const on = (time / 1000) % z.period < z.dur
      const pv = this.player
      if (on && !pv.dead && pv.x > z.x1 && pv.x < z.x2 && pv.y > GROUND_Y - 230) {
        pv.body.velocity.x += z.dir * z.power * dt
      }
      if (on && Math.random() < 0.55) z.emitter.emitParticleAt(Phaser.Math.Between(z.x1, z.x2), GROUND_Y - Math.random() * 160)
    }
  }

  updateCheckpoints() {
    for (const c of this.checkpoints) {
      if (!c.active && this.player.x > c.x) {
        c.active = true
        c.gate.setTint(0xffffff)
        this.checkpoint = { x: c.x, y: GROUND_Y - 40 }
        chip.play('checkpoint')
        this.registry.set('msg', 'CHECKPOINT 通關')
        this.burstSparks(c.x, GROUND_Y - 60, 0xf6c24a, 16)
        this.add.image(c.x, GROUND_Y - 92, 'glow').setScale(2.4).setTint(0xf6c24a).setAlpha(0.35).setBlendMode('ADD').setDepth(D.gate)
      }
    }
  }

  updateTriggers() {
    const pv = this.player
    if (!this.minibossSpawned && pv.x > 6050 && pv.x < 7000) {
      this.minibossSpawned = true
      const g = this.spawnEnemy('guardian', 6350, GROUND_Y - 60, { scale: 1.3 })
      this.registry.set('bossIntro', { name: '石獅子', sub: 'STONE LION GUARDIAN', miniboss: true, t: this.time.now })
      this.registry.set('bossHp', g.hp)
      this.registry.set('bossMax', g.maxHp)
      chip.play('roar')
      chip.startMusic('boss')
      this.cameras.main.shake(300, 0.008)
      this.burstDust(6350, GROUND_Y, 26, 0x8f8a96)
      this.freezeT = 1.8
      pv.body.moves = false
    }
    if (!this.bossSpawned && pv.x > 10750) {
      this.bossSpawned = true
      this.arena = { x1: 10480, x2: 11830 }
      this.sealArena()
      this.registry.set('bossIntro', { name: '鬼将軍', sub: 'THE DEMON SHOGUN', miniboss: false, t: this.time.now })
      chip.play('warning')
      this.cameras.main.setBounds(this.arena.x1 - 20, 0, this.arena.x2 - this.arena.x1 + 60, GAME_H)
      this.freezeT = 2.3
      pv.body.moves = false
      this._pendingBossSpawn = () => {
        const b = this.spawnEnemy('shogun', 11420, GROUND_Y - 300, { arena: this.arena })
        b.body.moves = false
        this.registry.set('bossHp', b.hp)
        this.registry.set('bossMax', b.maxHp)
        chip.play('roar')
        chip.startMusic('boss')
        this.tweens.add({
          targets: b, y: GROUND_Y - 78, duration: 800, ease: 'Quad.easeIn',
          onComplete: () => {
            if (b.isDead || !b.active || !b.body) return
            b.body.reset(b.x, b.y)
            b.body.moves = true
            this.cameras.main.shake(400, 0.012)
            this.burstDust(b.x, GROUND_Y, 20, 0x6b0f14)
            this.fxRing(b.x, GROUND_Y - 20, 0xff5a1a, 1.2)
          },
        })
      }
    }
  }

  sealArena() {
    for (const x of [this.arena.x1 - 10, this.arena.x2 + 10]) {
      const wall = this.add.rectangle(x, GROUND_Y - 400, 46, 280, 0x241a2e).setDepth(D.gate)
      wall.setStrokeStyle(4, 0x8c1626)
      this.physics.add.existing(wall, true)
      wall.body.setSize(46, 280)
      wall.body.updateFromGameObject()
      this.seals.push(wall)
      this.tweens.add({
        targets: wall, y: GROUND_Y - 130, duration: 460, ease: 'Quad.easeIn',
        onUpdate: () => wall.body.updateFromGameObject(),
        onComplete: () => {
          this.cameras.main.shake(160, 0.006)
          this.burstDust(x, GROUND_Y, 12, 0x8f8a96)
        },
      })
    }
  }

  onMinibossDown(e) {
    chip.startMusic('stage')
    this.spawnPickup('heart', e.x - 40, e.y - 60)
    this.spawnPickup('scroll', e.x + 40, e.y - 60)
    this.spawnPickup('scroll', e.x, e.y - 95)
    this.registry.set('msg', '石獅子 FELLED!')
    this.time.delayedCall(2200, () => this.registry.set('bossHp', -1))
  }

  onBossDown(e) {
    this.registry.set('msg', '鬼将軍 FELLED!')
    this.arena = null
    for (const s of this.seals) {
      this.tweens.add({
        targets: s, y: s.y - 560, alpha: 0, duration: 520,
        onComplete: () => { s.body.enable = false; s.destroy() },
      })
    }
    this.seals = []
    this.cameras.main.setBounds(0, 0, WORLD_W, GAME_H)
    chip.startMusic('stage')
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 140, () => this.burstSparks(e.x + Phaser.Math.Between(-130, 130), e.y - Phaser.Math.Between(0, 150), [0xf6c24a, 0xff7a2a, 0xf7ead0][i % 3], 18))
    }
    const sx = 13050
    this.add.image(sx, GROUND_Y - 150, 'glow').setScale(7).setTint(0xf6c24a).setAlpha(0.4).setBlendMode('ADD').setDepth(D.gate)
    this.add.image(sx, GROUND_Y, 'gate').setOrigin(0.5, 1).setDepth(D.gate).setScale(1.4, 1.2).setTint(0xfff2cc)
    const bigScroll = this.add.image(sx, GROUND_Y - 105, 'scroll').setScale(2.6).setDepth(D.gate + 1)
    this.tweens.add({ targets: bigScroll, y: GROUND_Y - 130, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.shrine = this.add.zone(sx, GROUND_Y - 100, 140, 200)
    this.add.particles(sx, GROUND_Y - 130, 'ember', {
      speedY: { min: -60, max: -20 }, speedX: { min: -30, max: 30 }, lifespan: 1400,
      scale: { start: 1, end: 0 }, tint: [0xf6c24a, 0xffd23e], blendMode: 'ADD', frequency: 60,
    }).setDepth(D.particle)
    this.registry.set('msg', 'CLAIM THE FINAL SCROLL →')
    this.time.delayedCall(2200, () => this.registry.set('bossHp', -1))
  }

  updateParallax(cam, time) {
    const sx = cam.scrollX
    this.mtnFar.tilePositionX = sx * 0.12
    this.mtnNear.tilePositionX = sx * 0.28
    this.stars.tilePositionX = sx * 0.04
    this.fogBack.tilePositionX = sx * 0.45 + time * 0.004
    this.fogFront.tilePositionX = sx * 1.15 + time * 0.011
    this.moon.x = 140 + sx * 0.03
    this.moonGlow.x = this.moon.x
    this.moon.y = 105 + Math.sin(time / 3000) * 4
    this.moonGlow.y = this.moon.y
  }

  updateSegment() {
    const idx = Phaser.Math.Clamp(Math.floor(this.player.x / SEG_W), 0, SEGMENTS.length - 1)
    const prog = (this.player.x % SEG_W) / SEG_W
    const nextIdx = Math.min(idx + 1, SEGMENTS.length - 1)
    const blend = idx === nextIdx ? 0 : Phaser.Math.Clamp((prog - 0.72) / 0.28, 0, 1)
    SEGMENTS.forEach((s, i) => {
      let a = 0
      if (i === idx) a = 1 - blend
      else if (i === nextIdx) a = blend
      this.skyImgs[s.key].setAlpha(a)
    })
    this.stars.setAlpha(SEGMENTS[idx].dark + (SEGMENTS[nextIdx].dark - SEGMENTS[idx].dark) * blend)
    this._dark = SEGMENTS[idx].dark + (SEGMENTS[nextIdx].dark - SEGMENTS[idx].dark) * blend
    const moonA = 0.3 + this._dark * 0.62
    this.moon.setAlpha(moonA)
    this.moonGlow.setAlpha(moonA * 0.6)
    this.fogBack.setAlpha(0.35 + SEGMENTS[idx].dark * 0.3)

    if (idx !== this.segIndex) {
      this.segIndex = idx
      if (this.time.now > 1500) chip.play('ui')
      this.registry.set('segment', { ...SEGMENTS[idx], t: this.time.now })
    }
  }
}
