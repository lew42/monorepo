# Owner inbox: state

**Done:** one `owner_note({title,text,kind,links})` path (Servex card system, MCP tool + `POST /owner_note`), pinned at the top of the AI Inbox until the owner opens the card.

## What was broken (reproduced)
- A plain `note` card scores 10 plus a freshness lift, so it drops under `Rail.FLOOR = 90` after about a day.
- Read state was per-browser localStorage only; no shared "seen".
- `create_card`, `card_ask` and `page_note` were three different routes, none enforced.

## Decision
A dedicated `owner_note` card kind, scored 100, no decay, until a shared `reviewed` line (written when the owner opens the card). Alternative: lift every note's score. Rejected: it would bury real work.

## Wired
Mastermind and sub-mastermind skills (one line each); `Server/on-landing.mjs` posts a digest note when a landed task recorded a decision.

## Proof
- `Servex/cards/test.mjs` passes.
- Headless Inbox probe at 400/1200/1920/3440: two test notes rank first (score 100), no page errors.
- Private-port Servex (8191): `POST /owner_note` ok, empty text refused, MCP `tools/list` shows `owner_note`.

## Open
One real Servex restart after the merge, then a live post-and-see check.
