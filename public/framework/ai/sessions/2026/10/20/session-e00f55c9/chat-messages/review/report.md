verdict: fix
1. [fix] The new page /framework/ext/Chat/list/ can't be reached from navigation: `ext/Chat/page.js` still declares `children: "panel drill v2 v3"`, with no `list` (navigation 1, CLAUDE.md law 10, "index everything").
2. [fix] `Servex/agents/ChatWriter.js` is not in Servex/readme.md's `agents/` row, which lists every sibling (WakePolicy.js, page_tools.js…). A fresh agent reading Servex's index won't find the writer of the chat list (law 9).
3. [fix] `Server/ChatToMessages.mjs`, the migration script that has been written but not run, is not in `Server/doc/scripts.md`, the table of every Server script. A later agent asked to "run the migration" has to find it by grep.
4. [fix] `Servex/doc/item-tool.md` is now out of date. A read of a session (`item({path})`) also answers `messages: {count, last}`, and `messages`/`sentences` are new session keys (page_tools.js SESSION_KEYS), but the doc says neither. Only core/Session/Chat/readme.md mentions it.
5. [fix] Ask 2's "`{place}` edits update a message's text in place" is not met. The `{place}` lines are not mirrored. The Chat readme says so and says why (the fast seat is off by default since 2026-11-01). The item-tool path `{messages:{<id>:{title,text}}}` is built and tested, so this is a gap only if the fast seat comes back. Record that choice in the owner's decisions, not only in the readme.
6. [fix] The chat list shrinks to fit its widest bubble instead of filling the text column (sizing). At 400, the bubbles run from x≈82 to 428 while the paragraph above runs from 28 to 478: about a quarter of a phone's width is lost. At 1200, the list is ≈440px wide and centred under a ≈700px paragraph. Its width will jump as longer messages arrive (shots/…Chat-list/400.png and 1200.png, band 3 `chatlist`). Give `.chatlist` `width: 100%` (it already has max-width 46rem).
7. [fix] The "system" label on a note is almost unreadable (colour). It is 60% of 65% currentColor at .75em × .85em, roughly 2.5:1 on the page grey (400.png, the "system" label above "The smart assistant could not be reached").
8. [note] Both shots logged a 404 (layout.json `errors`). Something the page loads is missing. Find what before merging.
9. [note] The intro paragraph is written for a coder, not for the owner (content): "Servex/agents/chat-messages.test.mjs", "?src=<url of any session.jsonl>". Lead with one plain sentence ("This is a session's chat, drawn from its message list; it updates live") and move the `?src=` tip into the readme. The "clean" in "smart assistant · clean" is not explained either.
10. [note] Class pages: Message, Prompt, Reply, Sentence and Chat are new classes. The demo shows live instances as bubbles but not their properties (id, `re.to`, `sentences`). A properties toggle on ChatList would satisfy "Show the class, and its live instances".
11. [note] Known gap, written down in the readme: a reply that is held back while Servex restarts is lost from the list (V1 still keeps it). This is acceptable for now.

Widths given: 400 and 1200 (one page, /framework/ext/Chat/list/). Tests run in the worktree: `Chat.test.mjs` 7 checks pass; `Servex/agents/chat-messages.test.mjs` 12 checks pass.

