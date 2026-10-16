# One session folder: proposed shape

This is a proposal for [R1–R17](requirements.md), and it waits on the owner's approval. mastermind-page agreed to it. The full version, with every rule and guard, is [doc/shape-full.md](doc/shape-full.md).

## The folder

```
sessions/2026/10/16/
  voice-20261016/            ← a session; folder name = agent id
    session.jsonl            ← its record (Session's log)
    page.jsonl               ← its page
    index.json               ← a cache for the grid
    requirements.md          ← for people
    accounting/              ← a task (has task.jsonl)
    helper-accounting/       ← a sub-session (has session.jsonl)
```

- **The one record:** the raw transcript in `~/.claude/projects` is the record of what was said and spent. The folder never copies it.
- **Children:** each task and sub-session is a plain child folder. Its own log file says which one it is.

## What `session.jsonl` holds

`class Session extends Item`. Each line names one `Session` method.

| Line | Holds | Written by |
|---|---|---|
| `session` | id, parent, model, provider, kind | spawn code |
| `req` / `check` | each requirement, and whether it was met | the agent; checked at landing |
| `tag` | modules worked on (`module/core/Page`) | a script over the transcript |
| `child` | each task and sub-session | spawn code and new-task |
| `cost` | the running total, Claude and OpenRouter kept apart | the Digest, after each turn |
| `prompt` | a link to a transcript line, with no text | the prompt hook |

## Recommendation: link prompts

- **A link, not a copy:** a `prompt` line points at the transcript, and the page reads the text from there.
- **Refinement:** skip it for now.
- **Exception:** a cloud session keeps the text, because it has no transcript on this PC.

## When to open a task

- **Open one** when the work changes files, takes more than a few minutes, or will be looked for again.
- **Don't** for a question, a status check or a lookup.

## The rename, in four commits

1. **One lookup** that finds `session.jsonl`, falling back to `task.jsonl`.
2. **The writers** make `session.jsonl`.
3. **A scripted, reversible `git mv`** of the 757 files.
4. **The skills and readmes.**

Then the copies listed in [answers.md](answers.md#r14) go away, one at a time.
