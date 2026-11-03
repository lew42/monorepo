verdict: fix
1. [fix] At 1920 and 3440 the live chat demo stretches the full width of the page, so your bubbles sit at the far right and the assistants' at the far left, about 900 px apart at 1920 and 1400 px at 3440. It stops reading as one conversation (layout 3, 10). My headless shots show it (ask-shot 1920: the log is 1481 px wide; 3440: 2922 px). Cap the chat's width near a phone or drawer width, and centre it.
2. [fix] Item 12's second sentence, "New cards … show which agent made them: the icon plus the agent id on hover", is not in this diff. Messages do it (a tooltip with `from.agent`), but no card code changed. Build it, or write down which task owns it.
3. [note] The task's shots/ folder is still "This site can't be reached" at all four widths (layout.json errors: ERR_CONNECTION_REFUSED). The server is up now, so I answered the layout questions from my own headless shots at 400, 1920 and 3440. Shoot the folder again so the proof lives with the task.
4. [note] In the smart reply, the small ⌨ mark drops to a line of its own at 1920 and 3440, which makes that bubble a line taller for one icon (wrapping 20). Keep the mark on the last word's line.
5. [note] The demo stage shows a scrollbar thumb at its right edge at every width, with nothing to scroll to (sizing 16).
6. [note] Still open from the last review: a bubble's first reaction adds 0.95em of margin (`.chatbox-has-reacts`), so every bubble below it moves down (flow 29).

