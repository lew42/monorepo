# Minion: pairs — one pair per page, and its lifecycle

Rules shared by all minions: `../common.md`. Owner's words: `../requirements.md` and the card dir `public/framework/ai/2026/09/25/one-recursive-agent-system-the-same-pair/`.
**Fence:** `Servex/agents/Layers.js`, `Servex/agents/layers.test.mjs`, `Servex/agents/layers-proof.mjs`, new files under `Servex/agents/doc/` about layers, `Servex/agents/tiers.js` only if you must. Private Servex port **8290**.

## Deliverables
1. **A pair for any page** (D1 + the 09-28 addendum). `Layers.record()` accepts a page path as well as a card id. A card is a page; the root is `/`. Ids stay `assistant-<base>` / `manager-<base>` (decision logged: no rename of live ids); the root's are `assistant-root` / `manager-root`. Each record stores `parent`: the parent page's manager id (a top-level card's parent is `manager-root`). Every existing card record in layers.json keeps working unchanged.
2. **The drawer interface**, exactly as `../interface.md`: `POST /api/page-ai {page,text,from}`, `GET /api/page-agents?page=`, and the plain page's chat log `public<page>ai/chat.jsonl`. The route appends the prompt line; the assistant's reply must land there too (give the page assistant a tool, or let `card_reply` accept a page path; your choice, logged). CORS like the existing routes.
3. **Created on first use.** The first prompt on a context spawns its assistant; nothing spawns on page open.
4. **Stopped after 5 idle minutes** (assistants; was 10), at most **4 live assistants**, the least recently used stopped past that. Managers stop after **15** idle minutes. Stopping ends the process; session ids stay in layers.json. Env overrides for tests.
5. **Resumed or fresh on next use:** resume by session id when its context is under 30k tokens and it was last used within the hour; otherwise start fresh from the card's or page's own log. **Measure** the start time of a resume and of a fresh start and put both in a doc.
6. **Fresh, not compacted** (D6): past a threshold (assistant 40k, manager 150k), ask for one checkpoint line, then restart the same id fresh from it. Reuse the existing `compact()` / `card_summary` / `recycle()` machinery if it fits; no SDK compaction.
7. **The root assistant runs on Opus** (D7): the `/` pair's assistant uses the architect tier.
8. **Assistants may quick-edit** (D5, your half): add `take_worktree`, `return_worktree` and `list_claims` to the page assistant's allowed tools. The rules text is the roles minion's.
9. Add `SERVEX_LAYERS_FILE` (a state file override) so a private Servex never touches the live layers.json.

## Proof (in proof.md)
On your private Servex with Layers on and a scratch layers file: process count and MB before and after, with 3 contexts prompted and then left idle 6 minutes (the owner's 5-minute number, not shortened for this run); resume and fresh start times; one recycled assistant whose context begins under 10k; `/api/page-agents` and `/api/page-ai` answering for a plain page and for `/`.
