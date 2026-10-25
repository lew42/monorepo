# Dictation: why the sheet's chat loads slowly and why the page freezes, measured

Budget: $8. Sonnet, high effort. Load the `minion` skill first. Owner's words: Part 3 item 1 and Part 7 item 2 of [../requirements.md](../requirements.md). Your parent is `mastermind-dictation-2`.

**Read-only investigation: you change no code outside your task folder** (`load-perf/`). A builder (`solid/`) is editing `ux/Dictate/` and `ext/drawer/` at the same time.

## What the owner hit

The phone sheet (✦, `ext/drawer/Sheet.js`, mounting `ux/Dictate/chat.js`) opens fast and looks like a timestamped log, then the chat arrives many seconds later. And the page sometimes freezes while dictating.

## Do

1. **Load.** Headless Playwright (imports as `file:///C:/…`), a 390-wide phone viewport, against `http://monorepo.localhost/` (any page that shows the ✦), cold cache. Open the sheet. Record: every request (url, size, start, end) as a waterfall, the count of files and bytes, time to sheet visible, time to first chat bubble, and what the chat waits on in between (which fetch, which socket message, which session-load step). Run 3 times; give the median. Then do the same for the session detail page's Chat tab if it uses the same loader.
2. **Freezes.** With a fake mic (see `ux/Dictate/test/flicker.mjs` for how the harness fakes the mic and stubs Servex), dictate for 60 s and take a performance trace (`page.tracing` or CDP `Performance` + a long-task observer). List every long task over 50 ms: duration, what code ran (file:function), and what triggered it.
3. **Causes.** The top three causes of each, with their numbers, and for each a proposed fix as one line naming file:line. Rank by milliseconds saved.

## Deliverable

`load-perf/report.md`, one screen: the two headline numbers (time to first bubble; longest freeze) first, then the causes and fixes. Raw data as `load-perf/waterfall.json` and `load-perf/longtasks.json`. Two numbers that must agree: the waterfall's total bytes and the sum of the per-request sizes. Findings as `log` lines in `load-perf/task.jsonl`. When done, message your parent in two sentences.

Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash. Any whisper-server you start, you stop.
