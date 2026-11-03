verdict: fix
1. [fix] The brief asks for shots of the demo and the sheet at 400 and 1920 in `shots/`. None of them are in the task folder (only the review's own Dictate-page shots are there), and `proof.mjs` never takes a sheet shot at 1920: it shoots `sheet-400.png` only (proof.mjs, section 6). (Requirements "Prove: Shots")
2. [note] The "same widget" proof prints 4 of the 7 fields the brief names. `level`, `source` and `debug` are read, but they come back `undefined` and `JSON.stringify` drops them, so the printed lists never show them. The check passes, but it proves less than it says. (Requirements "Prove: Same widget": proof-results.json, entry 1)
3. [note] The demo passes `{ placeholder, keep }` and the sheet passes `{ path, card, placeholder }`, so the demo also leaves out `path`. Leaving out `card` is right, because the demo has no card. `path` is a real difference that nobody mentions, even though the brief says only `keep` should differ. (Requirements 1: diff `ux/Dictate/page.js` vs `ext/drawer/rail.js:1107`)
4. [note] The words are much longer than the change. The `SETTINGS.send_mode` comment in `Mic.js` and the `MODES` comment in `Widget.js` each retell the owner's story in about 15 lines, and so do the readme, `chat.md` and `decisions.md`. Tell the story once, in decisions.md, and link to it everywhere else. (content: one place for detail)
5. [note] The tab bar takes 2 rows at 400 (7 tabs). This was already true before this change. (`layout.json` tab_rows 2 at 400)

## Requirements
- 1 "The demo mounts exactly what the sheet mounts… only extra option is keep" — yes, with note 3: the call is `chat($slot.el, { placeholder: "say something", keep: false })`, and `level`, `source` and `debug` are gone. The debug views are still one click away at /framework/ux/Dictate/playground/
- 2 "Autosend after a pause is the default and the only behaviour" — yes: `MODES.chat` is deleted, and `mode_switch`, `mode_from_url` and the popstate listener are deleted. The gear now offers only `["pause","sentences"]`. Mic.js turns a saved `"manual"` into `"pause"`. The proof shows one bubble with no Send press on both surfaces, and Enter still sends
- 2 "An old ?mode=chat link must still load fine" — yes: proof-results.json shows `widget.mode: dictate` with no console errors
- 3 "Find every other caller of mode:"chat" / send_mode:"manual"" — yes: this diff deletes the only callers outside dated task folders, `Widget.js:36` (a comment) and `Widget.js:83`, plus the comment in page.js
- 4 "Rewrite 'Modes, and where the Dictate box sits' in plain sentences" — yes: chat.md now opens with "One chat, everywhere, and it always autosends." It is plain, but it runs long (note 4)
- 4 "One-line entry in decisions.md" — no (small): the entry is a paragraph of about 14 lines, not one line (note 4)
- Prove: Same widget — yes, with note 2
- Prove: Autosend, Migration, ?mode=chat — yes: proof-results.json, all PASS
- Prove: Shots at 400 and 1920 of the demo and the sheet — no (fix 1)
## Page structure
- page 1 (what it is, shown) — yes: shots/…Dictate/400.png. The title, then the working chat box, with no paragraph before it
- page 2 (major parts, the way in) — yes: the tab bar and "How it works" follow the demo
- page 3 (level 1 above the fold) — yes: the demo is fully visible at all four widths (sheet.png)
- page 4 (one takeaway) — yes: "The same widget as the ✦ sheet, now actually answered" sits right under the demo
## Navigation
- techniques — tabs, a sidebar (page tree), a bottom rail at 400
- tabs: one row on wide screens — yes: tab_rows 1 at 1200, 1920 and 3440
- tabs: no wrap on a phone — no (note 5): tab_rows 2 at 400, not changed by this diff
- routed — yes: the `?mode` route is gone, and an old link falls back to plain dictate
## Layout
- the content fits its kind (doc layout) — yes: layout.json `layout: doc` at every width
- no horizontal overflow — yes: overflow_x false at all four widths
## Sizing
- the demo box is a readable width — yes: about 330px at 400 and about 600px at 1920 (widest_text 344 / 609)
- empty space at wide widths — note: empty is 0.68 at 1920 and 0.83 at 3440. The doc column is sized to its text width, as the doc layout intends; not changed by this diff
## Wrapping
- no unintended wraps — yes: the wraps measured are the icon-plus-label rail buttons (`drawer-rail-ai` 3.2 lines at 400, which is how they are designed) and icon buttons (`chatbox-compose-more` 2.4, `mode-btn` 1.7). None of them comes from this diff
## Spacing and padding
- left edge consistent — yes: the h1 and p left_stack are equal (28/38/67px)
- the removed switch left no gap — yes: shots/…/400.png shows New session, the note, then the box, with even gaps
## Colour and contrast
- contrast pairs readable — yes: shots/…/400.png. Dark text on light, white text on the orange Send button. Nothing in the diff changes colour
## Flow
- the reader's order is demo → takeaway → how it works — yes: shots/…/1920.png, from the top down
## Words
- content 1 (plain, full sentences) — yes: chat.md and the readme read plainly
- content 2 (detail lives in one place, with a link) — no (note 4): the same story is told five times
- content 3 (the owner's own words quoted correctly) — yes: "look alike but behave differently", "auto send after a pause of a reasonable amount"
