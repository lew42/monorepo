verdict: fix
1. [fix] None of the brief's required proof shots exist. The brief asks for shots of the open ☰ drawer's header strip and agent chips (at 1920 and 400), the composer panel, the tab row at one line, and the "+ New session" button on `/framework/ai/`. The only shots given (`shots/127-0-0-1-50231-framework-ext-drawer/`) are of the drawer's existing doc page with the drawer **closed** — the feature this task built is not visible in any shot.
2. [fix] `layout.json`'s `tab_rows` (2 at 400, 1 at 1200/1920/3440) measures the doc page's own Overview/Docs/Files tab strip, not the drawer's AI/Dictation/Settings row the brief asks to fit on one line at the drawer's 19rem width — so ask 4 has no real measurement behind it, only source reading.
3. [note] The brief asks to check the composer's new colours "in light and dark." No dark-mode shot was taken to check against.

Widths given: 400, 1200, 1920, 3440, plus `sheet.png` — the full set for a page layout change. All of them show the same wrong thing: the doc page, drawer shut.

## Requirements
(Judged from `review/diff.patch` — the source — since no shot shows the feature. Each "yes" below is a source-reading yes, not a seen yes; see finding 1.)
- 1 "AI and Sessions become one tab" — yes — `tabs.js`'s `list` drops the `sessions` entry; `tabs/ai.js`'s new `session_header()` draws the session name, its `.jsonl` log link, the global/scoped line, the agent chips, a switcher, and the shared `new_session_button`; `tabs.js`'s `open()` remaps `?drawer=sessions` to `ai`.
- 2 "+ New session beside + New card on /framework/ai/" — yes — `ai2/rail.js` calls `mount_chat.new_session_button(...)`, the same `chat.js` export, not a copy.
- 3 "The composer becomes one panel" — yes — `Chat.css`'s `.chatbox-compose` gets `background: var(--fill-a08)` and a top border; `Composer.js` reorders the row to mic, gear, Send, with `.chatbox-compose-send { margin-inline-start: auto }` pinning Send to the far end.
- 4 "Tabs fit on one row at 19rem" — not proven — the tab list is down to AI/Dictation/Settings(+Element), and Admin moved into Settings as a section (`settings.js` now calls `admin.js` directly), which should help, but no shot of the real drawer at 19rem confirms it — see finding 2.
- Prove: header strip + chips at 1920 and 400 — no, not shot (finding 1).
- Prove: composer panel shot — no, not shot (finding 1).
- Prove: tab row on one line — no, not shot (finding 1).
- Prove: "+ New session" click starts a session and updates the header — no, not shot or tested here.
- Prove: Dictate page demo and ✦ sheet share the same composer — no, not shot.

## Page structure
Answered against the one thing actually shown, the pre-existing drawer doc page (not this task's own change):
1. yes — "Drawer" + "The ☰ and its tabs" says what the page is.
2. n/a — this is a doc page, not an index page.
3. n/a
4. n/a
5. n/a — page unchanged by this diff beyond one sentence and a url.
6. yes — the doc text now says `?drawer=ai`, matching the diff.
7. n/a
8. yes — "AI", "Dictation", "Settings" are self-evident.
9. yes
10. n/a
11. yes
12. n/a

## Navigation
1. Identify — in the shots: a sidebar (the framework's own left rail, unrelated to this task) and tabs (the doc page's own Overview/The drawer/Mobile bottom rail/Docs/Files row). The drawer this task changed is never opened in any shot, so its own tabs, header strip and switcher are not visible.
2. n/a — not shown (finding 2).
3. yes — source only: `tabs.js`'s `open()` keeps `?drawer=ai` in the url.
4. n/a — not shown.
5. n/a
6. n/a
7. n/a
8. n/a — the drawer sheet (the ✦ surface) is never opened in a shot.
9. n/a
10. n/a

## Layout
1–12. n/a — the changed UI (header strip, chips, composer, tab row) is absent from every shot.

## Sizing
13–19. n/a — same reason.

## Wrapping
20. n/a — not shown; this is exactly what finding 2 says was never measured.
21–24. n/a

## Spacing and padding
33–40. n/a — not shown.
41. not measured — the diff's new CSS lines sit among existing rules already inside `drawer.css`/`Chat.css`'s layers; the diff alone doesn't show the enclosing `@layer`.
42. yes, by source — the new rules reuse existing tokens (`--fill-a08`, `--line`) and one new class per new part (`.drawer-ai-session`, `.drawer-ai-chip`, etc.), no inline styles.

## Colour and contrast
1–2. n/a — not shot, so no ratio can be read.
3. yes, by source — `--fill-a08`, `--line`, `--prim-ink`, `--prim` are all tokens, no literal colours.
4. n/a — not shown.
5. not measured — no dark-mode shot exists (note 3).
6. n/a
7. n/a
8. yes, by source — `tabs/ai.js`'s log link uses `.c("drawer-ai-session-log muted", ...)`, the `.muted` class, not `var(--muted)`.

## Flow
25–32. n/a — the changed UI is absent from every shot.

## Words
1. yes — the header strip shows the session as a name, a log link and live chips rather than a sentence describing them (by source).
2. n/a — not shown.
3. yes — the one new sentence in `readme.md` and `page.js` stays well under 60 words.
4. n/a — can't time a read of UI that isn't shown.
5. yes — "AI", "+ New session", "Switch session" all say exactly what they do.
6. n/a
7. yes — "session" and "+ New session" are used the same way throughout the diff.
8. n/a — no mentions of other modules needing a link in the changed text.
9. n/a
10. n/a
11. yes — the touched prose (`readme.md`, `page.js`) reads as full, plain sentences.
