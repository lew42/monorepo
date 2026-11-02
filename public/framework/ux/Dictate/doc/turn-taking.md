# Turn-taking: when the AI shows and speaks a reply (design notes, not built)

These are the owner's design notes from 2026-11-01, 20:55, relayed by the web voice session `v-u48msei`. Nothing here is decided or built yet. The rules being built tonight (a reply queues behind the one being read, waits for quiet, stops when the owner speaks) are in `mastermind-read-aloud-next`'s brief: `ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/owner-notes-2026-11-01-2040.md`, items 11–12.

## The four ideas

1. **Turn-taking changes with the conversation; it isn't one rule.** It needs a flow chart of modes.
   - **The default:** a reply that arrives on its own time is simply added to the chat.
   - **While the owner is talking,** even showing a new reply is held back: "it's rude to throw one at them."
   - **The wait before replying must be short.** 1–2 s is too slow for a quick back-and-forth.
   - **A question's rising tone at the end** makes the end of a turn obvious. A pause in the middle of a long dictation does not end the turn.
2. **The smart seat should start working while the owner talks.** Today its batches come after a pause of about 2–3 s or 6 sentences, so a long dictation arrives in big chunks.
   - **The ask:** send each sentence live, so the smart seat works in the background.
   - **That brings back the fast-and-smart split:** the smart seat does the digging, and the fast seat answers at once from what it finds. See [fast-and-smart.md](fast-and-smart.md).
3. **Paced streaming.** Don't generate a whole reply and then speak it. Show the text word by word, about in step with the voice and slightly ahead of it, so each word appears just before it's spoken.
4. **Heard-only context** (a special mode that may cost more tokens).
   - Track exactly which word was last read aloud: the page sends it to the session when the owner interrupts or a reply finishes.
   - For the next turn, remove the unspoken rest of the previous reply from the model's context, and mark that reply as interrupted.
   - So the model never assumes the owner heard something they didn't, and it can raise the point again later.
   - This may need only an SDK script, not a second agent.

## Cheapest to try first (the tab's recommendation)

1. **Per-sentence wake for the smart seat (idea 2).** The knobs already exist: the smart assistant's batch seconds and sentences, in [settings.md](settings.md) and [wake-policy.md](wake-policy.md). Lowering the defaults to 1 sentence and about 0.8 s is a settings change plus one test. It also fixes the "big chunks" lag.
2. **A short wait after a question (idea 1, the cheap version).** A rising tone shows up in Whisper's text as a "?". Use a short wait (about 0.5 s) after a "?" and a longer one (about 2 s) after other pauses. Real pitch detection can come later, if the "?" signal isn't enough.
3. **Hold the display of new replies while the owner talks (idea 1).** UI only: the same "owner is speaking" signal the turn-taking change already needs.
4. **Heard-only context (idea 4).** Moderate. Recite already knows the word it's on (the karaoke highlight), so the page appends one `{heard: {re, upto}}` line. The smart seat's next prompt then cuts the reply at `upto` and marks it interrupted.
5. **Paced streaming (idea 3).** This is the karaoke follow plus phrase-level streaming, already queued in read-aloud-next. It's the largest of the five, so it goes last.
