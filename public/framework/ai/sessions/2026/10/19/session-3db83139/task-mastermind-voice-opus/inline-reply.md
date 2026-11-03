# In-line Replies (parked, 2026-10-19)

**Decision (the owner):** keep quoting the question in Q&A cards for now. In-line replies are parked: resurfacing a card takes it out of order, and a duplicate still needs a reference. If it comes back, the unit is a sentence.

**What already exists, if it comes back:**
- Every Reply `{chat}` line already carries `re` (the owner line it answers): 71 of 71 in `public/ai/v-timqv56.jsonl`.
- `ext/Chat/Chat.js` `thread_item()` (line ~426) already draws a line with `thread: true` + `re` as a folded thread under that line, and opens it if it is under 2 minutes old. Voice Replies never set `thread`, so none use it (0 of 71).
- The smallest version: the Reply sets `thread: true` (plus an optional `span: [start, end]` into the Transcript sentence, for a highlight), and Widget.js draws it under the sentence through the same `thread_item`. No new store.
