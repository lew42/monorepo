Budget: $10.

# Servex: logs stamped by code, never typed by an AI

The owner, relayed by vscode-mastermind, 2026-10-02: "Audit our most-used AI logs (prompts, cards, chat, task logs, asks) for any place where an AI writes raw JSON to a file or copies a prompt or file through a tool call. Each should be a hook or a validated tool that stamps the fields itself." Law 7, compute don't recall.

Owner: `mastermind-servex`. **Starts after card-pipeline-2**, because both change `Servex/asks/` and `Cards.js`. (Its task.jsonl line 1 says "after token-reduction"; this sentence wins.) This replaces checkpoint-10's queue item "JSONL gaps 2–5" and folds it in (deliverable 7).

## What the audit found (mastermind-servex-10, 2026-10-02)

**Already right, leave alone:** the prompt log (`.claude/hooks/prompt-relay.mjs` stamps `at`, `session_id`, `author`), the voice chat (`Sessions.js` writes every line itself and sends each owner line to both assistants by code), card lines (`create_card`, `card_set`, `card_reply`, `card_summary` are validated tools), asks status marks (`Asks.js`, `mark.mjs`), and review lines (`review.mjs`).

**Typed by an AI today, by how often it runs:**
1. **The task launch line** (`new-task` skill, lines 27–31): every task. The AI types `session_id`, `requested_at`, `request` (the owner's prompt, retyped "verbatim"), `model` and `window.before` into a `lines.json`, and `append.mjs` checks only the shape.
2. **The landing line** (`finish-task`, lines 50–56): `landed_at`, `window.after`, `tokens`, `usage`, typed by hand on every landing.
3. **Day log lines**, opened and closed by hand (`new-task` 48–52, `finish-task` 80–85).
4. **Mid-task `log`, `assign` step and `agent` lines** (`new-task` 46 and 76–79, `minion` 67, `sub-mastermind` 244).
5. **The ask route line** (`Servex/asks/readme.md` 141–144): a mastermind writes it through `append.mjs`.
6. **`audit.jsonl` auditor lines**, written by minions through `append.mjs` (`Server/audit.mjs` header).

**Copied through a tool call:**
7. `create_card` / `ask_manager` "holding the owner's own words" (`Layers.js` ~815): the AI retypes the owner's words into the argument.
8. `spawn_agent`'s `prompt` is sometimes a retyped brief. The rule is a path (`task: {dir, card, brief}`), but nothing enforces it.

## Build (node, law 7), in this order

1. **`node Server/task.mjs open <slug> --steps "a|b|c" [--group g]`** writes line 1 and the day's open line. Code stamps `session_id` (from `CLAUDE_CODE_SESSION_ID`, or the Servex agent's own id), `requested_at`, `model`, `window.before` (from `ai/usage.json`) and `request`. **`request` is pulled from the prompt log**: the latest owner prompt of this session, or `--prompt <at>` to name another. The AI never retypes it. The AI passes only what needs judgment: slug, group, steps.
2. **`task.mjs step <dir> N "now"`**, **`task.mjs log <dir> "msg"`** and **`task.mjs agent <dir> <id>`** stamp `at` and the writer's id.
3. **`task.mjs land <dir> --outcome <file.md>`** stamps `landed_at`, `window.after`, and `tokens`/`usage` from Servex's own cost record for every agent on the task, then closes the day line. The AI writes only the outcome text, as a file.
4. **The ask route line** becomes `node Servex/asks/route.mjs <card> [--prompt <at>]` (and the same function as an MCP tool, `route_ask`). Code stamps `id`, `at` and the owning agent, and the owner's words come from the prompt log by reference.
5. **Owner words by reference, not by retyping:** `create_card` and `ask_manager` take `prompt: <at or p-id>`, and Servex copies the exact line from the prompt log or the session file. A `request` or `text` argument stays as the AI's own summary, labelled as one.
6. **`spawn_agent` with `task.brief` and a `prompt` over about 400 characters** warns in its result ("pass the brief path; don't retype it"). It doesn't refuse.
7. **JSONL gaps 2–5** (from checkpoint-10): confirm `Append.js` refuses a bad line from every writer path (servers' `rpc:append`, worktree servers included); `ledger.mjs` writes the line anyway, marked `"unchecked"`; every `flags.jsonl` line passes the schema; the skills name only these tools.
8. **The skills say one command each:** `new-task`, `finish-task`, `minion`, `sub-mastermind` and `servex-mastermind` replace their hand-built JSON examples with the `task.mjs` lines. `append.mjs` stays for verbs no tool covers yet.
9. `audit.mjs --submit <dir> <verdict.json>` stamps the auditor's id and `at` on an `audit.jsonl` line.

## Never backfires
- A guard must never stop logging itself. If a stamp can't be read (no usage file, no session id), write the line with that field `null` and a `"unchecked"` mark; never refuse.
- Old lines stay readable: readers accept both the hand-written and the stamped shape.
- Re-run `.claude/hooks/*.test.mjs` (jsonl-guard 24, jsonl-schema 38, ledger 5, git-guard 50) and add a test per tool: the right fields are stamped, and `request` matches the prompt log byte for byte.

## Rules
Sonnet, high effort. A pool worktree, a commit after each piece. The mastermind reads the diff (`Server/doc/review.md`, "Who reviews"); it changes no page, so no screenshot review. Then `merge.mjs`, and a Servex restart for the MCP tool. Never wait on the owner.
