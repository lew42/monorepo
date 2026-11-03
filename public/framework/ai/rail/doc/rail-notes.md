# rail.js — AI Rail architecture

## Overview

AI RAIL — the AI's inbox: the base rail (`Inbox.Rail`, `core/Page/ext/Inbox/Inbox.js`) plus what only the AI system has (the owner, 2026-09-30: "we don't need the AI usage meters on the inbox for every single page… override the rail… and you add the progress bars above it").

## Key components

Adds, each as an override of one base method:
- the usage meters above the filters (`head_extra`) — the ONLY place they exist;
- "+ New card" (`actions`) and auto-transcribe (`toggles`);
- the rows: cards, the Live card, groups and changed site pages, from the AI logs (`source`, `draw_extras`), with a progress meter and "what happened" on each;
- the pinned Now card, the focus-follow (an agent can open a card on your screen), the workspace word, and flagging a sentence you selected in the detail.

## Usage

AI 2 (`ai2/page.js`) and the AI page's Inbox and Log tabs (`ai/page.js`) both build one:
```js
this.ai2 = new AIRail({ page: this }).mount()
```
inside `content()`. Card pages read it back as `shell.ai2` (card.js).

⚠ The shell also wears `.ai2`: card.js finds it with `document.querySelector(".ai2")` to write its column widths (`--ai2-subw`, `--ai2-chat`) — rail.css passes those on.

## Data and state

The data first: the usage meters in the head read `live` while the head is built. Key data structures:
- Every card folder, as Servex lists them; `board.jsonl` is read only when it is not `ok`
- The familiar groups the work is filed under — `groups.json`, `groups.js`
- With the workspace view on, every link clicked keeps `?view=workspace`

## Constants and helpers

`storage` — `Inbox.Rail.prototype`'s try/catch localStorage helpers (`store_get`/`store_set`), shared rather than copied. Was named `store`, which read as "a data store"; it holds no data at all, just the wrapper methods (restructure, 2026-10-02 — the owner: "a misleading name").

`auto_transcribe` — On by default — a card you just opened starts listening unless you turned this off.

## Scoring and reasoning

THE REASON NEXT TO THE NUMBER (card-pipeline, 2026-10-02, item 3: "the items above 90 seem arbitrary"). `importance()` (`needs-rule.js`) already picks a number with a written-down rule for every band; `reason_of()` (same file) names, in five words or fewer, WHICH branch of that rule actually fired — this just finds the row's own highest-scoring open need (the same ones `score_for()` already looked at, never a second idea of the score) and hands it over. The full band legend, in prose: this module's own readme.
