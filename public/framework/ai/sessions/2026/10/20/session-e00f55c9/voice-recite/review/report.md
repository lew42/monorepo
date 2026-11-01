verdict: fix
1. [fix] At 400 px the Recite control line squeezes its label and progress line to about 40 px, so the label reads only "not…" (Sizing, Wrapping) — shots/127-0-0-1-60498-framework-audio-Recite/400.png, the demo's bottom band. This is the phone, the width the owner will use on the walk. In the phone sheet the mic sits beside the bar, so the space is smaller still. Fix: hide the threshold slider and voice picker behind the ear button on narrow screens, or let the track take a second row.
2. [fix] No shot shows the bar in the phone chat sheet (✦), and that is the owner's first ask ("a reply is read aloud in one chat view on the phone"). review.mjs shot only the three audio pages. The task log claims headless proofs, but none is filed in the task folder. Add one 400 px shot of the sheet with the bar above the mic.
3. [fix] The hand-off is missing. Requirements step 3 asks for the merge command and what to try on the walk, and Done #1 is "the owner can test it on the walk". Neither is in the task folder yet (no handoff file, and the last task.jsonl line is the shots line).
4. [fix] plan.md §6 still says "Filled in from the class map (below) once it is read", and the section is empty. The answer exists (task.jsonl decision "the live wire"; dictation-notes.md), but a fresh agent who reads plan.md meets a stale placeholder. Fill §6 with that one line and a link, or replace it with one.
5. [fix] Servex/readme.md, the `ext/` row (line 47), lists `remote/ openrouter/ refine/ local/` but not the new `recite/`. Law 10: index what you create.
6. [fix] Server/readme.md names `plugins/Whisper.js` but not the new `plugins/Recite.js` or its `/recite/*` routes. Server/doc/mobile-lan.md lists `/whisper/*` as a LAN-allowed route, but not `/recite/*`, which has the same guard.
7. [note] The voice agent coordination ask is not addressed. `Servex/ext/remote/doc/cloud-voice-agent.md` is untouched, and nothing says whether the Claude-app voice agent should hand off to Recite or ignore it. `/recite/*` uses the same `lan()` + `safe_host()` guard as `/whisper/*`, so it should work through the tunnel exactly where Whisper does. That is not proven.
8. [note] audio/Voice/doc/owner-2026-10-16-voice-conversation.md line 3 still calls Voice "browser `speechSynthesis` only". Voice.js and its readme dropped the `d-voice-engine` reference, and `audio/doc/decisions.md` has no voice entry at all, so the link in that note now points at nothing.
9. [note] At 1200 px, adding the Voice and Recite tabs pushes the audio tab strip past its width. The Voice page scrolls it so it begins "…ER TRANSCRIBER" (layout.json tabs_gap -276), and the overview cuts "DOCS" at the right edge (shots/127-0-0-1-60498-framework-audio/1200.png, top band). It is still one row (tab_rows 1).
10. [note] `audio/Recite/BargeIn.js` imports `ux/Dictate/Dictate.js` only to read `whisper_url`. That makes the audio building block depend on a ux surface. Passing the URL in, or reading it from `audio/Whisper`, keeps audio below ux.
11. [note] layout.json for /framework/audio/ records a 404 at both widths. It may predate this diff, but it was not traced.

Widths given: 400 and 1200 for each of the three pages (/framework/audio/, /framework/audio/Voice/, /framework/audio/Recite/).

