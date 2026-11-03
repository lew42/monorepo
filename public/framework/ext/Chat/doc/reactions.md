# Reactions, threads and avatars

## Reactions: an SMS tap-back on a bubble

Hold a bubble on a phone (about half a second), right-click it on a desktop, or click the small ☺ that shows beside it on hover. A row of six opens: 👍 ✅ ❤️ 😂 ❓ 👎. Tap one and it is pinned on the bubble's top corner. Tap the same one again and it comes off. Picking a different one replaces yours: one reaction per person per message.

On a phone, holding a bubble opens the reactions instead of selecting its text, so a message's words cannot be long-pressed and copied there (`user-select: none` under `@media (hover: none)` in `Chat.css`). On a desktop, text selects as usual.

A reaction is its own line in the log, never an edit of the message it marks:

```json
{"react": {"at": "2026-09-30T13:40:02.120-05:00", "session": "v-2joydc7", "re": "<the marked line's at>", "emoji": "👍", "from": {"kind": "owner"}}}
```

- `re` is the marked line's `at` (a universal chat line) or its `id` (an old `{type, by, text, id}` line).
- The newest line from a sender for a message wins. An empty `emoji` takes that sender's reaction off.
- A reaction that arrives before its message is drawn waits until the message appears.

### Who saves it

`chat({ on_react })` draws the reaction at once and calls `on_react({re, emoji, at})` to save it. `ChatPanel` passes its host's `react` option straight through:

| Host | Where the reaction goes |
|---|---|
| The ✦ sheet on a plain page (a voice session) | `POST /api/session/react`: a line in the session's file, so it survives a reload and every viewer sees it |
| A panel with its own list (the demos) | the panel's own list |
| A card's panel (`source` given, no `react`) | nowhere: reactions are off, because one that vanished on reload would lie |

### The assistants react too

In a voice session, an assistant reacts by making its whole reply one emoji. Servex (`Servex/agents/Sessions.js`, `LONE_EMOJI`) turns that reply into a `react` line on the owner's message instead of a bubble. The owner's own reactions reach both assistants as a plain note at the top of their next message, and a ❓ on an assistant's line asks the smart assistant to explain at once. The detail: [ext/Session/doc/sessions.md](/framework/ext/Session/doc/sessions.md).

## Threads: a reply under the message it answers

Tap a bubble to select it, then press **Reply ↩**. A "↩ Replying to …" bar shows above the box (× cancels it), and your next message goes into a thread right under that bubble, folded to "▸ N replies". A reply from the last two minutes opens its thread so you see it.

```json
{"chat": {"at": "…", "from": {"kind": "owner"}, "text": "why that file?", "re": "<the parent's at>", "thread": true}}
```

- `thread: true` is what makes it a thread. Every assistant reply also carries `re` (the line it answers) and stays in the main flow, so `re` alone never threads.
- Threads are one level deep: a reply to a message that is already in a thread joins that same thread.
- If the parent is not on screen (a page opened mid-conversation), the reply is drawn in the main flow rather than lost.
- `ChatPanel` offers Reply when it keeps its own list, or when its host passes `threads: true` (the ✦ voice sheet). In a voice session, Servex keeps `re` + `thread` on your line, tells both assistants which line you replied to, and threads their answers under the same bubble.

## Avatars: the icon is the name

Every bubble starts with a small round icon, and the words begin on the same line beside it. There is no name text: the icon is the author. It is tinted with the role's colour, and hovering it shows who made the message: the role and the exact agent id (`from.agent`, when the line has one).

| Who | Icon |
|---|---|
| You | 👤, or your own (below) |
| The fast assistant | ⚡ |
| The smart assistant | 🧠 |
| Any mastermind | the site's M logo (`/assets/img/favicon.png`) |
| Any other assistant | 💬 |
| Manager, master assistant, minion | 📋, 🧭, 🔧 |
| Anyone else | 🤖 |

Your own icon is one setting, kept in this browser: `set_avatar("🦊")`, or an image url for a photo (`set_avatar("/me.jpg")`); `set_avatar("")` goes back to 👤. There is no picker yet.

The 🎤 (said) or ⌨ (typed) mark is small and faint after each message's last word.
