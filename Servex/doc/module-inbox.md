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

## Next

- `ModuleReview --run`: spawn per module with `readme_chain`, record `outcome`; a periodic trigger in `TaskLoop`.
- Show a module's inbox in its Docs tab.
