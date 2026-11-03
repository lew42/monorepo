# Proposal: portable agent instructions and a git strategy

For lew42/monorepo. Written 2026-10-30 by the agent-ops research agent.

- Facts and sources: [notes.md](notes.md).
- How it works today, with permalinks: [current-setup.md](current-setup.md).
- Drafts to review: [drafts/AGENTS.md](drafts/AGENTS.md), [drafts/CLAUDE.md](drafts/CLAUDE.md), [drafts/framework-git-readme.md](drafts/framework-git-readme.md).

Every change below has a test that fails today and passes after (section 7). Build order is always: commit the failing test, then the fix in a separate commit.

---

## 1. The short version

1. **Add a root `AGENTS.md`.** It becomes the one base file every agent reads: the laws, the readme-chain rule, safety, git, tests. Move the text of `public/framework/ai/agents.md` there and leave the old file as a one-line pointer.
2. **Make `CLAUDE.md` start with `@AGENTS.md`.** An `@` import is loaded with CLAUDE.md, and the root CLAUDE.md is re-read from disk after every compaction. A sentence saying "read agents.md" (today's pattern) is not loaded at all unless Claude decides to open it.
3. **Servex adds `AGENTS.md` to the system prompt** of every spawn, next to the role readme. It also puts the readme chain there for every agent that has a folder, not only for `spawn_agent({path})`.
4. **Keep skills in `.claude/skills/`.** They already follow the open Agent Skills format. AGENTS.md tells non-Claude agents they are plain files to read.
5. **Git:** one landing machine, everyone else pushes only their own branch. Servex fetches automatically (poll first, GitHub webhook through the Cloudflare tunnel next) and tells each agent when its worktree is behind. Nothing merges into a working tree by itself.
6. **Write the git rules in `public/framework/git/readme.md`**, linked from the root readme, the framework index and one line in AGENTS.md.

---

## 2. File layout

```
AGENTS.md                 the base: laws, readme chain, safety, git, tests (new)
CLAUDE.md                 "@AGENTS.md" + Claude-only notes (slimmed)
readme.md                 humans' index: setup, systems, deploy (+ a git line)
public/framework/readme.md  module index (unchanged; + a git line)
public/framework/git/readme.md  git rules for agents and humans (new)
public/framework/ai/agents.md   one line: "moved to /AGENTS.md" (kept, not deleted)
Servex/agents/roles/*.md  role readmes (unchanged)
<folder>/readme.md        each module's readme (the chain)
<folder>/mastermind.md    a folder's own mastermind notes (unchanged)
.claude/skills/*/SKILL.md procedures (unchanged home)
```

### Why AGENTS.md at the root, not a readme

- Codex, Cursor, Copilot, OpenCode, Jules and more find a root `AGENTS.md` with no setup. None will find `public/framework/ai/agents.md`.
- Claude Code reads `AGENTS.md` on its own since v2.1.277, but only when no CLAUDE.md exists. This repo keeps a CLAUDE.md, so the import is the reliable path (and the one the Claude docs recommend).
- A symlink `CLAUDE.md -> AGENTS.md` is out: on Windows it needs admin or Developer Mode, and git checks it out as a one-line text file.

### The readme chain rule (one sentence, in AGENTS.md)

> Before you change a folder, read every `readme.md` from the repo root down to that folder.

This matches how Codex already walks `AGENTS.md` files (root down to the working folder) and what Servex's `readme-chain.js` computes. It needs no tool support, so any model can follow it.

### What stays in CLAUDE.md

Only what is Claude Code specific: Servex tools, the Skill tool, hooks, `/compact` habits, the `updates` call. Everything a non-Claude agent also needs moves to AGENTS.md. Draft: [drafts/CLAUDE.md](drafts/CLAUDE.md).

**Owner decision:** CLAUDE.md says "Do not edit it without asking." This plan moves the laws into AGENTS.md word for word (law text unchanged) and leaves CLAUDE.md as an import plus Claude notes.

---

## 3. How each kind of agent gets the instructions, and keeps them

| Agent | Where AGENTS.md lands | Survives compaction? | Readme chain |
|---|---|---|---|
| **VS Code tab / CLI on the PC** | CLAUDE.md `@AGENTS.md` import, loaded at start as a project-instructions message | Yes: root CLAUDE.md and its imports are re-read from disk after compaction | Agent reads it (rule in AGENTS.md); a SessionStart `compact` hook re-adds the chain for the folder it last edited |
| **Servex SDK agent (Claude)** | System prompt: `append` gets `<agents-md>` (new), then role readme, skills, chain, mastermind.md | Yes: system prompt | System prompt, for every spawn with a folder (`path`, `task.dir` or `page`) |
| **Servex SDK agent on OpenRouter** | Same as above: same Claude Code runtime, only the model differs | Same | Same |
| **Cloud session (claude.ai/code)** | CLAUDE.md `@AGENTS.md` (part of the clone) | Yes, same as a tab | Agent reads it; same compact hook (repo hooks run in cloud) |
| **Codex / Cursor / Copilot / OpenCode** | Root AGENTS.md, read natively | Depends on the tool; Codex rebuilds it once per run | Agent reads it (rule in AGENTS.md) |
| **Gemini CLI / Aider** | Only with a small config file | Tool's own rules | Agent reads it |

### 3a. Claude Code (tabs, CLI, cloud)

- There is no project setting that puts a file into the interactive system prompt. CLAUDE.md is delivered as a message, but the root one is **re-injected after every compaction** (docs, "Instructions seem lost after /compact"). So the import is enough for AGENTS.md.
- Add one **SessionStart hook with matcher `compact`**: it reads `transcript_path` from its input, finds the folder of the last file the agent edited, and prints that folder's readme chain (reusing `capped_chain()` from `Servex/agents/readme-chain.js`). Compute, don't recall.
- Hook output is capped at 10,000 characters per string, and a chain is 13k to 28k characters today (measured: `public/framework/core/Page` 27,096; `Server` 12,759). So the hook prints the leaf readme whole and, for the levels above, their paths and bold rules, plus "read these files now". The root levels come back anyway: AGENTS.md through the import, and the root CLAUDE.md re-read.
- Prefer a hook print over more `@` imports: imports load on every turn for every tab, while the chain depends on the folder.

### 3b. Servex SDK agents

Two small changes in Servex:

1. **`role_system()` adds AGENTS.md first** (`Servex/agents/roles.js` L180-L185). Text in `append` is system prompt, so it survives compaction (the repo's own codeword proof).
2. **The chain goes to the system prompt whenever a folder is known.** Today only `spec.path` does that; a `task.dir` or `page` spawn gets the chain in its first message, which compaction summarizes (`Servex/agents/Agents.js` L230-L244). Use `spec.path ?? directory_of(spec)` for the path blocks.

Side effects to accept or tune:
- With default `settingSources`, the SDK also loads CLAUDE.md, so AGENTS.md arrives twice (system prompt and message), about 2k tokens. Accept it first. Later, test whether `settings: {claudeMdExcludes: [...]}` on the spawn removes the message copy, and only then use it.
- A changed `append` reaches a running agent only after its next compaction (the SDK records the prompt). The role reminder hook already covers that gap; add AGENTS.md's bold rules to the reminder the same way.
- `setting_sources: []` agents (voice, directory, experts) get no CLAUDE.md today. With AGENTS.md in `append`, they get the base too, where they use `role_system`. Those with their own `system` keep theirs (decide per agent).
- Consider `excludeDynamicSections: true` on the preset so every agent with the same AGENTS.md text shares one prompt cache.

### 3c. OpenRouter models

- Through Servex: nothing extra. OpenRouter only swaps the base URL and key, so the same `append` system prompt goes out. OpenRouter warns that non-Anthropic models "may not work correctly" in Claude Code, so test one non-Claude model with the codeword check (test T3).
- Through another harness (OpenCode, Aider, Codex with an OpenRouter key): root AGENTS.md is what they see. Add `.gemini/settings.json` (`context.fileName`) or `.aider.conf.yml` (`read: AGENTS.md`) only when someone actually uses those tools.

---

## 4. Skills

- **Keep the one home `.claude/skills/`.** Claude Code, cloud sessions and OpenCode read it; Servex inlines from it. All 36 SKILL.md files already have a `name` that matches their folder (the open standard's rule; checked 2026-10-30).
- **Don't add `.agents/skills/` now.** That is Codex's folder name. Two copies break "one of everything", and a link breaks on Windows. If Codex is adopted, a node script copies `.claude/skills` to `.agents/skills` and a check fails when they differ.
- **AGENTS.md says what a skill is:** "a plain Markdown procedure; read `.claude/skills/<name>/SKILL.md` when the moment comes; index in `.claude/skills/readme.md`". Any model can follow that.
- **Keep moving rules out of skills.** A skill that is really a role or a module rule belongs in that role or module readme (the repo already did this for role readmes). Skills keep procedures (new-task, finish-task, decide).
- After compaction, Claude Code re-injects invoked skill bodies, capped at 5,000 tokens each and 25,000 in all, top of file first. Put each skill's key steps at the top.

---

## 5. Git strategy

### 5a. The rules (also in the git readme draft)

1. **One trunk: `michael/dev`.** Only `Server/merge.mjs` on the landing machine (the PC) writes it, and it pushes after each landing (done 2026-10-29).
2. **Everyone else pushes only their own branch.** A cloud session, another machine, a human: never `michael/dev`, never `main`.
3. **`main` is production** (Cloudflare deploys it). Only the owner updates it, by a pull request from `michael/dev`.
4. **One worktree per agent, one branch per worktree.** Never edit code in the shared main tree.
5. **Fetch often, merge rarely, and never automatically.** Servex fetches for everyone. An agent integrates the trunk only at a safe point: after a commit, before the next step, and before landing.
6. **Rebase your own unpushed branch; merge anything shared.** Never rewrite `michael/dev` or `main`. A pushed branch that only you use may be rebased and pushed with `--force-with-lease`.
7. **Test first.** For a bug fix or a behaviour change: commit the failing test, then the fix, as two commits. Don't squash them.
8. **Small commits that each pass,** so a rebase or a bisect stays easy.
9. **Land through `merge.mjs` only** (it locks, reviews, smoke-tests and three-way writes). That is this repo's merge queue.

### 5b. Branch names

| Who | Branch | Example |
|---|---|---|
| Trunk | `michael/dev` | — |
| Production | `main` | — |
| Local Servex agent worktree | `worktree/<slug>` | `worktree/git-sync` |
| Quick-fix pool slot | `worktree/qf-<n>` (as now) | `worktree/qf-3` |
| Cloud session | `claude/<slug>-<id>` (the harness default) | `claude/web-crawler-design-analysis-og8s3r` |
| Another harness or model | `<tool>/<slug>` | `codex/readme-audit` |
| Several builds tested together | `integration/<name>` | `integration/data-shapes-2` |
| A person | `<name>/<slug>` | `alex/page-route` |
| Kept refs | `landed/…`, `refs/salvage/…` (as now) | — |

Cloudflare turns `/` into `-` for preview URLs, so keep slugs short.

### 5c. Who merges

- **Into a worktree branch:** the agent that owns it.
- **Into `michael/dev`:** `merge.mjs`, called by the mastermind that owns the task, after review. A cloud or other-machine branch lands the same way: fetch, make a worktree from `origin/<branch>`, review, `merge.mjs`. One small change: `worktree-up.mjs --from origin/<branch>`.
- **Into `main`:** the owner, by PR.

### 5d. Keeping every agent aware of upstream pushes

**What is common practice:**
- Developer machines **fetch automatically and show "behind by N"**, but never merge. VS Code: `git.autofetch` (off by default; on by default in its agents window), every 180 seconds. Git's own background `prefetch` even avoids moving remote-tracking refs, so users are not surprised.
- `git status` reports "behind" only as of the **last fetch**. It never asks the remote. So "git status tells you right away" really means "something fetches right away".
- Servers and CI **react to webhooks**. GitHub recommends webhooks over polling.

**What happens on the PC today:** nothing fetches. No Servex or Server code runs `git fetch` (grep, 2026-10-30), and VS Code's `git.autofetch` is off unless the owner turned it on (its default is `false`, verified in VS Code's source). So "behind" in `git status` is only as fresh as the last hand fetch, and a cloud session's push is invisible locally.

**Why not auto-merge into live worktrees:**
- The agent's view of the files goes stale under it mid-task.
- A merge over uncommitted work stashes or refuses. This repo lost record lines that way on 2026-10-13, which is why `git pull`/`rebase` are banned in the main tree.
- A conflict mid-task leaves a half-merged tree with nobody deciding.

**The design: a `GitSync` class in Servex** (`Servex/GitSync.js`, one class, one JSON state file, no AI).

1. **Trigger.** Any of:
   - a GitHub `push` webhook on `https://servex.lew42.com/hooks/github` (needs the named tunnel; see below),
   - a poll: `git ls-remote origin` every 2 minutes (refs only, no AI, no tokens),
   - Servex boot (catch-up, since GitHub doesn't resend missed webhooks),
   - local `michael/dev` moving (watch the ref; `merge.mjs` lands there).
2. **Fetch once** in the main repo: `git fetch origin --prune`. All worktrees share its refs, so one fetch updates them all.
3. **Compute per worktree:** `git rev-list --left-right --count HEAD...michael/dev` and against `origin/michael/dev`. Write `{worktree, branch, ahead, behind, at}` to Servex state and one line to the `servex` log.
4. **Notify, only on change:** an inbox line (the existing `updates` tool) for each agent whose `cwd` is that worktree, and for its mastermind: "michael/dev moved: N commits (subjects). At your next safe point: commit, then `git rebase michael/dev`, re-run your tests." No line when nothing changed, so no agent wakes for nothing.
5. **New remote branches** (`claude/*`, people's branches): one line to the landing mastermind's inbox and the Merge page ("ready to review"), not a broadcast.
6. **Alarm:** if `origin/michael/dev` moved and the landing machine did not push it, that breaks rule 1. Make a Note card for the owner.

**So that `git status` itself shows it:**
- `worktree-up.mjs` sets each new branch's upstream to the local trunk: `git branch --set-upstream-to=michael/dev`.
- On the PC the local trunk is the truth (landings happen there first). So `git status -sb` in a worktree prints `[behind N]` the moment `merge.mjs` lands, with no fetch. Checked in a scratch repo: `## worktree/x...michael/dev [behind 1]`.
- With git's default `push.default=simple`, a bare `git push` then refuses (the names differ).
- So set `git config remote.pushDefault origin` and `git config push.default current` once per clone. Then `git push` sends the branch to `origin/<same name>`, and `status` still compares with the trunk (checked: `worktree/x -> worktree/x`, status still `[behind 1]`).

**Webhook vs poll, for this setup:**
- **Poll first.** It works on every machine, needs no secrets, and costs nothing in tokens. 2 minutes is close enough for agents that integrate at safe points.
- **Webhook next, through the existing Cloudflare tunnel.** lew42.com DNS is on Cloudflare, so no relay Worker is needed. But the webhook needs a **stable hostname**. The quick tunnel gets a new random `trycloudflare.com` name on every restart. The named tunnel `servex.lew42.com` is built (`Server/TunnelNamed.mjs`) and, per its doc on `michael/dev`, still **blocked on a Cloudflare API token** that needs Tunnel Edit and DNS Edit. Local agents have an authenticated Cloudflare MCP, so a local agent can finish that setup with the owner's OK.
- Webhook steps: add `/hooks/github` to the gateway allow-list in `Server/Tunnel.mjs`; in Servex, check the `X-Hub-Signature-256` HMAC with a secret kept outside git, answer 202 within 10 seconds, dedupe on `X-GitHub-Delivery`, then run the same check as the poller. Keep the slow poll as a backstop.
- A relay Worker + Durable Object is only worth it if several machines must all receive every push. A tunnel has one origin per hostname (Cloudflare documents several replicas of one tunnel for failover, not a copy to each), so a second machine should use the poller. Not verified: how Cloudflare routes between replicas (its docs pages didn't load here).

**Cloud sessions** have no Servex. Their SessionStart hook (guarded by `CLAUDE_CODE_REMOTE=true`) runs `git fetch` and prints "this branch is N behind origin/michael/dev". The AGENTS.md rule covers the rest: fetch again before the final push, and rebase your own branch.

### 5e. Fixes the current guard needs

Run in this cloud checkout on 2026-10-30:
- `git rebase origin/michael/dev` is **refused** (exit 2). The guard treats any project folder as "the shared main tree", but a cloud clone is private. Cloud agents can't follow rule 6.
- `git push origin michael/dev` and `git push origin HEAD:main` are **allowed** (exit 0). `main` has a GitHub ruleset; `michael/dev` has none, and the cloud git proxy doesn't limit branches.

Fix in `.claude/hooks/git-guard.mjs`: when `CLAUDE_CODE_REMOTE=true`, allow rebase, merge and pull, and refuse a push to `michael/dev` or `main`. A GitHub ruleset can't do this alone: the cloud pushes with the owner's own token.

### 5f. Where the git rules live, so nobody has to repeat them

- **`public/framework/git/readme.md`**: the full rules, branch names, sync design, bootstrap. Draft: [drafts/framework-git-readme.md](drafts/framework-git-readme.md).
- **`AGENTS.md`**: a "Git" section with five one-line rules and a link to that readme. Every agent has it in context (import, system prompt, or natively).
- **Root `readme.md`**, Systems list, one new line: `- **Git** (branches, landing, staying current, a new machine): [public/framework/git/readme.md](public/framework/git/readme.md)`. Also replace its "New Dev Onboarding" steps ("switch main, pull, branch") with a link there, since `main` is not the trunk.
- **`public/framework/readme.md`** index, one line: `- [git](./git/) — branches, landing, staying current, a new machine`.
- **The notifier itself carries the rule:** each GitSync inbox line ends with "rules: /framework/git/".

### 5g. Portability: what breaks on a new machine

| Thing | Tied to | Fix |
|---|---|---|
| `C:/Code/lew42/monorepo`, `C:/Code/lew42/worktrees`, Servex scanning `C:/Code` | owner's disk | derive from `git rev-parse --show-toplevel`; one config module; env overrides |
| `powershell.exe`, `Get-CimInstance`, `netstat -ano` in Lifecycle, Processes, Monitor, Pool, sustain | Windows | say "Servex is Windows-only" in its readme; guard with `process.platform` |
| `.mcp.json` → `servex.localhost`, `monorepo.localhost` | Servex on port 80 | fine locally; in cloud, tools are just absent (say so in CLAUDE.md) |
| Voice, Whisper, Dictate | local Whisper server, mic | local only |
| `%LOCALAPPDATA%\lew42\servex\*` (tunnel token, remote URL) | per machine | bootstrap step |
| `cloudflare.env`, webhook secret | secrets | never in git; bootstrap step |
| `~/.claude/projects/*.jsonl` (resume, spend) | per machine | spend reports are per machine |
| `.git/hooks/post-commit` | per clone | run `node Server/git-hooks/install.mjs` |
| `node_modules` in each worktree | per worktree | `npm ci` (never a junction) |
| GitHub webhook URL | one machine | other machines poll |
| `main` 7,368 commits behind `michael/dev` | — | owner: release by PR, or change the default branch |

**Bootstrap checklist for a new machine** (goes in the git readme):

1. `git clone https://github.com/lew42/monorepo` and `git switch michael/dev`.
2. `npm ci` at the root and in `Servex/`.
3. `node Server/git-hooks/install.mjs`.
4. `git config remote.pushDefault origin`, `git config push.default current`, `git config fetch.prune true`.
5. Install Claude Code (2.1.277 or later); check with `/context` that CLAUDE.md and AGENTS.md show under Memory files.
6. Windows only, for Servex: `node Servex/sustain.mjs`, open `http://monorepo.localhost/`.
7. Secrets and the webhook (landing machine only): install `cloudflared`; put a Cloudflare token with Tunnel Edit and DNS Edit in `cloudflare.env`; run `node Server/TunnelNamed.mjs setup`, then `node Server/Tunnel.mjs down` and `up`; create the GitHub webhook (event `push`, URL `https://servex.lew42.com/hooks/github`) and save its secret in `%LOCALAPPDATA%\lew42\servex\` (never in git). A local agent can do the Cloudflare part through its Cloudflare MCP with the owner's OK; a cloud session can't. Other machines skip this and poll.
8. Not on Windows, or no Servex: no voice, no Servex tools. Work in a branch and push it; the PC lands it.
9. Run `node Server/portability-check.mjs` (new, test T11) and fix what it lists.

---

## 6. What needs the owner's decision

1. **Edit CLAUDE.md** to `@AGENTS.md` + Claude notes, with the laws moved word for word into AGENTS.md.
2. **`main`:** release `michael/dev` to `main` by PR now (the production site is from 2026-08-07), and how often after. Or make `michael/dev` the default branch.
3. **Webhook:** grant the Cloudflare token (Tunnel Edit, DNS Edit) so `servex.lew42.com` is stable, and create the GitHub webhook. Until then, the poller.
4. **Git guard in cloud:** allow rebase there, block trunk pushes (5e).
5. **Test-first check in `merge.mjs`:** warn only, or refuse a code fix with no failing-test commit.
6. **Codex skills folder:** only if Codex is adopted.

---

## 7. Tests: each fails today, passes after

All plain Node scripts in the repo's style (`node X.test.mjs`, `assert`, a counter), using real temp folders, real git repos with a bare "origin", and the real hooks and CLI. Mocks are named where used.

### T1. Root AGENTS.md exists and CLAUDE.md imports it
- **File:** `Server/agents-md.test.mjs`.
- **Steps:** read the repo root. Assert `AGENTS.md` exists, is under 16 KB (Codex caps at 32 KiB), and every relative link in it exists. Assert the first non-comment line of `CLAUDE.md` is `@AGENTS.md`. Assert `public/framework/ai/agents.md` is now a pointer to `/AGENTS.md`. Assert `AGENTS.md`, the root `readme.md` and `public/framework/readme.md` each link `public/framework/git/readme.md`, and that file exists.
- **Today:** fails (no root AGENTS.md; CLAUDE.md L14 points in words to `public/framework/ai/agents.md`; no git readme).
- **Honest:** yes, a pure file check.

### T2. A Claude Code session still knows an AGENTS.md rule after compaction
- **File:** `Server/agents-md-live.proof.mjs` (a proof, costs a few cents; run by hand, like `role-system-proof`).
- **Setup:** `git worktree add` a scratch worktree. Put a codeword line in AGENTS.md there (today: at the end of `public/framework/ai/agents.md`). Real Agent SDK, Haiku, `settingSources: ["project"]`, all tools allowed.
- **Steps:** turn 1: "Follow your project's read-first instructions, then say ready" (a real agent does this). Turn 2: `/compact`. Then a `PreToolUse` hook denies every file tool, and turn 3 asks "quote the codeword from your base instructions".
- **Expected:** turn 3 quotes it.
- **Today:** fails. The agent may read `ai/agents.md` in turn 1 (CLAUDE.md asks it to in words), but that read is conversation, so `/compact` summarizes it away; with file tools denied it can't re-read.
- **Honest:** denying tools after compaction isn't how an agent normally runs; it isolates the question "is the rule still in context?" from "will the agent think to re-read it?". That second question is the real-world risk, and it only makes today's result worse.
- **Also cover:** a subfolder session (cwd `public/framework/core/`), since CLAUDE.md above the cwd still loads.

### T3. Servex puts AGENTS.md in the system prompt
- **File:** add to `Servex/agents/role-system.test.mjs`.
- **Steps:** `role_system("minion")` and `role_system("mastermind", {path: "Servex/"})` include the AGENTS.md text inside an `<agents-md path="AGENTS.md">` block, before the role readme.
- **Today:** fails (`role_system` has no AGENTS.md part, roles.js L180-L185).
- **Live half (proof):** spawn a minion with `OTEL_LOG_RAW_API_BODIES=file:<tmp>`; grep the logged request's `system` field for the codeword; `/compact`; ask for it. Run once with an OpenRouter non-Claude model too.

### T4. A task-dir spawn gets its readme chain in the system prompt
- **File:** add to `Servex/agents/path-mastermind.test.mjs`.
- **Steps:** a fake spawn (no process, like the existing tests) with `task: {dir: "public/framework/core/Page"}` and no `path`. Assert `options().systemPrompt.append` contains `<path-readmes` with `public/framework/core/Page/readme.md`, and the first message does not contain "Where you are: readmes".
- **Today:** fails; the chain rides in the first message (Agents.js L236-L244).

### T5. A tab gets its folder's readme chain back after compaction
- **File:** `.claude/hooks/chain-after-compact.test.mjs`.
- **Setup:** a transcript `.jsonl` fixture copied from a real session, ending with an `Edit` on `public/framework/core/Page/Page.js`.
- **Steps:** run the hook with stdin `{"source":"compact","transcript_path":<fixture>}`.
- **Expected:** stdout contains `=== public/framework/core/Page/readme.md ===` with that file's text, names `public/framework/readme.md` and `public/framework/core/readme.md`, and is under 10,000 characters; with `source: "startup"` it prints nothing.
- **Today:** no such hook; the only SessionStart hook prints the page line.
- **Edge:** no edit yet in the transcript: print nothing.

### T6. The git guard: cloud agents may rebase, may not push the trunk
- **File:** add to `.claude/hooks/git-guard.test.mjs`.
- **Steps:** with `CLAUDE_CODE_REMOTE=true` and cwd = project dir: `git rebase origin/michael/dev` → exit 0; `git pull --rebase` → 0; `git push origin michael/dev` → 2; `git push origin HEAD:main` → 2; `git push -u origin claude/x` → 0. Without the variable, every existing case keeps its result.
- **Today:** rebase exits 2 and both trunk pushes exit 0 (run in this workspace, 2026-10-30).

### T7. A new worktree shows "behind" in plain `git status`
- **File:** `Server/worktree-upstream.test.mjs`.
- **Setup:** a scratch bare origin, a clone on `michael/dev`, a worktree made the way `worktree-up.mjs` makes it (call its branch step, skip the dev server).
- **Steps:** commit to `michael/dev` in the clone; run `git -C <worktree> status -sb`.
- **Expected:** the first line contains `[behind 1]`.
- **Today:** fails; the branch has no upstream (worktree-up.mjs L121 runs `git worktree add -b` only).

### T8. GitSync fetches, records and notifies, once
- **File:** `Servex/GitSync.test.mjs`.
- **Setup:** bare origin, a "PC" clone with two worktrees, a second clone playing the cloud session. A tiny fake `agents` list maps an agent id to each worktree (Servex's `Agents` is too big to start here; the inbox writer is the real one, in a temp `SERVEX_HOME`).
- **Steps:** `await sync.check()` → no lines. The cloud clone pushes `claude/x` and the PC clone lands a commit on `michael/dev`. `await sync.check()` again.
- **Expected:** state shows `behind: 1` for both worktrees; one inbox line per agent; one "new branch claude/x" line for the landing mastermind; a third `check()` with no change writes nothing.
- **Webhook half:** start the real HTTP handler on a free port. POST a push payload signed with HMAC-SHA256 of the raw body and a test secret → 202 in under a second, and a check runs. Wrong signature → 401 and no fetch. Same `X-GitHub-Delivery` twice → one check.
- **Today:** fails at import (no GitSync).

### T9. GitSync never touches a working tree
- **File:** in `Servex/GitSync.test.mjs`.
- **Steps:** leave an uncommitted edit in a worktree; run `check()` after an upstream change.
- **Expected:** the worktree's `HEAD`, its index and the edited file (bytes and mtime) are unchanged.
- **Today:** n/a until T8; this pins the "never auto-merge" rule so a later "helpful" change fails.

### T10. Test-first order is checked at landing
- **File:** `Server/TestFirst.test.mjs`.
- **Setup:** a scratch repo with a small module and its `.test.mjs`.
- **Cases:** branch A = commit 1 adds a test that fails, commit 2 fixes the code → `TestFirst.check(A)` passes (it runs the test at commit 1 and expects exit ≠ 0, then at the head and expects 0). Branch B = one commit with test and fix → reports "no failing-test commit". Branch C = docs only → skipped.
- **Today:** no such check; `merge.mjs` has review, nav and smoke gates only.
- **Honest:** some fixes have no automatable test (a CSS look). The check applies to `.js/.mjs` changes and accepts a `--no-test "why"` override, like `--no-nav`.

### T11. No machine paths in code
- **File:** `Server/portability-check.mjs` (+ `.test.mjs`).
- **Steps:** `git grep` tracked `.js/.mjs` (not tests, not session records, not docs) for `C:/Code`, `C:\\Code`, `%LOCALAPPDATA%` used as a default.
- **Expected:** zero hits after; today it lists `Servex/files.js`, `Servex/Servex.js`, `Server/smoke.mjs`, `Server/TranscribeLoop.mjs`, `.claude/hooks/git-guard.mjs` and others.

### T12. A cloud session learns at start how far behind it is
- **File:** `.claude/hooks/cloud-start.test.mjs`.
- **Setup:** scratch bare origin and a clone 2 commits behind.
- **Steps:** run the hook with `CLAUDE_CODE_REMOTE=true`.
- **Expected:** stdout says `behind origin/michael/dev by 2`; without the variable it prints nothing and runs no fetch.
- **Today:** no such hook.

### T13. `main` is not left far behind
- **File:** a line in `Server/HandoverNow.mjs`'s NOW block (and a test beside it).
- **Steps:** count `origin/main..origin/michael/dev`.
- **Expected:** shows the count with a "release" note when over a threshold the owner picks.
- **Today:** 7,368 and nothing shows it.
