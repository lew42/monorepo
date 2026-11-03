# Brief: step 6, the status line beside the mic

Budget: $4. Load the `minion` skill first. Worktree `C:/Code/lew42/worktrees/chat-settings-status` (branch `worktree/chat-settings-status`, from michael/dev at 3b3d52258). Owner's words: [requirements.md](requirements.md) and [plan.md](plan.md) "Step 6": "a status line beside the mic showing the phase named as the code names it (listening, sending, agent working, speaking)". Read first: `ux/Dictate/doc/settings.md`, `ux/Dictate/readme.md`, `ext/Chat/doc/floor.md`, `audio/Recite/readme.md`. Tests first; commit by exact path; before each commit restore sweep-modified `files.jsonl` files (`git checkout -- <paths>`); never stash, never touch CLAUDE.md, never write the owner's name; a hand write to a `.jsonl` goes through `node .claude/hooks/append.mjs <file> <lines.json>`.

## What to build

ONE small line of text beside the mic button, phone first (360 wide, it must not push the composer wider; it may truncate with an ellipsis). It shows ONE phase, the first that is true, in this order:

1. `speaking` — Recite is reading aloud (`audio/Recite/Recite.js` `state` is "playing"/"loading", see `bubble_state()` ~l.625 and `speaking()` ~l.174).
2. `agent working` — the owner's line landed on the wire and no reply has started: `Recite.cue_pending` (Recite.js ~l.52, set at ~l.295/303; cleared when the reply starts). Also true while a `stream` event is arriving (`Session.stream` in `ux/Dictate/chat.js` ~l.423: `ev.kind === "stream"`) until its line lands — only if cue_pending alone leaves a visible gap; say which you used.
3. `sending` — a prompt was posted and has not yet landed on the wire (`post_prompt()` in `ux/Dictate/Dictate.js`/`chat.js` ~l.225, `floor.stamp(entry)`); short-lived.
4. `listening` — the mic is on (`floor.owner` is set, `ux/Dictate/floor.js`) .
5. nothing (an empty line, no placeholder text) otherwise.

Names are exactly those words (`listening`, `sending`, `agent working`, `speaking`), small muted type, `aria-live="polite"`. Never a new copy of state: read the three existing sources (mic via `floor`, Recite, the wire/post path). Where a source has no event to listen to, add the smallest emit at the source (one `emit("change")`-style line, or a plain callback list) and subscribe; do not poll with `setInterval` (CLAUDE.md "Stream, don't poll"). Put the logic in ONE small class `ux/Dictate/ChatStatus.js` (`phase()` returns the word or `""`, `subscribe(fn)`; sources handed in by `chat.js`, no imports from `ux/` into `ext/Chat` or `audio/`), and the line itself in the composer area via a hook the same way the gear panel was handed in (`mic.chat_status` or similar, drawn by `ext/Chat/Composer.js` beside the mic button, `ext/Chat` imports nothing from `ux/`).

## Deliverables (each checked by a test or a shot)

1. `ChatStatus.test.mjs` (node, plain-object sources): each of the four words appears in the order above; two true at once shows the higher one; all false = `""`; `subscribe` fires on a change only (no repeats of the same word).
2. The line draws beside the mic in the composer on the chat page, updates live in a headless browser run (drive the sources by calling the real source functions, not by poking the text), at 360x740 and 1920. Shots in your task dir; read them yourself: no overflow at 360, the word is legible.
3. Docs (laws 9, 10): a short "Status line" section in `ux/Dictate/doc/settings.md` or `ux/Dictate/readme.md` (what it shows, the order, where each phase is read from, the file), one index line in `ux/Dictate/readme.md`; plan.md Status line for step 6.

## Check and report

Tests green: the new one, `VoiceChat.test.mjs`, `ChatSettings.test.mjs`, `ChatDefaults.test.mjs`, `audio/Recite` node tests that run. `node --check` every changed .js. `git status` clean, committed. Report ONE message: commit hash, test counts, what each shot shows, what is left (e.g. a phase with no clean source).
