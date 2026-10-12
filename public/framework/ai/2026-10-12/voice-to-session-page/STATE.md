# voice-to-session-page: state

Landed in branch `voice-session` (worktree), merging into `michael/dev`; one Servex restart makes `/api/voice` and `/api/whisper` live.

## Baseline on michael/dev (before)

`/api/refine` total 6.6 s (clean 3.0, structure 3.6, clarity 2.8, notes 2.6, in parallel). Nothing from the five stages reached the session page (only `prompts.jsonl`).

## After

- Raw words stream to the page about every 150 ms while speaking or typing; clean 3-11 s; structure, subject, refined, cards, notes then done (7-15 s after Refine, Haiku latency varies). Model times are unchanged; the stages now arrive live.
- Whisper: `whisper-proof.mjs` kills it; Servex restarts it in about 2 s (`crashes:1`). `GET /api/whisper` reports it; the Dictate row shows one plain line.
- Phone: `phone-proof.mjs` (400 px, touch emulation, typing; `LAN_HOST=10.0.0.135` for the LAN path) shows all stages, no overflow. Four widths 400/1200/1920/3440 have no overflow.

## Review round 1 (fresh Opus, verdict fix) — answers

1. Cards composed in code, not by a model: recorded as a decision with the alternative in `stages/doc/voice-to-page.md`.
2. The phone path was untested, and testing it found a real bug: off localhost the dev socket is off, so the session page loaded once and never streamed. Fixed: `GET /api/voice/stream` (SSE) + `VoiceFlow.follow`. `LAN_HOST=10.0.0.135 node phone-proof.mjs` now loads both pages by the LAN address (Servex calls go to `<origin>/servex`) and shows all five stages at 400 px. The dev proxy in front of the stream is plain http-proxy and was not exercised against a private Servex.
3. Fixed: the "Servex is restarting it" line shows only for launching/restarting/crashed.
4. `owner_note` posted (needs-you, links `ux/Dictate/doc/try-it.md`); landing is last.
5. Not timed: Whisper to raw (no audio file run); Whisper itself is measured in `ux/Dictate/doc/whisper-flow`. Accepted gap.
6. Whisper is Servex's child, so a page reload or a phone reconnect cannot touch it; only the crash restart was exercised.
7. Fixed: partials coalesced to one write per 700 ms (8 partials became 3 lines).
8. Fixed: a late partial is dropped only within 3 s of the final; `failed()` now reaches generated prompt ids.
9. Only the Refine page streams to `/api/voice`; the VS Code app path is not wired (open).
10. Layout: width probes at 400/1200/1920/3440 had no overflow; `layout-check.mjs` itself not run.

## Not proven (and why)

- A real phone over `10.0.0.135`: the live Servex lacks the routes until the restart. Mic needs https (owner's choice, `ux/Dictate/doc/https-lan.md`); typing or the phone keyboard's dictation is the fallback.
- The Whisper restart line in a real browser after a crash (code and API proven).

## Docs

`ux/Dictate/doc/try-it.md` (steps for the phone), `ext/Refine/stages/doc/voice-to-page.md` (design), [loose-ends.md](loose-ends.md) (the 10 `now` rows, checked).

## Decisions and alternatives

- DOM-free `Compose` shared by Servex and the browser (alt: duplicate the text builders).
- Per-prompt page item written through the page tools (alt: a new endpoint writing JSONL; rejected, one writer).
- Verdicts on other tasks are written here, not into their `task.jsonl`.
