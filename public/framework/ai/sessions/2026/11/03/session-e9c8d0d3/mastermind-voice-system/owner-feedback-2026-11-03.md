# The owner's feedback on this morning's single voice session (2026-11-03, VS Code tab, relayed by vscode-mastermind)

**What the owner said, in short.** The single voice agent "seemed to be working pretty well". These parts weren't right. The owner's dictation is verbatim in the tab's prompt log (`e00f55c9`, 2026-11-03, about 13:10 local).

## The asks, numbered (each one becomes a task on this session; tick only with proof)
1. **Replies go through the item tool, not plain text.** Today a cue turn's text is piped by Servex (`Sessions.js` `single_cue`) into the chat. The owner wants one channel, the item tool, so the backend behind it can change later (a database, the cloud, a live cloud session) without a second REST path to re-implement. The agent adds its Reply to `session.messages` itself, with `item`.
2. **Placement and cleaning go through the item tool, and they "seemed not to be working properly".** Find out what went wrong this morning, from the session file of `v-z0jonhy`.
3. **Where each request came from must be recorded, end to end:** the raw transcriptions are attached to the cleaned Prompt, the cleaned Prompt is attached to the task, and the task is handed to a mastermind (`spawn_agent task: {from, id}`). The mastermind reads the whole task first, including the verbatim raw words that caused it. Check how well the voice agent handed off this morning.
4. **It replied far too often** ("listening", "nothing is open", "no open questions"), even after being told to only listen.
   - **The owner's idea:** an LLM may feel it has to say something. So give it a tool that does nothing, for example `listen()`, so it can end a turn without writing into the chat.
   - **The owner's suspicion:** the same instruction is injected with every sentence or every pause (`(sentence)`, `(pause: reply now only if a question is open)`). Repeated dozens of times, it pushes the model into a rut, so it keeps saying the words it was given.
   - **Audit:** every line Servex adds to each message. Cut each repeated instruction down to a bare tag, and keep the rule in the brief, said once.
5. **One list.** Chat V3 must draw `session.messages` (or `session.chat.messages`, whichever we chose: see `core/Session/doc/classes.md`), and the agent's replies are in that same list. Confirm it.
6. **Less jumping.** Bubbles disappeared and then reappeared. A move must be **one** line, never a remove followed by an add, because the text vanishes and comes back a second later. `List.move(id, {after, before, from})` already writes one line and can move between lists (`core/List/List.js:357`). Check whether the agent used it, or whether the cleaning re-added text.
7. **No "show raw" button** (`ext/Chat/v3/ChatV3.js:185`). It takes up space, and it appears late, after the cleaning, which adds to the jumping. **Tapping a message expands it** to show the raw text.
8. **View modes in the chat** might be useful (a maybe, not an ask to build now).

## Also seen by vscode-mastermind
- **Cost:** `single-voice-assistant-v-z0jonhy` took 226 turns and $14.94 this morning, about one turn per sentence plus one per pause. Measure the cost per sentence and say whether batching (or Haiku for the silent turns) is worth it.
- **Overlap:** `mastermind-chat-settings` (spawned by vscode-mastermind at 12:59) owns the Voice Chat plugins, per-session settings, the one Chat settings panel and "Make default". Your `worktree/qf-1` already has a per-instance plugin switch (c8c0af7b2) and `ux/Dictate/doc/settings-plugins.md`. Merge qf-1, then leave plugins and settings to chat-settings, so there aren't two builds of one thing.

## What to send back to vscode-mastermind (3 to 6 lines)
- what you found on asks 2, 3 and 6;
- your plan for 1, 4 and 7;
- **the owner's other asks from this morning's session** that are still open, one line each, so the tab can explain them.
