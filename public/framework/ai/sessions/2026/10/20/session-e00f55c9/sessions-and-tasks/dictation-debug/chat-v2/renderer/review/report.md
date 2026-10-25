verdict: fix
1. [fix] The index of `ext/Chat/` does not record `v2/` in the commit (Law 10, index everything). The worktree has `ext/Chat/files.jsonl` with `{"file":"v2/"}` and `{"file":"v2/page.js"}` modified but not committed (`git status` on worktree/chat-v2), so a merge of 5e3ff2a46 lands the folder unindexed. Commit that file, and the fixture's files.jsonl with it.
2. [note] `fixture/files.jsonl` holds 10 `live-copy.jsonl` add/gone lines left over from test runs. Each run of `ChatV2.test.mjs` adds two more, because it writes its temp copy inside the served folder. The noise is harmless; to avoid it, write the copy to a folder the index skips, or squash the lines.
3. [note] The brief asked for "a child Question answered and one open", but the fixture's second child question (`q-1761382836000`) is answered by a later line. Under the first prompt both questions draw ANSWERED (shots/…/1920.png, nest band), and the only open question is the root one under the second prompt. That covers the open phase, but not as a child in `tasks`.
4. [note] At 400 the child-card head wraps: the QUESTION label, then 2–3 lines of text in a narrow column, then ANSWERED on its own line (shots/…/400.png, lower band). The text column is about 160px wide beside the label and icon. Putting the kind label and phase on their own line above the text at phone width would read better.
5. [note] Not every field read goes through the Model. `ChatV2.child` reads `n.title ?? n.text ?? n.id` directly, so a field rename would mean two edits, against the brief's "one small method per field".
6. [note] Chat v2 is not in `ext/Chat/page.js` `children: "panel drill"`, so it is reachable by URL and by the readme link only, not from the page tree. The fence allowed only the readme line, so the parent should add `v2` when it merges.

Widths given: 400, 1200, 1920, 3440 (a new page; one layout.json), plus the minion's own chat-v2-390.png and chat-v2-1920.png.

## Requirements
- 1 "Decision: the conversation is the session's `tasks` list" — yes — `ChatV2Model.apply` folds `{tasks:{add}}` and `{"<id>":…}` lines from session.jsonl
- 2 "No left/right bubbles; the transcription sits at the root, not in a card" — yes — shots/…/1920.png: prompt title and text sit flush in the column, no bubble or card
- 3 "Replies and cards nest under the prompt, marked with the brain icon" — yes — 1920.png: 🧠 on every reply and child, inside a left-ruled nest
- 4 "Main view shows the refined prompt and its outcome" — yes — 1920.png: refined title and text, then tasks with state (COMPLETE, RUNNING)
- 5 "Raw Whisper and cleaned text one click down, show raw, never dropped" — yes — `show raw` toggle; the test checks that the raw text appears; the Model keeps `raw[]` (the reason given for not using Session.replay)
- 6 "A reply can point at one sentence or a word range" — yes — 1920.png: "The raw words" highlighted in the quote; beside the sentence when raw is open (test check)
- 7 "Draw in list order, never sorted" — yes — `roots()` filters `this.root` in append order; test "two prompts, in file order"
- 8 "Sentences and phase computed in one small helper each" — yes — `ChatV2Model.sentences`, `ChatV2Model.phase`
- 9 "Children = own tasks plus root Question/Task whose `from` matches" — yes — `children()`; test: the root question sits under the second prompt
- 10 "Fixture with the listed cases" — yes, one weak case — see note 3
- 11 "page.js: fixture by default, ?src= live, first line plain words" — yes — 400.png top: "This is a demo of Chat v2: …"
- 12 "Test: order, nesting, show raw, live append" — yes — 19 checks; the task log reports 19/19 pass (not re-run here: the run writes into the worktree)
- 13 "Shots at 390 and 1920 in the task dir" — yes — renderer/shots/chat-v2-390.png, chat-v2-1920.png
- 14 "readme: what, shape, who writes, which class reads; one link line in ext/Chat/readme.md" — yes — both present; the replay deviation and the TaskView choice are recorded under Decisions
- 15 "CSS in @layer, `chat-v2-` prefix, sensible max width" — yes — `@layer site`, max-width 46rem
- 16 "Fence: only ext/Chat/v2/ and one readme line" — yes — the diff touches nothing else
- class: can you open a page that shows its live instances? — no — ChatV2 holds only a draw state (`raw_open`); note-level, the demo page is its live instance
- index: is everything new indexed? — no — see fix 1; could a fresh agent continue from the task folder? — yes — requirements.md, session.jsonl log with commit 5e3ff2a46, shots, and the parent's step list

## Page structure
- page 1 says what it is — yes — 400.png: title "Chat v2" plus one plain sentence
- one takeaway — yes — the chat itself fills the page
- content order — yes — intro, then prompts in file order

## Navigation
- identify — none on the page itself (site sidebar and drawer only)
- page in the tree — no — not in the parent `children` (note 6)

## Layout
- one column with a measure — yes — 1920.png: chat column about 620px (widest_text 609)
- empty share — fine — empty 0.625 at 1920 and 0.748 at 3440; the space goes to the site rail and AI drawer, not to the chat
- overflow — no overflow at any width — overflow_x false ×4

## Sizing
- text measure readable — yes — widest_text 366 / 568 / 609 / 685
- grows at 3440 — partly — widest_text only rises to 685; acceptable for a reading column

## Wrapping
- unwanted wraps — one — layout.json reports `chat-v2-toggle` at 1.6 lines at 400; on the shot it is one line (its 44px min-height counts as a wrap, a measurement artefact). The child head wraps at 400 (note 4)
- tab rows — n/a

## Spacing and padding
- left edge — yes — left_stack p 16 / 38 / 54 / 90px, one layer (page)
- rhythm between prompts — yes — gap 2× --gap between prompts; the nest is ruled and indented 1.2em
- band sizes — yes — title 4–6%, intro 8–10%, chat band takes the rest

## Colour and contrast
- text contrast — yes — body text dark on light grey; the subtle text (kind, phase, answers) reads on the shot
- highlight — yes — the yellow mark keeps its text colour (1920.png)
- state colour — yes — complete is green, running is a neutral icon, open is amber via `--task-amber`

## Flow
- reads top-down — yes — prompt, its outcome, then the next prompt
- live — yes — test: appended prompt and reply appear without a reload, and an open "show raw" stays open

## Words
- page sentence plain — yes — "This is a demo of Chat v2: a made-up session's conversation…"
- readme clear to a newcomer — yes — what, try it, shape, who writes, decisions
- labels — yes — "show raw" / "hide raw", "What was said (raw)", "Cleaned into paragraphs"
