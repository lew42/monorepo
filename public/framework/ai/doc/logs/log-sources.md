# Where "what the owner asked, and what landed" actually lives

Six places claim to know what the owner asked and what happened to it. They disagree sometimes.
This page says which one is ground truth for what, so the next audit (or the next person) does
not re-derive it from scratch. Written 2026-10-08 (mastermind-cheap-models), extending
[2026-10-07/prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/) — that task only ever read
`asks.jsonl`; this map adds the one source it never touched: the raw Claude Code session files.

## The sources, ranked by how trustworthy they are for "what did the owner actually type"

1. **The Claude Code SDK session files** — `~/.claude/projects/<cwd-as-dirname>/<session-uuid>.jsonl`.
   **Ground truth for the owner's literal words**, because every other source is a SUMMARY an
   agent wrote about a prompt, and a summary can drop, merge or soften what was actually said.
   Every line is one turn; a real owner turn is `{"type":"user","message":{"role":"user","content":...}}`
   where `content` is a plain string (typed in a terminal) or an array whose items include a
   `type:"text"` entry (not only `tool_result` entries, which are the agent's own tool output being
   fed back in — those are NOT owner words, just shaped like a "user" turn because of how the
   protocol works). **Caveat:** most of these directories are NOT the owner typing — `spawn_agent`
   starts a real `claude` session per minion/mastermind, and that session's first "user" turn is
   the ORCHESTRATOR'S prompt text, structurally identical to an owner message. The giveaway is the
   text itself: boilerplate like `[You are Servex agent ...]`, `[You are an assistant ...]`,
   `[from: ...]` (not `[from: owner`), skill-preamble text, or a long structured brief — `Server/Council.mjs`'s
   `isOwnerPrompt()` already has this exact filter, written for a different source (below); reuse it.
   **Scale:** 6.5 GB, ~7,700 files across ~167 directories on this machine (2026-10-08 measurement) —
   never read these directly; always script-filter first (grep for `"role":"user"` before parsing
   JSON, since most lines are huge assistant/tool turns). Non-worktree directories (`c--Code-lew42-monorepo`,
   `C--Code-lew42`, and a handful of `C--Code-lew42-monorepo-public-framework-*` per-subdirectory
   tabs) are where the owner's own interactive tabs run; the ~140 `C--Code-lew42-worktrees-*`
   directories are almost all spawned-agent work — included in a full pass, but expect their "user"
   turns to be orchestrator prompts, not owner words, far more often.

2. **`.claude/prompts/<day>.jsonl`** — a curated extraction Servex already does from (1), tagged
   `{"prompt":{"author":"owner", "text", "at", "session_id"}}`. Easier to read than the raw session
   files, but it is only as complete as whatever extracted it — treat as a fast index into (1), not
   a replacement for it. `Server/Council.mjs`'s `collect()` reads this first.

3. **`public/framework/ai/asks.jsonl`** — the routed-ask ledger: one line per ask with its owner
   agent, card, and status (`building`/`landed`/`stalled`/`dropped`/`parked`/`queued`). This is
   ground truth for **status**, not for the original words — `title` is already a paraphrase, and
   `words` points back at source 2 or a task's `owner-words.md`, not the raw quote. This is what
   [2026-10-07/prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/report.md) already audited end
   to end (259 asks, 83% landed) — don't redo that pass, extend it with sources 1 and 4-6.

4. **`public/framework/ai/<date>/<task>/`** — `task.jsonl` (the task's own log; `landed_at` present
   = it landed, absent = still open or abandoned), `requirements.md` (the brief, often with the
   owner's own words quoted at the top), and whatever report the task produced. Ground truth for
   **whether a specific piece of work finished**, matched to an ask by its `brief` path or `card`
   field in asks.jsonl.

5. **`public/framework/ai/cards.jsonl`** and the card folders under `public/framework/ai/<y>/<m>/<d>/<slug>/`
   — the owner-facing board. A card's `page.jsonl` sometimes carries a `{"prompt":...}` line of its
   own (owner words typed into that card) — `Council.mjs`'s `collect()` step 2 already walks these.

6. **Servex's own logs**, `%LOCALAPPDATA%\lew42\servex\logs\` — `lifecycle.jsonl` (agent start/stop,
   useful for matching a session uuid to an agent id and a task dir) and `openrouter.jsonl` (real
   dollar cost per OpenRouter turn, keyed by agent id — see also
   [doc/tokens/tokens.md](../tokens/tokens.md) for the Claude-side cost story). Not a source of
   owner words at all; it is the join key between a raw session (source 1) and a task (source 4).

## What this means for an ask→delivered audit

- Start from source 1 (the only one that can't have dropped something), script-filtered hard, to
  build a candidate list of real owner asks with timestamps and session ids.
- Match each candidate against source 3 (asks.jsonl, by rough text overlap) and source 4 (grep
  task `requirements.md` files and `git log` for matching language) — this is pure computation,
  no model call.
- Only what the script genuinely cannot match goes to a model at all (Haiku first, per
  `Servex/ext/openrouter/evals/known-answer.mjs`'s pattern: inline the shortlist, no tool calls,
  score against a script-computed baseline wherever one exists).
- See `public/framework/ai/sessions/2026/10/08/mastermind-cheap-models/mastermind-cheap-models/ask-ledger/` for the running script
  and its output.
