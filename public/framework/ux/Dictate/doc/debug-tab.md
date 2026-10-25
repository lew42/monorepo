# The Debug tab — dictation, stage by stage: a row of lights and a live log

**What it is.** A tab in the drawer and the phone sheet that shows, live, each stage a spoken sentence passes through. At the top, one light per stage: green works, amber is waiting, red failed. **All green = it should work.** Under the lights, a compact live log: one line per record, newest first, the raw data one click down. Open it from the sheet’s **AI ▾** menu, or at `<page>/ai/debug/` (for example [/framework/ext/drawer/ai/debug/](/framework/ext/drawer/ai/debug/)).

Shots (`test/debug-tab.mjs`): [phone, 390](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/solid/shots/debug-390.png) · [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/solid/shots/debug-1920.png).

## The lights

One store holds every stage, `class DictateHealth` ([DictateHealth.js](../DictateHealth.js)), one per browser tab. The objects that do the work write into it; the tab only reads it. Hover a light for its last word. A tap shows it in full above the log and narrows the log to that stage; tap again for everything. A light that went red and then recovered still shows its **last error** (and when) beside its current word.

| Light | The question | Written by |
|---|---|---|
| Mic | Is the mic connected? | `Dictate.log_step()` and `set_error()` ([Dictate.js](../Dictate.js)); `heartbeat()` when the mic’s box leaves the page |
| Whisper | Is Whisper connected? | the same `log_step()` stages; the tab’s **Check Whisper** (`Connection.check_whisper`) |
| Heard | Are Whisper’s raw transcripts coming back? | `Dictate.transcribe()` → `DictateHealth.heard()`: a log line per answer (guess, amended, final) |
| Sentence | Do your words become sentences that leave the draft? | `ComposerMic.take_out()` ([ext/Chat/Mic.js](/framework/ext/Chat/Mic.js)), and its errors |
| Send | Is the text being sent to the AI? | `chat.js` around `Session.say()`: sending, sent, or not sent with Servex’s own reason; `ComposerMic.post_held()` for a send still open after 25 s; "Servex wrote it" when its line comes back |
| Reply | Is the AI answering? | `chat.js`: a reply being written, the answer; no answer 60 s after a send turns it red |
| Wire | Is the live wire to Servex open? | `chat.js` from `Session.stream`: amber at a drop, red only after 8 s (the LAN proxy cuts it every 30 s and it is back in a second); the 1.5 s poll’s failures |
| Page | Did anything on the page fail? | `DictateHealth.fail("page", …)`: a bubble that could not be drawn; every uncaught error and unhandled promise rejection on the page, from any script, not only dictation; it stays red until you reload (`DictateHealth.watch_window`) |

The lights are the shared `Connection` row ([Connection.js](../Connection.js)) in its `lights` layout, so there is still one step-row component. The view is `class DictateDebug` ([DictateDebug.js](../DictateDebug.js)); the drawer’s tab file is [ext/drawer/tabs/debug.js](/framework/ext/drawer/tabs/debug.js).

## The log

One line per record: the time to the millisecond, the stage, a one-line summary. Click a line for the raw data: Whisper’s raw text (each guess, each amendment, the final), each send (the text and its timing), a late echo or an answer (the whole session line Servex wrote), each sentence that left the draft, each error with its stack. The last 200 records are kept (`DictateHealth.KEEP`). **Copy report** puts every light and record on the clipboard as JSON; beside it, the session log, the Whisper log and the failures file.

## The handle

