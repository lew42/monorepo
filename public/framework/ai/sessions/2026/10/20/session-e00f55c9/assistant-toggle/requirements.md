# Dictation settings: a "One assistant / Two assistants" switch (you are a mastermind, on Sonnet, medium effort)

**The owner (2026-11-02):** "a setting in the dictation settings… switching a setting for single versus dual agent mode." The single voice assistant is built and merged (726960503), but today it can only be turned on in a file or with `POST /api/session/settings`. The owner is on a phone, so it needs a control.

## Build
- **One row in the gear panel**, `ComposerMic.settings_panel()` in `ext/Chat/Mic.js` (doc: `ux/Dictate/doc/settings.md`). It's a two-choice control: **One assistant** or **Two assistants (fast + smart)**. Default: whatever Servex's boot word is (`GET /api/session/settings` if it reports one; otherwise show "Default").
- **On change,** it POSTs `{session, assistant: "single" | "voice" | null}` to `/api/session/settings`, the same way the panel already posts the batch seconds. Read `Servex/agents/Sessions.js` for the route and the session id the panel already has.
- **Show which one is live:** one small line under the control, read from the server, not from localStorage.
- **Two lines in docs:** in `ux/Dictate/doc/settings.md` and `ux/Dictate/doc/single-voice-assistant.md` ("Turning it on").

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
- **Extend `node ux/Dictate/test/settings.mjs <base-url>`:** choosing One assistant reaches `/api/session/settings` with `assistant: "single"`, and the choice holds across a reload. Never run it against the live Servex with a real session; use a made-up session id.
- **A shot at 360×740** of the open panel, in this folder.

**Fences:** only `ext/Chat/Mic.js`, the settings test and the two docs; if the route needs a change, add a GET only. Commit by path; no `python -`. **Budget:** about $3. If you're stuck after two honest tries, say so. Report to vscode-mastermind in 3 lines (it reaches the tab's inbox even if a tool says otherwise), then complete your own task and stop.
