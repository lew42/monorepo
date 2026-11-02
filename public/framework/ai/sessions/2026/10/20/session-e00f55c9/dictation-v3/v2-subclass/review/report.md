verdict: fix
1. [fix] Two other places still draw V2 into a box with no `chat-v3` class, so ChatV3.css's column rule (`.chat-v3 {max-width:46rem; flex; gap}`, ChatV3.css:4, and its phone padding at :50) is missing there: the session page's Chat tab (`ai/AISession/AISessionDetail.js:294`, `div.c("flow chat-v2")`) and the drawer/✦ sheet (`ext/drawer/ChatView.js:68`, which adds `chat-v3` only when `mode === "v3"`). Only the demo `page.js` was changed to `"chat-v3 chat-v2"`. Either ChatV2 adds the class to `$box` itself, or both callers are changed (requirements "Everything else comes from ChatV3").
2. [fix] The task folder has no `task.jsonl`, in the main tree or in the worktree. There is no log, no past-work note, and no record of the skin-vs-subclass decision that the brief says goes in `task.jsonl`. A fresh agent can't pick this up from the folder alone.
3. [fix] Owner item 6 ("V2 shows no live Whisper text") was to be "confirmed in a shot". None of the shots shows the draft card, and none shows the ✓/🧠 marks either (`shots/chat-v2-400.png` and `127-…/1200.png` stop before the newest Prompt). The proof is only `live-guess.test.mjs`.
4. [fix] `ext/Chat/v2/report.js` still exists, but the rewritten `v2/readme.md` no longer mentions it (the old "Who writes the data" section was its only index). The same rewrite also dropped the Servex writer story (`Sessions.js` `say()`, `PromptLines.js`, the `session-smart.md` Chat v2 section, the "To fix" item about that section). A system readme must still say who writes the data (law 9).
5. [fix] `ext/Chat/v3/readme.md` is now out of date. It still says "step 2 will subclass this" and lists the hooks as `prompt()`, `reply()`, `marks()` only. The new `paragraph()`, `trailing_replies()` and `clamped_text()` hooks and `placement.js`'s `paragraph_groups()` are not indexed there, and the `placement.test.mjs` line names only `owning_prompt`/`paragraphs`.
6. [note] The brief asked for "every Reply in V2 is drawn beside the sentence holding its `re.to`". `ChatV2.test.mjs` checks this for the first Prompt and the live one, not for every Reply in the fixture.
7. [note] The one-line import change in `ux/Dictate/chat.js` falls outside the fence (`ux/Dictate/` is listed as not yours). It was forced by the move to `old/` and is the smallest possible change, but it should be named in the report to @mastermind-dictation-v3.
8. [note] The raw toggle is ChatV3's own ("show raw" appears only when `Prompt.clean` has entries). V2 adds nothing of its own here, and the readme logs the narrower behaviour under Decisions. Acceptable, but it differs from the brief's list of what V2 adds.
9. [note] At 1200 the first card's sentence grid leaves a tall empty cell under "Can you hear me?" while its two Replies fill the right column (`127-…/1200.png`, first card). The later sentences start only below the Replies.

Widths given: 400, 1200, 1920, 3440 (`shots/127-0-0-1-51708-framework-ext-Chat-v2/`), plus the task's own `chat-v2-400`, `chat-v2-1200` and `chat-v3-400`.

## Requirements
- 1 "ChatV2 becomes `class ChatV2 extends ChatV3`" — yes — diff ChatV2.js:138
- 2 "the ✓/🧠 marks" — yes in code (`marks()`, tested on the newest Prompt only) — no shot shows them (finding 3)
- 3 "the raw toggle" — partly — inherited from ChatV3, not added (finding 8)
- 4 "replies drawn beside their sentence" — yes — `127-…/1200.png`, cards 1–3: the 🧠 Replies sit to the right of their sentence; stacked at 400
- 5 "its own CSS" — yes — ChatV2.css cut to the marks and the beside layout
- 6 "Delete ChatV2Model.js (git mv to old/)" — yes — `v2/old/ChatV2Model.js`; V1's `chat.js` repointed
- 7 "Marks stay where they are this step" — yes — read off the Prompt TASK via the `{chat}`/`{sent}` tracker
- 8 "small overridable method in ChatV3, V3 output identical" — yes in the diff (`paragraph`, `trailing_replies`, `clamped_text`, `paragraph_groups`; the defaults reproduce the old join) — ChatV3 test runs not in the folder (finding 2)
- 9 "skin alternative, say why in task.jsonl" — no — no task.jsonl (finding 2); the decision is in views-on-messages.md step 4 only
- 10 "Owner item 6, confirm in a shot" — no — finding 3
- 11 "Read mastermind-chat-model's note, read defensively" — not shown — no record in the folder
- 12 "Fence" — no, one line — `ux/Dictate/chat.js` (finding 7)
- 13 "tests updated only where they read ChatV2Model" — no, and justified — ChatV2.test.mjs was rewritten, because the old fixture's shape is gone
- 14 "new check: every Reply beside its sentence" — partly (finding 6)
- 15 "shots at 400x860 and 1200, plus V3 at 400" — yes — `shots/chat-v2-400.png`, `chat-v2-1200.png`, `chat-v3-400.png`
- 16 "Docs: v2 readme, Chat readme V2 line, views-on-messages step 2 done" — yes, with gaps (findings 4, 5)
- 17 Class page with live instances — n/a, no new class (ChatV2 replaced in place)
## Page structure
- page 1 (title says what it is) — yes — `127-…/400.png`: "Chat v2", one line on what it draws
- page 2 (one takeaway) — yes — the intro says "drawn from the same fixture as Chat v3"
- remaining — n/a, the demo page's structure is unchanged
## Navigation
- navigation 1 — none added; the site sidebar and drawer only
- rest — n/a
## Layout
- layout 1 (one readable column) — yes — the chat column is held to 46rem at 1200/1920/3440 (sheet.png); `narrow_share` 0.926 at 1920
- layout 2 (two-up only where it fits) — yes — sentence + Reply side by side at 1200, stacked at 400
- layout 3 (other surfaces) — no — finding 1
## Sizing
- sizing 1 (no overflow) — yes — `overflow_x` false at every width
- sizing 2 (left stack) — yes — `left_stack` h1 16/38/54/90 at 400/1200/1920/3440, one layer each
## Wrapping
- wrapping 1 — yes — the only `wraps` are site chrome (drawer-rail buttons at 400, mode-btn and drawer-menu at 1200+), none from this diff; `tab_rows` 0
## Spacing and padding
- spacing 1 (bands sized right) — yes — at 400 the title is 0.04, the intro 0.076, then the chat band (1.458, ink 0.73)
- spacing 2 (no wasted gaps) — no, small — finding 9
- spacing 3 (empty share) — yes for a reading column — empty 0.579/0.629/0.737 at 1200/1920/3440 is the side margin of a 46rem column
## Colour and contrast
- colour 1 — yes — muted titles and "show raw" are the same tokens as V3 (`chat-v3-400.png` vs `chat-v2-400.png`); no new colours in ChatV2.css
## Flow
- flow 1 (reads top-down in the order said) — yes — `127-…/400.png`: sentence, its Reply, the next sentence, "show raw", the Question
## Words
- words 1 (plain, short intro) — yes — `127-…/400.png`, band 2: two sentences
- words 2 (readme says what it is first) — yes — the v2 readme heading and first line say what V2 adds on top of V3
- words 3 (docs current) — no — findings 4, 5
