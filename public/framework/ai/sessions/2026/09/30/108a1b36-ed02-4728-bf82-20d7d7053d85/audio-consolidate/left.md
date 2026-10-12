# What was left

The budget ran out at $24, so these wait for a follow-up.

- **Ask 2: rebuild Dictate on MicStream and Transcriber.** Today `ux/Dictate/capture.js` still holds its own copy of the mic code. `MicStream` should replace it. The minion that built MicStream can be resumed: session `3b106802-883c-40ef-9aa9-56167f0fb3e0`.
- **Widget page sequence.** The Dictate Overview should show the bare widget first, then the widget with options, then the widget inside the ✦ sheet.
- **Reactions and threads in the widget.** chat-reactions added `threads` and `react` options to ChatPanel. `rail.js` now passes them to the Widget, but the Widget doesn't hand them to its thread yet. A threaded reply's own bubble also doesn't carry its thread.
- **Review notes 3–6:**
  - The demo cards have ragged widths at 400px.
  - Two ~90-word paragraphs on the Dictate page belong in Docs.
  - The v1 link row is clipped at 400px.
  - The level meter sits beside Send when it should be on the line underneath.
- **merge.mjs smoke-tests deleted page.js files.** That's on mastermind-servex's todo list. For now, the six old audio URLs are thin alias pages that point to `/framework/audio/v1/`.
