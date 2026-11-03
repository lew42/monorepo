# Streamed input: what Chat does today, and what it would take

![Today: the words wait in the box until it sends](shots/phone-before.png)

## Today: your words wait in the box

While you talk, Whisper's growing guess is written into the text box only (`ext/Chat/Mic.js`).

The box sends by itself at a pause: 2.5 s of quiet after a sentence, or 2.5 s of silence.

Only then does your line land in the chat, and only then do the assistants hear it.

## What streaming would take (not built here)

1. **The line shape already exists.** A chat line with the same `at` and `fix: true` replaces earlier words in place (`Chat.js`, `chat_line()`).
2. **Mic.js** would post a draft line as soon as there are words, then `fix` lines as the guess grows, and clear the box.
3. **Servex** would need a `draft` verb that writes the line without waking the assistants. Only the final line (today's `say`) wakes them.

About one task: Mic.js, one Servex verb, a restart, and a proof that no draft wakes an agent.

Note: the dictation-stream task (merged 2026-09-30) now streams the assistants' replies live and draws your words in a live bubble while you speak; this report predates it.
