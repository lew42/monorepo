# pg-chrome-polish — fixed properties rail, mirrored grips, no devbar flicker

**The three laws:** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report ≤ one screen — evidence table + links; detail as `log` lines in YOUR `task.jsonl`.

## The asks (owner, verbatim, 2026-08-29)

> the right sidebar needs a fixed size, it shouldn't grow/shrink when switching selection (which causes the viewport area to resize).
>
> the grip on the left/right sidebars is offset in a strange way. i had you do this, because the grip for the devbar was appearing even when the devbar was off screen. an alternative solution, is to just push the devbar further off screen. another quick fix for the devbar: when we resize the window, the devbar jumps from off screen right to off screen bottom, but you can see it transitioning, appearing for a brief moment. we don't want to see a flicker, it looks glitchy.

## 1. Properties rail — REPRODUCE FIRST, the mastermind could not at defaults

`.pg-properties` is `flex: 0 0 clamp(13em, var(--pg-props, 18em), 34em); min-width: 0` (`playground.css:17-18`). Measured headless at 1280×900, default state: **270.72px, stable to the third decimal** across Box / Flex / root selections (probe: `<scratchpad>/pgmm-props-probe.json` + out dir). So the owner's grow/shrink needs one of the conditions the probe lacked — try, in rough order: a wide window (3440×1400 — the body font-size is a viewport clamp, so the em basis is fluid), a persisted rail width (`localStorage["lew42-pg-rails"]` → `--pg-props` px), devbar/drawer open pushing `.app` (`--devbar`/`--drawer` padding), PAD/GAP toggles, and the `.pg-properties-body` scrollbar toggling as field-count changes (Flex sidebar is long, Box short; a classic Windows scrollbar eats ~15px of the BODY's inner width even when the column holds). Log the reproduction — the numbers that move, under which condition — BEFORE fixing. "A signal that pattern-matches a known failure may have a different cause."

Whatever the cause, the acceptance bar is the owner's sentence: selection switch (Box↔Flex↔Grid↔root, chrome revealed or not) changes `.pg-properties`, `.pg-canvas` and `.pg-viewport` rects by **0.00px**, at 1280 AND 3440, floors on and off. `scrollbar-gutter: stable` on `.pg-properties-body` is the likely half-fix for the field-jump; the grip drag (`Playground.write()` clamps in em against the rail's own font-size, `Playground.js:73-80`) must keep working — if you change the width mechanism, keep the JS clamp and the CSS clamp agreeing, that comment is load-bearing.

## 2. Grip — mirror the anchors; keep the strip inside the rail

Diagnosed, not speculative: `.grip` is a 0.75rem strip wholly INSIDE its rail, anchored `inset-inline-start: 0`, with the lit 2px `::before` and the pill anchored to the strip's inline-START (`ext/grip/grip.css:14-42`). For an end-docked rail (devbar, drawer, Playground properties) that start edge IS the boundary — correct. For a start-docked rail (Playground tree), `playground.css:48` flips the STRIP to `inset-inline-end: 0` but the line/pill anchors don't flip — **the lit line draws 0.75rem away from the tree/canvas boundary**. That is the owner's "strange offset".

Fix at the cause, in ext/grip: `grip.js` already takes `from` — stamp a class (e.g. `grip-start`, run `new-css-class`) and let `grip.css` mirror the whole geometry for it (strip at `inset-inline-end: 0`, `::before` + pill anchored to the strip's inline-END). Then DELETE the `playground.css:48` override — the consumer stops compensating. Do NOT move the strip outside the rail: the wholly-inside rule exists because `.pages` reserves a scroll gutter flush against the rail and an overhanging grip pointer-captures scroll drags (`grip.css:8-13`) — that reason is independent of the devbar and stands. The owner's "push the devbar further off screen" alternative is therefore unnecessary — say so in one log line rather than doing it.

Verify: on the Playground, the lit line sits ON the tree/canvas boundary and ON the canvas/properties boundary (screenshot with the strip hovered, both rails); both grips still drag (drive a ±100px drag each way, rail width follows); devbar + drawer grips unchanged (from:"end" default — one screenshot each).

## 3. Devbar flicker — the transform morphs across the breakpoint

Diagnosed: closed `.dev-bar` is `transform: translateX(100%); transition: transform 0.18s` (`devbar.css:28-29`); below 34em the media query re-poses it `inset: auto 0 0 0; transform: translateY(100%)` (`devbar.css:215-225`). Crossing 34em while CLOSED animates translateX(100%) → translateY(100%) — the interpolation passes through on-screen territory; that is the visible flicker.

Fix: visibility-gate it. Closed: `visibility: hidden` delayed until the slide-out finishes (`transition: transform 0.18s, visibility 0s 0.18s`); open (`html.dev-open .dev-bar`): `visibility: visible` with zero delay. A transform morph while closed then happens invisibly; open/close animations are untouched. Keep the 100%-slide (the grip lives inside the box — `devbar.css:15-18`'s warning stands; nothing needs pushing further). Mind the reduced-motion path if one exists (grep `prefers-reduced-motion` — a `transition: none` context must not leave the bar permanently hidden).

Verify headless: with the bar closed, drive the window across the breakpoint (Playwright `page.setViewportSize` via two plans or an `eval` resize is not possible — use two drive runs at 1280 and 500, plus one run that starts ≥34em, closes the bar, then `eval` asserts `getComputedStyle(.dev-bar).visibility === "hidden"`; the deterministic assertion is visibility-while-closed at BOTH poses, since a mid-frame catch is racy). Then open/close at both sizes — the slide must still animate (assert a `transitionstart`/`transitionend` fires on transform, or before/after rects differ then settle).

## Your fence

`public/framework/ext/grip/` (grip.js, grip.css, readme/doc), `public/framework/dev/DevBar/devbar.css` (+ its readme/doc if a line is owed), `public/framework/ext/Playground/playground.css` (+ `properties.js`/`Playground.js` only if the rail fix demands), the modules' `doc/decisions.md`, and your task dir `public/framework/ai/2026-08-29/pg-chrome-polish/`. Nothing else.

## Rules

- Load `code` before JS, `css` before CSS (its caveats file is current as of yesterday), `new-css-class` for any new class name. Read the `ui-test` skill's Traps in full — four agents were bitten this week, the traps are fresh.
- Playground gestures: own document only (`swap('pgmm-chrome')`, re-acquire handles per eval, `delete_current()` at the end); NEVER gesture on the owner's documents — a speculative selector is a real gesture on real data.
- Never kill or restart the dev server; never drive the owner's browser tabs; never `git stash`; never commit.
- Task dir exists — open `task.jsonl` per `new-task` (skip dir creation; `group: "web-ui"`). Log the reproduction numbers and every decision.
- Scratchpad prefix `pgchrome-`. A misleading skill → one `skill-improvement` line. Land with `finish-task`. Blocked twice on one item → park it with a log line; the properties-rail reproduction failing everywhere is itself a first-class finding — report the conditions tried, do not fix blind.
