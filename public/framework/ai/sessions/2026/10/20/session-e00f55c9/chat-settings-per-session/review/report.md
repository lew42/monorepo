verdict: fix
1. [fix] Requirements 1, 3, 5 are not met and 2 and 4 are only partly met: the diff is step 1 only (core/Plugin overrides, load_overrides, reset_plugins, make_default; the demo; one doc). There are no Voice Chat plugins, no Chat settings panel, no Make default button in Chat, and no page-side save or load. The plan names these as steps 2 to 5; they are the owner's core asks.
2. [fix] Stale: `plan.md` Status says step 1 "Merges after qf-1 lands", but qf-1 has landed (merge d5af6b3c0 is in this worktree). Update it so a fresh agent knows step 1 is ready to merge.
3. [fix] Evidence noise in the task folder: `shots/` holds 10 pages, but only `shots/127-0-0-1-62246-framework-core-Plugin/` shows this diff. Seven of the others are 404 pages (`/public/framework/...` URLs, layout.json widest_text sample "404 — nothing matches") and three are unrelated session pages. A fresh agent cannot tell which page is the evidence.
4. [fix] Wrapping: on the Plugin demo, `Make default` and `Reset to default` buttons wrap to 2 lines at 1200, 1920 and 3440 (layout.json `wraps`, button lines 2). A short button label should stay on one line.
5. [note] The framework readme line 30 and `ux/Dictate/readme.md` line 89 say nothing about per-instance overrides or Make default; the core/Plugin readme does. Fine to link there, but the one-line index entry is now incomplete.
6. [note] The Plugin page is 70 to 79% empty at 1920 and 3440 (layout.json empty 0.70 and 0.79), which is normal for a prose page.

## Requirements
Widths given: 400, 1200, 1920, 3440 (Plugin page only; the other 9 shot folders are unrelated).
- 1 "the dictation and recite rules and thresholds as plugins you can switch on and off" — no — the diff touches no Dictate or Recite code, only core/Plugin and `settings-plugins.md`
- 2 "registered at the class level, toggled and configured per instance" — partly — `inst.plugins` and `overrides` work and `node core/Plugin/Plugin.test.mjs` passes. Nothing in Voice Chat uses them yet.
- 3 "one Chat settings panel (the gear), with Recite's settings in it" — no — not built (step 3)
- 4 "settings persist with the session; a new session starts from the defaults" — partly — `overrides` is JSON-safe, and `plan.md` says the Servex store exists in another worktree. This diff has no page-side load or save.
- 5 "a 'Make default' button" — partly — `Host.make_default` and a demo button on the core/Plugin page (shots/.../framework-core-Plugin/1200.png). There is no button in Chat.
- class live-instances page — yes — `core/Plugin/page.js` demo shows an instance's overrides, Make default and Reset
## Page structure
- page — yes — the Plugin page has a title, a use block and a "Try it" section (sheet.png)
## Navigation
- techniques: the framework sidebar and a right AI drawer; nothing new was added — n/a for the rest
## Layout
- no — shots/.../Plugin/400.png: the code block and demo stack in one column; the diff's additions do not break it
## Sizing
- yes — widest_text 368 at 400 and 592 to 714 at wider widths; no overflow_x
## Wrapping
- no — the two demo buttons wrap to 2 lines (finding 4); tab_rows 0
## Spacing and padding
- yes — layout.json bands show even shares (0.04 to 0.31 at 400); no band is unusually padded
## Colour and contrast
- yes — sheet.png: the code block is light on dark and the buttons are readable
## Flow
- yes — sheet.png: the page reads top-down, from the intro to Try it to One instance
## Words
- plain sentences, the reader's terms: yes — the readme Use block explains overrides, load_overrides, reset_plugins and make_default
- nothing stale: no — `plan.md` Status (finding 2)

## Index and handover
- new files are indexed: yes — `settings-plugins.md` is linked from `ux/Dictate/readme.md` line 89; the readme Structure section lists the new methods and the test file
- fresh agent can continue from the task folder: mostly — `plan.md` Status names the worktrees, commits and open steps, apart from the stale clause in finding 2
