# How lew42/monorepo runs its agents today

Read on 2026-10-30, read-only.

- **Branch read:** `integration/data-shapes-2` at `9ba46ee8` (2026-10-28). Links below use this sha.
- **`main`** at `b55a7cae` is from 2026-08-07. It is 7,368 commits behind `michael/dev` (GitHub compare API, 2026-10-30). The real trunk is `michael/dev`.

Short form of permalinks: `B = https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895`

---

## 1. Instruction files

### What exists

- **Root `CLAUDE.md`** (60 lines): ten "Laws", safety, cost, "Ask before", "Where to look". It says "Do not edit it without asking."
  [B/CLAUDE.md#L1-L60](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/CLAUDE.md#L1-L60)
- **Root `readme.md`** (81 lines): setup, a "Systems" index, Cloudflare previews, branch naming for human devs.
  [B/readme.md#L12-L31](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/readme.md#L12-L31)
- **No root `AGENTS.md`.** The vendor-neutral base lives at `public/framework/ai/agents.md` (33 lines), decided 2026-10-24.
  [B/public/framework/ai/agents.md#L1-L33](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/agents.md#L1-L33)
  No harness finds it there on its own: Codex, Cursor, Copilot and the rest look for `AGENTS.md` at the root and in folders on the path (see notes.md).
- **The framework index** `public/framework/readme.md` (85 lines) is the "mandatory for every agent" module index.
- **Role readmes** in `Servex/agents/roles/` (minion 117 lines, mastermind 256 lines, reviewer, clarity, and more).
- **`mastermind.md` per folder:** `public/framework/ai/mastermind.md` (124 lines) is the only one in use, plus one under a skill.

### The "read first" chain, as written

CLAUDE.md tells every agent to read, in order: the framework readme, its role readme, `ai/handover.md` and `git log`.
[B/CLAUDE.md#L8-L14](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/CLAUDE.md#L8-L14)

For a VS Code tab or CLI session, all of that is a **tool call** (a Read). So it is conversation context, and compaction summarizes it.

### Known gap the repo already records

`agent-base-proposal.md` says putting `agents.md` itself into the Servex system prompt is "not done yet".
[B/public/framework/ai/doc/agent-base-proposal.md#L11-L19](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/doc/agent-base-proposal.md#L11-L19)

`readme-system.md` notes: the readme chain gives `public/framework/readme.md` only to agents whose folder is under it; a `Servex/` or `Server/` agent misses it.
[B/public/framework/ai/doc/readme-system.md#L5](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/doc/readme-system.md#L5)

---

## 2. How a Servex agent gets its instructions

Servex starts each agent with the Claude Agent SDK `query()` (`@anthropic-ai/claude-agent-sdk`, pinned to `latest` in `Servex/package.json`).

### Into the SYSTEM prompt (survives compaction)

- `Agent.options()` passes `systemPrompt` from `role_prompt()`.
  [B/Servex/agents/Agents.js#L1345-L1359](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Agents.js#L1345-L1359)
- `role_prompt()` returns `{type: "preset", preset: "claude_code", append: role_system(...)}`.
  [B/Servex/agents/Agents.js#L1285-L1296](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Agents.js#L1285-L1296)
- `role_system()` = role readme + the role's skills (SKILL.md text, frontmatter cut) + the path blocks.
  [B/Servex/agents/roles.js#L180-L185](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/roles.js#L180-L185)
- **`spawn_agent({path})`**: `path_parts()` adds `<path-readmes>` (the readme chain from root to the path) and `<path-mastermind>` (`<path>/mastermind.md`, else `<path>/ai/mastermind.md`).
  [B/Servex/agents/roles.js#L187-L206](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/roles.js#L187-L206)
- `path_check()` proves every listed file's text is inside the final `append`, and the first message says what loaded (or a WARNING).
  [B/Servex/agents/roles.js#L208-L224](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/roles.js#L208-L224)
- The readme chain walker: root, then each folder down, `readme.md` or `README.md`, whole files, about 12k-token cap that drops middle levels first. It skips CLAUDE.md on purpose.
  [B/Servex/agents/readme-chain.js#L65-L98](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/readme-chain.js#L65-L98)
- Spawn code that resolves `path` and names the agent `mastermind-<folder>`:
  [B/Servex/agents/Agents.js#L141-L154](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Agents.js#L141-L154)
- Live proof recorded in the repo: a codeword in `append` was still answered after `/compact` (25,885 to 1,334 tokens).
  [B/public/framework/ai/doc/context-drift.md#L7-L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/doc/context-drift.md#L7-L13)

### Into the FIRST MESSAGE (lost at compaction)

- With no `path`, a task-dir or page agent gets the readme chain in its first message via `first_prompt(dir)`.
  [B/Servex/agents/Agents.js#L230-L244](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Agents.js#L230-L244)
- The task brief also rides in the first message.

### Reloaded by Claude Code itself

- `setting_sources` is unset for normal spawns, so the SDK loads user, project and local settings: `CLAUDE.md`, `.claude/settings.json` hooks, `.claude/skills`.
- Isolated agents (voice, directory mastermind, experts, jobs) pass `setting_sources: []` and get **no** CLAUDE.md at all.
  [B/public/framework/ai/doc/agent-context.md#L34](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/doc/agent-context.md#L34)

### The role reminder

After each compaction and every 100k tokens, a short reminder (role readme path, bold rules, headings) rides on the next `UserPromptSubmit` / `PostToolUse` hook as `additionalContext`. It covers the role readme only, not the readme chain or agents.md.
[B/Servex/agents/Agents.js#L1298-L1342](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Agents.js#L1298-L1342)
[B/Servex/agents/roles.js#L224-L244](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/roles.js#L224-L244)

---

## 3. Skills

- 38 skills in `.claude/skills/*/SKILL.md`, plus `skills-archive/`. Index: `.claude/skills/readme.md`.
  [B/.claude/skills/readme.md#L1-L28](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.claude/skills/readme.md#L1-L28)
- Servex reads them as **plain files**: `SKILLS_DIR` points at `.claude/skills`, and `skill_text()` strips the frontmatter.
  [B/Servex/agents/roles.js#L264-L291](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/roles.js#L264-L291)
- A `skill({name})` MCP tool serves the same text to clients with no Skill tool (the Claude app voice session).
  [B/Servex/doc/skills.md#L24-L26](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/doc/skills.md#L24-L26)
- Measured: when the model had to choose to load a role skill, 98.0% did. Servex now inlines them (100% by construction).
  [B/Servex/doc/skills.md#L3-L5](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/doc/skills.md#L3-L5)
- Several "skills" are really role readmes (a SKILL.md that says "Read `Servex/agents/roles/<role>.md`").

---

## 4. Hooks (`.claude/settings.json`)

All run `node ${CLAUDE_PROJECT_DIR}/.claude/hooks/*.mjs`.
[B/.claude/settings.json#L14-L236](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.claude/settings.json#L14-L236) (SessionStart at L88-L115)

- **PreToolUse:** `junction-guard`, `git-guard`, `jsonl-guard`, `server-guard` on Bash/PowerShell; `jsonl-guard`, `auto-hold` on Write/Edit; `spawn-session` on `spawn_agent`.
- **SessionStart:** `session-page.mjs` prints the tab's own page line; `ledger.mjs` on resume.
- **PostToolUse, Stop, SessionEnd, UserPromptSubmit:** the ledger, reply/prompt relays, the session audit.
- **No PreCompact or PostCompact hook,** and no SessionStart hook with matcher `compact` that re-adds rules. After a compaction a VS Code tab gets back only its page line.
  [B/public/framework/ai/doc/context-drift.md#L24](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/doc/context-drift.md#L24)
- `permissions.defaultMode: bypassPermissions` for the whole project.

---

## 5. Branches, worktrees, merging

### Names in use (GitHub, 2026-10-30)

- `main` (stale, protected by a ruleset: PR required, no force push, no delete).
- `michael/dev`: the trunk every agent lands on.
- `worktree/<slug>`: made by `Server/worktree-up.mjs` (local only, not pushed).
  [B/Server/worktree-up.mjs#L86-L121](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/worktree-up.mjs#L86-L121)
- `qf-*` pool slots (`Servex/Pool.js`), and `landed/<slot>-<date>-<sha>` to keep an applied branch reachable.
  [B/Servex/Pool.js#L250-L262](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/Pool.js#L250-L262)
- `integration/<name>`: several builds merged and tested together for one owner review.
  [B/public/framework/core/Session/tasks/data-shapes/build/integration-2/requirements.md#L1-L20](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Session/tasks/data-shapes/build/integration-2/requirements.md#L1-L20)
- `<person>/<topic>` for human collaborators (`alex/…`, `castin/…`, `edric/…`) and `claude/<topic>-<id>` from cloud sessions.
- The root readme's onboarding still says "switch main, pull, branch" — but `main` is two months stale.
  [B/readme.md#L41-L69](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/readme.md#L41-L69)

### Worktrees live outside the repo

`C:/Code/lew42/worktrees/<name>`, each with its own `npm ci` (never a junction to main's `node_modules`, after two incidents). Cleaned every 10 minutes by `Servex/Worktrees.js`.
[B/Servex/Worktrees.js#L12-L54](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/Worktrees.js#L12-L54)

### Landing: `Server/merge.mjs`

The one serialized way to land. Lock file, review gate, nav gate, smoke test, then a **three-way write per file** (`git merge-tree` / `git merge-file`) into the dirty main tree. It never runs `git merge` and never resets, stashes or rebases.
[B/Server/merge.mjs#L1-L57](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/merge.mjs#L1-L57)

Why: the main tree is shared and live. Servex and the site append to `*.jsonl` there all the time, and a plain `git merge` over that once lost record lines.
[B/public/framework/ai/sessions/doc/commit-rule.md#L42-L54](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/sessions/doc/commit-rule.md#L42-L54)

`*.jsonl merge=union` in `.gitattributes` keeps both sides' appended lines.
[B/.gitattributes#L1-L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.gitattributes#L1-L13)

### Guards

`git-guard.mjs` blocks, in the main checkout: `stash`, `reset --hard`, `checkout -- .`, `restore`, `clean -f`, `merge`, **`pull`**, **`rebase`**, `--autostash`, and recursive deletes.
[B/.claude/hooks/git-guard.mjs#L1-L44](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.claude/hooks/git-guard.mjs#L1-L44)

### Commits

- The log sweeper (`Servex/LogSweeper.js`) commits record files every 30 minutes: `servex: log sweep (N files)`.
- Code is committed by the agent that wrote it, in its worktree.
- A `post-commit` hook adds each commit hash to the task's `task.jsonl`.
  [B/Server/git-hooks/readme.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/git-hooks/readme.md)
- No test-first commit rule is written anywhere in CLAUDE.md or agent-rules.md.

### Pushing and pulling

- **Pushing** started 2026-10-29 on `michael/dev` (commit `ecd14599`, after this branch): `merge.mjs` pushes `michael/dev` after each landing; a failed push only warns. The reason given: a cloud agent's clone was 6,089 commits behind.
  [michael/dev ecd14599](https://github.com/lew42/monorepo/commit/ecd1459919067b9438f8125791397dee66628aa0)
- **Pulling / fetching:** no Servex or Server code runs `git fetch` or `git pull` (grep, 2026-10-30). Nothing tells a local agent that someone else pushed. A cloud session's push to `claude/<topic>` is invisible locally until someone fetches by hand.

---

## 6. What ties the repo to the owner's PC

- **Hard-coded paths:** `C:/Code/lew42/monorepo` and `C:/Code/lew42/worktrees` in `Servex/files.js`, `git-guard.mjs` (fallback), `Server/smoke.mjs`, `Server/TranscribeLoop.mjs`; Servex scans `C:/Code` for projects.
  [B/Servex/files.js#L9-L10](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/files.js#L9-L10)
  [B/Servex/Servex.js#L121-L122](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/Servex.js#L121-L122)
- **Windows-only process tools:** `powershell.exe`, `Get-CimInstance Win32_Process`, `netstat -ano` in `Lifecycle.js`, `Processes.js`, `Monitor.js`, `Pool.js`, `sustain.mjs`.
- **`.mcp.json`** points at `http://servex.localhost/mcp` and `http://monorepo.localhost/mcp`: these only exist where Servex runs.
- **Voice / Whisper / Dictate:** needs the local Whisper server and Servex.
- **Hooks** assume Servex (relays post to it) and fail open elsewhere.
- **Claude session files** under `~/.claude/projects/` are read for resume and spend: per machine.
- In a cloud checkout like this one, none of these run; an agent there reads files and pushes a branch.

---

## 7. Sync and tunnel today

- **Nothing fetches automatically.** No `git fetch` in Servex or Server code (grep). VS Code's `git.autofetch` defaults to `false` (VS Code source, `extensions/git/package.json`), so unless the owner turned it on, local `origin/*` refs are only as fresh as the last hand fetch.
- **Tunnel:** `Server/Tunnel.mjs` runs a Cloudflare quick tunnel to a small gateway that passes only `/mcp/remote…` to Servex (the Claude app's voice connector). `TunnelKeeper.js` restarts it every 60 s if it died.
  [B/Server/Tunnel.mjs#L8-L35](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Tunnel.mjs#L8-L35)
- **Named tunnel `servex.lew42.com`** is coded (`Server/TunnelNamed.mjs`) but blocked: the Cloudflare token can only list (needs Tunnel Edit + DNS Edit). Without it the hostname changes on each restart, so a GitHub webhook can't point at it reliably.
  [B/Server/TunnelNamed.mjs#L6-L36](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/TunnelNamed.mjs#L6-L36)
- **Cloud sessions** (like this one) clone from GitHub, run the repo hooks (they post to a Servex that isn't there and fail open), and push `claude/<slug>-<id>` branches.

## 8. Checked in this cloud checkout (2026-10-30)

Running the repo's own `git-guard.mjs` with the clone as `CLAUDE_PROJECT_DIR`:

| Command | Result |
|---|---|
| `git rebase origin/michael/dev` | blocked (exit 2) |
| `git merge origin/michael/dev` | blocked (exit 2) |
| `git pull` | blocked (exit 2) |
| `git push origin michael/dev` | **allowed** (exit 0) |
| `git push origin HEAD:main` | **allowed** (exit 0; GitHub's ruleset on `main` would still require a PR) |

So in the cloud the guard blocks the safe moves (rebasing a private clone) and allows the risky one (pushing the trunk from a machine that isn't the landing machine).
