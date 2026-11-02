# Plan: Chat V2 and V3 on `session.messages` (plan only, nothing built)

The goal (the owner, 2026-11-01, 21:18): one real list of messages, prompts and sentences by id, so every chat view draws the same data and updates the same way. The list exists and is already written for every voice session ([readme](../readme.md)); no view reads it yet except the demo [ext/Chat/list](/framework/ext/Chat/list/). Background on the old lines: [pseudo-properties.md](pseudo-properties.md).

## What each view reads today, and what it should read

| View | Reads today | Should read |
|---|---|---|
| **V1** (`ux/Dictate/Widget.js`, `chat.js`) | `{chat}` and `{place}` lines, sorted and patched by timestamp | `messages` last (step 5) |
| **V2** (`ext/Chat/v2/ChatV2.js`, `ChatV2Model.js`) | the file replayed into a real `Session` (the task list: Prompt, Question tasks), plus `{chat}` only to learn which Prompt an owner line belongs to (`ChatV2Model.js:20`); the ✓ and 🧠 marks come from `sent.fast` / `sent.smart` on the Prompt task | `session.messages` for the bubbles; marks stay on the task until they have a message-level home (step 3) |
| **V3** (`ext/Chat/v3/ChatV3.js`) | task deltas only (`ChatV3.js:86`: no `{chat}`, `{place}`, `{sent}`) | `session.messages`; tasks still drawn beside it |
| **demo** (`ext/Chat/list/ChatList.js`) | `messages` and `sentences` only, redrawn from the Session's `delta` event | the template for steps 1-2 |

