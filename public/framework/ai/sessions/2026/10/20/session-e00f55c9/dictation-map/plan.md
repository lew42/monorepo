# Plan: one chat view that shows your live words and the refined prompt (2026-11-01)

**Status: a plan, nothing built. Every step marked ⚠ ask first changes Servex or what a live session writes, so it waits for your go-ahead.** The facts behind it are in [map.md](map.md) and [answers.md](answers.md).

## The idea in one paragraph

Keep **one view, V3**, and make it do everything V1 does well. V3 already reads the proper structure (the session's `tasks` list, replayed into a real `core/Session`), and it already shows raw words in gray while a Prompt is still moving. Two things are missing:

- **Most replies are invisible to it.** The smart seat's replies are written as old-style `{chat}` lines, and V3 never reads those. The fix: Servex writes each reply into its Prompt.
- **The live words are borrowed.** V3 shows them only while V1's widget is mounted beside it. The fix: the mic hands them to V3 directly.

Once V3 shows everything V1 shows, V1 retires behind a chip, and V2 folds into V3.

**Why V3 and not V1 or V2.**
- V1 is the best experience, but it reads the pseudo lines. Building on V1 would keep two line shapes forever.
- V2 reads the right lines, but it never had live words, and it folds lines by hand instead of using `core/Session`.
- V3 is the smallest step from the right data to V1's experience.
- **The alternative:** teach V1 to read the `tasks` list. It is more code, because `Widget.js` and `Chat.js` are built around `{chat}` bubbles.

---

## The steps, in order

| # | Step | Where | Size | Ask first? |
|---|---|---|---|---|
| 1 | **Live words without V1:** `ComposerMic` fires `chat-live` itself, so V3 works on its own. Today `Widget.js:828` fires it | `ext/Chat/Mic.js` (one line moves out of `ux/Dictate/Widget.js`) | small | no |
| 2 | **V3 draws a live reply:** subscribe to the SSE `{kind:"stream", role, text}` (the wire V1 uses, `chat.js:300`) and show the partial reply in the newest Prompt's card | `ext/Chat/v3/ChatV3.js` | small | no |
| 3 | **V3 matches V1's look:** markdown in replies (`ext/Chat/md.js`), the ✓/🧠 marks (`ext/Chat/cursors.js`, already shared by V1 and V2), reactions. This is the open owner task "V3 chat: look and work like V1, markdown…" in v-9dvbbrn | `ChatV3.js`, `ChatV3.css` | medium | no |
| 4 | **Replies go into the Prompt.** When the smart seat's turn ends with text, `heard()` (`Servex/agents/Sessions.js:1437`) writes `PromptLines.add_reply(prompt, …)` instead of a bare `{chat}`. It is code, not a prompt change, so every reply lands in the structure | `Servex/agents/Sessions.js` | small | ⚠ yes: Servex code and a restart (never during a voice call) |
| 5 | **Read both for a while:** until step 4 has run for a week, V3 also folds an old-style smart `{chat}` reply into the Prompt named by its `re` line. This is read-only, so old sessions show their replies too | `ChatV3.js` | small | no |
| 6 | **V3 becomes the default chip;** V1 stays one tap away | `ext/drawer/ChatView.js` (`KEY` default) | tiny | ⚠ yes: it changes what you see first |
| 7 | **Pause the fast seat.** Add `off` to `session-assistant.txt`'s words (`Sessions.js:79`). With V3 as the view, the fast seat's `{place}` lines are read by nobody, and it is the most expensive role (D6 in the map). The smart seat already writes the cleaned Prompt `text`. **Alternative:** keep it, but send it only the last 10 sentences instead of all of them (`voice_say`), which removes the growing re-read | `Servex/agents/Sessions.js` | small | ⚠ yes |
| 8 | **Stop writing the duplicate owner `{chat}` line.** `say()` writes only the Prompt `raw` and paragraph | `Sessions.js` `say()` | small | ⚠ yes: V1 stops working on new sessions, so this comes only after step 6 has held |
| 9 | **Migrate old sessions, append-only:** a node script reads each old session's `{chat}`/`{place}` lines and appends the Prompt lines it would have had. Dry run, manifest, never a rewrite (CLAUDE.md "moves are scripted") | `Server/ChatToPrompts.mjs` (new) | medium | ⚠ yes: it touches every voice session file |
| 10 | **Retire V1 and V2:** delete the chips and move V2's useful parts (in-place patch, resurface) into V3 | `ext/Chat/v2/`, `ux/Dictate/chat.js` | medium | ⚠ yes: major surgery (a dozen callers mount `chat.js`) |

**Steps 1–3 and 5 need no permission:** they are additive and read-only. They make V3 as good as V1 without changing what any session writes.

## What happens to the pseudo lines

**Read both for a while, then migrate.**

- **For now, nothing is deleted.** V3 learns to read old-style replies (step 5).
- **New sessions stop writing pseudo lines** once V3 is the default (steps 4 and 8).
- **Old sessions get appended Prompt lines** from a script (step 9). Their original lines stay, because the log is append-only.

| Pseudo line | Its future |
|---|---|
| `{chat}` from the owner | Replaced by the Prompt's `raw` (already written today) |
| `{chat}` from the smart seat | Replaced by Prompt `replies.add` (step 4) |
| `{place}`, `{summary}`, `{para}` | Stop with the fast seat (step 7); the smart seat's title and text replace them |
| `{refined}` (code, two model calls per long line) | Recommend stopping it too: V3 shows the smart seat's text, so `refined` duplicates it. ⚠ ask first |
| `{react}`, `{sent}`, `{quiet}`, `{nav}`, `{pause}`, `{select}` | Stay for now as session events. Not chat content; a later item-delta pass can fold them |

## The live words: on screen only, or in the file?

**Recommendation: keep the guesses on screen only, and write the finals.**

- **Finals are already written.** Each finished sentence becomes the Prompt's `raw` the moment `say()` runs.
- **Guesses stay on screen.** They change every 900 ms, so writing each one would add hundreds of lines per minute to `session.jsonl`.
- **The alternative,** for when you want another device to watch you dictate (the phone and the desktop at once): Servex relays the guesses on the session's SSE wire as `{kind:"live", text}` without writing them, the same way it relays a reply in progress.

## How we will know it worked

- **V3 shows every reply.** Count the replies in a new session: Prompt `replies.add` should equal the smart seat's turns. Today it is 56 of 938.
- **Live words in V3 alone.** Open V3 with the V1 widget unmounted, speak, and the draft still appears (headless check, ui-test).
- **Cost.** After step 7, a 30-minute session spends nothing on `voice-assistant` (Servex registry, `node Server/usage-now.mjs`).

## For voice-recite

The Recite plug point is step 2's live reply and step 4's settled reply: see [../voice-recite/dictation-notes.md](../voice-recite/dictation-notes.md).
