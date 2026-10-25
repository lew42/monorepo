# Chat.js notes

Design reasons and history moved out of `Chat.js` comments. Each heading is pointed to from the code.

## chat-log

A scrolling column of message bubbles: yours on the right, everyone else's on the left, updates as one quiet line.

    const talk = chat({ source: () => entries, keep: e => true, answer: choice => send(choice) });
    talk.view;      // the scrolling box
    talk.sync();    // draw whatever is new since the last call

**Append, never rewrite.** A line is drawn once and never moves: `seen` is every entry already on screen, so `sync()` can be called as often as anything changes. `source()` is the entries to show, asked fresh each time; `keep(e)` says which belong here. `answer(choice)` is called when a button on a question is clicked; how the answer is sent is the caller's business.

**Smart scroll:** at the bottom, the box stays locked to the bottom as lines arrive; scroll up and it freezes; scroll back down and it locks again.

## one-bubble-per-run

(the owner, 2026-09-25.) A message from the SAME sender as the bubble at the end of the box, with nobody else in between and less than `MERGE_GAP_MS` since that bubble's last message, adds a paragraph to it instead of opening a new bubble. A longer gap opens a new one, even for the same sender. Drawing only: the card's log keeps every message separate, nothing is rewritten. The sender and time of the last message are stamped on the bubble (`data-sender`, `data-at`), so a re-drawn log merges the same way; an update, a question or a headed reply carries no sender and so ends the run. `mergeable()` is the whole rule, in one place.

## refined-bubbles

(the owner, 2026-09-25.) A merged bubble keeps its raw pieces (`{ id, text, at }`) in `bubbles`. A `{ type: "refined", of: [ids], sections: [{ text, from: [ids] }] }` line, drawn by `refine()`, replaces the raw paragraphs of the bubble holding those ids with its sections (markdown). A section with a `from` opens in place, on click, to the raw pieces it cites; a click on the bubble opens all of its raw pieces, in time order. With no refined line the raw paragraphs show. `fill()` is the one place a bubble is drawn from its state.

## via-mark

(the owner, 2026-09-30: the mark stays, "small and trailing".) A small, faint 🎤 (said) or ⌨ (typed) trailing each message's last word, for a universal chat line that carries `via`. Glued after the last word like the ✓/? mark, so it never takes a row of its own (a no-break space in front keeps it from wrapping alone).

## failed-send

"— not sent", muted, glued after the piece's last word the same way a ✓/? mark is. `ux/Dictate/Widget.js`'s `Thread` used to write this straight onto the DOM node it had just drawn; review finding 1 showed why that broke: a later merge's `fill()` redraws every piece from its stored state and wipes anything bolted on afterward. So it is stored on the piece, like `mark` and `via`.

## place-card

`place: {module, id, ...}` swaps a piece's text for that `ux/Content` module's own card, the same contract `page.jsonl`'s "place" lines use: `new Module({ id, ...rest })`. `capture: false` stops it self-attaching to the page's own captor: the import resolves later, asynchronously, so that captor is long gone (the `code` skill's "no DOM after an await"); the card is appended to the bubble explicitly once built. A module that fails to load says so in the card's place. `on_chosen` (the ✓/? loop-back) is ours, never the module's constructor prop. The module's own `write()` is its one seam for "an option got picked" (`ux/Content/ContentModule`), so wrapping it, rather than adding a second prop, follows the "reuse, never rebuild" rule the rename/marks features already follow.

## revision-pair

(the owner, 2026-09-29: "the revised text right under its raw line, raw greyed".) The raw words stay, muted, above the tidied-up version. A click toggles `.showraw`: the revised line hides and the raw one loses its muting ("back to raw"); a second click returns to the pair. `pc.revision` is `{text, level}`, set by `chat_line()` when a revision line's `re` matches this piece's `at`.

## check-mark

A ✓/? mark (`ux/Understand`'s shape, `{mark: "ok"|"unclear", purpose}`) is glued after the sentence's own last word, not on a line of its own (the owner: "a green check mark after it"). A non-breaking space is `ux/Understand`'s trick (`Understand.js`'s `row()`): the mark wraps like a word instead of dropping onto its own line. `md_into` renders `pc.text` as one or more block elements, so appending to `node` would land after the block, on its own line; landing it inside the last block's last child keeps it on the sentence's line. The via mark sits there too (see `via-mark`).

`resolve_mark(at, mark)` is the loop-back: a clarification card's answer (`place_card()`'s wrapped `write()`) calls it with the original line's `at` and a new mark, flipping that sentence's ? to a ✓ in place, as choosing an answer does in `ux/Understand`'s demo. False when the piece is no longer on screen.

