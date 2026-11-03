# Dictation: a thorough map of every piece, and a plan. PLANNING ONLY: no code, no moves, no merges of code.

Budget: $8. Opus, medium effort. Parent: `vscode-mastermind`, who tails your `session.jsonl`: log with the `log` tool. **You change no code and move nothing.** You write one doc, a few screenshots, and decision proposals. The owner approves before anything is built.

## The owner (2026-10-20, 22:05)

"Focus on the dictation system alone. We need a thorough map of where every little piece is: ext/Refine, ext/Revise (it is `ux/Revise`), things in ux, things in Dictate, audio, Whisper, all over the place. All need to be mapped and organized. We need to plan. Stay in planning mode; we're racing ahead and building garbage." Earlier tonight: the Dictate page's "Whisper" tile links to `audio/Transcriber`; how Transcriber differs from Whisper is unexplained; the owner never asked for `ux/Revise` and does not know what it does; ext/Chat's role is unclear; "I don't care where they go, but it must make sense."

## Leads (verify each; do not trust them)

- Two Whisper engines: `ux/Dictate/Dictate.js` calls whisper-server itself; `audio/Transcriber/Whisper.js` copied that code ("that file is read-only for this task") and is used only by demo and audit pages.
- Two cleaners: `ux/Revise` (2026-09-29) and `ext/Refine` (`Cleaner.js`, `RefineSystem`; its cleaner page lists Revise as a caller).
- The chat is split: `ux/Dictate/chat.js` + `Widget.js` (the one chat box), `ext/Chat/Composer.js` + `Mic.js` (composer and mic), `ext/drawer/rail.js` + `Sheet.js` (the phone sheet), `ext/Session` (one ✦ press = a voice session; Servex spawns `voice-assistant` and `session-smart`, two assistants where the owner asked for one: `Servex/agents/Sessions.js`).
- Also look in: `audio/` (MicStream, Recorder), `ext/Mic`, `ux/Dictate/` subfolders (`v1`, `variants`, `playground`, `surfaces`, `workspace`, `ai`), `ai/rail`, `dev/DevBar/ask.js`, `Server/plugins/Whisper.js`, `Servex/agents/Assistant.js`, `Servex/ext/refine/`, `core/Page/card/log/whisper/`.

## Deliverable: `ux/Dictate/doc/map.md`, linked from the first line of `ux/Dictate/readme.md` (that one-line link is your only edit outside the doc and your task folder)

1. **Every piece**, one row each: folder, file, class, its one job in plain words, who imports it (grep, with counts), whether a real surface uses it or only a demo, last commit date. Nothing left out: if it touches mic, audio, Whisper, transcript, cleaning, chat, voice session or the assistants, it is in the table.
2. **The chain as a diagram**: mic → whisper-server → raw text → clean → chat box → voice session → assistant(s) → reply on screen, each arrow naming the class that does it.
3. **Duplicates and dead ends**: every place two things do one job, every page that links the wrong thing, every demo-only module, with the proof (file:line).
4. **The proposed organization**: for each duplicate, two or three options ranked, the alternative named, and what it would take (files touched, importers to update). The one-assistant merge is one of them. Written as proposals for the owner to approve, with `node Server/Decide.mjs`; nothing applied.
5. **Screenshots** at 400 and 1920 of the Dictate, Refine, Revise, Chat, audio, Whisper and Transcriber pages as they are now, in your task folder, linked from the map, one line each on what a newcomer would understand from it.
6. **Why it got this way**, one short paragraph with the evidence, and one proposed skill line to prevent it (write it in `skill-proposal.md` here; do not edit the skill).

## Done when

- [ ] `map.md` exists, is linked from the Dictate readme, and a newcomer can find any dictation piece from it in one click.
- [ ] Every duplicate has ranked options; nothing was built or moved.
- [ ] Committed (docs and shots only); `finish-task` in your own `session.jsonl`, one screen.
