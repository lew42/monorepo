# Hidden windows — enforce it

The owner, verbatim: "just got a users/…/appdata/local terminal popup... why we still get
these terminal popups... make them hidden please."

The rule already exists in the skills (sub-mastermind's "Never" section: every spawn/exec/fork
sets `windowsHide: true`, `Start-Process` uses `-WindowStyle Hidden`, prove it with
`MainWindowHandle` = 0). It keeps getting broken. This task ENFORCES it, it doesn't just
patch one call site.

Card log (the owner's words) is at `public/framework/ai/2026/09/24/system-design/`.

## Evidence handed down

- 10:57:52 today: `node Server/clarity.mjs landing …ai/2026-09-25/servex-mastermind` launched
  by `Server/on-landing.mjs:35` or `.claude/hooks/ledger.mjs:182` — both already pass
  `spawn(..., { detached: true, stdio: "ignore", windowsHide: true })`.
- Other suspects: SDK agents' Git-Bash shells (claude.exe → bash.exe → conhost), and background
  `node …` loops under a minion's bash.
- The systems architect's own probe (`winprobe.mjs`, in a prior session's scratchpad) spawned a
  node child three ways (detached+windowsHide, attached+windowsHide, detached without hide) from
  a shell **that has a console**, and all three showed 0 visible windows via
  `EnumWindows`/`IsWindowVisible`. Working theory, NOT yet proven: the popup needs a parent with
  **no console** (a hook launched by claude.exe directly, or a detached grandparent) — then
  `detached: true` gives the child a brand-new console, and `windowsHide` may not apply to it
  (Node issue #21825).

## Deliverables

1. **Reproduce** the popup with a parent that has no console — e.g. start the parent itself via
   a hidden, detached launch, then have it spawn the child the way `on-landing.mjs` does. Name
   the exact launch chain that shows a window, or say plainly it could not be reproduced and why.
2. **Fix every launcher found** — `on-landing.mjs`, `ledger.mjs`, `clarity.mjs`'s callers,
   `text-check`, and any others the sweep turns up. Prefer `detached: false` + `unref()` where
   the child must outlive a dying parent only in the sense of not being killed by normal exit,
   or route through a wrapper PROVEN hidden (per the probe method above) when true detachment is
   needed. Prove each fix shows 0 visible windows with the same EnumWindows probe, run from a
   **no-console parent** (the probe that actually reproduces, not the one that didn't).
3. **Enforce it**:
   - Extend `.claude/hooks/syntax-guard.mjs`'s `hidden_guard` so it also refuses
     `detached: true` unless the call routes through the proven-hidden wrapper.
   - Add a repo-wide `node Server/window-lint.mjs` that lists every `spawn`, `exec`, `execFile`,
     `fork` and `Start-Process` call that can open a window (missing `windowsHide` /
     `-WindowStyle Hidden` / not routed through the wrapper).
   - Run it. Fix the hits, or list what's left and why. `ai/todo.md` already has a 16-file sweep
     item for this — finish it if it's small enough to fold in here.

## Rules

- Every process this task itself starts must be hidden — no exceptions, including test probes.
- Never restart Servex. `Servex/` changes wait for the owner's own batched restart.
- Budget: about $5.
- Report to `mastermind-servex`'s day task on landing: append a log line to
  `public/framework/ai/2026-09-28/servex-mastermind/task.jsonl`, and post on the card, live.