## reactions

(the owner, 2026-09-30: "long hold on a message and thumbs up or a green check mark... just kind of like an acknowledged".) An SMS tap-back. A reaction is its own log line, never an edit of the message:

    {"react": {"at": "…", "re": "<the message's at or id>", "emoji": "👍", "from": {"kind": "owner"}}}

One per person per message: the newest line from a sender for a message wins, and an empty `emoji` takes that sender's reaction off. `reacts_of` holds, per bubble, message id -> sender -> `{emoji, at}`; `draw_reacts()` pins the result on the bubble's top corner.

## reacting

Three ways to open the row of reactions on a bubble: hold it (a phone, about half a second), right-click it (a desktop; an Android long-press fires the same event), or the small smiley button shown on hover. Tapping an emoji pins it on the bubble's corner; the same emoji again takes it off. `on_react({re, emoji, at})` is how the caller saves it (a line in the session log); it is drawn here at once.

## speak

`onmount(el)` fires once, only for a brand-new bubble; `chat()`'s selection wiring hangs off it. `via`/`mark`/`failed` are stored on the piece, like `chat()`'s `put_line()` does for universal chat lines (review findings 1 and 6, one-dictation): a caller that bolted these onto the DOM node it got back, instead of handing them to `speak()`, lost them the next time a merge's `fill()` redrew the bubble from its stored pieces. `patch_piece()` updates one of these after it was drawn, e.g. a mark that only answers once the bubble is on screen.

`join: false` (one-dictation, item 2, a chat-mode preset's opt-out): never merge onto the last bubble, even from the same sender within `MERGE_GAP_MS`; every send is its own bubble. Default `true` is every earlier caller, unchanged.

## bare-speak-helpers

For a caller using the bare `speak()` primitive instead of the full `chat()` factory (`ux/Dictate/Widget.js`'s `Thread`), the same things `chat()`'s `mark_owner_piece()`/`resolve_mark()` do internally.

- `patch_piece(bubble, id, patch)`: change a piece's `mark`/`via`/`failed` (or any field `piece_body()` reads) and swap only that piece's node in place; the whole bubble is redrawn only when it is refined or the node is missing. `id` is the piece's own id (`speak()`'s `id`, usually its `at`). False when no piece has that id.
- `retag_piece(bubble, old_id, new_id)`: rekey a piece's id with no redraw (the id is never shown). `Thread.retag()`: a bubble drawn under a local echo's `at` before the real server answered with a different final one; without this, `patch_piece()` under the new `at` finds nothing. Only the id changes, never the piece's `at`: the new id is Servex's clock, the piece was ordered by the phone's, and mixing the two put a later sentence first (#bubble-order).
- `split_bubble($box, bubble, at_id)` (the `para` marker, one-dictation): the piece named `at_id` and every piece merged after it move into a brand-new bubble placed right after the original, same sender and look, built the way `speak()` would and registered in this module's piece-tracking, so a later merge, mark or `retag()` on either half still works. Exported (rather than letting a caller reach into private state) for `Thread`. Null when `at_id` is not on this bubble or is its first piece.

## dedupe-key

A universal chat line has no `type`/`id` to key on: every one would collide on the same key, and a `fix` line (which must still be drawn, to replace the original) would be silently dropped as a duplicate. `at` plus whether the line is a `fix` is enough: two ordinary lines never legitimately share an `at`, and a fix always differs from its original by that flag. A fix's key also includes its text: latest wins, so a later fix with different words for the same `at` is not dropped as a duplicate of an earlier placeholder ("waiting for the page's assistant…" then the real reply, both `fix: true` on the same `at`; audio-review, 2026-09-29).

## bubble-tree

(drill in, `doc/drill.md`.) `{ key, title, text, place, children }`: a card is a tiny page. A bubble's key is its first piece's `at` (or id), the same key a `fix` line uses, so it survives a reload. Its children: a refined bubble's sections (each with the raw pieces it cites as its children, one level deeper), else its pieces. A leaf has none.

## sticky-scroll

One scroll behaviour for every scrolling chat log on the site: `chat()`'s log and `ux/Dictate/Widget.js`'s `Thread` (the Dictate page and the ✦ sheet build their chat through that class, not `chat()`, since it owns a lighter box with no selection/reaction/drill wiring). `Thread` used to hand-roll its own broken copy; CLAUDE.md law 6 says fix it once, here. `box` is the element that actually scrolls (`overflow-y: auto`); a jump-to-bottom button is appended into it, so `box`'s CSS also needs `position: relative` for the button to anchor to it.

`locked` starts true: the reader is at the bottom, so every new line follows (the owner: sticks to the bottom, follows every new message, unless scrolled up, in which case it stays put and a small button appears; clicking it jumps down and resumes following). Scrolling up turns it false and shows the button; reaching the bottom again (by hand or the button) turns it on.

`pin()`, called once after drawing new lines, jumps to the bottom only while locked. A `ResizeObserver` on `box` also calls it, so a composer growing under the log, or the box's first layout (0px tall until the page is on screen), re-pins with no scroll event. See `doc/scroll.md` for why only a move up unlocks (reading "am I at the bottom?" on every event lost the lock on first load, because our own jump-to-bottom's scroll event arrives a frame later, after the box is already taller). The button is moved to the very end of `box` every jump, never left as its first child, so `.chatbox-log > :first-child`'s push-to-the-bottom margin (Chat.css) still lands on the real first message.

