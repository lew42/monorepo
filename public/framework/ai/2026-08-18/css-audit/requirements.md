# css-audit — read all the CSS; where does it duplicate, where does it fight, and why so much inline?

Laws: less is more · clarity · prioritize. **Deliverable: `audit.md` in this dir — ≤ 3 screens (≤ 160 lines): numbers first, then the interaction map, then a ranked consolidation proposal. Final message ≤ 20 lines.** You are the judge (Opus). Read-only: nothing under `public/` changes in this task; a written proposal is the result.

The owner (2026-08-18), verbatim:

> Also, we should do a CSS audit. Spawn an agent, and read all the css across the whole site. Consider how to simplify, reduce, reuse, etc. We want consistent simple systems. THERE'S WAY TOO MANY INLINE (`view.style()`) declarations. That could, for a one-off thing, be acceptable. But it seems to be the norm. We don't necessarily want to tailwind-ize (create a css class for every property). However, by A) being clear about what a thing is, B) being clear about WHERE it is, we should be able to create the proper scoped styles.
>
> And, if we have a strong base system of layout/css, we shouldn't need so many custom styles. A few layout utilities could be the right way to configure any content, anywhere. Have the CSS audit start with framework.css, theme, and ui components. These are the basic building blocks. Part of the audit should be to document interactions between css in different places. How a page layout affects children, for example. We need special attention to page layouts, there are many that are still broken, and nesting them gets tricky.

## The census as of the brief (verify; two numbers that must agree)

`public/framework/**`: 86 `.css` files, 7,956 lines; `framework.css` 611; theme `styles/layers/theme/lew42/lew42.css` 152; site skin `public/styles.css` 195; `styles/layouts/layouts.css` + per-layout files; `ui/` has **zero** `.css` files — its styles are in `ui/parts.js`'s `css(\`@layer theme …\`)` and 33 other modules carrying `` css(`…`) `` in JS. Inline: **885 `.style(` calls across 176 JS files.**

## Read in this order (the building blocks first)

1. `public/framework/framework.css` — the whole vocabulary; `styles/readme.md` and `styles/rules/*.md` (cascade, nesting, proportion, reuse, robust — the rules the site claims to follow); `styles/css-scopes.txt`.
2. `styles/layers/theme/lew42/lew42.css` + `lew42.js`; `public/styles.css`.
3. `ui/parts.js` and each `ui/*/` component's JS for its `css(\`…\`)`.
4. Page layouts: `styles/layouts/layouts.css`, `styles/layouts/*/` (~30 layouts — read `layouts/readme.md`, `layouts/doc/`, then sample the CSS of `sidebar`, `split`, `grid`, `flex`, `stack`, `document`, `landing`, `full`, `docs`, `home` (yesterday: `fill` was wrong for a document — `ai/2026-08-18/figma-home/`), and the `space/` generator words (`styles/layouts/space/doc/syntax.md`).
5. `core/Page/*.css` (or wherever `.page` and `.layout-*` live — grep), `core/App`, `ext/drawer/drawer.css`, `dev/DevBar/devbar.css` — the shells a layout sits inside.
6. Skim the rest of the 86 by `wc -l` + heading comments; read fully only the ten largest.
7. Inline: `grep -rn "\.style(" --include=*.js public/framework | …` — classify a **sample of 120** (every 7th hit): (a) a real one-off (a measured/computed value, a per-instance colour), (b) a layout word that framework.css already has a class for (name the class), (c) a layout word framework.css lacks (name the missing word), (d) a component's own look that belongs in its `css(\`…\`)`. Two numbers that must agree: 885 total by grep, and your per-file table summed. Also count `css(\`…\`)` modules and `View.stylesheet(import.meta, …)` modules — the three ways CSS gets in.

## Deliver — `audit.md`

1. **Numbers** (≤ 15 lines): the census above corrected, the inline classification with the four percentages, the ten largest CSS files, the layer distribution (how many rules per `@layer` — count `@layer base|theme|site|util` blocks and unlayered rules; unlayered is a defect per CLAUDE.md).
2. **Duplication + conflict**: properties set on the same selector family in ≥ 2 places (e.g. `.page` padding in framework.css AND a layout AND styles.css); tokens defined twice; `!important`s; rules outside any layer; container-query self-restyle traps. A table, ≤ 20 rows, each with file:line pairs.
3. **The interaction map** — how a page layout affects children: for the five most-used layouts (count `layout:` / class usage across `page.js` files to find them), what a child `.page` / `.card` / `pre` / `img` / a nested layout inherits or fights (`min-width:0`, `max-width:100%`, `overflow`, `height:100%` chains, `flex:1` on the wrong box, `grid` children stretching). Name each broken nesting you can prove with a file:line pair and a one-line reproduction; do not guess. ≤ 25 lines.
4. **Proposal, ranked** (≤ 30 lines): the handful of layout utilities that would remove the most inline declarations (each: the word, the CSS, how many of the 885 it retires — from your sample, extrapolated and marked as such); what to delete; what to merge; what a scoped-style rule should be (A: what a thing is, B: where it is → where its CSS lives). What NOT to do (no tailwind). Cost each S/M/L. The first item is the one to do tomorrow.

## Rules

- READ-ONLY outside this dir. Findings as `log` lines in this dir's `task.jsonl` as you go — a finding a screen later is a finding.
- Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `layout`); `finish-task` at the end with `"tokens": null`. A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`). Load the `css` skill once — it tells you how framework.css is read here.
- Timestamps from the clock. Forward slashes. Never a person's name; say "the owner".
- Do not measure in the live browser for this — read. (Two other minions are editing nothing but their own task dirs; the tree is stable.) If a claim needs a browser, `mcp__site__shot` on a headless page is allowed, ≤ 3 shots.
