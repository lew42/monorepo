# Latency — the first reply to a dictated sentence (2026-10-13)

**Short version:** the first reply used to wait 8 s on purpose; it now arrives in about 1.6–2.8 s after the sentence (4.7 s once, cold) on a private Servex. The 30 s the owner saw is the mic, Whisper and the quiet gap on top; this page covers the part Servex owns.

## Before and after (one spoken sentence, ms from the post of the sentence)

| Hop | Before | After, drawer open 4 s earlier | After, no pre-warm window |
|---|---|---|---|
| Servex takes the line (`say` returns) | 34 | 26 | 141 |
| Fast agent spawn plus its model turn | ~2200 | ~1300–1600 (already live) | ~2500–4700 (cold spawn in the turn) |
| Fast reply held on purpose (`fast_wait_ms`) | ~5900 | 0 | 0 |
| **First reply in the session file** | **8126** (8059 on another run) | **1585–1710** | **2830–4709** |

The two numbers agree: 8126 = 34 + 2173 (agent log, spawn to result) + ~5900 hold. Measured by [`measure.mjs`](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/first-reply/measure.mjs): a private Servex, the drawer's own `/api/session/new` then `say` (voice, floor done), the session file and agent log stamped. Results: `result-*.json` beside it.

## What changed (`Servex/agents/Sessions.js`)

- **The hold:** `fast_wait_ms` 8000 to 1500. It made the fast reply wait for a smart answer that never came inside 8 s (the smart agent loads a full Claude Code context). Restore the old pace with `SERVEX_SESSION_FAST_WAIT_MS=8000`. Cost: now and then two acknowledgements instead of one.
- **Pre-warm:** `create()` and `resume()` start the fast agent when the drawer opens (`prewarm_fast`), so the first sentence meets a live process. The smart agent still spawns at the first sentence. `SERVEX_SESSION_PREWARM=0` turns it off; the idle sweep stops an unused one after 5 minutes.

## The floor

About 1.2–2.5 s: one small model turn after the quiet gap (`answer_quiet_ms` 2.5 s, set by the owner's pause, not by Servex). Under 5 s is reachable; under 1 s is not, without streaming the fast reply (it is held back by design). Not measured here: Whisper's first text and the browser draw (browser code is outside this task), and the live Servex runs the old values until restarted.
