# Voice Chat: the guiding principles, and where it should head

**What this is.** The owner's direction for Voice Chat: talking to the site (Dictate), Whisper listening, the voice agent working, and Recite reading replies aloud. These are rules that hold however the code changes, plus the direction later work should follow. **The directions are additive:** each new one is added here, and none is dropped without saying so. From the owner's dictation of 2026-11-03, about 13:50 local, verbatim in the VS Code tab's prompt log (session `e00f55c9`). Earlier designs this builds on: [reply-pacing.md](reply-pacing.md), [turn-taking.md](turn-taking.md), [echo-and-turn-taking.md](echo-and-turn-taking.md), [single-voice-assistant.md](single-voice-assistant.md).

## Rules that never bend
1. **Never interrupt the user while they speak.** Read-aloud never starts mid-word. Speech waits for a real pause, measured by the page from audio levels, not guessed by the model. The default is about 1.5 s, and it's configurable.
2. **Never assume the user is looking at the screen.** They may be looking out the window, or have the phone in a pocket. The screen gives as much useful real-time feedback as it can for when they do look. Anything that must be heard has to be said.
3. **The messages list is the one source of truth for the chat.**
   - The scrolling chat area is just `messages.render()`.
   - Everything goes into that list: the owner's sentences, the agent's replies, cards, questions, task references.
   - Every change is a delta on the list (add, set, move), and the UI only reflects its state.
   - Nothing is appended to the chat view outside the list. That way the deltas show exactly what happened and when, and any agent can address any message by id.
4. **A move is one step.** Moving text writes one `move` line (`List.move`). Never a remove followed by an add, which makes the text vanish and come back.
5. **Never split the owner's words.** An agent message that arrives while the owner is talking goes below the owner's current bubble, never into the middle of it. Agent messages queue while the owner talks, the same way the read-aloud queue already does.
6. **Keep the raw words.** Every sentence keeps its raw Whisper text next to its cleaned text. The cleaned version is shown, and tapping a message shows the raw (no "show raw" button).
7. **Where every request came from is recorded.** The path is: raw sentences → the cleaned Prompt → the task → the mastermind. A mastermind that gets a task can read the verbatim words that caused it.

## Top priority: answer the most recent thing first (the owner, 2026-11-03, about 14:15)
- **Order replies by priority, which is relevance, which is mostly recency.**
  - Answer the newest thing first, as directly as possible: a question just asked comes before anything older.
  - Older items aren't dropped. They're worked on silently and come back later, in priority order, one at a time.
- **A queued `say` can go stale.** If the owner keeps talking, a queued `say` may never get its turn.
  - The page tells the agent when it may speak (a "you may speak" cue).
  - The agent can then retract or replace what it had queued, instead of reading out a reply to something said ten minutes ago.
  - Today's read-aloud queue plays oldest first, which is the wrong order after a long dictation.
- **Silent work and spoken words are separate.** Most of the agent's work is silent. It works while the owner talks, on each sentence as it arrives, and never interjects.
- **A noise-free chat.** No messages like "I've passed that along": doing it is the job, and saying so is noise.
  - Results of background work go where they belong (the answer onto its question card).
  - They aren't dumped into the chat while the owner is talking about something else.
  - Everything the agent adds is about what the owner said most recently.
- **Recommend and proceed; don't ask.** Ask the owner only when an action is dangerous, permanent or destructive. Otherwise pick the best option and go.
- **Keep a short ranked list of open items.** It can be the session's own tasks and question cards. When there's a pause, the next best item is next.

## Changing the voice agent's brief is high-risk
- The brief (`Servex/agents/single-voice-assistant.md`) is interpreted, not executed. Too much instruction gets the agent stuck in a rut; too little leaves it lost.
- **Don't add a line just because the owner said something, and don't remove one either.** For each change, write down the risk of adding it and the risk of leaving it out. Then test it on a real or replayed session before it lands.

## Seeing behind the scenes: a log mode (a separate task, after the settings work)
- A setting (with a level) that shows what's happening behind the scenes:
  - Whisper;
  - the thresholds;
  - each tool call, including `nothing`;
  - sends and replies.

  These appear as small, muted lines in the chat, in time order.
- **They are not persisted.** They're added to the messages *view* as temporary rows, not to `session.messages`, which saves every add to disk.
- Off by default.

## How the voice agent works
- **Silent by default, busy the whole time.** It gets every sentence as soon as Whisper ends it: send per sentence is the default. It works through tools without speaking:
  - placing and cleaning the words;
  - titles and cards;
  - filing tasks and passing questions to masterminds;
  - following up on agents that are already running.

  Its job is to show the owner, as fast as possible, what they're saying, put more clearly than they said it.
- **It must have a way to do nothing.** It gets a no-op tool (`nothing`), so it can end a turn without writing filler into the chat ("listening", "no open questions").
- **It speaks only with a `say` tool.** Plain text is not read aloud. A `say` waits for the pause-before-speaking gate (rule 1).
  - After a direct question and a pause, a quick answer is expected, so the wait is short.
  - In a long dictation with no direct question, the wait is longer, about 3 s.