## Requirements
- 1–4 (in the task's first prompt, not in requirements.md) — n/a
- 5 "One acknowledgement, not two" — yes — Sessions.js `hold_fast()` waits 8 s (`SERVEX_SESSION_FAST_WAIT_MS`) and drops the fast reply if the smart one answered or reacted; the 8 s is in ext/Session/doc/sessions.md
- 6 "a best guess… or an emoji response" — yes — session-fast.md: a best-guess few words, or a lone emoji that becomes a reaction
- 7 "an icon for both… doubles as the username" — yes — avatars.png: the icon replaces the name, inline
- 8 "Reactions belong to /framework/ext/Chat" — yes — built in Chat.js, roles.js and ChatPanel.js; the dev bar's sheet (drawer/rail.js) uses them through ChatPanel
- 9 "Streamed input: report" — yes — streaming.md in the task folder
- 10 "the text area should fill the row… a clearer gear… before and after" — yes — phone-before.png vs phone-after.png: the box fills the row, the buttons drop below it, the gear is an SVG gear
- 11 "inline messages just with a little icon… keep all the styling the same" — yes — avatars.png and the 400 shot: icon and words on one line, same sides and colours, 🎤/⌨ small and trailing; `set_avatar()` is the one-setting hook
- VS Code "Long-tap a bubble for quick reactions; tap to remove" — yes — phone-picker.png; the same emoji again takes it off; the newest `react` line wins
- VS Code "Reply… THREADED… N replies" — yes — the 400 shot: "▸ 2 replies" under the smart reply; lines carry `re` and `thread: true`
- 12 "a BRAIN… a bolt… a small user AVATAR… the site's M logo" — yes — avatars.png: ⚡, 🧠, a head, the M logo; the owner's sentence is now quoted in requirements.md
- 12 "New cards and messages show which agent made them… agent id on hover" — partly — messages yes, cards not touched (finding 2)
## Page structure
- page 1 — yes — 400 shot: "Chat", then what the log is
- page 2 — n/a
- page 3 — yes — the intro, then the live chat, then the line shapes
- page 4 — n/a
- page 5 — yes — an existing page under Extensions in the sidebar
- page 6 — n/a
- page 7 — yes — the standard page with demo.stage()
- page 8 — yes — the intro line names ☺, hold, right-click, and each icon
- page 9 — yes — the code block that sat above the demo is gone
- page 10 — yes — reactions and threads are shown live, not described
- page 11 — n/a
- page 12 — n/a
## Navigation
- page 13 — a sidebar (the site rail), a bottom rail at 400
- page 14 — n/a
- page 15 — n/a
- page 16 — n/a
- page 17 — yes — 3440 shot: the rail sits beside the main column; 400: it folds into ☰
- page 18 — yes — nothing moves when the page loads
- page 19 — yes — 400 shot: the page scrolls clear of the bottom bar
- page 20 — n/a
- page 21 — n/a
- page 22 — n/a
## Layout
- layout 1 — yes — 3440 shot: rail beside the main column
- layout 2 — yes — Rail + content
- layout 3 — no — 1920/3440: the chat log runs 1481/2922 px wide (finding 1); prose keeps its measure
- layout 4 — yes — bubbles pad themselves; the stage adds none
- layout 5 — yes — text keeps room inside every bubble
- layout 6 — n/a
- layout 7 — no — not measured (shots/ failed); 3440 shot: the chat band is tall and mostly empty between the two sides
- layout 8 — n/a
- layout 9 — no — the empty width is given to the chat log rather than capped (finding 1)
- layout 10 — no — small bubbles alone at opposite ends of a 2922 px band
- layout 11 — n/a
- layout 12 — yes — rounded bubbles stand apart with a gap
## Sizing
- layout 13 — yes — bubbles are auto height; the avatar is a fixed icon
- layout 14 — yes — the stage is as tall as the log
- layout 15 — n/a
- layout 16 — no — a scrollbar thumb at the stage's right edge (finding 5)
- layout 17 — n/a
- layout 18 — yes — not measured; 400 shot: nothing past the right edge
- layout 19 — yes — Chat.css sizes the avatar and chips in em
## Wrapping
- layout 20 — no — the ⌨ mark wraps alone at 1920/3440 (finding 4)
- layout 21 — yes — not measured; at 400 the same bubble wraps its words, not the mark alone
- layout 22 — n/a
- layout 23 — yes — 400 shot: bubbles take most of the width
- layout 24 — n/a
## Spacing and padding
- css 1 — yes — not measured; 400 shot: about 28 px to the heading
- css 2 — yes — one page pad, then the bubble's own
- css 3 — yes
- css 4 — yes — reaction chips sit on the bubble's corner, off the text
- css 5 — yes — Chat.css adds no spacing constants beyond control em sizes
- css 6 — yes — ☺, picker buttons and chips use em
- css 7 — yes — bubbles have their own ground
- css 8 — n/a
- css 9 — yes — the new rules sit inside Chat.css's existing layer
- css 10 — yes
## Colour and contrast
- css 11 — yes — dark text on light pink and grey bubbles
- css 12 — yes — "2 replies" in the accent is readable at its size
- css 13 — yes — avatar tints reuse the role colours
- css 14 — yes — bubbles differ from the page ground
- css 15 — not checked — no dark-mode shot
- css 16 — yes
- css 17 — yes — the same icon per role everywhere
- css 18 — yes — the via mark uses opacity, not `var(--muted)`
## Flow
- layout 25 — yes — the live chat comes right after the intro
- layout 26 — yes
- layout 27 — yes — flex gap in the log, flow in the prose
- layout 28 — yes — each reaction sits on its own bubble's corner
- layout 29 — no — the first reaction pushes the log down 0.95em (finding 6)
- layout 30 — yes — not measured; prose keeps its column at 1920 and 3440
## Words
- content 1 — yes — reactions and threads shown live
- content 2 — yes
- content 3 — yes — the longest paragraph is about 45 words
- content 4 — yes
- content 5 — yes
- content 6 — n/a
- content 7 — yes — "reaction", "thread", "avatar" used the same way in readme, doc and page
- content 8 — no — "/framework/ext/Chat/panel/" in the intro is code, not a link (small; not from this diff)
- content 9 — yes — the readme's page has the live chat
- content 10 — yes
- content 11 — yes
