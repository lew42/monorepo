# pg-proposals — brief

**You:** the Fable Playground mastermind, second program. **Supervisor:** the mastermind (run task `../mastermind-proposals/`).
**Three laws (CLAUDE.md):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** reports are a screen; the Playground itself is the deliverable.

**The grant:** the owner approved ALL proposals verbatim ("just run with all 7 proposals. work autonomously mastermind! go!"). Your three (plus one favor to a sibling), priority order:

## 1. Save fallback (your proposal #2 — data loss, first)

Ship the ~15-line fix sketched in `../playground-mastermind/proposals.md`: race `Socket.ready` against a ~2s timeout in `documents.js`; on timeout fall back to `LocalStorageSaver` (already the prod path) with a small "saving locally" pip. Reconciliation rule — supervisor's call so you are unblocked: **newest timestamp wins, nothing deleted** — the fallback saves under a distinct key; on a later load with the server up, if the fallback is newer, load it and write it through, parking the superseded copy under a suffixed key; one console line says so. Prove it with the dev server down (it still is): edit, reload, edits survive.

## 2. Tree migration (a sibling is gated on this — do it early, report the instant it lands)

Migrate ext/Playground's two call sites — `Playground.js:170` and `Playground.js:184` (`tree()` and `.select()`) — to `ux/Tree`. `ux/Tree` is READ-ONLY for you (import, never edit; if the migration needs a Tree change, tell the supervisor — the sibling owns it). Prove the playground tree pane still renders, selects, and survives an add/remove cycle (ui-test). **Say clearly in a log line and to the supervisor the moment this lands** — the sibling's ui.tree retirement waits on it.

## 3. Gesture shortcut (your proposal #1)

Supervisor's call between your options: **modifier-click, not auto-flex** — explicit beats magic, and a Box holding two children is legitimate. Shift-click on any `+` adds a Flex instead of a Box (long-press for touch only if cheap and proven). Document in the one place the `+` is documented. Then re-run the strict pg-hero gesture count: target ≤ the old UI's 9.

## 4. Parked geometry (your proposal #3)

Grid-mode resize handles; the `.pg-node` min-width floor that skews committed grow ratios a few px on re-render (`ext/Playground/doc/decisions.md`, pg-resize); wrapped-flex handle geometry — fix it, or disable handles on wrapped containers with the reason documented. A proven boundary beats a broken feature.

## Operating (same as the morning run)

Mastermind protocol (`.claude/skills/mastermind/SKILL.md`). **Foreground minions ONLY** (`run_in_background: false`, several per message). Haiku scans, Sonnet builds, Opus judges; no Fable minions. Task dirs `public/framework/ai/2026-08-21/pg-<slug>/`, `group: "panels"`, every brief carries: clock-read timestamps in the same command that writes the line (never typed); ASCII-safe jsonl appends (Add-Content is ANSI); never touch port 80 (still down; your throwaway recipe is `scratchpad/pg-server.mjs`, port 8917); never drive the owner's tabs; never git stash/commit/push. Pace gate each harvest: `public/framework/ai/usage.json` — the session window resets 16:40 local; the current window has large expiring headroom, so front-load NOW. ui-test proofs for every gesture claim; two numbers that must agree: gestures scripted vs screenshots taken.

Fences: you own `ext/Playground/**`. Everything else read-only (`ux/Tree` explicitly). Land with finish-task + day.jsonl lines; your final text = report to the supervisor: landed (clickable), proofs, parked, spend.
