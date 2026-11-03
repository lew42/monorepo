# ux-proposals — brief

**You:** the Fable UX mastermind, third program. **Supervisor:** the mastermind (run task `../mastermind-proposals/`).
**Three laws (CLAUDE.md):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** reports are a screen; demos and diffs are the deliverables.

**The grant:** the owner approved ALL proposals verbatim ("just run with all 7 proposals. work autonomously mastermind! go!"). Your four, priority order:

## 1. framework.css tokenization (your 4-row table on `../ux-system-plan/`)

The framework.css edit is now SANCTIONED for **exactly these four one-line changes with fallbacks, nothing else in that file**:
- `th, td` padding → `var(--pad-cell, 0.25em 0.75em)`
- `button / .btn` padding → `var(--pad-control, 0.25em 1em)`
- `input, select, textarea` padding → the same `--pad-control` (with its current fallback value)
- `.muted` → `color-mix(in srgb, currentColor var(--muted, 75%), transparent)`

Opus makes the edit. Prove minimality (the diff is 4 lines), prove nothing moved on fallbacks alone (computed-style equality or pixel-diff on a page with tables + buttons + fields, before/after), THEN extend `ui/words/words.js` to remap the new tokens and re-measure: the right-panel gaps your demo documented (table cells, buttons, search field staying loose inside `.ui-compact`) must now tighten. Update the numbers and `words.png` on the words demo and the `../ux-system-plan/` page.

## 2. Doc-vs-Page for the ux modules

Convert the eight `ux/*/page.js` from plain `Page` to `Doc` (`notes:`/`files:` declared — the documentation skill), so each module's `doc/*.md` gets the rail and pretty routes. Then update cross-links that used literal `.md` paths where a pretty route now exists (documentation SKILL.md carries the corrected trap note). Verify every Docs tab renders headless, all eight.

## 3. --density default

Your call now, with the evidence you have (compact measured exactly half: 7.52 vs 15.04). Decide the shipped default and the ui-compact factor, write the verdict in `ui/words/` doc + `ux/doc/decisions.md` — one line on why, per the verdict-firmness rule (never/always only for what actually breaks).

## 4. ui.tree retirement — LAST, and GATED

Do NOT start until the supervisor relays that the sibling's Playground migration (`Playground.js:170,184` → `ux/Tree`) has landed. Then: caller census again (must read zero callers outside ui/'s own pages), retire the `tree` closure/export per your plan (ui/ui.js exports, ui/readme, bands line if needed), keep `ui/tree/`'s page as the template story + pointer to `ux/Tree`. If the relay has not arrived when 1–3 are landed and verified: land 1–3, report, end your turn — never wait idle; the supervisor resumes you for #4.

## Operating (same as the morning run)

Mastermind protocol. **Foreground minions ONLY** (`run_in_background: false`, several per message). Haiku scans, Sonnet builds, Opus judges (the framework.css edit is Opus). Task dirs `public/framework/ai/2026-08-21/ux-<slug>/`, `group: "web-ui"`; every brief carries: clock-read timestamps in the same command that writes the line (never typed — your ux-tree minion future-dated its landing by 90 minutes); ASCII-safe jsonl appends; never touch port 80 (still down; your 8918 static-server recipe worked); never drive the owner's tabs; never git stash/commit/push. Pace gate each harvest via `public/framework/ai/usage.json`; the session window resets 16:40 local — the current window has large expiring headroom, front-load NOW.

Fences: you own `ui/**`, `ux/**`, and ONLY the four named framework.css lines. `ext/**` read-only (the sibling is editing ext/Playground right now). Land with finish-task + day.jsonl lines; your final text = report to the supervisor: landed (clickable), measured numbers, parked, spend.
