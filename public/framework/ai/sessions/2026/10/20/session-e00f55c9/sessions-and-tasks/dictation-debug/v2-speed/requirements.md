# Chat v2: show replies as fast as the first view

Budget: $4. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/`. Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db (the owner was still thinking aloud, so treat this as a likely problem, not a certainty).

Queued behind `../chat-sent/`, because it touches the same Chat v2 files. Start from current `michael/dev` after chat-sent has merged.

## The ask

Chat v2 (the V2 button at the top of the chat) shows replies much later than the first view does. Its headings appear, but the assistant's replies arrive late, while the first view streams them as they are written.

1. **Measure it first.** Use one real session. For the same reply, record when the first view draws its first text and when Chat v2 does, from the moment the reply line is appended. Log both numbers.
2. **Find the cause.** Possible causes to check: v2 only reads finished lines rather than streaming partial ones, a polling delay, or a debounce. Log the cause with file:line.
3. **Fix it** so that v2 draws a reply as quickly as the first view does, with a stream and a `live()` tail rather than polling (CLAUDE.md, "Stream, don't poll"). Measure again and log both numbers.

4. **Make the task state readable.** A task card in the chat shows something like "task idle" next to a small checkbox, and the owner does not understand what that means. Replace it with a label a newcomer reads at a glance: what state the task is in, and what the checkbox does. Fix it in the shared component, so every surface that shows a task picks it up.

5. **Settings that explain themselves** (the owner, same session: "I don't understand what these mean"). In the chat's Settings panel (built in `../settings/`), every label should say what it does in plain words, so a newcomer understands it without trying it. The owner named four: "Dictation goes into chat versus box"; "send delay" (keep talking within it and the words join one prompt); "Clean transcription" (the fast assistant cleans up the words); "send mode: pause or sentences". For each, give a short label plus a one-line hint under it saying what changes when you flip it. Screenshot the panel before and after.
6. **Bubbles use the width, and code blocks render.** Chat bubbles today do not use the available width. Make a bubble widen sensibly with the view (a readable maximum, not a narrow column), and render fenced code blocks inside a bubble as code (monospace, its own box, scrolls sideways if long). The smart assistant sent a reply with a code block in session v-sq8y7db to test it. Fix it in the shared bubble, so both chat views get it. Screenshot at 400, 1200 and 1920.

## Where to start

`ext/Chat/v2/readme.md`, `ext/drawer/ChatView.js` (the switch between the two views), and `../chat-v2/` (how v2 was built).

## Rules

Work in your own worktree, commit by exact path, and never kill or restart the dev server, drive the owner's tabs, or `git stash`. Findings go in `session.jsonl` as `log` lines. Report one screen to mastermind-dictation-2, which reviews and merges.
