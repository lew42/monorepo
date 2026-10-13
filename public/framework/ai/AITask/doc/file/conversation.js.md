A Claude session transcript, read as a chat: the owner's messages and
Claude's replies alternating down one column, oldest first, with a rail of
every prompt beside it.

It replaced **`feed.js`** (the same transcript, newest-first, expanded) and
**`replay.js`** (the same transcript again, as a rail of threads with a detail
column). Both were on the Session tab at once — the whole log rendered twice,
in two shapes, neither of which read as a conversation, and the rail/detail
pair could only ever show one turn.

## Talk is content; everything else is a run

`ingest()` sorts each line into one of three things: a message the owner
typed, a sentence Claude said, or a **run** — a maximal stretch of tool calls,
tool results, thinking and sidechain lines between two pieces of prose. A run
is one grey line saying what it did (`run_label()`: "thought, edited 3 files,
ran a command") that opens on click. A long session is a few dozen sentences
inside two thousand lines of tool noise, and the sentences are what a reader
came for.

⚠ One assistant line usually holds **both** — a sentence and the tool call it
introduces. An earlier version said the sentence and returned, which silently
dropped every tool call Claude narrated, i.e. most of them. The line now goes
into the run below it with its text removed, so nothing is printed twice.

## The fold builds on its first open

A run's body is not rendered until someone opens it. `message.js`'s `fold()`
now works the same way for the same reason: a hidden subtree is still built,
still in the DOM, and — when the body is a whole nested transcript — still
fetched.

## `id="m-<uuid>"`, and the deep link `replay.js` never had

Every owner message carries the uuid of its transcript line as an element id,
so `reveal(uuid)` scrolls to it and lights it, and `?m=<uuid>` (or
`#m-<uuid>`) in the url opens the Session tab there on a cold load. That
closes `replay.js`'s own recorded Improvement #2 — `ref()` has always copied a
`sessionId#uuid` reference to the clipboard and there was nothing to paste it
into.

⚠ `block: "start"`, not `"center"`: a dictated message can be 2,000px tall,
and centring one puts its first line a screenful above the viewport (measured:
top at -1029).

## The rail is an index, and it has to look like one

Three things it now does that it did not:

- **It says what it is.** `PROMPTS · 64` sits above the list. A column of grey
  one-liners beside a conversation announces nothing on its own.
- **Every row carries its time.** On one mastermind session the rail was 16 rows
  reading `/mastermind` out of the first 20: a table of contents whose rows
  cannot be told apart is not one. The clock is the one thing that always
  differs, so `.ai-prompt` is a flex row — label ellipsised, time never.
- **It disappears below two prompts.** This run's own session is 447 lines and
  exactly one message the owner typed, and the rail was a lone 26px clipped copy
  of the message beside it: a control whose click has no visible consequence.

⚠ `el.hidden` alone did nothing here. `.ai-chat-rail` declares `display: flex`,
which beats the browser's own `[hidden] { display: none }` — the rail measured
54px tall while "hidden". A box given a `display` has to say what hidden means
for itself (`ai.css`).

⚠ A tool `run_label()` has no word for used to print its raw camelCase name
bare — "… spawned 6 agents, ScheduleWakeup" — which reads as a glitch rather
than a report. `phrase()` names it as something that was done: "used
ScheduleWakeup".

## Improvements

1. **Only the owner's messages get ids.** A reply of Claude's cannot be linked
   to. Nothing has asked for that yet, and an id per assistant line is a lot of
   ids. *(low)*
2. **Polling is still `POLL_MS`, localhost only.** The `Range` request means a
   poll costs only the new bytes, so this is cheap — but a socket would be
   exact, and `ext/JSONL`'s `live()` already has one for files in the repo.
   *(medium; the transcript is outside the repo, so the dev server would need
   to watch `~/.claude/projects/` to offer it)*
