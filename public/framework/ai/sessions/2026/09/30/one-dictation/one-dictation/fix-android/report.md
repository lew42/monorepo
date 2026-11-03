# Report: phone fallback fix

Same simulated phone session, before and after (`proof.mjs`):

| | before (main) | after (this fix) |
|---|---|---|
| box text | so so tell so tell me so tell me why there's there's a there's a lot… | so tell me why there's a lot of beeping after every pause |
| mic after the "aborted" restart | stopped, "The microphone stopped: aborted" | still listening, no error |
| chimes (start + stop) | 3 | 2 |
| messages sent on stop | none (mic had errored) | one, the clean sentence |

Checked on the demo at 400 and 1920 and on the ✦ sheet at 400. The ✦ rail button exists
only at phone widths, so there is no sheet to shoot at 1920.
The whisper path was checked separately: one message and one start and one stop chime.

Shots: `shots/before-demo-400.png`, `shots/after-demo-400.png`, `shots/after-sheet-400.png`, `shots/after-demo-1920.png`.

Not fixed here (noted): the engine label "the browser's recognizer · Ctrl+Shift+M stop" runs
past the edge at 400, and `cardRows.filter is not a function` is thrown on every page (not this code).
