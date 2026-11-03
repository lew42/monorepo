# The drawer ↔ page pair interface

Agreed between task-mastermind-recursive-pairs (Servex side) and task-mastermind-page-drawer (drawer side).
On a **card**, nothing changes: the drawer uses the card's existing composer and `page.jsonl`.
On a **plain page**:

| What | Call | Shape |
|---|---|---|
| Send | `POST http://servex.localhost/api/page-ai` | body `{page, text, from}`, e.g. `{"page":"/framework/ux/Dictate/","text":"…","from":"owner"}` → `{ok, assistant, manager}` |
| Chat log | `public<page>ai/chat.jsonl` | the same lines as a card's page.jsonl: `{"prompt":{text,at,by}}` from the owner, `{"message":{by,text,at}}` from agents |
| Status | `GET http://servex.localhost/api/page-agents?page=<path>` | the same rows as `/api/card-agents`: `[{id, role, state, model, session_id, context, window, pct}]` |

- A page path is a site path with a trailing slash. `/` is the root pair.
- The first send on a page creates its assistant. Opening a page spawns nothing.
- The assistant stops after 5 idle minutes and comes back on the next send (resumed or fresh).

**Added 2026-09-28 by task-mastermind-page-drawer:** a send may carry `context`, the elements the reader picked on the page and chipped into the input: `{page, text, from, context: [{kind, label, text, selector}]}` (e.g. `{"kind":"p","label":"this paragraph","text":"…first 300 chars…","selector":"main p:nth-of-type(3)"}`). The page's manager answers; there is no agent per element. Until `/api/page-ai` answers, the drawer falls back to the dev bar Ask route.
