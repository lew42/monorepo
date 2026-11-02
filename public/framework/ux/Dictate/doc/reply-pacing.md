# Reply pacing: one paragraph at a time, shown, then read (the owner's design, 2026-11-02)

**What this is.** How Voice Chat's assistant should reply: in small pieces, shown and read one at a time, so a reply is never a wall of text that nobody reads. This is the owner's design from a dictation at about 16:30 (verbatim in the tab's prompt log). It isn't built yet. The single voice assistant's build ([its brief](/framework/ai/sessions/2026/10/20/session-e00f55c9/single-voice-assistant/requirements.md)) carries the instructions part; the read-aloud mechanics are a follow-up.

## Silent first
- **Often no reply is needed.** The assistant upgrades the owner's words into cards, files the task and fixes the text, and that shows it heard and understood. Reading aloud is optional: it's for the car, or walking with the phone in a pocket.
- **The best moment to speak:** the owner asks a question, then pauses.

## Small replies, a paragraph at a time
- **The first paragraph is the most immediately helpful thing to say.** Then a follow-up paragraph comes only if it's needed.
- **The assistant generates one paragraph at a time,** not a whole multi-paragraph answer. That saves output tokens, and nothing goes unread.
- **Each paragraph is shown whole, then read aloud.** A shown paragraph never disappears.
- **The next one is prepared about halfway through reading the current one,** so there's no dead gap. Then there's a pause of about 1 s between paragraphs, so the owner can cut in, ask, or keep listening.
- **After each read-aloud, the assistant gets one more turn.** It may update a card, file a task, ask a follow-up ("Would you like me to launch this?", with a Launch button), or do nothing.

## What is read and what is only shown
- **The title isn't read.** It's a visual anchor, and it usually repeats the first sentence.
- **A question being answered isn't read back.** Its own card shows it.
- **An answer goes on the question's own card:** the owner's prompt becomes a question card, and the answer is added to it (V1 already does something like this). No duplicate quote of the question.
- **An optional mode:** words appear as they're read, a little ahead of the voice, instead of lighting up words already on screen.

## Conversation mode
- **When read-aloud is on, assume hands-free.**
  - Replies get shorter and on demand: a spoken menu of directions to go in.
  - No tables, and nothing that only works on screen.
  - The spoken text and the shown text can differ.
- **The conversational instructions need tuning by testing.** Keep them short; find the best wording rather than adding rules.

## Questions, kept and reused (later)
- **Once a question is phrased and answered, file it where it belongs:** `<module>/questions/questions.jsonl`, with the chat holding a Ref to it.
- **When the same question comes again,** look it up first and link to the existing answer.

## Who improves this system
- **A voice-system mastermind.** It's spawned on demand by the voice assistant, probably on Opus. It knows how Voice Chat works (its modules and this role) and fixes and improves the system, spawning helpers of its own.
- **The quick assistant (Sonnet) doesn't edit its own system;** it hands that to the voice-system mastermind.
