# voice-to-session-page: state

Landed in branch `voice-session` (worktree), merging into `michael/dev`; one Servex restart makes `/api/voice` and `/api/whisper` live.

## Baseline on michael/dev (before)

`/api/refine` total 6.6 s (clean 3.0, structure 3.6, clarity 2.8, notes 2.6, in parallel). Nothing from the five stages reached the session page (only `prompts.jsonl`).

## After

- Raw words stream to the page about every 150 ms while speaking or typing; clean 3-11 s; structure, subject, refined, cards, notes then done (7-15 s after Refine, Haiku latency varies). Model times are unchanged; the stages now arrive live.
- Whisper: `whisper-proof.mjs` kills it; Servex restarts it in about 2 s (`crashes:1`). `GET /api/whisper` reports it; the Dictate row shows one plain line.
- Phone: `phone-proof.mjs` (400 px, touch emulation, typing) shows all stages, no overflow. Four widths 400/1200/1920/3440 have no overflow.

## Not proven (and why)

- A real phone over `10.0.0.135`: the live Servex lacks the routes until the restart. Mic needs https (owner's choice, `ux/Dictate/doc/https-lan.md`); typing or the phone keyboard's dictation is the fallback.
- The Whisper restart line in a real browser after a crash (code and API proven).

## Docs

`ux/Dictate/doc/try-it.md` (steps for the phone), `ext/Refine/stages/doc/voice-to-page.md` (design), [loose-ends.md](loose-ends.md) (the 10 `now` rows, checked).

## Decisions and alternatives

- DOM-free `Compose` shared by Servex and the browser (alt: duplicate the text builders).
- Per-prompt page item written through the page tools (alt: a new endpoint writing JSONL; rejected, one writer).
- Verdicts on other tasks are written here, not into their `task.jsonl`.
