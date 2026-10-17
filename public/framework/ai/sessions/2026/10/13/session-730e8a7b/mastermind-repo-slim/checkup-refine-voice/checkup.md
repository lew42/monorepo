# Checkup: refine and dictation (2026-10-17)

| Task | State | Open | Decision | Next |
|---|---|---|---|---|
| [Live Refine build](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) | landed (c82cae958) | outline lags about 8 s | The cause is the pacing in `LiveRefine` (6 s wait + 2.5 s model), not the page | `mastermind-checkup-servex` was asked to lower `MAX_WAIT_MS` to about 2000 ms (needs a Servex restart) |
| [Inbox labels](/framework/ai/sessions/2026/10/16/voice-20261016/inbox-labels/) | landed | nothing | "Waiting on you" shows 12 | closed |
| [Page UI templates](/framework/ai/sessions/2026/10/15/voice-opus/page-ui-templates/) | partly exists | nothing | Convention written: a `ui/` folder beside `page.js`, one `Template` per file | [core/Page templates doc](/framework/core/Page/doc/templates.md) |
| [Voice bridge doc](/framework/ux/Dictate/doc/voice-bridge.md) | landed, doc was stale | nothing | Doc now says what is exposed today and who holds the address | closed |
| [Refine task home](/framework/ext/Refine/tasks/refine-dictation-to-cards-and-tasks/) | 6 subtasks ranked; the first one is built | 5 left | Placement first | [Placement](/framework/ext/Refine/doc/placement.md) landed (rules only, `to: same / paragraph` for the voice assistant too); next is "the input box shows Whisper typing", then interactive cards |
| [Raw Whisper reply](/framework/audio/Whisper/doc/raw-log.md) | landed (2c9ed4a65) | nothing | Every reply is saved to the Servex `whisper-raw` log; finals carry timings and confidence | closed; the proof is in `audio/Whisper/doc/` |
| [Rolling voice session](/framework/ux/Dictate/doc/sessions.md) | landed (merged) | the kept-mount (✦ sheet) headless test; running the chunker over all sessions | One rolling session is the direction; the New session button stays as the escape hatch | New session tested headless on the demo (passes); a bug fixed: the demo overwrote the shared session key; `chunk-session.mjs` dry-run manifest in the doc |

## Decisions made for the owner

- **Lag:** lower the pacing wait. Alternative: skip the wait when nothing is running (fastest, one extra model call per dictation).
- **Raw Whisper:** one Servex log, finals carry the timings and confidence. Alternative: a file next to each session written from the browser (a second writer, missing on the static site).
- **Sessions:** one rolling session, chunked later by script. Alternative: several sessions with a working button, when you want a clean slate each time.
- **Page UI pieces:** a `ui/` folder beside the page, no new system. Alternative: a shared ui-piece system, only when a second page needs the same piece.
- **Refine order:** placement first. Alternative: interactive cards first (more visible, but they need to know where a card goes).
- **Placement:** rules, no model call (a question or a cue word starts a paragraph, unsure appends). Alternative: ask the model for every unsure sentence (more accurate, one more call each).

## Open warnings

- The task home's subtask pages are not named in a `children:` list ("unreachable from the nav" at merge). They live under `core/Task`'s `TaskPage`, which is outside this checkup's fence.
- `audio/Whisper` is not named in its parent's `children:` (outside the fence).
- Placement's `composer-flow.mjs` and `nothing-to-refine.mjs` runs were not done: they need Whisper and make real model calls.

## Needs the owner

Only a Servex restart, once the lag fix lands (restart is the parent's call when nobody is mid-step).
