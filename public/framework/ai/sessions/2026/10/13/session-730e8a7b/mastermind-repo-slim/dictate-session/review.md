verdict: fix
1. [fix] Ask 2's "small listening dot in the sidebar tab when the surface is collapsed" does not show at 400: in `shots/collapsed-400.png` the ✦ button in the bottom rail has no dot, and the only red dot is the floating mic's (that shot is pixel-identical to `shots/floating-400.png`). The compact `MicIndicator` is added in `ext/drawer/rail.js:124`, but it is either not mounted or clipped there. Find out why, then re-shoot with the ✦ dot visible. At 1200 the ☰ dot does work (`shots/closed-menu-1200.png`, top right).
2. [note] Ask 1 asked that a new session have a URL and that both presses "land on the same new session page". The press only clears the stored session id and the URL stays the same. `ux/Dictate/doc/chat.md` (new section, last paragraph) now records this choice and the alternative, which is fine under "decide and keep going". Because it differs from the brief, also put it on the card as a `Note:` so the owner sees it.
3. [note] In the proof, the open state is set by hand (`proof.mjs:15`, `MicIndicator.set_open(true)`). So `shots/drawer-1200.png` shows "listening" in the indicator while the composer status below it says "Mic: idle". Only `shots/sheet-400.png` shows a real mic ("Mic: on, level ok") driving the indicator. The sheet is shot only at 400 and the drawer only at 1200. They are the same surface at two widths, so that coverage is acceptable.
4. [note] In `shots/sheet-400.png` and `shots/drawer-1200.png`, the floating mic (forced on by `proof.mjs:14`) sits on top of the right end of the indicator's level bar. That overlap only happens in the proof setup, but if both can be open at once in real use, the bar needs room at the right.
5. [note] `ext/drawer/menu.js:30` passes `{ capture: false }`, which `MicIndicator` never reads. Either drop it or confirm it is a `View` option.
6. [note] Ask 3 is not done yet: no merge and no landing line (`task.jsonl` ends at the assign line and the first review). The first review's other points are fixed in 9e69311b5: the colour token (`--error`), the never-mounted leak, the old sheet classes now resetting the shared session through `chat.reset`, and the trimmed `surfaces.md` line.

## Requirements
- 1 "One New session: the sheet and the AI tab call chat.js's button; the other two copies go" — yes — `rail.js` now has one `new_session_button()` wrapping `chat_new_session_button`, and `tabs/ai.js` `new_session()` is deleted
- 1 "one paragraph in doc/chat.md (where created, what the URL becomes, Sessions page)" — yes — `chat.md` "New session, and the mic indicator"
- 1 "both land on the same new session page" — no — the URL does not change (recorded as a decision; finding 2)
- 2 "the same indicator component on all three surfaces" — yes — `MicIndicator` in `Widget.Composer`, `push-to-talk.js` and the drawer; `shots/sheet-400.png`, `shots/drawer-1200.png`, `shots/floating-*.png`
- 2 "a small listening dot in the sidebar tab when collapsed" — partly — the ☰ dot shows at 1200; the ✦ at 400 shows none (finding 1)
- 2 "shots of each surface with the mic open at 400 and 1200" — partly — six shots; the sheet and the drawer are one width each (finding 3)
- 3 "merge.mjs; surfaces line; landing line; card" — partly — `surfaces.md` item 3 is updated; merge and landing are pending
## Words
- content — yes — the `chat.md` section is plain and names files; one long paragraph each, acceptable for a deep doc
