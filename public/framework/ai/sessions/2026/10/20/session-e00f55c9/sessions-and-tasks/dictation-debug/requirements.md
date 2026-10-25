# Dictation: a Debug tab that shows each layer, and the stall fixed

Opus, high effort. Work in a worktree and land ready to merge; the merge is the owner's. The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, the prompt after "Session extends Task").

## The owner's ask

- **Voice dictation keeps breaking.**
  - It transcribes for a bit, then stops.
  - Sometimes the AI never answers ("hello, can you hear me?", and nothing).
  - After a reload it almost always breaks again. Maybe the microphone isn't released, or a process died and never came back.
  - "I can't see a damn thing about why. No error."
- **Make the drawer's Dictation tab a Debug tab.** It's in the mobile sheet's tab list, and today it seems to do nothing.
  - It shows each layer, live:
    - Is the mic connected?
    - Is Whisper connected?
    - Are raw Whisper transcripts coming back?
    - Is the text being sent to the LLM?
    - Is the LLM connected, and is it responding?
  - Each layer shows a real error message when it fails.
- **The tab is routed.** The sheet and the tab it's on survive a reload, as a subpath or a peer path. Pick one and say why.
- **Find the stall and fix it,** including whether the mic is released on reload. Reproduce it first.
- **A UI rule, written into `public/framework/doc/rules.md`** (or the doc it belongs in): anything that can fail tells the user what went wrong, so they can diagnose it.
- **Errors are logged per page and per module,** so we know the moment one happens, and the goal is pages with zero errors.
  - `public/framework/ai/errors/` already has dated jsonl files. Find what writes them and extend that rather than building a second system.
  - Propose (don't build yet) a watcher that re-runs a page when its files change and logs any new errors.

## Start here

`public/framework/ext/Chat/Mic.js`, `ext/Chat/Composer.js`, `ext/drawer/AIPage.js` (the drawer and its tabs), `ext/Ask/reply.js`, and the readmes beside them. Run the `past-work` skill on "dictation", "Whisper" and "mic" first: there has been a lot of voice work.

## Done when

- [ ] The Debug tab shows every layer live, with real errors, and a reload keeps you on it. Shot on a phone and at 1920.
- [ ] The stall is reproduced and fixed, or exactly located with the next step written down.
- [ ] The UI rule is written, the error log is extended, and the watcher is proposed. Log a `show:` line with links.
