# Docs vs code audit — do the AI + SDK docs add up with the code?

Scope: `Servex/` (agents, Pool, Heartbeat, TaskLoop, MCP tools, ext/openrouter, ext/local) and
`public/framework/ai/` (readme chain, `doc/*.md`, `asks.jsonl`, `todo.md`). 12 claims checked,
script-verified in [claims.json](claims.json) — see
[generate-claims.mjs](generate-claims.mjs) for exactly how each was tested.

## The scoreboard

| Verdict | Count | Meaning |
| :--- | :--- | :--- |
| TRUE | 9 | doc and code agree |
| STALE | 2 | doc's own number was wrong |
| UNDOCUMENTED | 1 | code/a name means two things and no doc says so |
| MISSING | 0 | nothing found promised in docs with no code behind it |

**The good news first:** most of what `doc/systems-overview.md` claims about *how* things work —
the dormant-agent mechanism, the results-gated $2/$3 spend policy, `spawn_agent`'s new
caller-as-parent default, the tool-result logging gap it calls out as unfinished — checked out
exactly against the code. The owner's worry ("omissions between the request and the product")
did not show up as a missing *feature*; it showed up as a stale *count*.

## The two real mismatches (now fixed)

1. **The Servex MCP tool catalog undercounted itself.** `doc/systems-overview.md` claimed
   "68 tools total" but only named 52 of them; the live count today is 77. At least 22 real
   tools — `ask_module`, `card_set`, `card_summary`, `claim_topic`, `create_page`, `follow`,
   `list_claims`, `list_follows`, `list_pages`, `page_reply`, `place`, `refine_step`,
   `register_session`, `release_topic`, `set_focus`, `set_layout`, `unfollow`, and five more —
   were simply absent from the list a new session would read to learn what exists.
   **Fixed directly**: the doc now names them and drops the hardcoded total in favor of a
   warning to count a live session's own tool list instead (law 7: compute, don't recall — a
   number that changes every time a tool is added should never be typed by hand again).

2. **The site MCP catalog was missing a whole program's tools.** Doc said 5 tools (`pages`,
   `eval`, `shot`, `claim`, `release`); live count is 12 — the 7 `research_*` tools that power
   `/framework/research/` were never added when that program shipped. **Fixed directly**, same
   way.

## The one undocumented name collision

**"Heartbeat" means two different things and no doc says so.** `doc/autonomy.md`'s "dynamic
heartbeat" is a Claude Code session's own wakeup-timing decision (the now-stopped `task-1565`
cron). `Servex/Heartbeat.js` is a completely different mechanism: it pings a *task's silent
owner agent* and revives dead ones. A reader who knows one will reasonably assume they know the
other. **Left as a `Note:` card** rather than fixed now, because picking which doc keeps the
word and which one gets renamed is a judgment call for whoever owns `doc/autonomy.md` next, not
a one-line text fix.

## What was checked and held up (no action needed)

- Dormant-agent process lifecycle (Agents.js) — matches doc and its own code comments exactly.
- The $2-start / $3-per-result spend gate — matches exactly.
- `tool_results()` really does drop tool outputs from the session log, and the doc's own
  proposed fix (`GET /api/session/trace`) really isn't built yet — both halves of that gap are
  honestly described, not stale.
- `spawn_agent`'s caller-as-parent default (the commit the brief itself named) is in the code.
- `list_agents` really does still return every row ever with no live/all split —
  `todo.md` already tracks this as open, so it's a confirmed-true open item, not a mismatch.
- ~700 untracked files in the main tree (708 today) — still accurate.
- `asks.jsonl` is live and being written by `servex-asks-tick` as described.
- `Servex/ext/openrouter/` and `Servex/ext/local/` are real provider code, not just
  handover-log narrative; `ext/openrouter/gaps.md` already owns that subsystem's own open
  items, so this audit didn't duplicate it.

## Not duplicated here

Per the brief: session/cost accounting is `task-mastermind-token-accounting`'s;
unbuilt-asks-from-prompts is `minion-prompt-audit`'s. Neither is re-litigated above.

## Full claim list

[claims.json](claims.json) — every claim, its doc location, its code location, the verdict, what
was actually found, and the fix (or why none was needed).
