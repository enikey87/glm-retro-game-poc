// ── Chiptune engine: WebAudio oscillators, data-driven SFX + 2-track music ──
// No audio files — everything is synthesized, Famicom style.

const NOTE = (semi) => 220 * Math.pow(2, semi / 12) // semi 0 = A3

// each sfx = list of steps scheduled relative to now
const SFX = {
  jump:    [{ f: 'sq', a: 280, b: 640, d: 0.12, v: 0.5 }],
  djump:   [{ f: 'sq', a: 420, b: 880, d: 0.11, v: 0.5 }, { t: 0.05, f: 'sq', a: 620, b: 1200, d: 0.09, v: 0.35 }],
  dash:    [{ f: 'noise', d: 0.14, v: 0.45, hp: 900 }, { f: 'sq', a: 190, b: 80, d: 0.12, v: 0.3 }],
  slash1:  [{ f: 'noise', d: 0.06, v: 0.4, hp: 2400 }, { f: 'sq', a: 740, b: 300, d: 0.06, v: 0.25 }],
  slash2:  [{ f: 'noise', d: 0.06, v: 0.4, hp: 2000 }, { f: 'sq', a: 620, b: 240, d: 0.07, v: 0.25 }],
  slash3:  [{ f: 'noise', d: 0.12, v: 0.5, hp: 1500 }, { f: 'sq', a: 480, b: 140, d: 0.14, v: 0.35 }],
  hitEnemy:  [{ f: 'sq', a: 200, b: 70, d: 0.08, v: 0.5 }, { f: 'noise', d: 0.07, v: 0.4, lp: 3000 }],
  clank:   [{ f: 'sq', a: 1250, b: 900, d: 0.05, v: 0.3 }, { f: 'sq', a: 833, b: 622, d: 0.07, v: 0.2 }, { f: 'noise', d: 0.05, v: 0.3, hp: 3200 }],
  enemyDie:  [{ f: 'noise', d: 0.25, v: 0.5, lp: 2200 }, { f: 'sq', a: 330, b: 50, d: 0.28, v: 0.4 }],
  bigDie:  [{ f: 'noise', d: 0.5, v: 0.6, lp: 1800 }, { f: 'saw', a: 220, b: 30, d: 0.6, v: 0.5 }, { t: 0.1, f: 'noise', d: 0.4, v: 0.4, lp: 900 }],
  pickup:  [{ f: 'sq', a: 660, b: 660, d: 0.05, v: 0.4 }, { t: 0.05, f: 'sq', a: 990, b: 990, d: 0.09, v: 0.4 }],
  scroll:  [{ f: 'sq', a: 587, b: 587, d: 0.05, v: 0.4 }, { t: 0.05, f: 'sq', a: 880, b: 880, d: 0.05, v: 0.4 }, { t: 0.1, f: 'sq', a: 1175, b: 1175, d: 0.1, v: 0.4 }],
  coin:    [{ f: 'sq', a: 988, b: 988, d: 0.05, v: 0.45 }, { t: 0.06, f: 'sq', a: 1319, b: 1319, d: 0.14, v: 0.45 }],
  power:   [0, 4, 7, 12, 16].map((n, i) => ({ t: i * 0.07, f: 'sq', a: NOTE(n + 12), b: NOTE(n + 12), d: 0.09, v: 0.4 })),
  heart:   [{ f: 'tri', a: 523, b: 523, d: 0.08, v: 0.5 }, { t: 0.08, f: 'tri', a: 784, b: 784, d: 0.14, v: 0.5 }],
  blast1:  [{ f: 'saw', a: 700, b: 220, d: 0.18, v: 0.4 }],
  blast2:  [{ f: 'saw', a: 800, b: 160, d: 0.24, v: 0.45 }, { f: 'noise', d: 0.12, v: 0.3, hp: 1400 }],
  blast3:  [{ f: 'saw', a: 900, b: 90, d: 0.35, v: 0.55 }, { f: 'noise', d: 0.3, v: 0.45, lp: 2600 }, { t: 0.04, f: 'sq', a: 1400, b: 300, d: 0.2, v: 0.3 }],
  hurt:    [{ f: 'saw', a: 320, b: 70, d: 0.22, v: 0.55 }, { f: 'noise', d: 0.15, v: 0.35, lp: 1200 }],
  die:     [{ f: 'sq', a: 600, b: 40, d: 0.5, v: 0.5 }, { t: 0.12, f: 'noise', d: 0.4, v: 0.4, lp: 1500 }],
  fall:    [{ f: 'sq', a: 700, b: 80, d: 0.55, v: 0.45 }],
  checkpoint: [0, 7, 12].map((n, i) => ({ t: i * 0.09, f: 'tri', a: NOTE(n), b: NOTE(n), d: 0.16, v: 0.5 })),
  secret:  [0, 3, 7, 10, 12, 15].map((n, i) => ({ t: i * 0.06, f: 'sq', a: NOTE(n + 12), b: NOTE(n + 12), d: 0.08, v: 0.35 })),
  oneup:   [0, 4, 7, 12, 7, 12, 16].map((n, i) => ({ t: i * 0.07, f: 'sq', a: NOTE(n + 12), b: NOTE(n + 12), d: 0.07, v: 0.4 })),
  crack:   [{ f: 'noise', d: 0.12, v: 0.45, lp: 2000 }],
  collapse: [{ f: 'noise', d: 0.4, v: 0.5, lp: 900 }, { f: 'sq', a: 140, b: 40, d: 0.4, v: 0.35 }],
  fireball: [{ f: 'saw', a: 500, b: 120, d: 0.2, v: 0.3 }],
  roar:    [{ f: 'saw', a: 80, b: 42, d: 0.9, v: 0.65 }, { f: 'noise', d: 0.8, v: 0.4, lp: 500 }, { t: 0.15, f: 'sq', a: 60, b: 50, d: 0.5, v: 0.4 }],
  bosshit: [{ f: 'sq', a: 240, b: 90, d: 0.09, v: 0.5 }, { f: 'noise', d: 0.08, v: 0.35, hp: 2000 }],
  warning: [{ f: 'sq', a: 880, b: 880, d: 0.16, v: 0.4 }, { t: 0.22, f: 'sq', a: 660, b: 660, d: 0.16, v: 0.4 }, { t: 0.44, f: 'sq', a: 880, b: 880, d: 0.16, v: 0.4 }],
  gust:    [{ f: 'noise', d: 0.9, v: 0.3, lp: 700 }],
  ui:      [{ f: 'sq', a: 880, b: 880, d: 0.04, v: 0.3 }],
  start:   [0, 7, 12, 19].map((n, i) => ({ t: i * 0.08, f: 'sq', a: NOTE(n), b: NOTE(n), d: 0.1, v: 0.4 })),
}

