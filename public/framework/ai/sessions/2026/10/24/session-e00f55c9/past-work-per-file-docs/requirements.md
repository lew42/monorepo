# Past work: find the per-file documentation system

Haiku, high effort. Budget about $2. **Search and report only: no code changes.** Going past 100k tokens of context is fine here (this is a trial of using Haiku for long searches).

## The owner's ask (2026-10-24, prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` line 402)

"At one point I created a whole system, I think in one of our documentation classes, for a per file README. So like any JavaScript file, frankly, any README file, you could have... I don't know if it was saved in the doc subdirectory or if there was like a doc/file sub namespace... basically just a way to create a new file for any existing file. See if you can find anything about that."

## Report as you go (most important)

- The moment you find something promising, log it with the `log` tool: `find: <path> | <what it is, one line> | confidence high/medium/low`. Don't wait for the end.
- Then keep digging from that find: who imports it, its readme, where it's linked, whether it's used.
- Nothing promising after a round? Try the next terms. Don't stop early.

## Where to look, in this order

1. `node Server/PastWork.mjs "per-file doc"`, then `node Server/PastWork.mjs "doc/file"` and `node Server/PastWork.mjs "file readme"`.
2. The doc modules: `public/framework/ext/Doc/` (readme, classes, `doc/`), `public/framework/ext/files/`, any `FileDoc` / `FileView` / `File` class.
3. Paths: `find public/framework -path "*doc/file*"`, `-path "*doc/files*"`, `-name "*.doc.md"`, `-name "*.js.md"`.
4. Grep the repo (skip `node_modules`, `.git`, `worktrees`): `doc/file`, `doc/files`, `per-file`, `per file`, `file readme`, `fileDoc`, `FileDoc`, `file page`, `file notes`, `sidecar`, `companion`, `page for every file`, `files:` (in Doc pages), `files.jsonl` (what writes it and what reads it).
5. The prompt logs (`public/framework/ai/**/page.jsonl` with `"type":"Prompt"`, `public/framework/ai/asks.jsonl`): the owner's own words about per-file docs, and when.
6. Memory notes in `C:\Users\mike\.claude\projects\c--Code-lew42-monorepo\memory\` (`doc-system-2026-08-15.md` and others).

## Land

- `findings.md` in this folder: the ranked finds (path, what it is, does it work today, where it is linked from, last commit date), and the owner's past words about it with their links.
- A short "method notes" section: which searches found it, which wasted time, and your context size at the end. This feeds the design of a Haiku past-work tool.
- Finish with a log line `show: <one line> | findings.md`.
