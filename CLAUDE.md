# Vapor Lane: rules for Claude

Vapor Lane is a neon arcade racer that runs in the browser (PC, laptop, phone). The whole game is ONE file: `index.html` (Canvas 2D + Web Audio, no libraries, no external files, works offline). The owner, Carlos, is not a programmer.

## How to work with Carlos
- Plain language, short answers. No jargon without a one-line explanation.
- If a design choice is unclear, ask first (one short question, or lettered options with a recommendation).
- Make the smallest change that does the job. Never rewrite the whole file, and don't "clean up" things he didn't ask about.
- Every change ends with: what changed (1-2 sentences), the new build number, and what you could NOT test (phone frame rate, sound by ear, real touch).

## Repo layout
- `index.html` = the game (about 750 KB). `sw.js`, `manifest.webmanifest`, icons = the installable-app wrapper.
- GitHub Pages publishes `main`. Merging a pull request to `main` makes the change live. Always work on a branch, never push straight to `main`.
- Carlos uploads builds to itch.io himself. Put the new build number in the PR description so he knows what to upload.
- Git history is the archive of old builds. Don't create numbered copies of the file.

## Rules for every change
- Keep it a single self-contained `index.html`. No new files, libraries, fonts or network fetches.
- Bump `BUILD_NO` (`var BUILD_NO = NNN`) by 1 on every change that affects the game. It shows as the small `v.NNN` label in the game.
- Old saves must keep loading (`vaporlane.save`, plus the old `neonrush.save` migration).
- A new menu screen must be added to the list in `syncPad()`.
- A new zone activator (off-ramp bay) goes through `ofrKind()`, `ofrIn()` and `ofrLive(idx)`, not `actInner()` or `hailLive()`.
- Two canvas layers: `#c` = world (zones are colour-graded on it), `#c2` = car, HUD and menus (never graded). Code that draws "in the world" runs between `useWorld()` and `useTop()` in `render()`.
- Anything that adds speed must respect the `coast` flag (time-out roll).
- Phone first: keep per-frame work light, avoid creating objects every frame, and keep touch buttons reachable. Check any menu or HUD change at desktop (1440x900) and phone landscape (872x392).
- Visible text needs English and Spanish.
- Don't touch `sw.js`, the manifest or the icons unless asked. `sw.js` is network-first for the page, so a new `index.html` needs NO cache bump. If `sw.js` itself ever changes, keep its "only delete our own caches" rule (`OWN_PREFIXES`): other games share the same GitHub Pages address.

## Before you say it's done
- Pull the inline script out of `index.html` and run `node --check` on it.
- If a browser (Playwright or Chromium) is available, load the page and confirm there are no console errors on desktop and phone sizes. If not, say so.
- When reading the file, print short pieces only (`grep -n ... | cut -c1-200`), never whole long lines.
- Search for the exact current code before editing it. Don't assume what it looks like.
