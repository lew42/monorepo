verdict: fix
1. [fix] At 3440 the `bleed` demo stretches the composer's text box about 1800 px wide, with Send alone at the far right edge, a long way from the mic (layout 3, 9; spacing 40). The bleed should paint the ground only; the box and its controls should stay at a readable width — shots/…Refine/3440.png, toolbar band.
2. [fix] Every page shot shows the empty state, so none of them shows asks 1 and 3: sentences adding up in the Cleaned list, and a sentence leaving the box while the next is heard. The only evidence is the builder's own `test/composer-flow.mjs` run. Add one shot with two or more sent sentences (Requirements 1, 3).
3. [note] The "1 · Said" stage shows nothing under its title at 400 and 3440, although the diff adds "Nothing said yet." for an empty `raw` (Prompt.js). Either the empty case takes another path or the text is hidden — shots/…Refine/400.png, stage band.
4. [note] "Watch live ↗" draws as a bare underlined arrow beside the Model picker, with no words. It is not self-evident (page 8) — shots/…Refine/400.png and 3440.png, toolbar row.
5. [note] dictate-page-400-fake-mic.png: the sentence was sent as a bubble, but the box below still holds "And so, my fellow Americans, ask not what … ask what you can". This is most likely the fake mic replaying its looping wav. Still, it is the same "sent sentence repeated" symptom that RefineDemo.transcript() fixed only on the Refine page, so it should be checked before ask 4 is called done.
6. [note] `padding-inline: clamp(.4em, 1vw, .9em)` is a new constant clamp, not the spacing tokens (`--pad`/`--gap`) (spacing 37) — Prompt.css.
7. [note] The page h1 still sits above the toolbar, and the stage titles are still numbered. The redesign doc says so honestly (step 3 not built).

Widths given: 400, 1200, 1920, 3440 for /framework/ext/Refine/, plus one 400 shot of the Dictate page with the fake mic.

## Requirements
- 1 "Cleaned sentences go INTO the existing structure, not a wall of text" — yes in code — RefineSystem.chunks + compose() renumber each send after the earlier ones; the shots don't show it (finding 2)
- 2 "Real-time, incremental refinement … step by step as the owner speaks" — partial — instant clean per word, live outline per batch; a one-sentence utterance waits about 8 s (redesign.md, inbox status partial)
- 3 "Send each finished sentence off … while the next one is still being transcribed" — yes in code — composer `per_sentence` → `sentences_per_send: 1` (Composer.js, Mic.js); proven only by the builder's test, not a shot
- 4 "Fix the broken web voice dictation page, as part of the Refine/chat system" — mostly — dictate-page-400-fake-mic.png shows dictation reaching a bubble; the fix went into the shared composer, not a standalone patch; see finding 5
- Inbox notes marked by appended lines, nothing deleted — yes — diff of both inbox.jsonl files

## Page structure
- page 1 — no — the title is just "Refine", with no line saying what the page does (400.png, top band)
- page 2 — n/a
- page 3 — yes — input first, then the stages, then instances and the class card
- page 4 — n/a
- page 5 — yes — an existing page
- page 6 — n/a
- page 7 — yes — the `bleed` layout word replaces `wide`
- page 8 — no — the bare ↗ link (finding 4)
- page 9 — yes — the old "1 · Said: speak, or type…" label row was removed
- page 10 — yes — stages shown as structure
- page 11 — yes — every stage has a title
- page 12 — yes — the saved-run ladder stays linked below the demo

## Navigation
- nav 1 — a sidebar (the site rail); on the Dictate page, tabs
- nav 2 — n/a on Refine (tab_rows 0); the Dictate tabs run off the screen at 400 ("PLAYGR…"), not new in this change
- nav 5 — yes — the rail sits beside the main column at 3440 and folds into a drawer at 400
- nav 6 — yes — the drawer is unchanged
- others — n/a

## Layout
- layout 1 — yes — at 3440 the stages run in 4 columns, and the instances in 3
- layout 2 — yes — Standard
- layout 3 — no — the composer box is about 1800 px wide at 3440 (finding 1)
- layout 4 — yes — the toolbar and footer keep their own padding inside the bleed
- layout 5 — yes — the text never touches an edge
- layout 6 — yes — the multi-column part sits in `bleed`
- layout 7 — yes — demo band share 2.17 / ink 0.59 at 400, 1.35 / 0.32 at 3440; big_empty false everywhere
- layout 8 — no — note: at 3440 the four stage columns are mostly empty in the empty state; they fill once words arrive
- layout 9 — no — the reading box was widened to fill the dead space (finding 1)
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes

## Sizing
- 13 — yes — auto heights
- 14 — n/a
- 15 — yes — `.refine-foot` max-block-size 30vh, overflow auto
- 16 — yes — only the foot log scrolls
- 17 — yes — the h1 band share is 0.04–0.06
- 18 — yes — overflow_x false at every width
- 19 — yes — em

## Wrapping
- 20 — yes — tab_rows 0; the listed wraps (chatbox-compose-more 2.4, drawer-rail 3.2, mode-btn 1.7) are icon buttons whose line-height ratio exceeds 1, not real wraps, and none was changed here
- 21 — yes — the same wraps appear at every width
- 22 — yes — `.refine-prompt-h` is flex-wrap by design
- 23 — yes — 400.png: the stages stack in one column
- 24 — n/a

## Spacing and padding
- 33 — yes — left_stack h1 28 px, p 36 px at 400
- 34 — yes — two layers (page 28, refine-result 8)
- 35 — yes — `bleed` plus inner padding
- 36 — yes
- 37 — no — a constant clamp, not the spacing tokens (finding 6)
- 38 — yes — controls are unchanged
- 39 — yes — the toolbar ground differs from the stage ground
- 40 — yes — `.refine-demo > :not(...)` gets padding-inline
- 41 — yes — both new blocks are in `@layer site`
- 42 — yes — small

## Colour and contrast
- colour 1 — yes — dark ink on light grey; the muted "Waiting for words." is legible
- colour 2 — yes — the orange Send button carries dark text
- colour 3 — yes — no literal colours in the diff
- colour 4 — yes — the toolbar band differs from the page ground
- colour 5 — not measured — no dark shot
- colour 6 — yes
- colour 7 — yes — the orange underline on class keys
- colour 8 — yes — opacity, not `var(--muted)`

## Flow
- 25 — yes — input first
- 26 — yes — overflow_x false
- 27 — yes
- 28 — yes — each stage title sits close to its own text
- 29 — n/a — not observable in an empty shot
- 30 — yes — widest_text 570 px at 3440
- 31 — n/a
- 32 — yes

## Words
- words 1 — yes — the live instances and the class card are shown
- words 2 — yes
- words 3 — yes — the new readme line runs about 60 words, borderline
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — yes
- words 8 — no — note: the new readme/doc lines name `test/composer-flow.mjs` as code, not as a link
- words 9 — yes — the readme sits beside a live page
- words 10 — yes
- words 11 — yes — the inbox "how" lines are full sentences
