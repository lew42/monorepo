verdict: fix
1. [fix] A hotkey on a modifier key never fires, or never releases (requirement 1). `Hotkeys.matches()` requires exact modifier flags, but pressing AltRight sets `altKey: true` on its own keydown and `false` on its keyup. So the readme's own example `{ code: "AltRight" }` never fires. A captured AltRight or Ctrl binding fires "down" but never "up", so push-to-talk keeps recording after release. Releasing Ctrl before M on a Ctrl+Shift+M push binding gets stuck the same way. Fix: match "up" on `code` alone, and ignore a key's own modifier flag. — diff `Hotkeys.js` `key()` / `matches()`.
2. [fix] Push-to-talk is off by default, so the owner's ask "go somewhere and set the key, then go anywhere… I hit push-to-talk" does not work out of the box (requirement 2). A second checkbox in Settings has to be found first. The reason is real: two mounts send one utterance twice (ptt-proof check 7). But the fix belongs in `chat.js` (a cross-mount send guard), and that guard is still open, so the feature ships disabled. — diff `push-to-talk.js` `mic_pref`, `settings.js`.
3. [note] The level-driven size was proven only with a hand-set `--mic-level`; the real meter wiring was never seen working. `ensure_mount()` sets `on_meter` only if `mount.panel.dictate` already exists at mount time, and the real-mic run logged a worklet AbortError (ptt-proof check 6). — `ptt-proof/proof.md` checks 3 and 6.
4. [note] Hotkeys fire while the reader is typing. Nothing checks for an input or textarea, so if push-to-talk is rebound to a plain key (the proof rebinds it to "9"), typing that key in any field starts dictation. On the Hotkeys page, typing "h" in the filter fires `demo.example`. — diff `Hotkeys.js` `key()`.
5. [note] The two demo actions are registered when `ux/Hotkeys/page.js` is imported. After that, they appear in the real drawer Settings list on every page ("Demo action (try me)", "Demo toggle (modifiers)"), mixed in with the real hotkeys. — `shots/…Hotkeys/400.png`, the four rows.
6. [note] At 400, each "press a key or button…" button wraps to 2 lines (layout.json `wraps`, 3 of them) and sits on its own row under the binding. At 1920 and 3440, the bled demo stage is a wide box that is mostly empty. — `shots/…Hotkeys/400.png`, `1920.png`.
7. [note] `FloatingMic.css` uses literal colours (`#fff`, `rgba(0,0,0,.25)`), not tokens (colour 3). The filter input carries `dev-hotkeys-filter`, a class no stylesheet defines (css 42).
8. [note] Mouse buttons 3 and 4 always have their default action blocked, on every page, even when nothing is bound to them or push-to-talk is off. That means the browser's back and forward thumb buttons stop working site-wide. It is deliberate (Hotkeys `doc/decisions.md`), but the owner should know.

Widths given: 400, 1200, 1920, 3440 for `/framework/ux/` and `/framework/ux/Hotkeys/`. The floating mic is not in these shots; it is judged from `ptt-proof/` shots and the diff.

