# Common to every brief in this run

Load the `minion` skill first; it carries the three laws, the never-list and how to land. This
page adds only what is specific to the Servex run.

- **The full ask** is in [`requirements.md`](requirements.md) beside this file — the owner's
  architecture brief, verbatim, sections A–I and three phases. Read your section(s) there.
- **The owner is away and their dev server on :80 is theirs.** Never touch it. Every proof you
  need runs against a private server you start and kill by PID. Ports 8090–8099 are the minion
  range; your brief names yours. The old Servex repo is `C:/Code/servex` — read it, never edit it.
- **The Servex port lives at `Servex/`** in the monorepo root beside `Server/`. It has its own
  `package.json`; `pm2`, `http-proxy` and `@anthropic-ai/claude-agent-sdk` are the only new
  dependencies allowed, and only there (decision `servex-home` in the run ledger). The monorepo
  root `package.json` stays as it is.
- **Nothing you write breaks the owner's site.** Files under `public/` and `Server/` are live;
  take the reload hold for any batch that touches them, `node --check` every `.js`, load the page
  headless before you release. `Servex/` is not served by the owner's server, so it is safe.
- **Log, don't narrate.** `task.jsonl` in your task dir: launch line with your session id, `log`
  lines for findings and decisions (via `node .claude/hooks/append.mjs`), a `decision` line for
  every fork in the road with the alternative named. Never a `findings.md`.
- **Your report is a PAGE (`page.js`), never a raw readme** (the owner, 2026-09-22 15:10: "a lot
  of the reporting has been linked readme's that load raw in the browser, very hard to read, way
  too long"). **Iceberg content**: the primary things first, named, a brief description only where
  the name is not self-evident, then a link into the iceberg of detail. A readme is the module's
  index for a coder; the report is for the owner, and it is a page with the thing shown, its
  parts named, a way in; detail one click down. The landing line's `outcome` is the same shape:
  the headline first, then plain sentences with links, the numbers in the log.
- **Resolve, don't park** — but three things do wait for the owner: money, deleting what git
  cannot undo, and their own config (`CLAUDE.md`, `.claude/settings.json`). Write those as an
  `ask` line with `needs: {owner, minutes}` and carry on with everything else.
- Run `skill-improvement` for any skill that misled you. Land with `finish-task`.
- **Minions work in worktrees from 17:55 on** (the owner: "why aren't minions working on
  separate worktrees so that live reload isn't even a problem?"). A minion that edits files the
  owner's site loads is launched in its own worktree (`C:/Code/lew42/worktrees/wt-<slug>/`, its
  own dev server on its own port, the main tree's uncommitted work carried in and committed as
  `carry-in`), proves there, and lands by ONE patch into the main tree (`git diff carry-in` →
  `git apply --3way`), behind a hold that lasts seconds. The reload hold is no longer the way to
  keep the owner's tab quiet; the worktree is. `Servex/node_modules` is not carried in — a
  worktree minion on `Servex/` runs `npm install` there first.
- **A hold names its fence** (18:30): `node Server/hold.mjs on "<slug> — <what>" --paths "public/framework/<your>/**"` — quoted globs; only those paths are held, everything else reloads at once for everyone. Seconds around the writes, never minutes.
- **A proof never writes to the live board** (19:55: five "New card · you" rows on the
  owner's screen were a minion's headless test). Prove against your own worktree server and a
  scratch board (`SERVEX_HOME` for Servex, a copy of `board.jsonl` in your task dir), never the
  main tree's `ai/board.jsonl`, `ai/prompts.jsonl` or the live Servex on 8090.