- **No instruction injected with every sentence or every pause.** The rules live in its brief, said once. The same instruction repeated dozens of times pushes a model into a rut: "no open questions", over and over.
- **When it speaks:**
  - As little as possible, and as clearly as possible, most important point first. It lets the owner steer the conversation.
  - One paragraph at a time, so it never gets far ahead of what's been heard: see [reply-pacing.md](reply-pacing.md).
  - After a long stretch of silence, it can run through what was said, newest first or context first, whichever makes more sense.
- **The thinking sound** (three quick beeps is fine as a placeholder) means "an answer should come soon, so I'm not talking". If the agent says "I've asked the mastermind" instead, no beep is needed. Either way it must follow up and deliver the answer.
- **Cleaning stays light.** Fix punctuation (a clear question ends with "?") and obvious mis-hearings; nothing more.
- **Clarity (back burner):** if a sentence makes no sense, wait for a sentence or two more before marking it. Mark only what's clearly out of place, with a small yellow "?" on the raw words. Don't ask questions just because something is half understood; listening is usually best. The old per-sentence clarity check, the HITL API, is off on purpose (one model call per sentence).

## How the owner's words become structure
- **A new sentence goes at the end of the last paragraph by default,** so doing nothing is right most of the time.
- **New topic:** the agent moves that sentence to a new paragraph, or a new bubble, in one move. A few sentences per paragraph is a good hint for when to break.
- **A rough title after a couple of sentences:** a few plain words taken from the text, as context.
- **A prompt that looks like a task** gets an empty checkbox in front of its title. Prompts evolve into tasks:
  - the task is a message in the chat that references it;
  - the sentences and the raw words file into it.
- **Data shape:** each sentence is an object `{raw, clean}` (a plain object is fine). A paragraph refers to its sentences, so there's one extra layer, not copies.

## Cards
- **The agent can put anything the site can show in front of the owner, instantly,** with the item tool:
  - an icon and a title, or a reference to an existing item;
  - any content.

  `add` returns the new id. With that id it can append to the card, rewrite it, or read it back.
- **It can upgrade the owner's messages into cards too.**
- **Look:** the owner's messages are right-aligned bubbles. The agent's text is left-aligned with no wrapper, but its cards may have their own background.

## Questions
- **A question becomes a question card,** in place, nested where it was asked, with a "?" icon.
- **The answer goes on the card.** If the card has scrolled far away, a reference to it appears near the bottom of the chat. The reference has a back-arrow overlay on its icon; tapping it scrolls to the original.
- **A question asked again in the same session** links to the card that's already answered, instead of being answered twice.
- **A mastermind that gets a question** answers it thoroughly, and may add nearby questions to cover the space.
- **Later: questions outlive sessions.**
  - Possible homes: `session.questions`, a module's `questions.jsonl`, and the top FAQ in the module's readme (a short answer plus the question's id).
  - **Objection, written down:** saved answers go stale when the system changes, which is one more thing to update.

## Settings
- **One "Chat settings" panel** (the gear) with its groups named after the code: **Dictate** and **Recite**, in the order things happen: Whisper → sending to the LLM → read-aloud. Interruption is its own group.
- **Every slider says what its ends mean** (what 0 does, what 1 does). For example, "sensitivity" on the interrupt slider must be explained, testable, and consistent.
- **"Send after": a short dropdown of presets with descriptions,** default "each sentence". No compound condition builder.
- **Names stay close to the code.** A setting or status uses the method or class name it controls. The data structure is shown where possible, so the owner can tell what *should* be happening when something breaks.
- **Settings are per session, with class defaults.** The class registers its plugins and defaults once, each session keeps its own. A new session starts on the defaults. "Make default" saves the session's settings as the defaults.
  - **Home:** a `core/Settings` class (`settings.render()` draws the panel; field types; how often it saves).
  - On a Session it's `session.settings` (with `settings.dictate` and `settings.recite`), saved in the session's own `session.jsonl`, so the session loads it by itself.
- **The two toolbars stay,** but the voice picker moves into settings: it takes space and is rarely changed.

## Seeing what's happening
- **A status line next to the mic** shows the current phase or state (listening, sending, the agent working, speaking), named as the code names it, without filling the screen.
- **Maybe:** one Chat widget that owns the area, with Dictate and Recite as plugins that hook in and draw their own parts.

## Echo: the agent's voice heard as the owner's
- Read-aloud often interrupts itself, because the mic hears it as the owner.
- **Ideas:**
  - tell the voices apart: WhisperX diarization, or a simple pitch check (the read-aloud voice is female, the owner's voice is deeper);
  - use a different interrupt threshold while read-aloud plays.
- Whisper's own words can't tell the two voices apart, so they're no help here.

## The team around a voice session
- **Every new voice session gets a voice-system mastermind,** spawned with it.
  - The voice agent's brief names it by id.
  - It tails the session log, rather than getting every sentence, and studies and improves the whole system.
- **The best hand-off is a well-made task:** the full prompt and raw words go in, and the work is handed over by task id.

## Open questions
- **Can a web page keep a voice session running on a locked phone, or as an installed PWA?**
- **The docs:** every connected module (Dictate, Whisper, Recite, Chat V3, Servex Sessions) should link to each other. That way an agent working on one loads the others. Maybe one Voice Chat class or readme ties them together.
