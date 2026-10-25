# Module inbox: an ask lands where it belongs, a fresh mastermind reads it later

**The point:** the master mastermind should not read a module's documentation to judge what that module should change. It drops the *essence* of what the owner said into that module's inbox, and later a fresh mastermind for that one module reads the inbox with the module's readmes (a warm cache read) and decides, in the module's own files. The owner's words: [`requirements-12.md`](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-12.md) asks 1 and 2.

## Built today (smallest slice)

```
class ModuleInbox      Servex/agents/ModuleInbox.js   add(essence, source) · outcome(id, …) · lines() · unread() · static modules()
class ModuleReview     Server/ModuleReview.mjs        plan()  — lists modules with unread lines, depth, model, token estimate
tool  module_inbox     (Servex MCP)                   module + essence + source → one inbox line; no essence → lists unread
```

`ux/Dictate` holds three real lines, and the plan shows what a reviewer would read:

```
$ node Server/ModuleReview.mjs --plan
public/framework/ux/Dictate  3 unread  deep  sonnet  12 readmes/docs  ~21406 tokens
```

## What exists and is reused (nothing is rebuilt)

- **Page inbox** (`page_note`, [inbox.md](inbox.md)): a note on a *page*, wakes a coordinator. The module inbox is different: it is a durable list of owner *asks*, read in batches, not a wake. It reuses the same habit (append-only JSONL beside the module, `claim_topic` names the module).
- **Readme chain** ([readme-chain.md](readme-chain.md), `agents/readme-chain.js`): the reviewer loads it with `load_module`; the plan prices the same files.
- **`TaskLoop`** ([task-loop.md](task-loop.md)) and `Server/FollowUp.mjs`: the periodic nodes. The next slice adds the batch run beside them, not a new scheduler.

## Class architecture

- **`ModuleInbox`** — one module's inbox. File: `<module folder>/inbox.jsonl`, append-only, never rewritten. A line is `{id, at, essence, source, from, size?}`; the reviewer's answer is a later `{outcome:{id, state, note, by}}` line, so an essence line is never edited. `source` links the prompt it came from (link, don't retype).
- **`ModuleReview`** — the node scheduler (no model in the loop). It walks `ModuleInbox.modules()`, keeps those with unread lines, picks depth and model, and (next slice) spawns one fresh mastermind per module, one module per batch so the readme chain is a cache hit, then records the outcome with `ModuleInbox.outcome`.
- **Depth and model by the ask's size:** a *shallow* read (readme chain) for a small ask; a *deep* read (adds `doc/architecture*.md`, `doc/decisions*.md`, child readmes) when the line is tagged `architecture`, names classes/moves/hierarchy, or is long. Haiku only while the whole read fits under about 80k tokens (the 100k line is 5x per token); anything deep or bigger goes to Sonnet, which reads more. These are defaults the node picks; the reviewer can ask for more.

## Wording a rule from an inbox line

When the reviewing mastermind writes or changes a rule because of a line, it **should** word it as a *should/could*: name the factors (file size, how often, who is affected) and the clearly good and clearly bad sides, then leave the judgment call to the reader. A *must* that prescribes a judgment call fails at the edge cases, and every caveat loaded every time is context pollution. A hard rule is for what actually breaks, and says what broke. (The owner, ask 1.)

## The feedback inbox (the owner, 2026-10-23)

Module `ai` (`public/framework/ai/inbox.jsonl`) is also the feedback inbox of the AI system mastermind (a `mastermind` spawned at `public/framework/ai/`). Any agent logs a problem with the system as `essence` plus its suggested `fix`. If the same problem was logged before, `repeat_of` names the first line's id. `ModuleInbox.repeats(id)` counts them. The tool wakes it on the third repeat (`FEEDBACK_WAKE`), or at once for `obvious: true`: if a live `ai-system-mastermind` or `mastermind-ai` exists it is sent the line (`ModuleInbox.FEEDBACK_LIVE`); otherwise Servex spawns a `mastermind` at `public/framework/ai/` with no parent. A line with no `fix` is an ordinary ask and wakes nobody. Test: `node Servex/agents/path-mastermind.test.mjs`.

## Next

- `ModuleReview --run`: spawn per module with `readme_chain`, record `outcome`; a periodic trigger in `TaskLoop`.
- Show a module's inbox in its Docs tab.

## How work passes between agents today

There are two kinds of hand-off, and only one leaves a record. **Recorded** means the words end up in a file that git keeps, so a fresh agent can read them later. **Unrecorded** means the words went into the receiving agent's live conversation and exist nowhere else.

- `spawn_agent` is both: it writes the new task's first `task.jsonl` line (the `assign` line, with the brief path) and then sends the agent one prompt. The brief file is the real hand-off; the prompt only points at it.
- `send_to_agent` is an SDK message into a running agent. It is **not** recorded unless the receiver chooses to log it. If the receiver restarts or its context is compacted, the message is gone.
- Cards and `task.jsonl` lines are the recorded channel: anything an agent must not lose goes there.
- The module inbox (above) is the recorded hand-off for owner asks that belong to a module.

| Channel | Recorded where | Survives a restart |
|---|---|---|
| `spawn_agent` brief + `assign` line | the task's `task.jsonl` and `requirements.md` | yes |
| `send_to_agent` | nowhere, unless the receiver logs it | no |
| Card reply / `card_ask` | the card's `page.jsonl` | yes |
| `page_note` / `drop` | the page's `page.jsonl` | yes |
| `module_inbox` | `<module>/inbox.jsonl` | yes |

**Recommendation (not built yet):** every `send_to_agent` should also append a `chat` line to the receiver's `task.jsonl` (sender, text, time), done by Servex itself, so nothing passes between agents unrecorded. It is a small change in the send path: the live message stays the wake-up, the file becomes the memory.
