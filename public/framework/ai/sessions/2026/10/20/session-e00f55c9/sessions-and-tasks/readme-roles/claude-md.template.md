# CLAUDE.md

Lew42 — a no-build, native-ESM web framework; the site is static, `Server/` is dev only.
This file rules; skills and readmes elaborate it. **Do not edit it without asking.**

This file holds the laws, safety and cost rules every agent needs. The framework's own rules (presentation, readmes and docs, classes, pages, the live site, traps) live in `public/framework/readme.md` and the doc it links, `public/framework/doc/rules.md`; the long form of the safety and cost rules is `public/framework/ai/doc/agent-rules.md`. Split 2026-10-22: every old sentence is mapped to its new home in `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md`; reworded ones keep their old wording in `public/framework/ai/doc/claude-md-archive.md`.

## Read first, in this order

1. **`public/framework/readme.md`** — mandatory for every agent: the module index and the framework's rules. Before you write a page, a readme, a class or anything the owner reads, also read the rule it links (`public/framework/doc/rules.md`).
2. **Your role's readme** — `Servex/agents/roles/readme.md` lists them (minion, mastermind, task mastermind, reviewer, clarity). A Servex agent gets its own readme in its first message; a VS Code tab reads it by hand.
3. **`public/framework/ai/handover.md`** and `git log --oneline -20` (below, "Where to look").

{{## Laws}}
## Memory, history, safety (long form: `public/framework/ai/doc/agent-rules.md`)

- **Context must not die in sessions:** decisions and insight go to the page or module they concern, linked to the source prompt, never left in chat. Post an update or log line at least every ~5 minutes of work.
- **File each ask the first time:** as a task on the session's record or a one-line note in the readme it concerns (`core/Task/readme.md`, "Using tasks").
- **Link, don't regenerate:** reference the prompt, session, task or doc by link; never retype what is written.
- **Never destructive:** don't delete logs, merge records or overwrite history; if something must go, move it aside and say so. Git is the undo.
- **Moves and renames are scripted, never retyped:** a node script with a dry run and a manifest of every old to new path. Then link anything that exists in the repo but not on the site.
- **Commit after every working step:** smoke-test, then commit, in a worktree; merge after reviewing the diff.
- **Stream, don't poll:** anything real-time is a JSONL append and a `live()` tail, never `setInterval` + `fetch`.

## Cost and roles (long form: `public/framework/ai/doc/agent-rules.md`)

- **Usage pace:** a mastermind runs `node Server/usage-now.mjs` when it starts and before each spawn. Over pace: Sonnet by default, no Opus without a stated reason, fewer agents.
- **Audits go to Haiku, under 100k tokens:** aim for 30–60k per request; a node script chunks big inputs. Sonnet is for UI and object-oriented code.
- **Mind the token burn:** let a script read and calculate, batch tool calls, no session replays or long audits unless asked, keep sessions short.
- **No hard fences between roles:** a capable agent just does the job; the mastermind is the one that decides and splits work.

{{## Ask before}}
{{## Where to look}}
