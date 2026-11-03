# One chat list: `session.messages`, written beside the old lines

**Status: built** by mastermind-chat-messages on branch `worktree/chat-messages` (commit 28189ccf3), merging after review. Its doc: [core/Session/Chat/readme.md](/framework/core/Session/Chat/readme.md) (on the branch until it merges); a 60-line reference view: `ext/Chat/list/ChatList.js`. What follows is the plan it was built from. It follows [the owner's decisions](owner-decisions.md) (2026-11-01, 18:04): dual write, order kept, the list belongs to the chat, no migration yet. It reconciles [dictation-map/plan.md](../dictation-map/plan.md) and the data-shapes synthesis ([core/Session/tasks/data-shapes/synthesis.md](/framework/core/Session/tasks/data-shapes/synthesis.md), decisions 2 to 4; fork F3 leans "Prompts and Questions are messages").

## The idea

Today a voice session's chat is spread over pseudo lines (`{chat}`, `{place}`, `{summary}`, `{para}`) that V1 replays, plus Prompt tasks that V2 and V3 replay. From now on, **every message is also appended to one real list, `session.messages`, in the order it happened.** V1 keeps reading its old lines, untouched. V2, V3 and Recite read only the new list. When the new list has proven itself, V1 switches over and the old lines stop.

## The shape

```js
session.messages: List<Message>        // append-only, in arrival order; the chat's one source of truth
class Message extends Item { by, at, text }
  // by: "owner" | "smart" | "fast" | "system"
  // owner: { raw, via: "voice"|"typed", prompt? }      one finished sentence (Whisper final), never edited
  // smart: { re?, prompt? }                            one reply; re = the message it answers
  // a later cleaned copy is a field on the same message ({clean}), never a second message
session.tasks: Prompt { messages: [ids], title?, text? }  // the prompt card: a group that LINKS to its messages
```

**Why `session.messages` and not `chat.messages`:** the key `chat` is already the pseudo line's verb (`{"chat": {at, from, text}}`), so a list named `chat` would collide in the same file during the dual write. The owner said either name is fine.

**The lines on disk** (item-tool deltas, one per message, beside the old line it mirrors):

```jsonl
{"chat":{"at":"…","from":{"kind":"owner"},"text":"Fix the tab bar.","prompt":"p-1"}}                     ← old, unchanged (V1)
{"messages":{"add":{"id":"m-a1","by":"owner","at":"…","text":"Fix the tab bar.","raw":"fix the tab bar","prompt":"p-1"}}}   ← new
{"p-1":{"messages":{"push":"m-a1"}}}                                                                        ← the card links it
{"messages":{"add":{"id":"m-b2","by":"smart","at":"…","text":"On it.","re":"m-a1","prompt":"p-1"}}}        ← a reply
```

## Order: the two rules the owner set

1. **New dictation always appends at the bottom.** A sentence is added when Whisper finalises it, never inserted above. A view groups consecutive owner messages into one bubble, so a sentence said after a reply starts a new bubble below that reply; it never joins a bubble higher up (today's `{place}` lines do that).
2. **A reply never splits a message in progress.** While the owner is still speaking (Servex's floor is `speaking`, `hold_thought`), a finished reply waits in Servex and is appended only when the floor is released. The reply still streams live on the wire, so a view shows it as a pending bubble at the bottom; only its place in the list waits.

## Who writes it

One writer, Servex (`Servex/agents/Sessions.js`), in the code paths that already write the old lines:

| Message | Old line, kept | New line, added in |
|---|---|---|
| owner sentence | `{chat}` in `say()` | `say()`, same moment, plus the Prompt's `messages.push` |
| smart reply | `{chat}` in the turn-end path (`heard()`) | the same place, held while the floor is `speaking` |
| fast-seat cleaned text (when the seat is on) | `{place}` | a `{clean}` field on the owner message it cleans |
| Question for a "?" sentence | Question task | unchanged (a task, linked by `from`) |

No AI writes the list; code does (CLAUDE.md law 7).

## Readers

- **V3** reads `session.messages` for bubbles and `Prompt.messages` for its cards; it stops reading `{chat}` (today's read-only fallback goes when this lands).
- **V2** folds into V3: one view over one list (the V2/V3 comparison is a separate note).
- **Recite** reads replies as they are appended (and streamed), from one place.
- **V1** unchanged until the switch.

## The trade-off (the owner's pick, and the alternative)

| | **Standalone messages, cards link to them** (chosen) | Replies attached only to prompt cards |
|---|---|---|
| Order | The list *is* the order; nothing to reconstruct | Order across cards must be rebuilt from times |
| A reply to nothing in particular, a system note | Has a home | No home |
| Prompt cards | A second structure (ids) to keep in step | Free: the card holds everything |
| Streaming a view | Append one bubble | Find the card, patch it |

## How we will know it works (the replay test)

`Servex/agents/messages.test.mjs`: feed a copy of a real session's owner and reply lines (v-9dvbbrn, 316 replies) through the writer, then check:
- one message per old `{chat}` line, same text, same order (two counts that must be equal);
- every reply's `re` names an earlier message;
- no reply sits between two sentences of the same released thought;
- a fresh replay of the file rebuilds the same list (the item tool's own replay).

## Migration

**None now** (the owner, 18:04). Later, once the list has run for a week: a node script (`Server/ChatToMessages.mjs`, dry run and a manifest, append-only) adds the `messages` lines an old session would have had. Old lines are never rewritten.

## Size

About a day: the writer and its test (Servex, then a Servex restart outside a voice call), then V3 reading the list. Ask first before building (the owner asked for the plan).