## pin-per-batch

One pin per batch, not one per line: `scroll.pin()` forces a layout, and the Live card (hundreds of lines) paid that once per line, 5.7 s. The microtask runs after the synchronous batch; the second try (`requestAnimationFrame`) is for a box not on the page yet (its height is 0 until then).

## live-bubbles

(dictation-stream, 2026-09-30.) Not lines of the log: your words while you are still speaking (`live()`) and an assistant's reply while it is still being written (`stream()`). They always sit at the very end, so every real line is drawn with them lifted out and put back after it; `mergeable()` then never sees one as "the last bubble". A real line from the same speaker removes its live bubble (`chat_line()`).

`live({text, settled, guess, sent})`: one bubble on your side that grows; `settled` in ink, the still-moving `guess` grey. Empty text removes it, unless `sent`: then it stays, faded, marked "cleaning…", until your real (cleaned) line is drawn in its place; after ~2 s with nothing back the mark flips to "sent, waiting" and the raw text stays (the owner, 2026-10-04: instant feedback, never a silent minute-long wait).

## selection

(the owner: "when you click on a specific card, first it kind of selects that card".) One bubble at a time in this log; a second tap on the same bubble, or Esc, clears it. Added on top of whatever a bubble's own click already does (opening a refined bubble, a place card's clicks), never instead of it: two listeners on the same element both fire even when one calls `stopPropagation()` (that only blocks bubbling to an ancestor). Requirements: "a tap selects AND opens what's inside".

## threads

(the owner, 2026-09-30: "a reply is attached to its parent bubble, shown as a thread under it, collapsed to N replies, not appended at the bottom out of context".) A selected bubble grows a Reply button; pressing it hands `on_reply({re, title})` to the caller, whose next message carries `re` = that bubble's key and `thread: true`. Such a line is drawn in a small thread right under its parent (`thread_item()`), never at the bottom. A reply to a message already in a thread joins the same thread: threads are one level deep. `thread: true` is the marker: an ordinary assistant reply also carries `re` (the line it answers) and stays in the main flow.

Threaded replies (card-threaded-replies, 2026-10-01): `reply()` tries `thread_item()` first, the same one a `{chat:{thread,re}}` voice-session line uses. If the parent isn't on screen (opened mid-conversation), it falls through to the plain flow rather than vanish, as `chat_line()` does.

## refine

