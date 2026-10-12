# view-tc — `View.tc(cls, force)`

**The three laws:** Less is more — ASAP, simplest working version. Clarity is the one exception. Prioritize.
**Length budget:** your final report ≤ half a screen. Findings go in YOUR `task.jsonl` as `log` lines, never a findings.md.

## The ask (owner, verbatim)

> look into the .tc() and .toggle_class() methods on View, and implement the .tc("class", bool) variant for easier toggling.

## Scope — your fence

You may edit ONLY:
- `public/framework/core/View/View.js` (the method, `View.js:153`)
- `public/framework/core/View/doc/method/tc.md` and `doc/method/toggle_class.md` (make them current)
- `public/framework/core/new/starter/Router.js:140` — ONE stale comment ("View.tc(cls) takes no force argument") may be corrected; change nothing else there
- your task dir: `public/framework/ai/2026-08-27/view-tc/`

## The work

1. Load the `code` skill first (mandatory before editing JS under `public/`).
2. Read `View.js:141-158` (`has_class`/`hc`/`toggle_class`/`tc`) and `doc/method/tc.md`, `doc/method/toggle_class.md`, `doc/method/ctrl.md` (`ctrl` wires toggles through `tc` — must not break).
3. Implement: `tc(cls, force)` — `cls` still splits on spaces; with `force` undefined, behavior is exactly today's; with `force` boolean, add when true, remove when false (native `classList.toggle(c, force)` is prior art — the docs already note `toggle_class` exists only to be called by `tc`, so folding is allowed if it stays minimal). An equal-value set must still return `this` (house rule, `View.js:160`).
4. Grep every `.tc(` caller under `public/` — confirm none passes a second arg today that would change meaning (e.g. `ctrl`'s wiring at `View.js:343`).
5. Prove it headless (never the owner's tabs): `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs <plan>` with an `eval` step —
   `eval import('/framework/core/View/View.js').then(m => { const v = new m.div(); v.tc("x", true).tc("x", true); const a = v.hc("x"); v.tc("x", false).tc("x", false); const b = v.hc("x"); v.tc("y"); return [a, b, v.hc("y")]; })` → expect `[true, false, true]`. Any page url works (`http://localhost/`). Log the output.

## Rules

- Never kill or restart the dev server; never drive the owner's live tabs; never `git stash`; never commit.
- Your task dir already exists with this brief. Open `task.jsonl` there per the `new-task` skill (skip dir creation; `group: "web-ui"`; session id from `$env:CLAUDE_CODE_SESSION_ID`).
- Scratchpad files: prefix `viewtc-` (the scratchpad is shared with sibling agents).
- A skill that misled you → one evidence line via the `skill-improvement` skill.
- Land with the `finish-task` skill.
