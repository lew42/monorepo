# Dictation: one map, one engine, one cleaner, every link right

Budget: $10. Opus, medium effort. Parent: `vscode-mastermind`, who tails your `session.jsonl`: log with the `log` tool. Own worktree; commit each step; `node Server/merge.mjs`; no Servex or dev-server restart. **Class map first, shown on a page, then build** (CLAUDE.md: design the class architecture before you build). Moves and renames are scripted (`git mv`, manifest, dry run). Never delete: move aside.

## The owner (2026-10-20, 21:55)

"Where our dictation system is, it's not clear to me. What lives where?" The Dictate page's "Whisper: raw text" tile links to `audio/Transcriber`, not the Whisper class; how Transcriber differs from Whisper is unexplained; the audio page did not link Whisper; `ux/Revise` exists and the owner never asked for it and does not know what it does. "I don't really care where they go, but we need to make sure it makes sense." "How do we have so many things unclear and mislinked?"

## Found (verify, then use)

- **Two Whisper engines.** `ux/Dictate/Dictate.js` talks to whisper-server itself (`fetch_timeout`, `whisper_url`). `audio/Transcriber/Whisper.js` (`Transcriber.Whisper`) is a second streaming engine that copied Dictate's code because a past brief made Dictate "read-only for this task". Transcriber is imported only by demo and audit pages, never by a real surface.
- **Two cleaners.** `ux/Revise` (2026-09-29 audio task: "the AI step of dictation", text in, revised text out) and `ext/Refine` (`Cleaner.js`, `RefineSystem`, the cleaner page lists Revise as one of its callers).
- **The chat is split.** The one chat box is `ux/Dictate/chat.js` + `Widget.js`; the composer and its mic are `ext/Chat/Composer.js` + `Mic.js`; the phone sheet is `ext/drawer/rail.js`; the voice session is `ext/Session`; Whisper is `audio/Whisper`.
- Wrong link: `ux/Dictate/page.js:34` sends "Whisper" to `/framework/audio/Transcriber/`.

## Do

1. **The map page** (`ux/Dictate/doc/map.md`, shown on the Dictate page's first screen as a diagram plus one line per piece): every class in the chain mic → whisper-server → text → clean → chat → session → assistants, its folder, its one job, who calls it. Mark each piece used by a real surface or demo-only.
2. **Decide, one decision each** (`node Server/Decide.mjs`, options ranked, alternative named): one Whisper engine (Dictate's, with Transcriber folded into it or moved aside); one cleaner (Revise or Refine's Cleaner, the other becomes a pointer or moves aside); where the chat lives (one module). The owner does not care which folder wins, only that one thing has one home and one name.
3. **Fix every link and label** on the Dictate, audio, Whisper, Transcriber, Revise, Refine and Chat pages and readmes so each points at the thing it names. A module that is demo-only or retired says so in its first line and links its replacement.
4. Apply the decisions you can apply safely in this task (scripted moves, every importer updated, pages checked at 400 and 1200). Anything bigger: a next-step brief beside this one.
5. **Why it happened**, one paragraph in `ux/Dictate/doc/map.md`: briefs that fenced files off and so caused copies; new modules built without reading the existing ones. And one line proposed for the `sub-mastermind` or `new-task` skill to prevent it (proposal only; write it to `skill-proposal.md` here).

## Done when

- [ ] The map is on the Dictate page, and every piece in it is one click from it.
- [ ] Every link above points at what it names; no dead or misleading tile.
- [ ] Decisions logged; safe consolidations merged; `finish-task`, one screen, check marks.
