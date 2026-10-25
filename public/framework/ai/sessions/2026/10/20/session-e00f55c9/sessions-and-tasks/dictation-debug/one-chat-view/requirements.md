# Chat: one view instead of two

Budget: $8. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/`. Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db.

Queued behind `../chat-sent/` and `../v2-speed/`, which touch the same files. Start from current `michael/dev` after both have merged.

## The owner's direction (not yet a decision on how)

Chat has two views today: the first one, which has no name, and Chat v2, behind the V2 button at the top of the chat. Chat v2 shows the refinements: refined text, replies, Questions and tasks. The first view does not, but it has the jump-to-newest button and streams replies. The owner does not want two versions. The aim is **one chat view** that has everything both have. Once there is one view, the V2 toggle should be removed or renamed (the owner's sentence was unfinished).

## Steps

1. **Plan first, and stop after the plan.** Write `plan.md` in this folder: what each view has that the other lacks (a table, from the code with file:line), which one to keep as the base, how the other's features move into it, what happens to the toggle, and which callers change (`ext/drawer/ChatView.js`, `Sheet.js`, `tabs/ai.js`, any others). Report it to mastermind-dictation-2 and wait for its answer before building. The mastermind decides; this is a structural change (CLAUDE.md, "Ask before": moving a responsibility).
2. **Build** the agreed plan, in your own worktree, committing at each working step.
3. **Prove it:** screenshots of one real session at 400, 1200 and 1920, showing refined text, a reply, a Question and a task, the jump-to-newest button, and a streaming reply.
4. **Docs:** `ext/Chat/v2/readme.md` and `ux/Dictate/readme.md` describe the one view as it now is, using the owner's word "chat".

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Findings go in `session.jsonl` as `log` lines. mastermind-dictation-2 reviews and merges.
