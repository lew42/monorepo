# A pair on every page

Every page on the site can have two agents of its own: a fast **assistant** that answers you, and
a **manager** that does the work the assistant hands it. A card is a page too, and the whole repo
is the page `/`. Nothing runs until you speak on a page, and an assistant that has gone quiet is
stopped so it costs no memory.

Code: [`Layers.js`](../Layers.js). Tests: [`layers.test.mjs`](../layers.test.mjs). Proof on a
private Servex: [`pairs/proof.txt`](/framework/ai/2026-09-25/recursive-pairs/pairs/proof.txt).

## Which agents a page gets

| where you speak | its assistant | its manager | the manager's parent |
|---|---|---|---|
| `/` (the root) | `assistant-root`, Opus | `manager-root` | none |
| `/framework/ux/Dictate/` | `assistant-dictate`, Sonnet | `manager-dictate` | `manager-ux` |
| a card, `2026/09/24/fix-the-sidebar` | `assistant-fix-the-sidebar`, Sonnet | `manager-fix-the-sidebar` | `manager-root` |

An id is `assistant-` or `manager-` plus the page's last path segment, lower-cased. A second page
ending in the same word gets `-2`. Ids are minted once and kept in `layers.json`, with each
agent's session id, its context size and when it was last used. The parent is the page one level
up; minting a page mints its parents first, so the tree always reaches `/`.

## How the drawer talks to a page

| what | call |
|---|---|
| send | `POST /api/page-ai` with `{page, text, from}` → `{ok, page, assistant, manager}` |
| status | `GET /api/page-agents?page=<path>` → the same rows as `/api/card-agents` (`[]` before the first send) |
| chat log | `public<page>ai/chat.jsonl`: `{"prompt":…}` from you, `{"message":…}` from the agents |

On a card's own page (`/framework/ai/<card>/`) the send goes into the card instead. The assistant
answers with `page_reply`. The agreed interface: [`interface.md`](/framework/ai/2026-09-25/recursive-pairs/interface.md).

## The lifecycle, in the owner's numbers

1. **Made on first use.** The first send on a page starts its assistant. Opening a page starts nothing.
2. **Stopped after 5 quiet minutes** (a manager after 15). Stopping ends the process, about 230 MB;
   the session id stays in `layers.json`. At most **4** assistants run at once: before a fifth
   starts, the one used longest ago is stopped. One in the middle of a turn is never stopped.
3. **Resumed or fresh on the next send.** It is resumed by its session id when its context was
   under **30k** tokens and it was used within the **hour**; otherwise it starts fresh from the
   page's own log. A manager is resumed unless it is past its fresh line.
4. **Fresh, not compacted.** Past **40k** tokens (an assistant) or **150k** (a manager), Servex asks
   it for one checkpoint line (`card_summary`), stops it once that turn ends, and forgets its
   session. Its next start reads the log from that line on. Nothing is ever compacted.

Every number has an environment variable: `SERVEX_ASSISTANT_IDLE_MS`, `SERVEX_MANAGER_IDLE_MS`,
`SERVEX_MAX_ASSISTANTS`, `SERVEX_RESUME_MAX_TOKENS`, `SERVEX_RESUME_MAX_AGE_MS`,
`SERVEX_ASSISTANT_FRESH_AT`, `SERVEX_MANAGER_FRESH_AT`. `SERVEX_LAYERS_FILE` moves the state
file, so a private Servex never touches the live one.

## What a start costs (measured 2026-09-28)

Each time is from the send to the assistant's reply landing in the page's chat, for a one-word
answer, on a private Servex ([`proof.txt`](/framework/ai/2026-09-25/recursive-pairs/pairs/proof.txt)).

| the assistant was | reply after |
|---|---|
| running (warm) | 2.3 s |
| stopped, then **resumed** by its session id | 3.1 s |
| started **fresh** from the page's log (Sonnet) | 3.1 to 3.6 s |
| started fresh, the Opus root | 3.9 to 4.1 s |

So starting a process costs under a second, and a resume costs the same as a fresh start. Keeping
an idle assistant alive saves that second and costs about **230 MB** each: three idle assistants
held 694 MB, and 0 MB once the 5-minute stop had run.

## Why a fresh assistant is small

A fresh assistant used to begin at about **60k tokens** before it said a word. Most of that was
not ours: the account's claude.ai connectors (Figma, Google Drive, Claude Docs, about 40k tokens of
tool descriptions) and the auto-memory file load into every session, even one started with no
settings files. An assistant now starts with those turned off, with every Servex tool it does not
use left out of its tool list, and with only `Read`, `Edit`, `Write` and `Bash` built in. It begins
at about **11k** (Sonnet) and **8k** (the Opus root).

`Bash` is about 5k of that. It stays because a safe quick edit has to commit, smoke-test and merge
inside its worktree (`take_worktree`, `node Server/smoke.mjs`, `node Server/merge.mjs`,
`return_worktree`). `SERVEX_ASSISTANT_BASH=0` removes it, and quick edits with it, for about 6k.

## Watch out

- A plain page's chat is written only by Servex (the send route and `page_reply`). The root's chat
  is `public/ai/chat.jsonl`; `/framework/`'s lands in `public/framework/ai/chat.jsonl`, beside the
  task-log module's own files.
- A stopped agent's session id is copied into `layers.json` only while it runs. Before 2026-09-28
  the sweep copied it back from the stopped agent, which silently undid every recycle.
- The assistant's brief is `card-assistant.md`, its whole system prompt. It does not load skills:
  an assistant runs with no settings files.
