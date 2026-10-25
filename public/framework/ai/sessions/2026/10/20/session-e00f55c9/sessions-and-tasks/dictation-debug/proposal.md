# Chat: the proposal for every ask so far

Planning mode (the owner, voice session v-sq8y7db, 2026-10-25): nothing new is built or merged until the owner has seen this. One build is already running (step 1 below); it finishes its current step, commits it in its own worktree, and stops. Nothing of it reaches the live site yet.

## The shape: one chat, three layers

- **One source of data.** Each chat session is one file of items: a Prompt holds its lines, the refined text, the replies, the Questions and the tasks.
- **One placement process.** A single piece of code decides where each item goes. Two rules: the owner's words always arrive at the bottom, and a reply sits under the Prompt it answers, never in the middle of the owner's dictation.
- **Many looks.** A version is only a way of drawing that same data, picked from a dropdown at the top of the chat. Suggested names (easy to change): **Stream** (today's first view), **Threads** (today's Chat v2), and **Structure** (the item tree, for checking that the refinement is right).

Open question for the owner: whether the two views read the same data today. The running build answers it from the code; the answer will be added here.

## The work, in four steps

1. **Small fixes** (building now, about $6)
   - ⬜ A "sent" mark on each line: when it reached the fast assistant and when it reached the smart one, with the delay measured.
   - ⬜ A check that lines dictated before a page refresh are not lost.
   - ⬜ Scroll lock in both views: pinned to the bottom by default, scrolling up unpins it, and a small "newest" button that covers nothing pins it again.
   - ⬜ A light mic background, so the voice rings show.
   - ⬜ Open Questions shown under their Prompt.
   - ⬜ "Chat" as the name everywhere, written down as a goal; nothing renamed.
2. **Polish** (about $4)
   - ⬜ Chat v2 shows replies as fast as the first view, as they are written.
   - ⬜ A task's state reads plainly; it no longer says "task idle" beside an unexplained checkbox.
   - ⬜ Every setting has a plain label and a one-line hint under it saying what it changes.
   - ⬜ Bubbles use the width sensibly, and code blocks inside a bubble show as code.
3. **One chat view** (a plan for about $2 that the owner sees first, then about $8 to build)
   - ⬜ The three layers above, with the version dropdown and the Structure view.
   - ⬜ The owner's live bubble always last, with no reply landing just above or below it.
   - ⬜ No long walls of text: a long dictation breaks into blocks by Prompt or by pause.
   - ⬜ Replies anchored under their Prompt. The alternative is to hold a reply until the owner pauses; anchoring is suggested because it never moves the owner's words.
4. **Pipeline** (about $6)
   - ⬜ **Chunking.** An unfinished sentence is marked pending and placed once it is finished, instead of being cut mid-question. The fast assistant may also get a chunk at each mid-sentence pause. How often it is fed becomes a setting.
   - ⬜ **Tasks.** Measure how long it takes from a spoken ask to a task on screen. Then make the smart assistant create tasks reliably and show them at once, and run those tasks first.

Order: 1, then 2, then 3, then 4. Steps 1 and 2 are safe to land on their own. Step 3 changes the shape, so its plan comes to the owner first. Step 4 changes Servex, which needs a restart outside a voice call. Total: about $26.

Briefs: [chat-sent](chat-sent/requirements.md) (1) · [v2-speed](v2-speed/requirements.md) (2) · [one-chat-view](one-chat-view/requirements.md) (3) · step 4 has no brief yet.
