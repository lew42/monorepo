# Chat: one view instead of two

Budget: $10. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/`. Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db.

Queued behind `../chat-sent/` and `../v2-speed/`, which touch the same files. Start from current `michael/dev` after both have merged.

## The owner's direction (not yet a decision on how)

Chat has two views today: the first one, which has no name, and Chat v2, behind the V2 button at the top of the chat. Chat v2 shows the refinements: refined text, replies, Questions and tasks. The first view does not, but it has the jump-to-newest button and streams replies. The owner does not want two versions that drift apart. The aim is **one chat view** that has everything both have: the first view gets the refinements, and both use the same shared parts.

**The V2 button becomes a version dropdown** (the owner, who finished the thought later): it switches back and forth between chat versions, so that a V3 can be added later. Keep the switching and give every version a name, the first one included. The owner noted that today the first view is not even called "v1".

**Replies never land inside the owner's dictation** (a long-standing problem). Today an assistant reply can appear between two of the owner's transcription lines and break up the flow. In the one view, a reply is anchored under the Prompt it answers, or waits until the owner pauses. Choose one, and write the other down as the alternative. Read `../place/` first: an earlier placement fix lives there.

**A Structure view in the dropdown.** The owner wants to see the chat's structure, the Prompt and its children (refined text, replies, Questions, tasks), to check that transcriptions are refined properly ("that is the only way to make progress"). Add a "Structure" entry to the version dropdown that draws the session's item tree: each item's type, id and text, nested under its parent, live as lines arrive. Reuse an existing tree or item renderer if one exists; look before building.

## Steps

1. **Plan first, and stop after the plan.** Write `plan.md` in this folder: what each view has that the other lacks (a table, from the code with file:line), which one to keep as the base, how the other's features move into it, how the version dropdown lists and switches versions (and where the choice is saved), and which callers change (`ext/drawer/ChatView.js`, `Sheet.js`, `tabs/ai.js`, any others). Report it to mastermind-dictation-2 and wait for its answer before building. The mastermind decides; this is a structural change (CLAUDE.md, "Ask before": moving a responsibility).
2. **Build** the agreed plan, in your own worktree, committing at each working step.
3. **Prove it:** screenshots of one real session at 400, 1200 and 1920, showing refined text, a reply, a Question and a task, the jump-to-newest button, a streaming reply, a reply arriving mid-dictation that does not split it, and the Structure view.
4. **Docs:** `ext/Chat/v2/readme.md` and `ux/Dictate/readme.md` describe the one view as it now is, using the owner's word "chat".

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Findings go in `session.jsonl` as `log` lines. mastermind-dictation-2 reviews and merges.