## Requirements
- 1 "One List on the Session for messages … real Items … saved through the normal Store delta path … item tool can add" — yes — `session.messages` (Chat extends List) of Prompt/Reply/Message, with id, by, at, text, `prompt`, `re`; it is written as `{messages:{add}}` deltas, and the test adds a message through the item tool (`run_item`) and passes
- 2 "Dual write: say() and line() ALSO add … V1's lines stay exactly as they are" — yes — Sessions.write() mirrors every `{chat}` line; the test checks that V1 still has 4 owner lines and 3 other lines, and that no new line has a `chat` key
- 2a "Order: append at the bottom … a reply never splits a message in progress" — yes — ChatWriter holds the reply while the owner is mid-thought; the test checks the order Prompt, Reply, Prompt, Reply, Prompt, Message
- 2b "`{place}` edits may update a message's text in place" — no — the `{place}` lines are not mirrored (the fast seat is off); editing in place works through the item tool (finding 5)
- 3 "A replay test … same list, same order, no twins" — yes — chat-messages.test.mjs replays the file twice and through a snapshot; ids and sentences are unique
- 4 "V3, or one simple chat view, renders the list live" — yes — ext/Chat/list/ChatList.js redraws on the Session's "delta" event; the readme reports a 29 ms append in the headless check; the shots show 7 bubbles. V3 still reads `tasks` (it is under "Next")
- 5 "Document it: the shape, who writes it, how a view reads it, in core/Session's readme and docs" — yes — core/Session/Chat/readme.md has all three; core/Session/readme.md links it; Servex, Server and the item-tool docs are not updated (findings 2–4)
- Fence "migration as a script with a dry run, don't run it" — yes — Server/ChatToMessages.mjs does a dry run by default and is not run
- Fence "Don't break V1" — yes — V1's lines are unchanged; SessionTimelineRows files the new lines as plumbing
- Class page: live instances and their properties — no — bubbles only (finding 10)
- Could a fresh agent continue from this task folder alone? — mostly — session.jsonl holds the decision, the build log, the worktree and the commit; the indexes it should reach through are missing (findings 1–4)

## Page structure
- page 1 (the title says what it is) — yes — 1200.png: "Chat list"
- page 2 (one takeaway) — yes — a session's chat as bubbles, in order
- page 3 (most important first) — yes — the intro, then the list

## Navigation
- techniques used — a sidebar (1200), a bottom rail (400)
- reachable from its parent — no — the page is not in ext/Chat's `children` (finding 1)
- sidebar — yes — the standard site sidebar, unchanged
- bottom rail — yes — 400.png, the standard rail

## Layout
- the content follows the page's standard layout — yes — layout.json `layout: standard` at both widths
- no horizontal overflow — yes — `overflow_x: false` at both widths
- tab rows — n/a

## Sizing
- the main block fills its column — no — the list shrinks to fit its bubbles (finding 6); band `chatlist` share 0.579 at 400 and 0.602 at 1200
- the text measure is readable — yes — widest text 568px at 1200 and 365px at 400
- the left edges line up (left_stack) — yes — h1 and p both at 16px (400) and 38px (1200); the list's own left edge does not line up (finding 6)

## Wrapping
- nothing wraps that shouldn't — yes — the only wraps are site chrome (drawer-rail buttons at 400, mode-btn at 1200), not this diff
- bubbles wrap their text cleanly — yes — `overflow-wrap: anywhere`; 400.png "The tab bar is broken. On my phone." wraps inside the bubble

## Spacing and padding
- the gap between bands is even — yes — title → p → list at about 30–40px (layout.json band y values)
- bubble padding is consistent — yes — .55rem/.8rem on every bubble
- no space is wasted — no — about 100px of a 400px phone is unused beside the list (finding 6)

## Colour and contrast
- text contrast is at least 4.5:1 — no — the "system" label is about 2.5:1 (finding 7); the bubble text and the "You" labels read fine
- the owner and the assistant can be told apart — yes — owner bubbles are filled and on the right, replies are outlined and on the left
- uses colour tokens, not raw colours — yes — color-mix on currentColor only

## Flow
- reads top to bottom in the order it happened — yes — the list order is the chat order, never sorted
- the live update keeps positions — yes — ChatList.draw refills a bubble in place and never moves it

## Words
- plain words for the owner — no — the intro names file paths and a `?src=` query (finding 9)
- labels say what they are — yes, mostly — "You", "smart assistant"; "clean" is not explained (finding 9)
- the readmes are clear and conclusive — yes — core/Session/Chat/readme.md opens with what and why, then the shape, what is on disk, who writes it, how a view reads it, and next
