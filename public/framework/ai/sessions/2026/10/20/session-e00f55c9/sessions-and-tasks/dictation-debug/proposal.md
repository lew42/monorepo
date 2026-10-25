# Chat: the proposal for every ask so far

**Planning mode.** The owner set this in voice session v-sq8y7db on 2026-10-25: nothing is built or merged until the owner okays this proposal. One build is paused at commit `c3069554b` on its own branch, and nothing from it is live. Each of the four steps below is a process task whose first step waits for that okay, so nothing starts on its own.

## The shape

```js
// ✅ exists today · ⬜ to build · "by" = who writes it

class Session extends Task {          // ⬜ one instance per chat, held by Servex (today: plain data in Sessions)
  file          // session.jsonl: one log, Servex is its only writer
  prompts       // Prompt[], in the order they were said
  views         // ["stream", "threads", "structure"]: one reader, many looks
  live          // the Prompt being spoken now; drawn last, on screen only
}

class Prompt extends Task {           // ✅ core/Task/Prompt.js: one per thought
  raw           // string[]  by mic      the words as heard, never lost
  paragraphs    // Paragraph[] by fast   placement only
  title, text   // by smart              the refined heading and short summary
  tasks         // Task | Question, by smart
  replies       // Reply[], by smart
}

class Paragraph extends Item {        // ✅ core/Task/Prompt.js
  sentences     // Sentence[]; a new Paragraph = send the last one to smart
}

class Sentence {                      // ✅ computed from Paragraph.text
  id, text
  flag          // ⬜ "?" when a word looks wrong (whisper "Mars" for "smart")
}

class Task extends Item {             // ✅ core/Task/Task.js
  title, state  // idle → running → complete
  by            // ⬜ shown: fast or smart mark
}

class Question extends Task {         // ✅ core/Task/Question.js
  text, answer
}

class Reply extends Item {            // ✅ inside Prompt.replies
  text
  anchor        // { sentence }: drawn under it, never between your lines
}

class View {                          // ⬜ one reader of Session, many styles
  draw(session) // Stream | Threads | Structure, chosen in a dropdown
}

// fast  (voice assistant): every sentence → place it: same Paragraph | new Paragraph. Nothing else.
// smart (session-smart):   tails the file; on a new Paragraph → title, text, tasks, replies on that Prompt.
//                          Hands-free: work goes to the mastermind.
```

## Fixed now (allowed in planning mode)

- **A completed task now shows checked in Chat v2.** The test task "show the life cycle" was completed in the file, but Chat v2 still drew it unchecked. Chat v2 stored the change on the Prompt instead of passing it to the task inside it (`ext/Chat/v2/ChatV2Model.js`, `edit`). The fix is two lines; it is being reviewed, then merged.

## How a card is made today

1. **Your words arrive** and become one **Prompt** item in the session file, holding the raw text (written by "fast").
2. **The fast assistant** (the voice assistant) places each sentence into a paragraph of that Prompt.
3. **The smart assistant** writes a title and a short summary onto the same Prompt, and adds tasks or Questions under it.
4. **Chat v2 draws** the title and summary as the card, with the raw text behind "show raw".

All 31 cards in v-sq8y7db are written as `"type":"Prompt"`, and `core/Task/Prompt.js` is the class for them. **But Chat v2 does not use that class:** it reads the file with its own copy of the logic, and that copy is where the checkbox bug came from. Step 4 makes Chat v2 read real Prompt objects, so there is one reader.

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
   - ⬜ Raw transcription on screen in real time in Chat v2 (priority), added seamlessly at the end of the current paragraph, in place. Where to draw it: the mic's live draft (`ext/Chat/Mic.js:206`), shown raw under the last line until the real line arrives.
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
   - ⬜ Chat v2 reads real Prompt objects (`core/Task/Prompt.js`), not its own copy
   - ⬜ A standing "dictation tasks" group with subtasks: anything you say may add a task under it; blocks can be given a name
   - ⬜ One reader, the dropdown, the Structure view, the live paragraph last, no walls of text
   - ⬜ A small yellow "?" on a word that looks wrong (Whisper wrote "Mars" for "smart"), so the AI does not take it as meant. Suggested from the word's confidence.
   - ⬜ The clarity mark with its two readings beside the "?"

Steps 2 and 3 are safe to land alone. Steps 1 and 4 change Servex, which needs a restart outside a voice call. Total: about $31.

## Ideas recorded, not designed

- **Moving a card shows where it went.** A dimmed copy with an arrow stays where the card was and scrolls to its new place; the moved card gets a back arrow. The owner isn't sure yet.
