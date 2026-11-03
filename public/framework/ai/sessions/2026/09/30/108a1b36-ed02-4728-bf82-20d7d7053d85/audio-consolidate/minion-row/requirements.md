# Minion: the widget's composer row on ONE line

Load the `minion` and `css` skills. Worktree only: `C:\Code\lew42\worktrees\audio-consolidate` (server http://localhost:53292/). Commit with `git commit -m "…" -- <exact path>`.

**The defect** (shots `../minion-wire/card-1920.png` and `../minion-wire/sheet-400.png`): the one dictation widget's composer row wraps. In the desktop drawer at 1920 the text box, the 🎤 button and Send stack on three lines; in the ✦ sheet at 400, Send drops to a second line. The sheet used to be one row: `[say something][🎤][Send]` (see `../minion-widget/sheet-400.png`, the earlier look). The owner must recognise the widget as the sheet's.

**Fix, CSS only**, in `public/framework/ux/Dictate/Widget.css` (fence: that file, plus `ext/drawer/rail.css` / `drawer.css` only if a rule there causes it): the text box, the mic and Send stay on one row at every width from 320px up; the live-guess caption and any extras (meter, picker, Sample) may drop to a line of their own underneath, never between the box and Send. The likely cause is `.ux-dictate-widget-composer .ux-dictate-info { flex: 1 1 8em; min-width: 8em }` taking the row's space; check the drawer's width too.

**Proof:** headless Playwright (`windowsHide: true`, script in your session scratchpad named `row-*.mjs`), shots into this dir: `sheet-400.png` (http://localhost:53292/framework/ with the ✦ sheet open) and `drawer-1920.png` (an AI 2 card page with the desktop AI tab open), each showing one row. Open them and check. Zero console errors.

Budget: about $0.60. Keep it short. End with 2 lines: the commit id and what the cause was.
