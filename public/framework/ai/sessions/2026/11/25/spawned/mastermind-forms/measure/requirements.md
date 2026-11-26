Budget: $3

# Measure Figma Lew42 v3 against the web's tokens (read only)

Load the `minion` skill first. The job and its context: `.scratch/forms/brief-2026-11-25.md` (part 1) and the plan beside this folder, `../plan.md`. You write no code and edit nothing in Figma or the site. Your only writes: `measure.json` and `measure.md` in this folder, and `log` lines in this folder's task log.

## Deliverable

`measure.json` (raw numbers) and `measure.md`: one table, one row per token, columns `Figma name · Figma 500 / 1000 / 1920 (or Light / Dark) · web name · web at 400 / 1000 / 1920 · match?`. A screen long, no prose beyond a line per mismatch.

## What to read

1. **Figma, Lew42 v3** (file key `JYGQX0WaBO4HcGMZTkL2rx`). Load the `figma:figma-use` skill, then ONE `use_figma` call that reads every local variable of the collections `Lew42 v3 - Colors`, `Lew42 v3 - Color Mode` (Light, Dark), `Lew42 v3 - Scale` (three modes) with its resolved value per mode, and every local text style (name, family, style, size, line height, letter spacing, and the variable bound to its size). Docs: `public/framework/ext/Figma/doc/start-here-v3.md`, `doc/v3-scale.md`. Figma calls are shared, about 10 a minute for all agents: one or two calls total.
2. **The web**: the site's tokens are in `public/framework/framework.css` and the theme `public/framework/styles/layers/theme/lew42/lew42.css`. Measure, don't compute by hand: a headless Playwright page (import from `file:///C:/…`, never the owner's tabs) on `http://monorepo.localhost/framework/ui/controls/` at widths 400, 1000 and 1920. For each width read with `getComputedStyle`: body font-size and family; h1–h4 font-size, weight, letter-spacing, transform; `small`, `label`, `code` size; the resolved `--pad --gap --flow --radius --prime --ink --subtle --surface --line --wash --light --dark --error --ok --warn` on `document.body` (resolve colours by setting them as a probe element's `color`); a `button`'s and an `input`'s height, padding, radius, font-size; a `button.prim`'s background and colour. Also read in dark mode (`page.emulateMedia({colorScheme:"dark"})`) for the colours.

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Search with Glob or rg scoped to the repo. Two numbers that must agree: the body font-size you measure at 1920 and the one `framework.css`'s clamp gives (it is written to land on 16 px at 1920); say both in `measure.md`. When done, end your turn with one line: the path of `measure.md`.
