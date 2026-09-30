# The directory mastermind — `ask_directory`

Ask a question about one folder, and a **fresh** mastermind answers it. It starts from plain files
only: the project's `CLAUDE.md`, the readmes from the repo root down to that folder, and its two
skills. Nothing else is loaded, so what it knows is exactly what the docs say.

```js
ask_directory({ dir: "/framework/core/Page/", question: "How is a page reached?", session: "<voice session id>" })
// → { agent: "directory-mastermind-page", dir: "public/framework/core/Page", reused: false, session_id }
```

**Who calls it.** Usually a voice session's smart assistant (`session-smart`), routing a technical
question about one folder instead of answering it from its own context; any other agent may call it
too. **`session` is the voice-session id** (`v-…`): the same id `Session.start()` returns and the
smart assistant's brief names. It keys follow-ups, nothing else.

It returns at once. The answer arrives later as that agent's message to you (the ordinary wake,
`done: …`). Code: [`directory.js`](../directory.js), wired by one line in `Servex/Servex.js`.

## How it works

1. **`dir`** is a repo path (`public/framework/core/Page`, `Servex/agents`) or a site path
   (`/framework/core/Page/`, which is served from `public/framework/core/Page`).
2. **The first message is `opening(dir)`**, the same string, byte for byte, every time for that
   folder: `You're a mastermind working in <dir>.`, then `CLAUDE.md` (or `AGENTS.md`), then the
   readme chain (`readme-chain.js`, `first_prompt`), then the `sub-mastermind` and `page` skill
   files in full, then every other skill listed by path. It ends with "reply only: READY".
3. **The question is the second message.** So the first turn is identical every time, and the
   prompt cache can reuse it. The question message says: answer from the readmes and the code,
   change no files, cite paths, and end with a `Docs:` line naming any readme that was wrong or
   missing something.
4. **Follow-ups.** With `session`, a second question about the same folder in the same session goes
   to the same agent. If it was stopped (the idle stop, a Servex restart), it is reopened from its
   saved Claude session (`host.wake()`), so it still remembers the first question. A new folder gets
   a new agent. The map is kept in memory and in `directory-sessions.json` in Servex's home folder.
5. **Idle stop.** After 10 minutes with no message in or out, the agent is stopped. Its session file
   stays, so the next question in the same session reopens it.
6. **At most 2 per session.** A third folder in one session first stops the oldest idle one (it is
   reopened if asked again). If both are mid-answer, it goes over rather than cut one off.
7. **Hearing the owner too.** A directory mastermind reused within a session may be told to
   `follow` the session file (`public<home>ai/<session>.jsonl`), so it hears the owner's corrections
   as they are said: [`Servex/doc/follow.md`](../../doc/follow.md). The question itself still comes
   polished, from the smart assistant.

## Why it is built this way

- **Plain files, so any harness can run it.** `opening(dir)` is a pure function of the files on disk:
  no clock, no agent id, no Servex state. A harness for another model or provider (OpenRouter) can
  call it as is. The spawn sets `system` (Claude Code's own preset) so `Agents.spawn` sends that text
  untouched, with no id line and no skill-load preamble, and `setting_sources: []`, so `CLAUDE.md` and
  the skills come in once, as text, not again through Claude Code's loaders.
- **Questions change nothing.** The agent runs in `plan` permission mode, which refuses Bash writes
  too, and `Edit`, `Write` and `NotebookEdit` are refused outright. A
  readme that misled is named in the `Docs:` line; fixing it is a task, and only a merge updates docs.
- **Never held at the gate.** It spawns `urgent: true`, so Servex's spawn gate (low memory, 30 live
  agents) never swaps in a queued stand-in while the owner waits for an answer.
- **No junk wake.** The opening is a turn of its own, and every turn end wakes the parent. So the
  spawn names the parent (for the registry), but the live agent's parent is cleared until the
  opening turn is over; then it is set back and the question sent.

## `ask_directory` or `ask_expert`?

| | `ask_directory` | `ask_expert` ([`experts.md`](./experts.md)) |
|---|---|---|
| Starts from | the folder's readmes, CLAUDE.md, two skills | a module's recipe: readmes and key files in full |
| Each question | a fresh session, or the same one for a follow-up | a **fork** of one saved checkpoint, answers once |
| Knows | only what the docs say, then reads code itself | the files the recipe loaded |
| Use it for | a question in a voice session, and testing whether the docs are enough | a fast, cheap answer about a module that has an `expert.json` |

The owner ruled out forking here (2026-09-29): a directory mastermind is fresh by default, so a
wrong or missing readme shows up as a wrong answer instead of being papered over by a checkpoint.

## Watch out

- The parent sees only the first 300 characters of each answer (`Agents.wake_parent`). The question
  asks for a one-sentence answer first; the whole answer is in the agent's own log,
  `agent-<id>` (`server_logs`).
- The cache is shared across agents only if the files did not change between them. Claude Code's own
  system prompt also carries the working directory and git status, so two agents started minutes
  apart may still miss the cache on their first turn; a follow-up on the same agent always hits it.
- A caller with no Servex id (a terminal) gets no wake: pass `parent`, or call `wait_for_agent`.
