# The owner's feedback, part 2 (2026-11-03, about 13:50 local, relayed by vscode-mastermind)

**Read [ux/Dictate/doc/principles.md](/framework/ux/Dictate/doc/principles.md) first.** It holds the owner's direction from this dictation. Below are the build asks that fall to you. Plugins, the settings system and the panel belong to `mastermind-chat-settings`. Verbatim words: the VS Code tab's prompt log, session `e00f55c9`.

## A correction first
- **Don't build the batching.** vscode-mastermind decided "send at the pause", and the owner reversed it:
  - keep **one sentence per send** as the default;
  - "send after" becomes a dropdown of presets in settings (chat-settings builds it);
  - the agent does useful silent work on each sentence.
- **Remove what made it repeat:** cut the instruction Servex injects with every pause (`(pause: reply now only if a question is open)`) and every sentence, down to bare tags. The rules stay in the brief.

## Asks, in priority order (file each as a task; tick only with proof)
1. **Tasks via the item tool, top priority.**
   - The voice agent files tasks on the session with `item`.
   - Each task appears in the chat as a message that references it.
   - Each task carries `from: {prompt, sentence}` and the raw words.
   - The task is handed off by id (`spawn_agent task: {from, id}`).
   - **Check:** the mastermind that gets it can read the verbatim words.
2. **Two tools: `nothing` and `say`.**
   - `nothing` ends a turn with no chat output.
   - `say` is the only way to be read aloud; plain text is not spoken.
   - The page gates a `say` until the owner has paused (about 1.5 s by default, configurable). After a direct question the wait is short; in a long dictation with no question it's about 3 s.
   - This replaces the pause cue's "reply now" prompt.
3. **Cards of any kind, by id.**
   - `item` adds a card with an icon and a title, or a ref to an existing item, plus any content.
   - It gets the id back, then appends to the card, rewrites it, or reads it.
   - It can upgrade the owner's messages into cards.
   - The owner asked for a card this morning and got "undefined": that request must work.
4. **The messages list is the only truth.** Confirm that nothing reaches the chat view outside `session.messages`. If something does, fix it.
5. **Never split the owner's bubble.**
   - An agent message that arrives mid-dictation goes below the owner's current bubble, never inside it.
   - Agent messages queue while the owner talks.
   - The owner also saw messages out of order a few times: find out why.
6. **Placement:**
   - A new sentence goes at the end of the last paragraph by default.
   - On a new topic, move it to a new paragraph in one step (with the move fix you already found).
   - A rough title after a couple of sentences.
   - A task-like prompt gets an empty checkbox before its title.
   - Sentences are `{raw, clean}`, and paragraphs refer to them.
7. **Question cards:**
   - A question becomes a question card in place, its punctuation fixed.
   - The answer goes on the card.
   - A far-off answered card is resurfaced as a reference with a back arrow.
   - A repeated question links to its existing card.
8. **A voice-system mastermind spawned with every voice session.**
   - The voice agent's brief gets its id.
   - It tails the session log; it doesn't get every sentence.
9. **Tap a message to see its raw words** (already approved).
10. **The thinking sound:** three quick beeps for now. No beep when the agent has said "I've asked the mastermind", but it must then deliver the answer.

## To research (Haiku; write findings, don't build)
- **Telling the read-aloud voice from the owner's:**
  - WhisperX diarization;
  - a simple pitch check (the read-aloud voice is female, the owner's is deeper);
  - a different interrupt threshold while read-aloud plays.
- **Whether a voice session survives a locked phone, or an installed PWA.**

## Report to vscode-mastermind
Two lines per merge.
