# Dictate: does transcription work right now, on the phone and the desktop sidebar?

Budget: $12. Load the `sub-mastermind` and `page` skills first. The owner's raw words: `../requirements-2.md`, ask 7 ("check into the whole transcribe thing. It should be working. It was sort of working… I'll go try it right now"). The owner is trying it NOW on an Android phone at the LAN address, so this task is urgent and starts with proof, not building. Your log is this dir's `task.jsonl`.

## What exists (read these first, in order)

`public/framework/ux/Dictate/readme.md`, then `doc/handover.md`, `doc/asks.md`, `doc/decisions.md`, `doc/try-it.md` (the phone voice walk; a headless run passed on 10-12, see `ai/2026-10-12/voice-verify/STATE.md`). The mobile sheet, the desktop sidebar tabs and the whisper stream are described there. Servex supervises `whisper-server` (`list_servers`, `server_logs`).

## Deliverable

1. **Prove it works (30 min):** whisper-server up (`list_servers`); the headless voice walk from try-it.md passes again today on current `michael/dev` (log the command and the result); then a Playwright run at phone width (400) that opens the sheet, presses transcribe, feeds the test audio and sees text arrive, with a screenshot in this task dir. Anything that fails is the first thing you fix, in a worktree, smoke-tested, merged with `merge.mjs`.
2. **Watch the live session:** the owner's own attempt lands in the Dictate logs (`ux/Dictate/doc/handover.md` says where; the session store under `public/framework/ai/sessions/2026/10/13/`). If their attempt shows an error, fix that first and post what you found on your card.
3. **Same UI on phone and desktop:** the owner's design: on mobile a small sheet holding only the transcribe button and the text area, resizable; expanded, it becomes the whole sidebar with the chat and the tabs (AI, sessions, ...) the desktop sidebar has. Record how far today's code is from that in `ux/Dictate/doc/asks.md` (the existing asks file; append a dated section, do not rewrite): what is one component already, what is two, and the smallest change that makes the sheet the sidebar's collapsed form. Build that smallest change only if it is one afternoon of Sonnet work and the proofs in 1 pass; otherwise write it as the next brief in `doc/next.md`.
4. **New session:** does the Dictate app have a "new session" control, and where do its sessions go? One paragraph in asks.md with the link; fix if trivial.
5. Report on your card: works / does not, with the screenshot and the proof command; what you fixed; what is next. Keep the card to one screen.

Fence: `public/framework/ux/Dictate/**`, this task dir. Never restart Servex or the owner's dev server (:8137 is the phone's); never drive the owner's live tabs (headless only, `ui-test` skill).
