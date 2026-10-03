# servex-mastermind: improvements

- **jsonl-guard false positive (2026-10-01, vscode-mastermind).** `.claude/hooks/jsonl-guard.mjs` blocked two harmless commands:
  1. a heredoc appending to a `.md` file, whose BODY contained a placeholder `‹slug›/page.jsonl`. The placeholder's closing angle bracket, followed by a path ending in .jsonl, reads as a redirection;
  2. a `node -e` call whose quoted JS STRING contained that same text.

  Match only a real redirection target: an unquoted `>`/`>>` in the shell command itself, not inside quotes or heredoc bodies. Add both cases to its tests.

- **Every class module readme OPENS with its class block** (the owner, 2026-10-01): the pseudo-JS shape (properties first, then the main methods, `[X]` for arrays), most useful first, under a `## Architecture` heading. It is the ONLY copy: there is no central guide, to avoid drift (the owner). Whoever changes a class updates it. Add this to the documentation skill and the review questions.

- **Heartbeat churn on a waiting agent (2026-10-01):** task-mastermind-openrouter was waiting on a timer (the OpenRouter daily cap resets at 19:00), yet the heartbeat kept status-checking and REVIVING it (3 revives by 07:50, then escalated). Each revive and check is a paid Opus turn spent saying "still waiting". Fix: an agent can declare `waiting_until` (a time or an event). The heartbeat leaves it dormant until then and wakes it once.

## 2026-10-03 — mcp__playwright__* opens a VISIBLE window, never use it for verification
Used `mcp__playwright__browser_navigate`/`evaluate`/`screenshot` to probe the Sortable ghost
fix (ghost-theme-fix task) — it opened a real, visible Chrome window on the owner's own
screen, exactly the thing "never claim/eval the owner's connected tab" was meant to prevent,
just via a different tool than `mcp__site__eval`. Fix for next time: `mcp__site__shot`
(headless screenshot) and `mcp__site__eval` (after `mcp__site__pages` confirms no owner tab
on that path) cover everything a live check needs; `mcp__playwright__*` should not be reached
for on this project at all. — mastermind-page-3
