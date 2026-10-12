# VS Code tabs in the Sessions dashboard, with their real cost

## The ask (owner, 2026-10-04, dictated)
> Is it possible to add the VS Code sidebar sessions ... Those should have session IDs and if we're not logging them to the same system, the same session based system that we're tracking everything else, we should be. We want as much data into that AI slash sessions dashboard as possible. So if we can use hooks ...

## Found (vscode-mastermind, from `public/framework/ai/sessions/week.json`)
- `claude_usd` $1,482.68 for the week, of which `session-361c4d18` (the previous VS Code tab) is **$1,474.21**: almost the whole week under one session. Either everything that tab spawned rolls up into it, or the week total is built from that one page. Find which; the per-session number must be the session's OWN cost, with its spawned agents shown as a subtree (spend-tree already models own vs subtree).
- `session-60d9def6` (this VS Code tab, a very long conversation with Opus 5.5) shows **$5.32**: far too low.
- `usd_per_pct` $20.04 (shown to the owner as "per 1% of the weekly plan") rests on these numbers.

## Want
1. A VS Code / terminal session's cost computed from its own transcript (`~/.claude/projects/<project>/<session_id>.jsonl`, every assistant message's `usage` × the PRICES table that token-accounting made the single source), updated by the existing Stop/UserPromptSubmit hooks (`.claude/hooks/reply-relay.mjs` / `prompt-relay.mjs`) — no timer.
2. Fix the roll-up so each session's own $ and subtree $ are separate, and the week total counts each API call once.
3. Recompute `usd_per_pct` and show its inputs on the Sessions tab.
4. Worktree → check_page → merge.mjs.

Budget: $3 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
