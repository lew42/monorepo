# Voice chat UI on "/": why the text jumps (read-only investigation)

Load the `minion` skill first. Parent: task-mastermind-voice-opus, task dir public/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/

## The owner's words (via the voice assistant, cleaned)
> (1) Text jumps around; the font switches from Montserrat to a monospace/typewriter font, probably during streaming vs final render. (2) Paragraphs appear inside each chat bubble, and there are also multiple bubbles per reply; the last group got a headline, and my latest message seemed to chop the last paragraph bubble in half. (3) "Our deltas might not be applied properly." It's not completely broken like before.

## Deliverables (change NOTHING; the owner has not asked for a fix)
1. Find the code that renders the voice chat sheet and bubbles on the home page (start at public/framework/ux/Dictate/chat.js, its readme, surfaces/, and the `place` / amend_bubble lines in a session file like public/ai/v-timqv56.jsonl).
2. For each of the three symptoms: the likely cause, file:line, and the one-line fix you would make.
3. Evidence: the real lines from public/ai/v-timqv56.jsonl that show the split or the headline (print them with a node one-liner, never hand-copy). Headless Playwright only if you need a shot; never drive the owner's tabs.
4. Write findings to `chat-render-check/findings.md` in the task dir above (one screen, plain sentences), report to your parent, and stop.

## Budget
Sonnet, about 20 minutes, read-only.
