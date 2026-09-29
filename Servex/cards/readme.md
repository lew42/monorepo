# Servex/cards — one folder per card

A card is a folder under `public/framework/ai/`, holding one append-only `page.jsonl`. It
lives in the folder of the day it was made, and a sub-card is a folder inside it, to any depth:

```
ai/2026/09/24/page.jsonl                   the day's own page, listing its cards
ai/2026/09/24/fix-the-sidebar/page.jsonl   a card — its id is 2026/09/24/fix-the-sidebar
ai/2026/09/24/fix-the-sidebar/wider/…      a sub-card — 2026/09/24/fix-the-sidebar/wider
```

`Cards.js` is the only thing that writes these files. Agents make cards with the
`create_card` tool and never by hand.

## Use

- `new Cards({ agents })` — `root` defaults to the repo's `public/framework/ai/`; pass a scratch dir to test.
- `create({parent, title, type, by, tags})` → `{ok, id, url, path}`. No parent (or `"today"`) = today's folder.
- `append(id, line)` · `read(id)` · `fold(id)` (the latest-wins state) · `resolve(id)` → folder or null
- `list({view, tag})` — `view` is `today`, `open`, `all`, or a tag. Projects are tags, not folders.
- `on(fn)` — `fn(cardId, line, info)` hears every line appended to any card (`{fresh}` for a prompt, `{created: true}` for a create); returns a remover. A throwing listener never breaks a write.
- `attach(id, agent)` · `attached(id)` · `forward(id, prompt)`
- `ask({card, question, options?, title?, from?})` places a Decision (with `options`) or a Question (without) — the widget the owner already answers on a card. `waiting()` reads every card's open asks back, ranked and newest first (`needs-rule.js`'s `card_needs`, the same rule the AI 2 "Needs you" tab uses); the MCP tools are `card_ask` and `list_waiting`, the HTTP route is `GET /waiting`.
- The moment a `chose`, `answer` or legacy `answer.ask` line lands in `append()`, it wakes whoever asked (`from` on the placed line, or every attached, live, non-minion agent when there's no `from`) with the answer.
- `routes(router, cors)` — `GET /cards?view=`, `GET /card?id=`, `POST /card/create`, `POST /card/append?id=`, `GET /waiting`
- `tools()` — `create_card`, `read_card`, `attach_card`, `list_cards`, `card_ask`, `list_waiting`, in `agents/tools.js`'s shape
- `node Servex/cards/test.mjs` runs every method against a scratch folder.

## The lines — this is the one place they are defined

Line 1 builds the card; every later line is one change, and the latest line wins.

| Line | Meaning |
|---|---|
| `{"class": "/framework/ai2/card.js", "title", "type", "id", "created", "by", "tags": []}` | Line 1 only. |
| `{"type": "request"}` | Turns the card into another kind — question, request, task… |
| `{"tags": ["site"]}` · `{"status": "open"\|"done"}` · `{"title": "…"}` | Latest wins. |
| `{"message": {"by", "text", "at", "kind"}}` | Anything said or that happened (`kind` = reply, update, task…). `at` is stamped if missing. |
| `{"prompt": {…}}` | One of the owner's own prompts — below. |
| `{"cites": ["<card id>#<prompt id>"]}` | This card answers or builds on that prompt. |
| `{"attach": "agent-id"}` · `{"detach": "agent-id"}` | Who is working on the card. |
| `{"legacy": "topic-xyz"}` | An old id this card also answers to. |
| `{"file": "<slug>/page.jsonl"}` | The parent's listing of a child. Safe to repeat. |

**A prompt** is the owner's words, kept as a record of its own:

```json
{"prompt": {"id": "p-mfz3k2a9x4", "at": "2026-09-24T15:04:09-05:00", "by": "owner",
  "raw": "um make the sidebar wider", "text": "Make the sidebar wider.",
  "via": "whisper", "on": "2026/09/24/fix-the-sidebar", "url": "/framework/ai2/"}}
```

- `raw` is the verbatim transcript; `text` is the cleaned reading, and is the raw words until one arrives.
- A new prompt gets its `id` (`p-` + `Date.now()` in base 36 + two random characters), `at`, `by` and `on` filled in.
- A later `prompt` line with the SAME `id` merges into it, field by field — that is how a cleaned reading lands.
- Its global name is `<card id>#<prompt id>`; any card cites it with a `cites` line.
- `POST /card/append` with a new prompt forwards its `text` to every live agent attached to the card.

## Watch out

- **Minions never hear the chatter.** A prompt is forwarded to attached agents that are live and are not minions. `attach_card` still sends a minion the whole log once, because attaching it was deliberate.
- **Only a new prompt is forwarded** — a merge (the cleaned reading) and a plain `message` are not, so an agent never hears the same words twice.
- **A day folder is dated when the card is made**, in local time, and the card never moves.
- **Slugs are claimed with a plain `mkdir`**, so two cards with one title at the same moment get `x` and `x-2`, never one folder.

## More

The design: [handoff2.md](../../public/framework/ai/handoff2.md) items 5–7.
