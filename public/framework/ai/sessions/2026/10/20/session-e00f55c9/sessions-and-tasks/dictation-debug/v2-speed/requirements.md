# Chat v2: show replies as fast as the first view

Budget: $4. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/`. Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db (the owner was still thinking aloud, so treat this as a likely problem, not a certainty).

Queued behind `../chat-sent/`, because it touches the same Chat v2 files. Start from current `michael/dev` after chat-sent has merged.

## The ask

Chat v2 (the V2 button at the top of the chat) shows replies much later than the first view does. Its headings appear, but the assistant's replies arrive late, while the first view streams them as they are written.

1. **Measure it first.** Use one real session. For the same reply, record when the first view draws its first text and when Chat v2 does, from the moment the reply line is appended. Log both numbers.
2. **Find the cause.** Possible causes to check: v2 only reads finished lines rather than streaming partial ones, a polling delay, or a debounce. Log the cause with file:line.
3. **Fix it** so that v2 draws a reply as quickly as the first view does, with a stream and a `live()` tail rather than polling (CLAUDE.md, "Stream, don't poll"). Measure again and log both numbers.

## Where to start

`ext/Chat/v2/readme.md`, `ext/drawer/ChatView.js` (the switch between the two views), and `../chat-v2/` (how v2 was built).

## Rules

Work in your own worktree, commit by exact path, and never kill or restart the dev server, drive the owner's tabs, or `git stash`. Findings go in `session.jsonl` as `log` lines. Report one screen to mastermind-dictation-2, which reviews and merges.
