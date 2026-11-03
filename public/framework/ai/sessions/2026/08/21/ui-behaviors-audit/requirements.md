# ui-behaviors-audit — brief

**You:** a Sonnet minion. **Supervisor:** the mastermind (run task `../mastermind-ui-ux/`).
**Three laws (CLAUDE.md rules all):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the whole report is ONE screen; the table IS the deliverable.

## The ask (owner, verbatim)

> spawn a minion to look at our current ui/. assess how many of the ui elements have behaviors. i'm thinking: "ui/*" should generally be html+css templates, not behavioral. once something needs behaviors, it should probably become a ux, a class, so it's extendable, and we can have extensions as variants.

## Deliverables

1. `task.jsonl` in THIS dir — you write line 1 yourself at launch (new-task skill shape: `assign` with your `$env:CLAUDE_CODE_SESSION_ID`, `group: "web-ui"`, `window.before` from `public/framework/ai/usage.json`, your own 3–5 `steps`). Findings go in as `log` lines — no findings.md. ⚠ Never write jsonl with Out-File/Set-Content (BOM kills line 1) — Write tool to create, Add-Content to append. Timestamps from the clock (`Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz'`), never typed from memory. Forward slashes in any path inside JSON.
2. `page.js` in THIS dir — exec-summary page (run the new-page skill first): the verdict table rendered, one short paragraph of pattern-level findings above it. A Fable UX mastermind planning the ui/ ↔ ux/ split reads this — write for that reader. Task dirs with a page.js are auto-routed; do NOT add yourself to any `children:`.

## Method

- Subject: every module dir under `public/framework/ui/` (21 dirs at last count). Your table row count MUST equal the dir count — state both numbers; they must agree.
- Per module: name · has its own `.js` beyond `page.js`? · verdict: `template` (html+css, factory returns markup) / `light` (trivial behavior, e.g. one class toggle) / `behavioral` (event listeners, state, lifecycle, timers) · what the behavior is (≤1 line) · recommendation: `stay ui` / `graduate to ux` / `split` (template stays in ui/, behavior becomes a ux class).
- Also read `ui/ui.js`, `ui/parts.js`, `ui/readme.md`, `ui/doc/decisions.md` for pattern-level context.
- Headline is a ratio, not an opinion: **N behavioral / total**.

## Fences and rules

- WRITE: this task dir only. Everything else is read-only.
- Never kill or restart the dev server (localhost:80, runs in the owner's own terminal). Never drive the owner's live browser tabs. Never `git stash`. Never commit or push.
- Scratch goes in the session scratchpad, files prefixed `ui-audit-` (the scratchpad is shared with sibling agents).
- If a skill misleads you, append ONE evidence line to `.claude/skills/<skill>/improvements.md` (see the skill-improvement skill).
- Land with the finish-task skill. Your final text is your report to the mastermind: the ratio, top 3 pattern-level findings, and the path to your page.js.