// music: 32 sixteenth steps, semitone offsets from A3 (null = rest)
const MUSIC = {
  stage: {
    bpm: 128,
    bass: [0, null, null, 0, null, 0, null, null, -2, null, null, -2, null, -2, null, null, 3, null, null, 3, null, 3, null, null, -2, null, null, -2, null, -2, 5, 3],
    lead: [12, null, 10, null, 7, null, 10, null, 12, null, 15, null, 12, null, 10, null, 7, null, 5, null, 7, null, 10, 7, null, 5, null, 3, null, 0, null],
    hat:  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  },
  boss: {
    bpm: 152,
    bass: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 6, null, 5, null, 0, 0, 1, 0, 0, 0, 1, 0, 8, 8, 7, 7, 6, 6, 5, 5],
    lead: [12, null, null, 12, 13, null, 12, null, 10, null, 8, null, 10, null, null, null, 12, null, null, 12, 13, null, 15, null, 18, null, 17, null, 13, 12, 10, 8],
    hat:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
}

class ChipAudio {
  constructor() {
    this.ctx = null
    this.muted = false
    this.musicOn = true
    this.track = null
    this._step = 0
    this._nextT = 0
    this._timer = null
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.8
      // gentle echo for space
      const delay = this.ctx.createDelay(1)
      delay.delayTime.value = 0.22
      const fb = this.ctx.createGain(); fb.gain.value = 0.22
      const wet = this.ctx.createGain(); wet.gain.value = 0.14
      this.master.connect(this.ctx.destination)
      this.master.connect(delay)
      delay.connect(fb); fb.connect(delay)
      delay.connect(wet); wet.connect(this.ctx.destination)
      // noise buffer
      const len = this.ctx.sampleRate * 1
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const d = this.noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return true
  }

  setMuted(m) {
    this.muted = m
    if (this.ctx) this.master.gain.value = m ? 0 : 0.8
  }

  _osc({ f = 'sq', a = 440, b = null, d = 0.1, v = 0.4, t = 0, hp = 0, lp = 0 }) {
    if (!this.ctx || this.muted) return
    const now = this.ctx.currentTime + t
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(v, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + d)
    let src
    if (f === 'noise') {
      src = this.ctx.createBufferSource()
      src.buffer = this.noiseBuf
      src.loop = true
    } else {
      src = this.ctx.createOscillator()
      src.type = f
      src.frequency.setValueAtTime(a, now)
      if (b !== null && b !== a) src.frequency.exponentialRampToValueAtTime(Math.max(20, b), now + d)
    }
    let node = src
    if (hp) { const flt = this.ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = hp; node.connect(flt); node = flt }
    if (lp) { const flt = this.ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = lp; node.connect(flt); node = flt }
    node.connect(g)
    g.connect(this.master)
    src.start(now)
    src.stop(now + d + 0.05)
  }

  play(name) {
    if (!this.ctx) return
    const steps = SFX[name]
    if (!steps) return
    for (const s of steps) this._osc(s)
  }

  startMusic(track) {
    if (!this.ensure() || this.track === track) return
    this.track = track
    this._step = 0
    this._nextT = this.ctx.currentTime + 0.1
    if (!this._timer) this._timer = setInterval(() => this._schedule(), 40)
  }

  stopMusic() {
    this.track = null
    if (this._timer) { clearInterval(this._timer); this._timer = null }
  }

  _schedule() {
    if (!this.ctx || !this.track || !this.musicOn || this.muted) { this._nextT = this.ctx ? this.ctx.currentTime + 0.1 : 0; return }
    const pat = MUSIC[this.track]
    const stepDur = 60 / pat.bpm / 4
    while (this._nextT < this.ctx.currentTime + 0.15) {
      const i = this._step % 32
      const t = this._nextT - this.ctx.currentTime
      const b = pat.bass[i]
      if (b !== null && b !== undefined) this._osc({ f: 'tri', a: NOTE(b - 12), b: NOTE(b - 12), d: stepDur * 1.8, v: 0.16, t })
      const l = pat.lead[i]
      if (l !== null && l !== undefined) this._osc({ f: 'sq', a: NOTE(l), b: NOTE(l), d: stepDur * 1.4, v: 0.085, t })
      if (pat.hat[i]) this._osc({ f: 'noise', d: 0.03, v: 0.05, hp: 6000, t })
      this._step++
      this._nextT += stepDur
    }
  }
}

export const chip = new ChipAudio()
