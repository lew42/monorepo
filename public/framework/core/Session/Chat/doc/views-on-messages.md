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

1. **V3 on messages.** V3 draws `session.messages` (Prompt with its sentences, Replies under it), tasks beside. Smallest view, nothing else reads it.
2. **V2 on messages.** Same swap in V2; drop the `{chat}` lookup in `ChatV2Model`; keep the marks on the task.
3. **One home for the marks.** Move `sent.fast`, `sent.smart` and `working` onto the Prompt message (a new field, written by `Sessions.mark_sent` through `ChatWriter`), and make 🧠 "answered" in both views. Then V2's per-Prompt ✓ can become per-sentence.
4. **One view.** If dictation-v3 agrees (below), V2 and V3 become one class over the same model with two skins; otherwise two skins on one shared model class.
5. **V1 switches** ([pseudo-properties.md](pseudo-properties.md), the plan), then `{chat}` / `{place}` stop.
6. **The fast seat's comma feed** (owner item 30). `Mic.js` posts each sub-sentence piece of the live text as its own event (for example a `piece` line), separate from the message. `Sessions.js` routes only those pieces to the fast seat (`voice_say`, around line 495). Messages and the smart seat stay per sentence. Medium change; **after step 5's data cut-over** so it is built once, on the new data.

Each step: a worktree, a test, review, merge by the mastermind that owns the view.

## Open questions

Folded in from `mastermind-dictation-v3` (it owns the views): see the section below once it answers.
