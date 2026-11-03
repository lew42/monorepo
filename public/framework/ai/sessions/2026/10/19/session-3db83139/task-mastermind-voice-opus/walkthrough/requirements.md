# One spoken sentence, end to end (a walkthrough note)

Parent: task-mastermind-voice-opus, task dir public/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/

## The owner's words (via the smart assistant, cleaned)
> The last explanation was confusing. Look into how the dictation system works and clarify it with real code snippets and concrete examples: one short walkthrough note following ONE spoken sentence end to end, the real JSON line at each step (the Dictate.js Whisper result, the say() call, the {chat} line in the session file, the poll in Session.js, how Widget.js draws it, a {place} line and what it changes, and the smart assistant's reply line), each step with the file and line number and a 3-line snippet. Compact, with a small diagram if it helps.

## Deliverables
1. `walkthrough/walkthrough.md` in the task dir above. One real sentence from `public/ai/v-timqv56.jsonl` (pick one with a later `place` line and a smart reply; print the lines with a node one-liner, never hand-copy).
2. Steps, in order, each a heading: what happens in one plain sentence, `file:line` as a link (`/framework/ux/Dictate/Dictate.js`), a ≤3-line real snippet, the real JSON line at that step. Steps: Whisper result in the browser (public/framework/ux/Dictate/Dictate.js) → ext/Session say() (public/framework/ext/Session/Session.js) → Servex/agents/Sessions.js say() appends {chat} (and the {quiet}, held-thought release) → the poll: Session.js watch() every 1.5 s → ux/Dictate/chat.js → Widget.js draws the bubble (speak() in ext/Chat/Chat.js, the merge into the last bubble) → the voice assistant's {place} line (what `same` / `card` do in Widget.js place()) → the smart assistant's reply {chat} line. Mention the ✓/? marks (ux/Understand, Widget.js:196) and the separate {refined} line (Sessions.js refine()).
3. A 6-line ASCII diagram at the top. Plain sentences for a new coder; one screen and a half at most.
4. Change no code. Stop when the file is written.

## Budget
Sonnet, under 60k tokens.
