# Pseudo properties: V1's `{chat}` and `{place}` lines

**A pseudo property is a line in a voice session's `session.jsonl` whose top-level key (`chat`, `place`) is not a real field of the `Session` class.** The file replays as a stream of sets on the Session; most keys (`tasks`, `title`, `messages`) name a real property, so replay changes something real. `chat` and `place` name nothing the class has. They are events that each view interprets for itself. The term is the owner's; the real list that replaces them is [`session.messages`](../readme.md).

## The two kinds, and what writes them

| Line | Meaning | Written by |
|---|---|---|
| `{"chat":{at, session, path, from, via, text, re?, prompt?, floor?, cues?, fix?, level?}}` | one bubble: an owner sentence, an assistant reply, or a Servex note | `Servex/agents/Sessions.js`, through `write()` (line 674): `say()` (1032, the owner's words), `line()` (978, `session_line`, a reply or refined restatement), `heard()` (1478) and `hold_fast()` (1534) for the two seats' replies, `unanswered()` (577) and the notes at lines 419, 587, 1292, 1367 |
| `{"place":{re, where?, to?, text?, edit}}` | the fast seat's verdict on one sentence: where its bubble goes, and a cleaned text (`edit: improve` or `both`) | the fast seat itself (the voice assistant), through the item tool; `page_tools.js` lists `place` in `SESSION_KEYS` (line 449). `Sessions.voice_say()` (495) wakes it with one sentence at a time and tells it to write one `{place}` line per sentence; `heard()` drops any chat text it ends on (1486) |

Neither is a property: replaying them into a `Session` sets nothing. `session.messages` and `session.sentences` are the real ones (below).

## Who draws them (V1 readers)

About twenty files read a line with a `chat` or `place` key and draw it. The main ones, found by grep:

- `ux/Dictate/Widget.js`: `draw({chat})` (69, 80, 88, 113, 152), `entry.place` to `this.place()` (274), the held-back lines (322, 331, 346, 357, 365).
- `ux/Dictate/chat.js`: the wire reader (256 `line.place` to `panel.say({place})`; 265 `line.chat`; 266-284 the echo, dedupe and read-aloud path).
- `ux/Dictate/Dictate.js` (737, writes a `{chat}` revise entry) and `ux/Dictate/floor.js` (104).
- `ext/Chat/Chat.js` and `ext/Chat/ChatPanel.js` (the V1 thread), `ext/Session/Session.js`, `audio/Recite/Recite.js` and `ReciteHighlight.js` (read aloud), `ext/Refine/Placement.js` and `VoiceFollow.js`, `dev/DevBar/chat.js`, `ai/AISession/AISessionDetail.js`, `SessionTimelineRows.js`, `ai/sessions/v/mobile/MobileSession.js`, `core/Page/ext/Inbox/timeline/TimelineTalk.js`.

Chat V2 (`ext/Chat/v2/ChatV2Model.js:20`) reads `chat` only to remember which Prompt an owner line belongs to; V3 reads neither (it replays task deltas only, `ChatV3.js:86`). Re-run `grep -rn "\.chat\b\|\.place\b" public/framework` for the current list; it moves.

## Why it is a problem

- **No ids.** A bubble is `at` (a timestamp). A `{place}` points at a sentence by `re` = that `at`, and a revision by `fix:true` plus the same `at`. Two sentences in the same millisecond collide; an edit has nothing stable to name.
- **Order is a reading rule.** There is no list. Each view sorts by `at`, then applies `{place}` `to` / `where` moves, so a late `{place}` or a held reply (the `waiting` list in `Widget.js`, 322-365) moves a bubble under the owner's eyes, and two views can disagree.
- **Edits move bubbles.** A cleaned sentence arrives as a new line and the reader re-finds the old bubble to replace it; a missing `re` leaves an orphan (`Widget.js`, `orphans`).
- **No single list.** Each reader keeps its own model (Widget `lines`, ChatV2Model, the timeline rows), so the same file is three data structures, and every fix is made twice or more.

## How `session.messages` replaces it

`core/Session/Chat` ([readme](../readme.md)) holds the conversation as one ordered list of real Items, by id: `session.sentences` (the raw words), `session.messages` (`Prompt` holds its sentence ids and the cleaned text per sentence; `Reply` is anchored by `re.to`). Order is the list's order and never changes. Servex dual-writes it: `write()` (line 679) calls `mirror_chat()` (267) after every `{chat}` line, via `ChatWriter.js`, since b35ee6370; the fast seat's `{place}` improve is mirrored as an in-place `clean` edit since 9165c4e6c (`ChatWriter.place`). A `{place}` move (`to`, `where`) is deliberately not mirrored.

## How V1 switches over (not yet; builder.md step 8)

Each step only starts once `node Server/ChatV1Compare.mjs` (read-only; `core/Session/Chat/V1Bubbles.js` is the adapter, `compare.txt` beside this doc's task is one real run) shows the thing that step needs. Run it again before trusting any of these — it moves as more sessions get mirrored.

1. **V2 and V3 read `messages` first** ([views-on-messages.md](views-on-messages.md)) — done; nothing for the compare to check here.
2. **Every session must have a `messages`/`sentences` list, not just the newest ones.** Right now most real sessions have none at all, and even `v-u48msei` only got the tail mirrored (`readme.md`'s "only the tail written after chat-model step 1 landed was ever mirrored"). The compare must show **0 sessions still needing `ChatToMessages.plan()`** among the ones it checks — today it is 4 of 5 (every session but `v-timqv56` needed it, one, `v-u48msei`, even with real `messages` lines, was still missing most of its early tail). Nothing is migrated for real until this step; `--apply` stays unused.
3. **Ordering must match, not just counts.** `ChatWriter`'s reply-hold rule ("a reply never splits a message in progress", above) places a held reply after the owner's thought ends; V1 draws a `{chat}` line the moment Servex writes it, in file order. On the two biggest real sessions this is the dominant cause of difference in `compare.txt` (`v-sq8y7db`: 1114 of 1247 bubbles differ, `v-9dvbbrn`: 591 of 729) — once one reply lands at a different point, every later bubble index is shifted by one even though no words are lost (see `compare.txt` bubbles 137–166 of `v-9dvbbrn`: the same lines, one position apart, over and over). The compare must show **0 differing bubbles**, not just equal counts, on a session before `Widget.js` can trust the list's order over `{chat}`'s.
4. **V1's `Widget.js` draws `session.messages` instead of `{chat}`/`{place}`,** and its `waiting`/`orphans` machinery goes — only once a session clears step 3.
5. **The other ~20 readers move one by one** (read-aloud, timeline, mobile — the list above, "Who draws them").
6. **Last, Servex stops writing `{chat}` and `{place}`,** and every remaining old session is migrated for real: `node Server/ChatToMessages.mjs --apply` on each file the compare still finds missing `messages`.

Until step 6 both are written, and the `{chat}` lines stay exactly as they were. Nothing here is built yet; `V1Bubbles.js` and `ChatV1Compare.mjs` are read-only tools, not a migration.
