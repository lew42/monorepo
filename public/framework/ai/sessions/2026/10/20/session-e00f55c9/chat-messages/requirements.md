# One real chat list: session messages, dual-written beside V1's old lines (you are a mastermind)

**The owner (2026-11-01, 18:35):** "I need to get a better data structure than pseudo properties… a list that we can render in the right place, and then it automatically updates when items are added to the list, and items can be added to the list via an item tool, that's the right shape. Get it done." Also: "we don't want to have to go back and write another migration script and redo this whole thing in another day". Tasks, prompts and messages must be "seamed together into a chat log". Different views may show different depths of the same thing: the full 12-page dictation, or a one-paragraph title and summary. The rendered view isn't settled yet; the data must be.

**Read first:**
- [../dictation-v3/owner-decisions.md](../dictation-v3/owner-decisions.md): dual write; V1 untouched; order kept; the list belongs to the chat widget.
- `../dictation-v3/chat-structure.md`, if `mastermind-dictation-v3` has written it. Message it before you start (`send_to_agent mastermind-dictation-v3`); you own the build, it owns the views.
- [../dictation-map/map.md](../dictation-map/map.md).
- The data-shapes decisions: `public/framework/core/Session/tasks/data-shapes/plan.md`. Fork F3 makes prompts and questions messages. Also the Item/List/Store backbone: `core/Item/`, `core/List/`, `core/Item/RecordWriter.js`, and `item.move_to`.

**Who writes the old lines today (verified):**
- `Servex/agents/Sessions.js:1025`, `say()`, writes each owner sentence as `{chat}` plus a Prompt.
- `Sessions.js:959`, `line()` (the smart seat's `session_line` tool), writes each smart reply as `{chat}`.
- The fast seat writes `{place}` through the item tool.

## Build, in a worktree

1. **One List on the Session for messages** (pick the name; `session.messages` or `session.chat.messages`). Each member is a real Item (a `Message`, or the existing Prompt/Question classes where they fit, per F3) with an id, `from`, `at`, the text, and links (`prompt`, `re`). It's saved through the normal Store delta path, so it replays exactly, and the item tool can `add` to it.
2. **Dual write:** `say()` and `line()` ALSO add to this list. V1's `{chat}`/`{place}` lines stay exactly as they are.
   - **Order:** a new owner sentence appends at the bottom (or grows the owner's open message), and a reply never splits a message in progress.
   - **`{place}` edits** may update a message's text in place, never its position.
3. **A replay test:** write a mixed session, replay it, and check the same list, in the same order, with no twins.
4. **V3, or one simple chat view, renders the list live** (`live()` / the Store "delta" event): new items appear without a reload, and each reply shows. Coordinate the view part with dictation-v3.
5. **Document it:** the shape, who writes it, and how a view reads it, in `core/Session`'s readme and its docs.

**Fences:**
- Don't break V1. Don't convert old sessions yet; write the migration as a script with a dry run, and don't run it.
- No `python -`.
- `node Server/review.mjs <this dir> <worktree>`, then merge with `node Server/merge.mjs` (the owner said to get it done). Restarts are fine.
- **Budget:** about $30.
- Report to vscode-mastermind when it merges.
