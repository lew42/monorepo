# Chat: one view instead of two

Budget: $10. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/`. Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db.

Queued behind `../chat-sent/` and `../v2-speed/`, which touch the same files. Start from current `michael/dev` after both have merged.

## The owner's direction (not yet a decision on how)

Chat has two views today: the first one, which has no name, and Chat v2, behind the V2 button at the top of the chat. Chat v2 shows the refinements: refined text, replies, Questions and tasks. The first view does not, but it has the jump-to-newest button and streams replies. The owner does not want two versions that drift apart. The aim is **one chat view** that has everything both have: the first view gets the refinements, and both use the same shared parts.

**The V2 button becomes a version dropdown** (the owner, who finished the thought later): it switches back and forth between chat versions, so that a V3 can be added later. Keep the switching and give every version a name, the first one included. The owner noted that today the first view is not even called "v1".

**Replies never land inside the owner's dictation** (a long-standing problem). Today an assistant reply can appear between two of the owner's transcription lines and break up the flow. In the one view, a reply is anchored under the Prompt it answers, or waits until the owner pauses. Choose one, and write the other down as the alternative. Read `../place/` first: an earlier placement fix lives there.

**One source, one placement, many looks** (the owner, a later dictation in the same session). The owner wants ONE source of data and ONE process that places items, with each version being only a different rendered style or configuration of it (a session has one or more views). Converge on one system, not two. The owner is unsure whether both views use the same agents and data today: **answer that first, in `plan.md`, from the code with file:line**, so it can be reported back.

**The owner's words always land at the bottom.** A bug the owner saw after switching to the first view: the bubble being transcribed into was not the last one; a reply from the smart assistant sat below it, and new words went into the earlier bubble. The owner's incoming words must always appear at the bottom, and assistant messages must never land just before or after the owner's live bubble in a confusing order. Reproduce it headless first. Read `../order/` too: earlier ordering work lives there.

**No long walls.** The first view puts a long run of transcription into one bubble. In the one view, a long dictation breaks into readable blocks (by Prompt, or at pauses), the way Chat v2 does it.

**A Structure view in the dropdown.** The owner wants to see the chat's structure, the Prompt and its children (refined text, replies, Questions, tasks), to check that transcriptions are refined properly ("that is the only way to make progress"). Add a "Structure" entry to the version dropdown that draws the session's item tree: each item's type, id and text, nested under its parent, live as lines arrive. Reuse an existing tree or item renderer if one exists; look before building.

**The two assistants' roles, and one Prompt per thought** (the owner, later the same day; `../proposal.md`, "The shape"). The fast assistant does only a strict first pass: it places each sentence in the last paragraph or a new one. The smart assistant tails the session file and writes the refinement (heading and breakdown) as sentences arrive. Each thought is one Prompt item holding the raw text as sentences plus its refined form. Every item shows a small mark for who made it (fast or smart).

**Flag words that look wrong.** Whisper wrote "Mars" where the owner said "smart". A word that is out of place gets a small yellow "?", so the owner sees it and the AI does not take it as meant. Check whether whisper's per-word confidence is available and use it if so.

**One refinement for both views** (the owner, later the same day). V1 and V2 are driven by the SAME refinement: an accurate, condensed summary that misses no sentence. Sentence ids (S1, S2…) are never shown.

**Topic cards ("context blocks").** At any moment the chat can open a topic card: a bubble that holds items, titled by the refinement. A new topic makes a new card. Questions, tasks and statements go inside the card they belong to, or at the root when there is no topic. Cards follow the owner's words in real time: clean sentences merge into the card, and a question sentence becomes the card's Question.

**A Question is its own small widget.** The answer is added to it when it comes. `Question extends Task` (`core/Task/Question.js`): it is not complete until it is answered AND the owner accepts the answer; until then it stays open and reminds the owner. Make the card generic, so a question, a statement and a task are each one kind of card. A past-work check on the Question class is being run by the voice session; read its result first if it is linked on the card.

**Sentences feed as they arrive.** Each raw whisper sentence is sent as it arrives and placed by topic: into the last Prompt or a new one, then the last paragraph or a new one. Paragraph headings don't matter yet. What matters: the refined Prompt looks right, and the raw text is on screen live.

Start from `../pipeline-doc/` (the pipeline doc, once it lands): it says how each item is logged today and where V1 and V2 differ.

## Steps

1. **Plan first, and stop after the plan.** Write `plan.md` in this folder: what each view has that the other lacks (a table, from the code with file:line), which one to keep as the base, how the other's features move into it, how the version dropdown lists and switches versions (and where the choice is saved), and which callers change (`ext/drawer/ChatView.js`, `Sheet.js`, `tabs/ai.js`, any others). Report it to mastermind-dictation-2 and wait for its answer before building. The mastermind decides; this is a structural change (CLAUDE.md, "Ask before": moving a responsibility).
2. **Build** the agreed plan, in your own worktree, committing at each working step.
3. **Prove it:** screenshots of one real session at 400, 1200 and 1920, showing refined text, a reply, a Question and a task, the jump-to-newest button, a streaming reply, a reply arriving mid-dictation that does not split it, and the Structure view.
4. **Docs:** `ext/Chat/v2/readme.md` and `ux/Dictate/readme.md` describe the one view as it now is, using the owner's word "chat".

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Findings go in `session.jsonl` as `log` lines. mastermind-dictation-2 reviews and merges.
