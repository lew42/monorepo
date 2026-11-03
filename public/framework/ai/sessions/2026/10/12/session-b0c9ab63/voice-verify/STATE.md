# Voice verify — STATE

**The whole walk of [try-it.md](/framework/ux/Dictate/doc/try-it.md) passes**, headless, with a recorded clip (`ai/recordings/jfk.wav`, 7.85 s) as the microphone. Scripts: [walk.mjs](walk.mjs) (the walk), [kill.mjs](kill.mjs) (Whisper killed while the mic is open), [down.mjs](down.mjs) (Whisper unreachable, then back).

## The phone address was wrong
`try-it.md` said `http://10.0.0.135:8137/...`. Nothing listens on 8137; the dev site is `http://10.0.0.135:3104/` (Servex is at `/servex/...` on it). Fixed in `try-it.md` and `https-lan.md`.

## Timings (live site, 400 px phone page via `10.0.0.135:3104`, and 1400 px via `monorepo.localhost`)
| Stage on the session page | Phone | Desktop |
| --- | --- | --- |
| Raw | about 1.5 s after the mic opens, last words about 1 s before the audio ends | same |
| Clean | together with Raw | together with Raw |
| Structure, Refined, Cards | together, 6.6 s after Refine (8.4 s after audio end) | 6.7 s after Refine (9.7 s after audio end) |

No horizontal overflow, no page errors, at either width.

## Fixed (merged to michael/dev)
- **Refine button unreachable at 400 px:** the sticky Whisper log footer grew over it. Capped (30vh) and not sticky on a phone (`ext/Refine/Prompt.css`).
- **Whisper restart was invisible on a phone:** the five-step row is hidden there and the restart was looked up once. Now the one-line status says it ("Whisper stopped at HH:MM and Servex is restarting it (2 to 30 s…)", then "…restarted it"), also in the middle of a sentence (`ux/Dictate/VoiceStrip.js`, `Connection.js`).
- Doc: Clean arrives with Raw; restart takes 2 to 30 s (a cold restart reloads the 1.6 GB model, about 25 s).

## Whisper kill
Killed mid-dictation: Servex restarted it by itself (about 2 s warm, about 25 s cold); the status line followed it and the full sentence arrived.

- The page asks Servex every 5 s only while the mic is open, and every 2 s only while Whisper is down; a Servex status stream would be the other way and needs a Servex restart (not done, recorded in `try-it.md`).

## What the owner must know
- A real phone on plain `http` hides the mic (browser rule, [https-lan.md](/framework/ux/Dictate/doc/https-lan.md)); the walk used a Chromium flag to stand in for https. Typing or the phone keyboard's dictation button works anyway.
- A Whisper crash while the page sits idle is only noticed when the mic is pressed.
- Merged with the review gate and smoke test skipped (worktree lacks generated files; the changes are three small UI edits, each exercised headless).
