# Chat: the proposal for every ask so far

**Planning mode.** The owner set this in voice session v-sq8y7db on 2026-10-25: nothing is built or merged until the owner okays this proposal. One build is paused at commit `c3069554b` on its own branch, and nothing from it is live. Each of the four steps below is a process task whose first step waits for that okay, so nothing starts on its own.

## The shape: two assistants, one session, many looks

- **The fast assistant does only a strict first pass.** As each sentence ends, it places the sentence: in the last paragraph, or in a new one. Nothing more.
- **The smart assistant tails the session file and refines.** As sentences arrive it writes the heading and the breakdown. A new paragraph is its cue to act on a batch.
- **One Prompt per thought.** A thought is not a loose run of transcription. It is one Prompt item holding the raw text as sentences, plus its refined form (heading and breakdown).
- **You can see who did what.** Each item carries a small mark for the assistant that made it (fast or smart), like the brain icons beside tasks.
- **The session lives on the server.** Servex holds each chat session and is the only thing that writes its file.
- **Many looks over one file, through one reader.** A dropdown picks how to draw it: **Stream** (the first view), **Threads** (Chat v2) and **Structure** (the item tree).
- **Your live paragraph stays at the bottom.** When a reply arrives while you are still talking, your paragraph moves below it. This happens on screen only; the file keeps its order.
- **The smart assistant stays hands-free.** It passes work through to the mastermind, which decides and builds.

## What happens today (from the code)

- **The mic icon** means a line was spoken; "typed" means it was typed (`ext/Chat/Chat.js:46`).
- **The green check is the clarity mark, and it is still live.** A model reads each line: ✓ when it is clear, ? when it isn't (`Servex/agents/Hitl.js:16`, drawn at `Chat.js:108`). For an unclear line it also suggests two readings, but nothing shows them.
- **The fast assistant waits for a pause.** Lines are held until you are quiet for 2.5 s (or the mic goes off, you type, or 8 s pass). That is the "Sends when you pause" flicker you saw (`Sessions.js:246`, `:984`).
- **The smart assistant is woken by fixed rules:** a 12 s pause, a line ending in "?", its name, or 6 sentences (`WakePolicy.js:1`).
- **One `Sessions` object holds every session,** and each session is plain data (`Sessions.js:227`, `:798`).
- **A completion system exists** ([completion.md](/framework/core/Task/doc/completion.md)): it flags open tasks nobody works on and counts a session's tasks. It is not yet making v-sq8y7db's tasks finish (about 4%: 1 of 26).

## The four steps, highest priority first

1. **Tasks get done** (about $5, HIGH) · [brief](task-completion/requirements.md) · [process](chat-tasks-get-done/)
   - ⬜ Measure v-sq8y7db: each task's state, owner, and why it is open
   - ⬜ Every task made in a session gets an owner when it is made; the session shows "N of M done"
   - ⬜ Time from a spoken ask to its task on screen; tasks appear live, without a pause
2. **See your words live and know when they are sent** (about $7; part built, paused) · [brief](chat-sent/requirements.md) · [process](chat-see-your-words-live-and-know-when-t/)
   - ✅ Sent marks, built but unproven · ✅ "↓" newest button · ✅ light mic background
   - ⬜ Raw transcription on screen in real time in Chat v2 (priority)
   - ⬜ No flash on send: raw words show live, then settle into the cleaned sentences in place; the raw stays behind "show raw". Which component does the swap is being checked.
   - ⬜ A clearer send moment than the "Sends when you pause" flicker
   - ⬜ Find why a long pause once did not send · ⬜ stop losing lines on a refresh
   - ⬜ Prove scroll lock in both views · ⬜ Questions under their Prompt · ⬜ the "chat" readme lines
3. **Polish** (about $5) · [brief](v2-speed/requirements.md) · [process](chat-polish/)
   - ⬜ Chat v2 replies as fast as the first view
   - ⬜ Padding below the last task in Chat v2 · cards get a background (white) · "show raw" sits tight to its card
   - ⬜ "Cleaned paragraphs" are really sentences: show real paragraphs, or label them right
   - ⬜ A plain task-state label · settings with a one-line hint each · wider bubbles and code blocks
4. **One session, one view** (a plan the owner sees first, about $2, then about $12) · [brief](one-chat-view/requirements.md) · [process](chat-one-session-one-view/)
   - ⬜ The shape above: first pass on the server, smart refinement, one Prompt per thought, who-did-what marks
   - ⬜ One reader, the dropdown, the Structure view, the live paragraph last, no walls of text
   - ⬜ A small yellow "?" on a word that looks wrong (Whisper wrote "Mars" for "smart"), so the AI does not take it as meant. Suggested from the word's confidence.
   - ⬜ The clarity mark with its two readings beside the "?"

Steps 2 and 3 are safe to land alone. Steps 1 and 4 change Servex, which needs a restart outside a voice call. Total: about $31.

## Ideas recorded, not designed

- **Moving a card shows where it went.** A dimmed copy with an arrow stays where the card was and scrolls to its new place; the moved card gets a back arrow. The owner isn't sure yet.
