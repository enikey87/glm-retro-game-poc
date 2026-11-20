# 紅龍傳說 · Legend of the Red Dragon

> In 1994, a small Shanghai studio called **Red Dragon Software** released a
> Famicom game exclusively for the Chinese market. Only 5,000 cartridges were
> ever made. This is that "lost cartridge", rebuilt as a playable HTML5
> prototype — an NES-era silhouette with a modern-remaster layer of particles,
> glow and juice.

**Play it:** https://enikey87.github.io/glm-retro-game-poc/

A side-scrolling platformer: a monk walks the Great Wall, fights demons and
collects wisdom scrolls. 3 lives, score counter, a mini-boss midway and the
Demon Shogun at the end.

## Everything is procedural

Zero image, audio or font assets — every sprite is drawn at boot from chunky
pixel maps (1 art pixel = 3×3 real pixels), every texture (bricks, parallax
mountains, moon, sky gradients, CRT overlay) is generated on canvas, every
sound is a synthesized chiptune (WebAudio square/saw/triangle/noise), and the
HUD font is a hand-drawn 5×5 bitmap font registered as a Phaser RetroFont.

## Features

- **4 segments along the Wall** — dawn → dusk → night → boss arena, with
  crossfading skies, stars, moon and parallax fog
- **8 enemy types** — sine-wave flying demons, charging hellhounds (with
  telegraph), hopping imps, fireball turret-statues, shielded armored brutes
  (melee-proof from the front), homing bat swarms, the 石獅子 Stone Lion
  Guardian mini-boss, and 鬼将軍 the Demon Shogun with 3 phases
- **Hazards** — spike pits, collapsing battlements, swinging lantern chains,
  dragon-head fire traps, wind gusts (with drifting leaves)
- **Mechanics** — double jump, dash with afterimages, 3-hit staff combo,
  hold-to-charge spirit blast (3 levels, level 3 pierces), melee-reflected
  fireballs, combo multiplier ×8, Dragon Spirit power-up
- **Collectibles & secrets** — 50 wisdom scrolls, 7 golden dragon coins
  (all 7 = +5000), hearts, 1UPs behind breakable walls and on hidden ledges
- **Juice** — 5+ parallax layers, landing dust, hit sparks, embers, screen
  shake and flash, hit-stop blinks, boss intro cards, segment title cards,
  CRT/scanline filter (**T**), and a full synthesized soundtrack + SFX
- **NES-style HUD** — monk-head lives, hearts, score/hi-score, combo counter,
  boss health bar

## Controls

| Key | Action |
| --- | --- |
| ← → / A D | Move |
| SPACE / W / ↑ / Z | Jump (press again for double jump) |
| SHIFT / L / V | Dash |
| J / X | Staff combo (3 hits) |
| K / C (hold, release) | Charged spirit blast |
| P | Pause |
| T | CRT filter on/off |
| M | Sound on/off |

## Dev

```bash
npm install
npm run dev        # vite dev server
npm run build      # production build → dist/
npm run sprites:check  # validate pixel-art maps (also runs in CI)
```

Debug URL params: `?auto=1` (skip title), `?demo=1` (attract-mode bot),
`?boss=1` (start at the arena), `?x=<world-x>` (spawn at position),
`?god=1` (invulnerable).

Built with [Phaser 3](https://phaser.io) + [Vite](https://vitejs.dev).
Deployed to GitHub Pages on every push to `main` (`.github/workflows/pages.yml`).
