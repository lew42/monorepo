# Ask 3: cards of any kind, by id, through `item` (Budget: $6)

Load the `minion` skill first. Worktree: `take_worktree`. Tests first, commit by exact path, do not merge or push. Owner words: [owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md), ask 3. Read the item tool doc first: `public/framework/core/Item/` readme and `Servex/agents/single-voice-assistant.md` (the `place`/`messages` calls the seat uses today), and `public/framework/ext/Chat/v3/ChatWriter.js` (how `place` and `messages` lines are written).

## What the owner asked
`item` adds a card with an icon and a title, or a ref to an existing item, plus any content. It returns the new card's id. The agent can then append to the card, rewrite it, or read it by that id. It can upgrade one of the owner's messages into a card. And this morning the owner asked a voice agent for a card and the card came out titled "undefined": that request must work.

## Steps
1. Reproduce "undefined" first: find where a card without a title or content is written (search `ChatWriter`, `Sessions.js` place/messages handling, `core/Item`), with a failing test that adds a card with `{icon, title}` through the real item path and reads it back. Fix the cause (a missing/!string field becomes the stringified word "undefined"); see also the existing "undefined/null is filler" guard in Servex/agents/Sessions tests for the pattern.
2. Make `item({path:<session>, delta:{messages:{add:{type:"Card", icon, title, content?}}}})` (or the nearest form the code already supports; reuse, do not invent a second path) work and return the id; then `messages:{"<id>":{content:{add:...}}}` appends, `{title:"..."}` rewrites; reading by id is `item({path})` filtered. Name the exact calls in your report and in the seat brief's section only if the brief already covers messages (it does at "A new task or topic starts a card"): add AT MOST 3 lines to Servex/agents/single-voice-assistant.md, and per the owner's rule write the risk of adding and of leaving it out in `ask3-cards-by-id/risk.md` first, with a test on the replayed session `v-z0jonhy` (Servex/agents/single-brief.test.mjs is the pattern).
3. Upgrading an owner message into a card: a `{move}`/place of an existing message into a card with a title; test it.

## Fences
Own: ChatWriter/ChatV3 only where a card line needs it, the item tool handler, tests, the doc line. Not the Recite files, not chat-settings files, not `Sessions.js` gate code.

## Report
One screen in your task.jsonl: the exact calls, the cause of "undefined", test output; one line to `mastermind-voice-system`. Update the readme of the module you changed with the structure (CLAUDE.md law 9).