## Requirements
- 1 "a key detection system for setting hotkeys… one place to manage every hotkey, filterable, rebindable" — partly — filter and capture work (`shots/…Hotkeys/400.png`; proof check 5); modifier-key bindings broken (finding 1)
- 1b "bind… a mouse button… preventDefault so the browser doesn't navigate back" — yes — `Hotkeys.button()` blocks 3/4 on mousedown/mouseup/auxclick
- 1c "settings row where settings already live" — yes — drawer Settings tab, `section("hotkeys")` (proof `5-settings-hotkeys.png`)
- 2 "hold → records; release → sends to the ONE global session, with the page URL" — partly — works once opted in (proof check 1, `push_to_talk.nav`); off by default (finding 2)
- 2b "works on every page, dev shell open or closed" — yes — mounted once in `app.js` beside devbar/devshell
- 3 "floating mic bottom-right, fixed, shown only while recording" — yes — `FloatingMic.css` fixed, `.showing` only; proof `1-hold-showing.png`
- 3b "scales ~1.5–2em with the live level" — not proven live — simulated only (finding 3)
- 3c "Click → opens the DevShell on its chat tab" — yes — proof check 4, `4-dev-shell-ai-tab.png`
- 4 "Prove it headless… screenshots, short real test note" — yes — `ptt-proof/proof.md`, 6 of 7 pass
## Page structure
- page 1 — yes — `shots/…Hotkeys/1920.png`: title "Hotkeys" + description says what it is
- page 2 — yes — the live settings rows lead the Overview
- page 3 — yes — demo, then how to register, then the rule
- page 4 — n/a
- page 5 — yes — `ux/page.js` children adds Hotkeys
- page 6 — yes — Overview/Docs tabs routed by Doc
- page 7 — yes — Doc + `demo.exhibit`
- page 8 — no — demo rows "Demo action (try me)" read as real hotkeys in Settings (finding 5)
- page 9 — yes
- page 10 — yes — the widget is shown, not described
- page 11 — yes
- page 12 — n/a
## Navigation
- navigation 1 — tabs (Overview/Docs); a sidebar (site rail); the floating mic opens the dev shell
- navigation 2 — yes — layout.json tab_rows 1 at every width
- navigation 3 — yes — Doc tabs carry their own URLs
- navigation 4 — yes — two tabs
- navigation 5 — yes — `shots/…Hotkeys/3440.png` rail beside main; folds at 400
- navigation 6 — yes
- navigation 7 — yes — the mic is a 1.5em circle 1em from the corner, shown only while recording
- navigation 8–10 — n/a
## Layout
- layout 1 — yes — `3440.png` stage + source side by side beside the rail
- layout 2 — yes — Docs three-region (layout "doc")
- layout 3 — partly — demo stage too wide for four short rows at 1920/3440 (finding 6)
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes
- layout 7 — yes — no band `big_empty` at any width
- layout 8 — n/a
- layout 9 — yes
- layout 10 — no — four short rows alone in a full-width stage at 3440 (`3440.png`, top band)
- layout 11 — yes — `/framework/ux/` wall, Hotkeys card added, no lone card in `sheet.png`
- layout 12 — yes
## Sizing
- sizing 13 — yes — mic is fixed 1.5em (an icon); rest auto
- sizing 14 — yes
- sizing 15 — yes — the source block scrolls
- sizing 16 — yes — only the code block scrolls
- sizing 17 — n/a
- sizing 18 — yes — overflow_x false at all widths, both pages
- sizing 19 — yes — mic in em
## Wrapping
- wrapping 20 — no — "press a key or button…" 2 lines at 400 (layout.json wraps ×3)
- wrapping 21 — yes — h2 "How a module registers its own action" wraps at all widths alike, not a sub-1920 wrap
- wrapping 22 — no — button rows are not `flex wrap`; the button drops under the binding (`400.png`)
- wrapping 23 — yes — rows stack at 400
- wrapping 24 — n/a
## Spacing and padding
- spacing 33 — yes — layout.json left_stack 28px at 400
- spacing 34 — yes — one layer each
- spacing 35 — yes
- spacing 36 — yes — `400.png`, rows sit inside the stage's padding
- spacing 37 — yes — no new gaps; mic insets are 1em at a fixed corner
- spacing 38 — yes — `dev-knob` buttons keep their own em padding
- spacing 39 — yes
- spacing 40 — yes
- spacing 41 — yes — `FloatingMic.css`, `row.css` both in `@layer theme`
- spacing 42 — no — `dev-hotkeys-filter` is a class that does not exist (finding 7)
## Colour and contrast
- colour 1 — yes — white icon on `--prim` circle (UI shape, 3:1)
- colour 2 — n/a
- colour 3 — no — `#fff` and an `rgba()` shadow in `FloatingMic.css`
- colour 4 — yes
- colour 5 — partly — `--prim` follows the mode; the literal `#fff` does not
- colour 6 — yes
- colour 7 — n/a
- colour 8 — yes — `span.c("muted")`
## Flow
- flow 25 — yes — the live widget is first
- flow 26 — yes — overflow_x false; the mic hides when not recording
- flow 27 — yes — `flex v gap` rows
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — widest_text 707 at 3440, the measure; 448 at 400 is the scrolling code block
- flow 31 — yes — the mic and its hidden mount sit on `<body>`, beside `.app`
- flow 32 — yes
## Words
- words 1 — yes — the settings widget is shown live
- words 2 — yes
- words 3 — no — the page's own `md()` paragraph about `default` bindings runs ~110 words
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — no — "push-to-talk floating mic", "dictation mic", "open mic" and "toggle dictation" all appear for overlapping things
- words 8 — partly — the readme names `dev/DevBar/parts.js` but links only `/framework/dev/`
- words 9 — yes — readme sits beside the live page
- words 10 — yes
- words 11 — no — the Settings checkbox label is a run-on caveat ("off by default — can send your words twice if another dictation mic is open on the page"); its first half also repeats the box's own state
