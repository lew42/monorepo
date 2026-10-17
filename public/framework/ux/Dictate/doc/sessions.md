# One rolling voice session, or many

The browser voice chat is one session shared by every page (`chat.js`, kept in `sessionStorage` under `lew42-voice-session`). The question: should the "New session" button start separate sessions, or should there be one continuous session that is chunked later?

## What already rolls today

Starting a session on a page within an hour of its last line continues that session (`ext/Session`, `/new`). So the chat is already one rolling session with an hour-long edge. "New session" sends `fresh: true`, which is the only way to start a separate one.

## The two options

- **(a) Several sessions, a working button.** The owner presses "New session" for a clean slate. Simple and already built.
- **(b) One continuous session.** The file is cut into archive chunks at silences, and the refined prompts become a hierarchy of ideas (`ext/Refine/Outline.js`, `structure.js`). Nobody has to create a session.

## Test of (a), headless (`test/new-session.mjs`)

Typed sentences, no mic, against the live site. All pass:

- The demo on `/framework/ux/Dictate/` shows a typed sentence, "New session" clears the chat, and the next sentence is accepted (a new session starts: `POST session/new`).
- **Bug found and fixed in `chat.js`:** the demo (`keep:false`) wrote to the shared `lew42-voice-session` key on every reset and session start, which overwrote the key the ✦ sheet relies on. It now writes only when it persists.
- Not tested headless: the ✦ sheet's kept mount. It uses the same `reset()`, so it is expected to behave the same, but it has no proof yet.
- Seen, not understood: after a reset the demo showed a line typed by an earlier test run in a different mount. It is worth a look when someone changes `chat.js` again.

## Decision

**(b) is the direction; (a) stays as the manual escape hatch.** A Refine outline already turns prompts into a hierarchy, and chunking by silence is a script, not a screen. The button costs nothing and exists, so it stays for a clean slate.

- (a) wins when you want a hard stop: a new topic, a new person, or a failed run.
- (b) wins for day-to-day talking, because nobody has to remember to press anything.

## First step toward (b): a dry-run chunker

`chunk-session.mjs` reads one session file and prints where it would cut: at a silence of an hour or more (or a line cap). It writes and moves nothing; a later step moves by that manifest (never destructive).

```
node ux/Dictate/chunk-session.mjs ux/Dictate/ai/v-6jvcrk2.jsonl 1 80
chunk  from                   lines  first words
1      2026-10-01T19:49:07Z   80     Testing, can you hear me?
2      2026-10-01T20:01:30Z   80     Yeah, seeing these have scrolled to the bottom.
3      2026-10-01T20:13:17Z   64     In fact, that'd be the best name for
```

That 224-line session has no hour-long silence, so only the line cap cut it. Next: run it over all files in `ux/Dictate/ai/` and move chunks by manifest.