In the phone sheet, the Debug panel sits under the chat. A handle on its top edge resizes it: drag it up for more log, down for more chat (a sheet within a sheet). Its height is saved on this device (`localStorage`, `lew42.sheet.tabs_h`), so it survives a reload; a double-click puts the default back (`SheetPanel.tabs_grip`, [ext/drawer/Sheet.js](/framework/ext/drawer/Sheet.js); how it is built: [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md#the-debug-panel-handle-2026-10-25)).

## Every error caught

Each stage catches its errors and either shows them (a red light and a log line, with the raw error) or ignores them on purpose, with a one-line comment in the code saying why. `DictateHealth.fail(stage, error, where)` is the one way to show one. What changed on 2026-10-25 (`test/errors.mjs`):
- **One bad line no longer freezes the chat.** `Session.watch` caught everything around the whole poll, so a line that failed to draw stopped the rest and was retried every 1.5 s, forever, in silence. Now each line is drawn on its own, a failure is on the Page light, and the poll’s own failures (and recovery) are on the Wire light. A half-written last line (no newline yet) is read again on the next poll instead of being skipped; a complete line that is not JSON is logged on the Wire light and skipped.
- Errors that went only to the console now light their stage: the sentence queue, the pause that sends, a deliver that threw, a guess request, the fallback log refusing the words, a failed poll or a half-bad session log.
- Deliberately ignored, each with its reason in a one-line comment beside it: the check or ? mark on a bubble (a bonus), a suspended audio context that cannot resume (shows as no sound), the Whisper log copy (the Debug log holds the answer), a start's own failure shown once by `start()`.

## Reconnect

The sheet’s Reconnect reopens one thing: the chat’s live wire to Servex, the Wire light. It shows only after that wire has been down 8 s, saying for how long and why, and a press never throws or opens a second wire. Details: [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md#reconnect-2026-10-25).

## What the stall was (reproduced 2026-10-24, `test/stall.mjs`)

Three separate faults, each found by a headless run with a fake microphone (jfk.wav) and Servex stubbed, so nothing real was posted.

1. **One unanswered send stopped every later one.** The mic sends sentences through one queue, in order (`ComposerMic.enqueue`). `Session.post()` had no time limit, so when Servex took a sentence and never answered (busy, restarting, or the LAN proxy holding it), the queue waited forever. Before: 1 send in 25 s of speech, the bar stuck on "Sending · one moment", no error. After: `Session.post()` gives up after 10 s with a sentence ("Servex did not answer session/say in 10 s"), `ComposerMic.post_held()` has a 25 s backstop, the stuck sentence is marked "not sent" and its words go to the fallback log, and the next sentences go out (4 sends in the same run). A send that timed out but that Servex took after all heals when its line arrives: one bubble, the "not sent" mark taken off (`chat.js`, the late echo; `stall.mjs late`).
2. **The mic stopped when the chat moved.** A mic whose box leaves the page stops (`Dictate.heartbeat`). That happens whenever the chat moves between the page, the dock and the sheet (for example the first second on `<page>/ai/` at 1920, when the dock opens and takes the chat). It stopped silently. Now the newest mic on the page takes over and keeps listening (`ComposerMic.heir()`, looked for over 2 s); with none, the Mic row says why.
3. **The first sentence of a new session vanished when its send failed.** Starting a session redrew the chat from the session file (`chat.js attach()`), which wiped the sentence that started it; if that send then failed, the words were gone, with no "not sent". Now a session start keeps the screen.

**Is the mic released on reload?** Yes: `pagehide` stops every track (`Dictate.js release_on_hide`); the run counted 1 of 1 tracks stopped. A reload breaking dictation again is fault 1 or 2 above, not a held microphone.

**Whisper dying** already stopped the mic with a reason; the run confirms the bar says it.

## Refresh then dictate

The owner's failure: reload the page, press the mic, nothing works. `test/refresh.mjs` reproduces it headless (a phone, a fake mic, every Servex verb stubbed) in six scenarios (plain, pill, deferred, restart, again, twice). It found four causes:
- **The "page is out of date" pill covered the mic**, so a tap meant for the mic hit the pill and reloaded. The pill now sits at the top centre (`dev/Socket/Socket.js`).
- **A reload deferred while the mic was busy fired 1 s after the mic stopped**, landing on a stop-then-start. It now waits until the page has been quiet `QUIET_MS` (30 s); until then the pill shows. See [dev/Socket](/framework/dev/Socket/readme.md).
- **Two starts at once.** The page starts the mic by itself, and during the up-to-5 s Whisper check `Dictate` still said `idle`, so a press ran a second `start()`. One start's AudioContext was closed while its audio module loaded ("Unable to load a worklet's module"). `Dictate.start` is now single-flight, the state is `connecting` from the press, and a cancelled start shows no false error. `Capture.chunks` also did not exist until the module loaded, so the 200 ms heartbeat threw; it is now a field.
- **A dev reload dropped the sheet.** The sheet now comes back at its size (`Sheet.keep_on_reload`), and the mic bar says "the page reloaded because a file changed: tap the mic to keep talking".

Proof: `node public/framework/ux/Dictate/test/refresh.mjs <base-url> [runs] [scenario]`; five runs in a row, all six scenarios, exit 0: `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/solid/proof/refresh-5-runs.txt`.

## Routed

The tab is the subpath `<page>/ai/debug/`, the AIPage view url that already exists on every width (a desktop shows it in the page). On a phone the sheet writes that url with `history.replaceState` when Debug is picked, so the size steps in history are untouched, and a reload opens the full sheet on Debug again (`SheetPanel.route_tab`, `Sheet.routed`, `Sheet.apply`). Picking the chat, or a smaller sheet, gives the page's own url back. **Instead:** a peer path `<page>/debug/`, which would collide with a real child page of that name and is not an AI view. The old `?drawer=dictation` and `<page>/ai/dictation/` open Debug.

## Bubbles and deltas (the web live-transcribe)

The chat thread (`Widget.Thread`, [Widget.js](../Widget.js)) gets the same line from two places, the live wire and the 1.5 s poll, sometimes out of order. The rules now:
- **One piece per `at`.** The same line again changes nothing; a line with new text for a known `at` (a `fix`) updates that piece in place.
- **Time order inside a bubble.** A late line goes before the later ones (`speak()` in [ext/Chat/Chat.js](/framework/ext/Chat/Chat.js)), never at the end.
- **A stream that ends stops blinking.** The end of a streamed reply removes the cursor; the settled line replaces the bubble, or it goes after 15 s if none comes.

Proof: `test/deltas.mjs` replays a sequence with a repeat, a late line, stream chunks, the settled line, its repeat and a fix, then the whole sequence again. Now: all pass. The old code: the owner's bubble read "One. One. Three. Two.", the reply read its text three times, and a replay grew it again.

## Where errors go

A layer that turns red becomes one line in [ux/Dictate/failures.jsonl](/framework/ux/Dictate/failures.jsonl) (dev only: the file is git-ignored and appears on this machine at the first failure, so the link 404s before that and on the static site; `ErrorLog.report`, [ext/ErrorLog](/framework/ext/ErrorLog/)), the file whoever follows `ux/Dictate` hears. Every page's uncaught errors go the same way, to the module that threw (`app.js` calls `ErrorLog.watch()`). The proposal for re-running pages when their files change: [ext/ErrorLog/doc/page-watcher.md](/framework/ext/ErrorLog/doc/page-watcher.md).

## Run the proofs

```
node public/framework/ux/Dictate/test/stall.mjs <base-url> [hang|refuse|whisper|reload]
node public/framework/ux/Dictate/test/debug-tab.mjs <base-url> <shots dir>
node public/framework/ux/Dictate/test/deltas.mjs <base-url>
node public/framework/ux/Dictate/test/reconnect.mjs <base-url> [shots dir]
node public/framework/ux/Dictate/test/refresh.mjs <base-url> [runs] [scenario,…]
node public/framework/ux/Dictate/test/errors.mjs <base-url>
node public/framework/ux/Dictate/test/marks.mjs <base-url>
```

**Still open:** the Reply light turns red 60 s after a send with no answer, but it cannot yet say *why* Servex's assistants did not answer (asleep, held by the floor until you are quiet, or crashed). The next step is a reason on Servex's side: `Servex/agents/Sessions.js` would write a `{status}` line to the session (held, waking, answering, failed) that `chat.js` already reads.
