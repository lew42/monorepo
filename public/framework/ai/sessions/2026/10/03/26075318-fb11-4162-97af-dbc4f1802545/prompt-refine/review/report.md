verdict: fix
1. [fix] The new "Your prompts" pinned row says only "You said..." dated Oct 1, though the owner's prompt that started this task came at 21:03 on Oct 2. Its one line tells the reader nothing and looks out of date (page 8; requirement 5). Evidence: shots/…-ai2/1200.png, rail, first row.
2. [fix] Each card on the "Your prompts" page is built with `sentences: null, structured: null` (`ai2/faces.js` `prompt_timeline_row`). So Condensed, Structured and Clean all show the same fallback text, and the four modes the owner asked for show nothing different from each other yet (requirement 5).
3. [fix] Dictate still runs its own clean step, and live Dictate plays no sound on a red flag. This diff doesn't touch `ux/Dictate`, so requirements 1 and 4 are only half met here. The brief gives that work to @task-mastermind-one-dictation, so it needs a link to that task before this one can count as landed.
4. [note] The litmus sample was chosen because it had "a real mid-sentence self-correction", but all three models came back with `strikes: 0`. So `detectStrikes()` missed the one correction it was tested on (requirement 2a). Source: Server/refine-litmus-result.json.
5. [note] The litmus pick is less solid than its verdict line makes it sound. Haiku cost $0.15 and took 123 s for 79 words. The two OpenRouter costs are rough estimates priced from Anthropic's table, as the doc itself warns. "Cheapest wins" therefore compares figures that weren't measured the same way (requirement 7).
6. [note] The review shots are of the `/framework/ai2/` index only. The new view, `/framework/ai2/your-prompts/`, wasn't shot, so the prompt card and its mode tabs have no visual proof.
7. [note] Switching a card's mode doesn't change the URL, so a reload drops back to Condensed (page 6). The comment in `prompt-card.js` still calls the engine `refine.js`, but the file is now `engine.js`.

Widths given: 400, 1200, 1920, 3440 of `/framework/ai2/` (one page).

