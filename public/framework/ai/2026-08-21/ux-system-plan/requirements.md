# ux-system-plan — brief (Opus)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** each readme = one screen. doc/*.md may breathe. Your final report = one screen, clickable paths, no essay.

You are the design keystone of the ui/ + ux/ program. You DECIDE the system and land it small. A Fable mastermind harvests your report; builders follow you in wave 3 — what you write becomes their contract.

## Ground truth (verified by recon — trust it, spot-check what you build on)

- `public/framework/ui/` is ALREADY the template tier: 21 module dirs, no event listeners anywhere, no standalone .css files (css lives in `css()` calls inside `<name>.js`), only 4 exported functions (table, timeline, keys, tree — each earns it by carrying a loop), 16 modules are copy-paste markup pages. All 40 css classes already carry the `ui-` prefix.
- `ui/ui.js` exports `ui = { table, timeline, keys, tree }` and side-effect imports 9 css-only component .js files so their classes exist site-wide. ⚠ Trap (from ui/doc/decisions.md): a css-only component's page.js never imports its own `<name>.js` — a new css-only component NEEDS its line in ui.js or its page renders unstyled, silently.
- `ui/page.js`: BANDS = Surfaces / Data / Forms / Marks; children are derived from BANDS; band sizes are load-bearing at 3440. Editorial rule already written there: a function is exported only for "logic a user shouldn't have to carry"; everything else is markup with a copy button. Variants are child pages: "a variant earns its place by being a different thing, not a different value."
- `framework.css` (styles/): layer order `base, theme, site, util`; tokens on :root include --prim --bg --ink --surface --line --wash --tint --subtle --error --ok --warn --radius --flow --font --mono. There are NO density/contrast/theme classes anywhere yet — you are minting the first.
- The DevBar (public/framework/dev/DevBar/devbar.css) is the owner's reference for a section-wide system: ONE root/state class sets custom properties (`html.dev-open { --devbar: var(--dev-rail) }`), everything inside reads tokens, light-dark() pairs, all in @layer theme, one `dev-` prefix. That token-remap mechanism is the direction for config words.
- `.ac("word")` / `.rc("word")` on View (core/View/View.js:28) — chainable classList add/remove; every ui module builds on View.
- `styles/css-scopes.txt` reserves `ui-` for ui/. Every new class name goes through the `new-css-class` skill.
- A sibling Sonnet audit of ui/ behavior is landing at `public/framework/ai/2026-08-21/ui-behaviors-audit/` (page.js + task.jsonl). Read it if present when you start and fold it in; if absent, proceed — do NOT wait.

## The owner's ask (condensed, authoritative)

We are building a library. ui/ = reusable html+css templates. ux/ = behavioral systems (workflows: signup, login, wizards, courses, game/team UX) built FROM ui templates, responsive mobile ↔ 3440. He wants "an adaptive ui/ux system where a small set of config words (CSS classes) can manipulate the entire section" — high contrast (`.ac("ui-contrast")`), density ("compact (maybe micro, mini, small?)"), spacing, colors — "instead of writing a bunch of fresh classes, we lean on the core framework." Behavioral variants in ux/ are named class extensions (`class CardHero extends Card`), never numbered; mixins via prototype assign are open for exploration later (NOT yours).

## Deliverables (in priority order)

1. **ux/ exists and states the system.** Create `public/framework/ux/` with:
   - `readme.md` — the system plan, one screen, index shape (what · Use · Watch out · More): what ui/ is, what ux/ is, the graduation rule (when a template becomes a ux class), how config words bind both tiers. This is THE document of the program.
   - `page.js` — minimal Doc page (new-page skill), states the same in show-don't-tell form; children only for pages that exist (⚠ a declared child without a page.js 404s).
   - `doc/system.md` — the depth: the tier boundary argued, the config-word contract (what a word may do: remap tokens; what it may not: reach into component internals), naming rules for ux variants (named extensions, never numbers).
   - Make ux/ reachable: add `ux` to the children string in `public/framework/page.js` (line ~14, reads `"... styles ui ext ..."`). That ONE word is the only edit you may make to that file.
2. **The config words, working.** Decide the word list — small: `ui-contrast` plus your pick of density naming (owner floated compact/mini/micro/small — decide with a reason, 1–2 density words max to start; every word must earn a visibly different demo). Mechanism: each word is a section-level class that REMAPS framework tokens (the DevBar pattern) so every ui component inside re-skins for free — zero per-component CSS. Implement as a css-only module `ui/words/words.js` + its line in ui.js (the trap above), rules in the right layer (css skill decides; DevBar precedent is theme). Class names through new-css-class.
3. **The demo.** `ui/words/page.js` — one real section (compose existing ui markup: a card, a table, a toolbar row, a field) with toggle buttons that `.ac()`/`.rc()` the words on the section so the re-skin is visible live. Page-level demo JS is fine (pages carry logic; templates don't). Add `words` to a BANDS band in ui/page.js so it exists (band sizes are load-bearing — pick the band, don't resize the grid).
4. **ui/readme.md refreshed** — index shape, one screen: name the template tier, the words, the graduation rule (link ux/readme.md), the ui.js trap line. Don't restructure ui/ — it already conforms.
5. **doc/decisions.md entries** (ux/doc/): every decision you made with its one-line reason — density naming, layer choice, file placement, what you rejected.

## Fence (yours alone — no other agent writes these today)

`ux/**` (create) · `ui/readme.md` · `ui/words/**` (new) · one import line in `ui/ui.js` · one band word in `ui/page.js` · one word in `framework/page.js` children. READ-ONLY: everything else — core/, styles/ (framework.css change = written proposal in your task dir, never an edit), ext/, dev/, all other ui/<module>/ dirs.

## Process

- Load skills before writing: `code`, `css`, `layout`; `new-css-class` per new class name; `new-page` per page.js; `documentation` before landing; `skill-improvement` (one line in that skill's improvements.md) the moment a skill misleads you.
- Log to `public/framework/ai/2026-08-21/ux-system-plan/task.jsonl`: line 1 `assign` (Write tool; group "web-ui"), then append `log` lines (Add-Content, ASCII only — no em dashes), findings as log lines never a findings.md, close with the finish-task skill (landing line with outcome headline + links + a screenshot).
- **Verify before landing:** load /framework/ux/ and /framework/ui/words/ through their parents (nothing crawls), screenshot the words demo at 360, 768, 1280, 3440 wide via the mcp `site` `shot` tool (fresh headless chromium; ⚠ mcp `eval` runs in a hidden tab — hidden tabs do not lay out, use `shot` for rendering truth). Save the money shot (words toggled, side by side if you can) into this task dir and link it in the landing line. A claim without a clickable or screenshot is not a result.
- **Safety:** never kill or restart the dev server (localhost:80, the owner's terminal); never drive the owner's live browser tabs; never `git stash` (shared tree — diff, don't stash); never commit or push; scratch goes in the session scratchpad, never the repo.
- Traps that never throw: no DOM after an `await`; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — ⚠ one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; framework.css `max-width:100%` and util-layer `:first-child` beat component CSS; resolve URLs against `import.meta`.

## Cut first if squeezed

doc/system.md depth → the second density word → readme polish. Never cut: ux/readme.md existing, one working word (`ui-contrast`), the demo page, verification shots.
