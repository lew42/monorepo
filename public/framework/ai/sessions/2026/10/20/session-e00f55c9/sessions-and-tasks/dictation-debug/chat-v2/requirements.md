# Chat v2: a session's chat drawn from its `tasks` list

Budget: $30 total, children included. You are a task mastermind (load the `sub-mastermind` skill); build through Sonnet minions, one page and one minion at a time. Your parent is `mastermind-dictation-2`. Card: `/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

**What the owner decided.** Read the Decision section at the end of [../chat-shape.md](../chat-shape.md), then Part 10 (and Part 4) of [../requirements.md](../requirements.md). In short: one session's conversation is its `tasks` list in `session.jsonl`. Your prompt sits at the root of the chat, with no left/right bubbles. The smart assistant's replies and cards nest under the prompt they answer, marked with the brain icon. A reply can be anchored to one sentence or a word range.

## Name and home (settled, law 8)

- **Folder:** `public/framework/ext/Chat/v2/`, linked from `ext/Chat/readme.md`.
- **Class:** `ChatV2` in `ChatV2.js`. It replaces the dictation chat when it is ready; until then the old chat (`ext/Chat/Chat.js`, `ux/Dictate/chat.js`) stays exactly as it is.
- Call it "chat" in the UI: dictation is one feature of the chat.

## What exists, and who owns it

- **The core classes:** `Prompt extends Task` and `Question extends Task`, plus the `prompts.jsonl` migration. They are built by **mastermind-prompt-task** in `core/Task/tasks/prompt-extends-task/` ([its brief](/framework/core/Task/tasks/prompt-extends-task/requirements.md)). Agree the field names with it first, by message: `raw`, `paragraphs`, sentence ids, `replies` with an anchor, `answer`. Build on what it lands; never write a second Prompt class.
- **The session detail page's Chat tab:** owned by **mastermind-sessions-page**. Agree with it how ChatV2 mounts there (Part 4: one chat component for the sheet and that tab).
- **Live tail:** a session's `session.jsonl` is already streamed; reuse the existing `live()` / Item loading. Stream, don't poll.

## Build, in this order (each step merged before the next)

1. **Renderer, read only.** `ChatV2` takes a session and draws its `tasks` in **list order**, never sorted by a stamp ([the rule in chat-shape.md](../chat-shape.md#one-rule-from-the-misorder-bug-applies-to-every-option)). A Prompt shows its paragraphs at the root; its replies, questions and tasks sit under it with the brain icon. It updates live as lines append. Prove it with a headless test on a fixture session; take shots at 390 and 1920. Load the `page`, `layout` and `ui` skills first.
2. **Mount it** behind a "Chat v2" toggle (or tab) in the session detail page's Chat tab and in the ✦ sheet, so the owner can compare it with the old one. The sheet's files (`ext/drawer/Sheet.js`, `ux/Dictate/chat.js`) are being edited by `minion-dictation-solid`: wait for its landing (your parent tells you), then make only the one-line mount.
3. **The writers.**
   - The fast seat (voice-assistant, `Servex/agents/Sessions.js` `voice_say`) writes Prompts only: raw text plus cleaned paragraphs, using the small deltas mastermind-prompt-task lands.
   - The smart seat (the voice mastermind, `Servex/agents/session-smart.md`) writes the tasks, questions and replies onto the prompt.
   - `Sessions.js` is also touched by the wake branch (`worktree/dictation-wake`). Start this step only after your parent says it has merged. A Servex change goes live only with `node Servex/sustain.mjs --restart`, which your parent schedules.

Hold the "Chat v2 replaces v1" step until the owner has tried it.

## Rules

- Work in worktrees (`node Server/worktree-up.mjs chat-v2`), commit every working step, run `node Server/smoke.mjs <worktree>` (no FAIL), get a `Server/review.mjs` report for each page change, then merge with `node Server/merge.mjs`.
- Log findings as `log` lines in `chat-v2/task.jsonl`. After each merge, send your parent one sentence: what is live and how to try it.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), never stash.
- Update `ext/Chat/readme.md` and add `ext/Chat/v2/readme.md` (what it is, its on-disk shape, who writes the data, which class reads it).

## Done when

Steps 1–3 are merged, the owner can open a voice session and see its prompts with the assistant's cards nested under them, and the readmes say so.
