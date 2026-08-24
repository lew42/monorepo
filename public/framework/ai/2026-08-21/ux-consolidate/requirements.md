# ux-consolidate — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** readmes stay one screen; skill-suggestions = one screen each; final report = one screen.

## The job

The ui/ + ux/ program built 5 ux classes and refreshed the template tier today across 7 task dirs. You close it: make the tier's root docs tell the truth about what now exists, consolidate the day's pattern verdicts into ONE place, write the two skill-suggestions files the owner asked for, and walk the link trail so every deliverable is reachable from where a reader already is.

## Inputs (read these; they are your source material — do not re-derive)

1. `public/framework/ux/readme.md` + `ux/page.js` + `ux/doc/system.md` + `ux/doc/decisions.md` — the keystone, written when ux/ was EMPTY ("Nothing lives here yet", "today: 0"). Now stale.
2. The five landed modules: `ux/Auth/` (+ MagicAuth), `ux/Wizard/` (+ Wizard.Keys), `ux/Tree/` (+ TreeKeys), `ux/Course/`, `ux/Filter/` (+ FilterChips) — each has readme.md + doc/decisions.md with verdicts.
3. The task logs — `public/framework/ai/2026-08-21/ux-{system-plan,cards,auth,wizard,tree,course,filter}/task.jsonl` — every line prefixed `lesson:` is harvest.
4. `ui/` today: `ui/words/` (the two config words), card/toolbar variant pages, `ui/readme.md`.
5. `.claude/skills/css/improvements.md` and `.claude/skills/code/improvements.md` — lines appended today (read-only context for the suggestions files).

## Deliverables (priority order)

1. **`ux/readme.md` + `ux/page.js` current** — smallest possible edits: the "today" row (5 classes exist — name them, link them), kill "Nothing lives here yet", the tier table stays; page.js's intro similarly. Keep both one screen. Do NOT restructure what the keystone argued.
2. **`ux/doc/decisions.md` — the day's verdicts consolidated, appended as one dated section**: mixin-vs-subclass (Wizard's evidence: naive mixin crashed on live prototype lookup, careful mixin silently lost + mutated the shared prototype, subclass ran both layers — subclass is the tier's pattern); extend-vs-compose is a per-case call (Course prototyped `extends Wizard`, rejected: no per-region seams — link its decisions.md); the seam-per-composed-thing rule (Auth); the one-wire rule (`selected_change` / `changed(predicate)` — Tree, Filter); static parts bought every extension (TreeKeys = one static replaced; MagicAuth = 14 lines). Each verdict: 2-3 lines + link to the module doc that holds the evidence. No essay.
3. **`ui/skill-suggestions.md` and `ux/skill-suggestions.md`** (new files, owner's explicit ask): what a future `ui-design` / `ux-design` skill should contain — important lessons from today, minimal, NOT overly restrictive (the owner's words). Format: a short intro line, then grouped one-liners with evidence links (task.jsonl lesson lines, module decisions). Candidates you must weigh (reject any that don't earn it): ui side — zero-new-CSS default & the duplicate-class rule (no .ui-card), variants are different THINGS, the ui.js import trap, words remap tokens & the never-scale-a-token contract, the inline-custom-prop inheritance trap (bit 3 builds today), band arithmetic at 3440; ux side — the graduation rule, subclass-over-mixin (with the crash evidence), seam per composed thing, one-wire to regions, static parts via this.constructor, View name-shadow list (render/text/toggle — the Filter collision), style-this-not-a-wrapper (the Wizard words bug), prototype-headless-before-landing. These are SUGGESTIONS for the owner — do not create any SKILL.md, do not edit any existing skill.
4. **Link-trail sweep** — for each landed page confirm a reader can reach it: /framework/ → UX → each of the 5 modules → their child demos; /framework/ui/ wall → words, card, toolbar. Load through parents on http://localhost:8918 (recipe below). Fix nothing outside your fence — a broken trail elsewhere is a one-line finding in your task.jsonl.
5. **Re-verify only the pages you edited** (`/framework/ux/` at 360/1280/3440) — builders already verified their own modules at 4 widths.

## Fence

Yours alone: `ux/readme.md`, `ux/page.js`, `ux/doc/decisions.md` (append a dated section; do not rewrite the keystone's entries), `ux/skill-suggestions.md`, `ui/skill-suggestions.md`. READ-ONLY: everything else — all module dirs, ui/ (except the one suggestions file), core/, styles/, skills.

## Process

- Load `code` and `css` skills before editing page.js; `documentation` before landing; `finish-task` to land; `skill-improvement` if a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-consolidate/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); never a findings.md.
- Verification recipe (proven): `node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/ <out.png> <width>` — prints overflow_x + console errors; ignore only the repeated ws://localhost:8918 LiveReload error. Money shot (the refreshed /framework/ux/ at 1280) into this task dir.

## Safety (non-negotiable)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server (8918 stays up); never drive the owner's browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps

Only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; ui.table cells are plain text (no md pass); an inline custom property inherits into what sits below; every CSS rule inside a layer; ASCII in jsonl appends.

## Cut first if squeezed

The link-trail breadth (keep the ux trail) → suggestions candidates you can't evidence. Never cut: truthful ux/readme + page.js, the two suggestions files existing, the consolidated verdicts section.