## Requirements
- 1 "replies… read aloud, like the Claude app" — yes — ux/Dictate/chat.js passes every live-wire event to `Recite.shared.from_wire(ev)`; the smart seat is read as it streams (diff, chat.js)
- 2 "local model that fits beside Whisper in 12 GB; check Whisper's VRAM first" — yes — plan.md §1: Whisper 2 033 MiB; Kokoro runs on the CPU with 0 VRAM
- 3 "how voices work; several voices" — yes — plan.md §2; `Voice.PERSONAS` holds seven, and the 54 ids are at GET /recite/voices
- 4 "a `Voice` class per persona, a `Recite` class for playback, loading, reconnecting" — yes — audio/Voice/Voice.js extended (`persona`, `render`); audio/Recite/Recite.js has `check`, `offline` with 3/10/30 s retry, and a browser fallback
- 5 "pause/resume, play turns into pause" — yes — ReciteBar.draw switches the play_arrow/pause icon
- 6 "back 10 s; restart" — yes — `back(10)`, `restart()`; the replay_10 and skip_previous buttons
- 7 "one small, unobtrusive control line, not floating buttons" — partly — one inline line (Recite/1200.png), but at 400 it holds 8 controls and the label is crushed (finding 1)
- 8 "pauses when the owner talks, remembers its place" — yes — BargeIn.trigger → `pause("heard")`; `resume` keeps the audio position
- 9 "resume button, adjustable threshold, mic-mute to manual" — yes — play resumes, a range slider sets the threshold, the ear button runs `set_on(false)`
- 10 "can Whisper tell speech from noise?" — yes — plan.md §3: silero VAD returns "" for silence.wav; BargeIn.noise and the learned noise_floor
- 11 "fit into the chat and dictation classes properly" — yes — one line in chat.js on the shared wire, one in DictationBar.mount; architecture.md says why
- 12 "coordinate with the voice agent; works from the phone via the public URL" — partly — `/recite` proxy shares Whisper's guard; cloud-voice-agent.md untouched (finding 7)
- 13 "Done 1: the owner can test it on the walk" — no — no hand-off yet (finding 3)
- 14 "Done 2: a reply read aloud in one chat view on the phone, with pause/resume and barge-in" — not shown — built in the sheet; no shot of it (finding 2)
- 15 "plan.md with the choice and the alternative" — yes — plan.md §2 (Kokoro; Chatterbox the alternative), plus task.jsonl decisions
- 16 "supervised local server, like whisper-server" — yes — Servex/ext/recite/recite.js `Process.Recite`, detached, NO_RECITE; recite.test.mjs
- 17 "demo page; readme and class docs; review.mjs" — yes — /framework/audio/Recite/; Recite readme + doc/architecture.md; shots exist
- class page with live instances — yes — `track(Recite)` and `track(Voice)` register instances; the demo shows `Recite.shared` through its bar

## Page structure
- page 1 (title says what it is) — yes — Recite/1200.png: "Recite" under the audio tabs; description "Reads the AI's replies aloud…"
- page 2 (one takeaway, shown first) — yes — the demo comes first, then Use, then Watch out
- page 3 (detail nested, linked) — yes — Readme sits in md.details; decisions are in doc/architecture.md
- page 4 (indexed in its parent) — yes — audio/page.js `children` and TOOLS cards; the sidebar shows Voice and Recite (audio/1200.png)

## Navigation
- techniques — tabs (the audio module strip), a sidebar (1200), a bottom rail (400)
- tabs one row — yes — layout.json tab_rows 1 at both widths, on all three pages
- tabs fit without clipping — no — tabs_gap -307 (Recite 1200), -276 (Voice 1200); the strip scrolls (finding 9)
- current tab marked — yes — RECITE is underlined in Recite/1200.png
- sidebar shows the current page — yes — "Recite" is highlighted, Recite/1200.png
- bottom rail at 400 — yes — the three icons sit at the bottom of every 400 shot

## Layout
- layout type fits the content — yes — layout "doc" on all pages; one demo and prose
- demo frame used as intended — yes — code, then the live stage, then the caption (Recite/1200.png)
- control line sits with what it controls — yes — the bar is directly under Read it aloud, Recite/1200.png band 2

## Sizing
- nothing too small to read or use at 400 — no — the bar label is about 40 px wide and shows "not…" (Recite/400.png, demo bottom band)
- text measure reasonable — yes — widest_text 549 at 1200, 359 at 400
- no horizontal overflow — yes — overflow_x false on all pages, both widths
- tap targets — yes — the bar buttons are 2.4em square (Recite.css)

## Wrapping
- nothing wraps that shouldn't — yes — wraps lists only the rail's ✦AI/☰Menu (existing); no Recite element
- truncation hides meaning — no — at 400 the label ellipsis hides the state and time (finding 1)

## Spacing and padding
- left edges line up — yes — left_stack h1 16 / p 49 at 400, which is the demo's own inset (existing pattern)
- gaps even inside the bar — yes — gap 0.25em; Recite/1200.png
- wasted space — yes, acceptable — empty 0.56 at 1200 is the doc layout's normal; Recite/1200.png has no large blank band (big_empty false everywhere)

## Colour and contrast
- tokens, not raw colours — yes — Recite.css uses --subtle, --ink, --wash, --prime, --line, --error
- control icons readable — yes — subtle grey on white, Recite/1200.png; disabled buttons are 0.4 opacity when nothing is queued, which is intended
- state colours mean something — yes — prime marks the ear while the mic is open, --error marks the label on failure

## Flow
- order reads top-down: try, use, caveats — yes — demo → Use → Watch out → Readme, layout.json bands 2–9
- one clear first action — yes — the "Read it aloud" button, Recite/1200.png

## Words
- plain, full sentences — yes — the readmes and page text are short and clear ("A phone plays sound only after a tap on the page.")
- owner's names used — yes — Voice, Recite, playhead, barge-in
- nothing stale — no — plan.md §6 placeholder (finding 4); the Voice owner-note line (finding 8)
- the bar's empty state says something useful — yes — "nothing to read yet" (Recite/1200.png)
