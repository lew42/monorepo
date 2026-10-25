# Chat: the proposal for every ask so far

**Planning mode.** The owner set this in voice session v-sq8y7db on 2026-10-25: nothing is built or merged until the owner okays this proposal. One build is paused at commit `c3069554b` on its own branch, and nothing from it is live.

## The shape: two assistants, one session, many looks

- **The fast assistant hears every sentence.** As each sentence ends, it puts the sentence into the last paragraph or starts a new one.
- **A new paragraph means "send to the smart assistant."** The smart assistant gets one batch per finished paragraph, not one line at a time. On screen, each paragraph is its own bubble, so a split bubble is the "sent" signal. That replaces most of the small marks.
- **The session lives on the server.** Servex holds each chat session and is the only thing that writes its file. The fast assistant's decision to keep a sentence in the paragraph or start a new one runs there. Whether a real class instance exists yet is being checked; if it doesn't, building one is part of step 3.
- **Many looks over one file.** Both views already read the same file, through two different readers. One reader replaces the two. A dropdown then picks how to draw it. Suggested names: **Stream** (the first view), **Threads** (Chat v2), and **Structure** (the item tree).
- **Your live paragraph stays at the bottom.** When a reply arrives while you are still talking, your paragraph moves below the reply. This happens only on screen, in the last few seconds; the file keeps its order.

## What happens today (from the code)

- **The mic icon** shows how a line came in: a mic means it was spoken; "typed" means it was typed (`ext/Chat/Chat.js:46`).
- **The green check is the clarity mark, and it is still live.** A model reads each line you say: it shows ✓ when the line is clear and ? when it isn't (`Servex/agents/Hitl.js:16`, drawn at `Chat.js:108`). For an unclear line it also suggests two readings, but nothing shows them.
- **The fast assistant waits for a pause before it gets anything.** Lines are held until you have been quiet for 2.5 s; turning the mic off, typing, or an 8 s limit also releases them. It then places each sentence in the same paragraph, its own paragraph, or its own card (`Sessions.js:246`, `:984`).
- **The smart assistant is woken by fixed rules, not by paragraphs.** The rules are a 12 s pause, a line ending in "?", saying its name, or 6 sentences (`WakePolicy.js:1`).
- **The server keeps sessions, but not as objects.** One `Sessions` object holds every session, and each session is plain data (`Sessions.js:227`, `:798`).

**So the change is small in idea:**
- Feed the fast assistant at every sentence instead of every pause.
- Let its "own paragraph" choice wake the smart assistant, in place of the fixed rules.
- Give each session its own object on the server: one `Session` instance per chat. The alternative is to keep plain data plus methods on `Sessions`, which is cheaper now, but the logic stays spread out.
- Show the two readings beside a "?".

## The four steps

1. **Small fixes** (about $6; mostly built, paused)
   - ✅ Sent marks for both assistants, built but unproven
   - ✅ A small "↓" newest button
   - ✅ A light mic background
   - ⬜ Prove scroll lock in both views
   - ⬜ Stop losing lines on a page refresh
   - ⬜ Show Questions under their Prompt
   - ⬜ Write the "chat" goal line in the readmes
2. **Polish** (about $4)
   - ⬜ Chat v2 replies as fast as the first view
   - ⬜ A plain task-state label
   - ⬜ Settings with a one-line hint each
   - ⬜ Wider bubbles, and code blocks shown as code
3. **One session, one view** (a plan the owner sees first, about $2, then about $10 to build)
   - ⬜ The shape above: paragraphs decided on the server and sent to the smart assistant as batches, and one reader
   - ⬜ The version dropdown and the Structure view
   - ⬜ The live paragraph kept last
   - ⬜ The clarity mark again, if it still exists: a green check when a sentence makes sense, a yellow "?" when it doesn't. The meaning of today's check and mic icon is being checked.
4. **Tasks** (about $4)
   - ⬜ Time how long a spoken ask takes to appear on screen as a task
   - ⬜ Create tasks reliably and show them at once
   - ⬜ Run those tasks first

Steps 1 and 2 are safe to land on their own. Steps 3 and 4 change Servex, which needs a restart outside a voice call. Total: about $26.

## Ideas recorded, not designed

- **Moving a card shows where it went.** When a past card or task moves to the bottom for reference, a dimmed copy with an arrow stays where it was, and clicking it scrolls to the new place. The moved card gets a back arrow. A completed task could come back this way instead of looking duplicated. The owner isn't sure this is the right approach yet.

Briefs: [chat-sent](chat-sent/requirements.md) (step 1) · [v2-speed](v2-speed/requirements.md) (step 2) · [one-chat-view](one-chat-view/requirements.md) (step 3). Step 4 has no brief yet.