(asks #7, 2026-10-12.) A selected bubble of yours grows a "Refine ✦" button. It hands `on_refine({ text, at, button })` the bubble's words (every piece, in order) and the time of its first piece; the caller runs the refine pipeline on them (`AISessionConversation.refine`: POST /api/refine, and the stages draw above the chat). No `on_refine`, no button.

## drill-in

(`doc/drill.md`, 2026-09-30.) A selected bubble that has contents grows an "Open" button; pressing it hands `on_open` the bubble's tree (`card_of()`) and the caller (`ChatPanel` -> `Drill.js`) takes it full screen. No `on_open`, no button.

## rename

`ux/Rename`'s ask, reused, never rebuilt here: `rename.options(text)` is `rename_options` from `ux/Rename/Rename.js`, handed in by the caller (`ChatPanel`) so this file never imports `ux/`. Choosing a name calls `rename.on_renamed({el, piece}, name)`; the caller delivers the new title the normal way (a `fix` line, same `at`, so latest wins everywhere the log is read), and `chat_line()`'s fix handling redraws the title from it.

## understand-marks

`ux/Understand`'s `marks()`, reused, never rebuilt here: after each of your own lines, asked once, in the background ("the smart assistant, no hurry"; requirements.md). `fetch_marks` is `marks` from `ux/Understand/Understand.js`, handed in by `ChatPanel` the way `rename` is, so this file never imports `ux/`. The mark is stored on the piece (`piece.mark`) and drawn by `piece_node()`, so a later `fill()` keeps showing it without asking again. An unclear sentence also calls `on_unclear(chat_line, mark)` once, so the caller can drop a clarification card into the flow.

## questions

`{type: "ask", text, choices: ["Yes", "No"]}` (or a `prompt` line that carries `choices`). A click calls `answer(choice)`; the buttons then show which was picked. Your later message matching a choice also settles it, so a reload shows it answered. A reply's heading (the owner, 2026-09-24): a `heading` field, or a first line written `# Heading`, shows as a short bold title above the body.

## universal-chat-line

(voice-sessions/design.md, 2026-09-29.) `{"chat": {at, session, path, from: {kind, id}, via, text, re}}`, the one shape every surface (voice, typed, an agent's reply) logs a turn as. Mapped onto this file's bubbles rather than the old `{type, by, text}` dispatch, so that shape (what AI 2 and the drawer still log) is untouched: `from.kind === "owner"` is your bubble (right); anything else is a reply (left), labelled by `from.id` (`who_label()` reads ids like `assistant-fast`) or, missing that, `from.kind`.

A fix (`fix: true`) is a later line with the same `at` as an earlier one, "here is what was actually meant", and replaces that piece's words in place instead of adding a bubble; `fix_index` remembers which bubble and piece each `at` landed in, per `chat()` instance. With no original found (a page opened mid-conversation, or logs out of order) the correction is still the newest truth, so it shows as its own line.

## revision-lines

(`ext/Chat/readme.md`'s "revision line".) `c.re` names the raw line's `at` this tidies up, `c.level` says how much; never a `fix` (a correction to what was said) and never its own bubble. Keyed on the line's shape alone (`re` + `level`, no `fix`), not on who wrote it, so `ChatPanel`'s `handle_revision()` and a later voice-sessions assistant writing the same shape both land here unchanged. If the raw line isn't on screen it is shown as a plain reply, rather than a revision nobody can see.

## bubble-order

A bubble drawn late (a reply that beat its sentence) is moved before the first bubble with a later `data-at`, so the log reads in session-file order. `place()` does it; proof and before/after run: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/`.

Order only works when every `at` it compares comes from one clock. A piece the owner said is drawn with the phone's stamp (`ComposerMic.stamp`), and Servex answers with its own; `retag_piece` therefore changes the id only. Before it did, a phone behind the PC showed "now?" above "Can you hear me?" (2026-10-25; proof `ux/Dictate/test/order.mjs`; cause `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/report.md`). One clock now: `Session.say` keeps `clock.offset` (Servex's `at` minus the request's midpoint, updated each answer) and `ComposerMic.stamp()` adds it, so a new owner bubble sits on Servex's clock beside the replies. `ux/Dictate/chat.js` also sends `said_at` (the stamp); Servex `Sessions.say` writes it on the chat line, and `chat_line` orders by `said_at ?? at` (ids stay `at`), so a reload keeps the order the owner spoke in. Lines without `said_at` (older, or Servex not yet restarted) order by `at` as before. Proof, all three cases including a reply between: `ux/Dictate/test/order.mjs`.
