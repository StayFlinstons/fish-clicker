# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Fish Clicker** — a Portuguese-language (pt-BR) incremental/idle fishing clicker game. Pure static site: no build step, no bundler, no package.json, no test suite. Vanilla ES6+ JavaScript loaded as native modules, Tailwind CSS served locally (`tailwind.min.js`), Canvas API for all pixel art rendering, Web Audio API for synthesized SFX (no audio files), and a Service Worker for 100% offline PWA support.

## Running locally

There is no build/lint/test tooling — just serve the static files and open in a browser:

```bash
python -m http.server 3000
# or
npx serve .
```

Then open `http://localhost:3000`. `start_game.bat` does the same (serves on port 3000 and opens the browser) for Windows convenience. There are no automated tests; verify changes by loading the page and playing/using the in-game dev console (see below).

## Architecture

### Module layout

- **`index.html`** — the entire UI (~2000 lines): every screen/modal (fishing view, aquarium, shop, achievements, album/encyclopedia, magnet fishing, forge, museum, profile customization, settings, console) lives in this one file as hidden/shown DOM blocks, styled with Tailwind utility classes. There is no client-side templating engine — `game.js` toggles `hidden` classes and writes `innerHTML` directly.
- **`game.js`** (~4500 lines) — the entire game logic and state, in a single `FishingGame` class instantiated once as `window.game` on `DOMContentLoaded`. This is the file you'll touch for almost any gameplay change. Its own methods are grouped by feature area (search for the relevant section rather than reading top to bottom): time-of-day cycle, profile/customization, magnet fishing (cast/forge/museum/tiers), Fish Eyes (prestige-like currency from Blood Moon events), achievements, album, save/load, core fishing loop (`fish()`, `rollFish()`), shop (rods/baits/upgrades), auto-fisher/auto-seller, rendering (`renderAll()` and per-section `render*()` methods), golden fish + Blood Moon/Eclipse event, temp buffs, the in-game dev console, and `setupEventListeners()`.
- **`fishData.js`** — `RARITIES` (7 tiers: COMUM → SECRETO, each with drop `chance` and color) and `FISH_LIST` (species catalog: id, rarity, weight range, baseValue, optional `buff` for aquarium bonuses, optional `timeExclusive` for day/sunset/night-only fish).
- **`itemsData.js`** — `RODS`, `BAITS`, `UPGRADES` shop catalogs and `isCosmicOrHigherRod()` helper.
- **`magnetData.js`** — the "Pesca Magnética" (magnet fishing) sub-game data: `MAGNET_TIERS`, `MAGNET_SCENARIOS` (alternate pixel-art scenes), `MAGNET_ITEMS`, `FORGE_RECIPES` (crafting), `MUSEUM_COLLECTIONS` (donate-to-complete-sets).
- **`achievementsData.js`** — `ACHIEVEMENTS` catalog (22 achievements), checked by `checkAchievements()` in `game.js`.
- **`pixelArt.js`** (~1700 lines) — all procedural pixel-art generation: fisherman rendering to canvas (`renderFishermanToCanvas`), fish sprites (including silhouettes and Blood Moon variants) as data URLs, the animated water/rod/fishing-line renderers, and icon generators for rods/baits/upgrades/magnet items. Character outfits (`OUTFIT_PRESETS`) and hair colors (`HAIR_COLORS`) live here.
- **`sound.js`** — `sound` singleton: Web Audio API synth SFX (no audio assets).
- **`sw.js` / `manifest.json`** — Service Worker (offline cache) and PWA manifest; bump the cache name/version in `sw.js` when shipping changes so installed PWAs pick up updates.
- **`generate_icons.cjs`** — Node script (run manually, not part of any build pipeline) that generates the PWA icon set in `icons/`.

### State & persistence

All game state lives on the single `FishingGame` instance. `saveGame()`/`loadGame()` serialize a large flat object to `localStorage` under key `pescaria_clicker_save_v4` (with fallback read from the older `_v3` key for migration). **Any new piece of persistent state must be added to both the save object in `saveGame()` and the restore logic in `loadGame()`**, or it will silently reset on reload. Autosave runs every 5s (`setInterval`) plus on `beforeunload`.

Offline progress is simulated via `checkOfflineProgress()` using the saved `lastActiveTime`/`timeSavedAt` timestamps.

### Time-of-day cycle

A day/sunset/night cycle (`initTimeOfDay`, `startTimeCycleLoop`, `applyTimeOfDay`) gates certain exclusive fish (`timeExclusive` field in `fishData.js`) and visual themes. Time state persists across sessions via saved offsets, not wall-clock phase.

### Two parallel "fishing modes"

`gameMode` (`'pesca'` vs magnet mode) switches between the classic rod-and-bait lake fishing loop and the separate "Pesca Magnética" system (cast a magnet into scenarios to fish up junk/treasure items, feed duplicates to the Forge for crafting, donate uniques to the Museum to complete collections for set bonuses). These are largely independent feature sets sharing the same gold economy — see `setGameMode()`, `renderMagnetAll()`, and the `magnet*`/`forge*`/`museum*` methods in `game.js`.

### Golden Fish & Blood Moon event

A random "Golden Fish" swims across the lake periodically (`initGoldenFish`/`spawnGoldenFish`) for a bonus click. Catching a special Blood Moon variant (`spawnGoldenFish(true)` path) can trigger the "Eclipse Sangrento" (Blood Moon Berserk) timed event (`triggerBloodMoonEclipse`/`startBloodMoonEvent`) with temporary buffs.

### In-game developer console

`initConsole()`/`execConsoleCmd()` implement a debug console (toggle with `Ctrl+Shift+'`, close with `Esc`) with commands for adding gold, spawning events, unlocking content, and simulating offline time/day-cycle skips — run `help` in it for the full list. This is the fastest way to manually verify a change without grinding the economy.

## Conventions

- All in-game text, IDs, comments, and commit messages are Portuguese (pt-BR); keep new content consistent with this.
- No framework, no build step by design ("Sem frameworks pesados, foco em performance pura" per README) — don't introduce a bundler, TypeScript, or a UI framework without discussing it first, since the whole project is intentionally dependency-light and installable as-is.
- Rarity tiers, fish, items, and achievements are plain data objects in the `*Data.js` files — prefer extending those catalogs over hardcoding new special cases in `game.js`.

## Knowledge graph (graphify)

A local [graphify](https://pypi.org/project/graphifyy/) code graph lives in `graphify-out/` (gitignored — regenerate per machine). It is an aid, not a gate: most of the logic is still inside the single `FishingGame` class, so the graph is star-shaped and plain Grep is often faster for "where is X".

- Use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<X>"` or `graphify affected "<X>"` for cross-cutting questions — who calls a method, what a change can break, and especially when moving methods out of `game.js` into separate modules.
- If `graphify-out/graph.json` is missing, build it with `graphify update .` (AST-only, no API key, a few seconds).
- After changing code files, run `graphify update .` so the graph stays current.
