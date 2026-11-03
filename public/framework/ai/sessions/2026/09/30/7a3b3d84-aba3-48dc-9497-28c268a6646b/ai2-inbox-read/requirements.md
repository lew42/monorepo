# AI 2: an inbox that zeroes out: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

## Asks
1. **Inbox only.** Needs you and Inbox are the same thing in two looks, and the owner prefers the Inbox, where a click opens the sidebar. Hide the Needs you tab for now; don't delete its code.
2. **Read and unread.** Unread rows are bold, or otherwise look different. Opening a row marks it read. Read state belongs to the owner, so keep it per viewer (localStorage is fine for v1).
3. **Archive / clear.** Each row gets a button that removes it from the Inbox. **Nothing is ever deleted.** Archived items stay in the Log and on their card.
4. **Automatic resolution.** A row leaves the Inbox by itself when it's resolved:
   - an ask answered (a `chose` line);
   - a question replied to;
   - a task landed or stopped;
   - a card marked done.

   Write the resolution rule down, in one place, in a comment.
5. **Search.** One search box that finds any card or row, including archived ones, by title and text.
6. **The Now card has redundant wording.** "Running now", then "working" on every row, then "· now" after each one. Say it once: the heading says it, and the rows just name the agent and what it's doing.

## Rules
- Pool worktree (`take_worktree`), then `merge.mjs` with the smoke test, then the review skill. Screenshots at 400 and 1920.
- Budget: $8, hard. At most 1 minion.
- Post one short card when it's live: http://10.0.0.135:8137/framework/ai2/
- Coordinate with task-mastermind-cards-and-logs if it touches the same files.