## Requirements
- 1 "One refine process, two speeds" — partly — `ext/Refine/engine.js` `clean(text,{prev})` is shared and runs in both the browser and Node, but Dictate isn't switched to it in this diff
- 2 "Clean = near-verbatim, enforced by code" — yes — engine.js does a word-level diff check against the raw vocabulary and a glossary edit-distance check, and falls back to the raw sentence; strike detection missed the litmus sample's correction (note 4)
- 3 "Structure = every sentence placed" — yes — structure.js fails with `missing`/`duplicated` if any S1..Sn isn't used exactly once
- 4 "Flags … a red flag plays a short sound" — partly — `flags` and the `onFlag` callback exist and the card shows a red flag; no sound yet (Dictate side)
- 5 "The prompt card … Condensed → Structured → Clean → Raw … prompt and reply as one exchange" — no — the mode switch is built and shown with the reply folded under "my reply", but the ai2 timeline passes no sentences or structure, and the pinned row reads "You said..."
- 6 "Log the replies too" — yes — the `.claude/hooks/reply-relay.mjs` Stop hook writes the reply to the session's page (the final storage rule), and skips Servex-spawned sessions via `SERVEX_MCP`
- 7 "Litmus test for cheap models" — yes — 3 models run, all pass, haiku picked; the cost basis is uneven (note 5)
- 8 "Batch the past" — n/a — waits for its own go/no-go
## Page structure
- page 1 — yes — shots/…/1200.png: "AI 2" title, "AI INBOX" rail
- page 2 — n/a
- page 3 — yes — Live, then the open cards, in the rail
- page 4 — yes — open cards come first; 16 archived below
- page 5 — yes — `your-prompts` is routed in `ai2/page.js`
- page 6 — no — a card's mode tab has no URL (note 7)
- page 7 — yes — reuses the existing `inbox-row-pinned` row and the rail layout
- page 8 — no — "You said..." doesn't say which prompt it is (fix 1)
- page 9 — yes — the pinned row is one line; nothing repeats
- page 10 — yes — modes as tabs, not prose
- page 11 — yes — the rail sections are titled
- page 12 — yes — the ai/v/3 thread keeps working on the same `prompt_modes()`
## Navigation
- navigation 1 — tabs (Inbox/Log/Overview), a rail (the card list), a sidebar (site nav), a bottom rail at 400
- navigation 2 — yes — layout.json tab_rows 1 at every width
- navigation 3 — yes — the Inbox/Log/Overview tabs are routed
- navigation 4 — yes — 3 tabs
- navigation 5 — yes — at 3440 the rail sits beside the work area; at 400 it folds to "← all cards"
- navigation 6 — yes — the pinned rows redraw in `$pinned`, outside the sorted list
- navigation 7 — yes — 400.png: the bottom rail sits below the last row
- navigation 8 — n/a
- navigation 9 — n/a
- navigation 10 — yes — a card opens in the work column
## Layout
- layout 1 — yes — 3440.png: sidebar, rail, and a two-column Live view
- layout 2 — yes — Rail + content
- layout 3 — yes — the rail width holds at every width; 400 shows a single column
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes — the Live columns are in the wide area at 1920 and 3440
- layout 7 — yes — no band has big_empty set; the largest is ai2-full, share 1.68 with ink 0.43 at 1200
- layout 8 — no — 3440.png: the right column ("Assistant: ask it…") is short beside "Working on" (existing, not this change)
- layout 9 — yes — empty 0.575 at 3440 is gutter, and the measure holds (widest 599)
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — pinned rows stack flush in the rail
## Sizing
- sizing 13 — yes — the rows are auto height
- sizing 14 — yes
- sizing 15 — yes — the rail and work area scroll
- sizing 16 — yes — rail and main scroll by design
- sizing 17 — yes — no band above the tabs
- sizing 18 — yes — overflow_x false at every width
- sizing 19 — yes — `prompt-card.css` uses em
## Wrapping
- wrapping 20 — yes — the tabs and the pinned row are each one line; the wraps listed are icon buttons (drawer-rail 3.2 lines at 400, mode-btn 1.7), as before
- wrapping 21 — yes — mode-btn is 1.7–1.8 at 1200, 1920 and 3440 alike
- wrapping 22 — yes — the "Needs you / score" control row wraps cleanly at 1200
- wrapping 23 — yes — 400.png: one column
- wrapping 24 — n/a
## Spacing and padding
- spacing 33 — yes — layout.json left_stack h1 14px at 400
- spacing 34 — yes — one layer (doc-well)
- spacing 35 — yes
- spacing 36 — yes — 1200.png: the pinned row's text is inset
- spacing 37 — yes — no new spacing constants in Card.css or prompt-card.css
- spacing 38 — yes — the mode tabs use em
- spacing 39 — yes — the pinned row has its own ground
- spacing 40 — n/a
- spacing 41 — yes — the new CSS is inside a layer
- spacing 42 — yes — reuses `inbox-row-pinned`; the new classes are added to css-scopes.txt
## Colour and contrast
- colour 1 — yes — 1200.png: dark text on a light ground
- colour 2 — yes — the accent (orange) "working" labels are short UI text, existing
- colour 3 — yes — the flag uses a token
- colour 4 — yes — the pinned row is set off from the list
- colour 5 — not measured — no dark shot
- colour 6 — yes
- colour 7 — yes — the pinned row matches the Now row's look
- colour 8 — yes — the new labels use `.muted`
## Flow
- flow 25 — yes — the pinned row sits at the top of the rail
- flow 26 — yes — overflow_x false
- flow 27 — yes
- flow 28 — yes
- flow 29 — yes — the pinned rows redraw in place in `$pinned`
- flow 30 — yes — widest_text 365/453/486/599
- flow 31 — n/a
- flow 32 — yes
## Words
- words 1 — yes — each prompt is shown as a live card with modes, not described
- words 2 — yes
- words 3 — yes — the readme's "Your prompts" paragraph is about 120 words across two blocks; on the page itself, yes
- words 4 — no — "You said..." doesn't say what was said (fix 1)
- words 5 — yes — "Your prompts", "my reply"
- words 6 — n/a
- words 7 — no — the engine is called `refine()` in the brief, `engine.js` in the code, and `refine.js` in a prompt-card.js comment
- words 8 — yes — the readme links `/framework/ai2/your-prompts/` and ext/Refine
- words 9 — yes — the readme points at the live page
- words 10 — yes
- words 11 — yes