Gaps to fill before a view can drop its old source: the `sent.fast` / `sent.smart` marks and `working` live on the Prompt **task**, not on the message; the live draft is a client-side box; a Prompt message links its task by `prompt` (the task's id), so the marks can be read through that link until they move.

**One meaning for the brain icon (decided here).** V1 colours 🧠 when smart has *received* the chunk; V2 only when smart has *answered* ([status-icons.md](/framework/ux/Dictate/doc/status-icons.md)). The unified data uses **answered**: 🧠 is done when a `Reply` (or the Prompt's own `title` / `text`) exists after the smart seat's receipt. On messages that is computable from the list alone (a Reply with `re.to` in the Prompt's `sentences`), which V1 could not do from a live piece. Received stays a gray state.

## How live updates stream

The same way for every view: `ext/JSONL` delivers each new line of `session.jsonl`; the view calls `session.replay_line(line)`; the Session emits `"delta"` with the Message that changed (a new member, or a Prompt that grew); the view redraws only that message (`ChatList.js:22`). That is the Store delta path: no polling, no reload, a 29 ms append redraws one bubble. A Prompt growing is one line, so a bubble never splits.

## How often each seat processes

The owner's wake rules ([turn-taking.md](/framework/ux/Dictate/doc/turn-taking.md), "Wake rules"):

- **Smart seat: per whole sentence.** Already true: `WAKE_DEFAULTS.every: 1` in `Servex/agents/WakePolicy.js:12`, plus a "?", its name, or a 12 s pause.
- **Fast seat: per piece (comma, full stop, "?").** Not true yet. It is woken once per owner line (`Sessions.voice_say`, `Sessions.js:495`), and `ext/Chat/Mic.js` sends one sentence per send (`sentences_per_send: 1`). The existing `send_on_comma` cuts the send itself and would split the owner's bubbles, so it cannot be used.

## The steps, one merge each

1. **V3 on messages — done, merged (`mastermind-v3-messages`, 2026-11-01).** `ext/Chat/v3/ChatV3.js` draws `session.messages` (Prompt with its sentences, Replies found by `re.to` under it), tasks/questions beside through the Prompt message's `prompt` link. Paragraphs are pause-based (`placement.js`, `PARAGRAPH_GAP_MS`), not "one per sent chunk". Proof: `placement.test.mjs` (18 node checks on a real-session fixture) + `ChatV3.test.mjs` (16 Playwright checks, incl. live append). Readme: [ext/Chat/v3/readme.md](/framework/ext/Chat/v3/readme.md).
2. **V2 on messages.** Same swap in V2; drop the `{chat}` lookup in `ChatV2Model`; keep the marks on the task.
3. **One home for the marks.** Move `sent.fast`, `sent.smart` and `working` onto the Prompt message (a new field, written by `Sessions.mark_sent` through `ChatWriter`), and make 🧠 "answered" in both views. Then V2's per-Prompt ✓ can become per-sentence.
4. **One view.** If dictation-v3 agrees (below), V2 and V3 become one class over the same model with two skins; otherwise two skins on one shared model class.
5. **V1 switches** ([pseudo-properties.md](pseudo-properties.md), the plan), then `{chat}` / `{place}` stop.
6. **The fast seat's comma feed** (owner item 30). `Mic.js` posts each sub-sentence piece of the live text as its own event (for example a `piece` line), separate from the message. `Sessions.js` routes only those pieces to the fast seat (`voice_say`, around line 495). Messages and the smart seat stay per sentence. Medium change; **after step 5's data cut-over** so it is built once, on the new data.

Each step: a worktree, a test, review, merge by the mastermind that owns the view.

## Open questions, answered (mastermind-dictation-v3, 2026-11-01 21:50)

**(1) What V2 and V3 read that has no field on Prompt or Reply yet.**
- **No field, needs one (step 3):** `sent.fast` / `sent.smart` (V2's ✓ and 🧠, `ChatV2.js:206-224`, Prompt-level only) and `working` with its `at` (V2's bottom 🧠 dots, `ChatV2.js:82`, stale after `STALE_MS`). Until step 3, read them through the Prompt message's `prompt` link to its task.
- **Stays client-side, no field:** the live draft (both views listen to the window event `chat-live`, `ChatV2.js:38`, `ChatV3.js:205`), V2's open raw toggles (`raw_open`), and V3's reply being written (`partial`, from the live wire's `{kind:"stream"}`, `ChatV3.js:66`). A streaming reply in the file would be one line per word; the wire is the right home.
- **Already covered by messages:** V3's `{chat}` reply lookup (`chat_line`, `ChatV3.js:48`: a reply's `re` is the owner line's `at`) becomes `Reply.re.to` (a sentence id); V2's anchored replies (`M.anchor`) are the same thing. The title (`Prompt.title`), the refined text (`Prompt.text`) and the fast seat's cleaned words (`Prompt.clean`) exist.
- **Paragraph breaks** (owner item 7, being built by `mastermind-ink-check`): V3 makes one paragraph per sent chunk (`ChatV3.paragraphs`, `ChatV3.js:170`). On messages a chunk is no longer visible, so a paragraph starts where the gap between two sentences' `at` is long (a pause). `Sentence.at` exists, so no new field. The step-1 builder carries this rule over.
- **The read-aloud played flag** (owner item 20) is kept by `audio/Recite` per message id; no chat field.

**(2) One view or two skins: one class, and V2 is a subclass of it.** Step 1 rebuilds `ext/Chat/v3/ChatV3.js` on messages, and that class is the one view. Step 2 makes `ChatV2` a subclass of `ChatV3` that adds only V2's extras (the ✓/🧠 marks, the raw toggle, replies beside their sentence) and its own CSS, and deletes `ChatV2Model.js`. So step 4 folds into step 2. The alternative is one class with a `skin` option; it wins if the subclass ends up overriding most methods.

**(3) Merge order:** 1 (V3 on messages) → 2 (V2 as its subclass, marks read through the `prompt` link) → 3 (marks on the message; Servex code, live only after a Servex restart with no voice call on, so the views keep the link as a fallback) → 5 (V1) → 6 (comma feed). Step 1 starts after `mastermind-ink-check`'s paragraph-break merge (it edits `ChatV3.js` in `worktree/views-fix`), or takes that work over by agreement, so two agents never edit `ChatV3.js` at once.
