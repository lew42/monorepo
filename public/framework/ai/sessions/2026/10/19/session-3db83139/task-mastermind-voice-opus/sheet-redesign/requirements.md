# Dictate sheet: the mic is the level meter, tabs move into the AI menu

Load the `minion` skill first. Parent: task-mastermind-voice-opus, task dir public/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/

## The owner's words (via the smart assistant, cleaned)
> (a) Mic level: instead of the mic just pulsing orange every second, make the mic's BACKGROUND the level meter: a fill that rises from the bottom in the primary colour (orange) following the live wave level, on a transparent-black/dark backdrop so the levels read as they happen. (b) Remove the separate "listening" bar/row (red dot + progress bar). (c) The bottom tabs (AI, Dictation, Settings): move them to the TOP. Preferred idea, not final: make the "AI" title a dropdown whose menu holds Dictation and Settings (hidden tabs, shown on click), with the New session button grouped next to the AI title, then the X at the right. (d) Overall goal: the chat area takes up more space. Also from earlier: the "Type" button and the stale "sending… one moment" line take space and don't seem helpful, so reconfigure them; the bottom area should be one compact row.

## Already done on this branch (don't redo; read the diff `git log michael/dev..HEAD`)
One layer of side padding, no top/bottom padding on the chat, smaller mic (2.25rem), the "sending" word now clears (ext/Chat/Mic.js enqueue returns its promise), tighter top padding (ext/drawer/rail.css).

## Deliverables
1. **Mic = meter** (ux/Dictate/DictationBar.js + .css): while listening, the mic button's background is a dark translucent disc with a `var(--prime)` fill rising from the bottom to the live input level (reuse the level the existing meter reads; find it in ux/Dictate, e.g. MicIndicator.js / VoiceStrip.js / Dictate.js, never a second audio graph). Drive it with one CSS custom property (`--level`, 0 to 1) set per animation frame; no pulse animation while listening.
2. **Remove the listening row** (red dot + progress bar) inside the sheet only; other pages keep theirs.
3. **One compact bottom row:** `[mic] [word · hint, one line]` with Type as an icon-only ⌨ button at the right end of that row (it opens the text box; keep the feature).
4. **Tabs to the top** (ext/drawer/rail.js mount_tabs + rail.css): the sheet's bottom tab row goes away; the "AI" title becomes a small dropdown (▾) whose menu lists Dictation and Settings (and Element when it shows); picking one shows that tab's body in the sheet, and "AI" goes back to the chat. New session sits right after the title, ✕ at the far right. Routed: the open tab stays in the URL the way it does today.
5. Proof: headless screenshots at 400×820 before and after, with the sheet expanded (the probe `none-seat/sheet-shot.mjs` in the task dir does this: `node <it> http://127.0.0.1:52636 <out.png>`; it clicks `.drawer-rail-ai` then `.drawer-rail-sheet-up`). Also one shot at 1200. Zero console errors on /framework/ux/Dictate/ and / in the worktree.
6. Commit each piece in the worktree. Do NOT merge, do NOT restart anything. Report: the shot paths, one line per deliverable.

## Fence
Worktree C:/Code/lew42/worktrees/qf-6 (branch worktree/qf-6, server http://127.0.0.1:52636/). Files: ux/Dictate/DictationBar.*, ux/Dictate/Widget.css, ext/drawer/rail.js, ext/drawer/rail.css, and the meter source you read (read-only unless a one-line hook is needed). Not Servex/, not public/live/. Every process you spawn uses windowsHide: true.

## Budget
Sonnet, about 45 minutes.
