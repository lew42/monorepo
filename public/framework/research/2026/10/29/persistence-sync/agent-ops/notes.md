# Research notes (verified 2026-10-30)

Each fact has its source. "Docs" means the official Claude Code docs at code.claude.com.

---

## 1. Claude Code: CLAUDE.md and AGENTS.md

Source: [How Claude remembers your project](https://code.claude.com/docs/en/memory) (fetched 2026-10-30).

### Where CLAUDE.md loads from

- **Order, broad to specific:** managed policy file, `~/.claude/CLAUDE.md` (user), `./CLAUDE.md` or `./.claude/CLAUDE.md` (project), `./CLAUDE.local.md` (local, gitignored).
- **Above the working directory:** loaded at launch, root first, so the file nearest the launch folder is read last.
- **Below the working directory (nested):** "included when Claude reads files in those subdirectories". Not at launch.
- Files are concatenated, not overridden.
- HTML block comments in CLAUDE.md are stripped before injection.

### `@path` imports

- "Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them."
- Relative paths resolve from the importing file. Max depth: four hops.
- A path in backticks is not imported.
- An import outside the working directory asks for approval once.

### How CLAUDE.md is delivered

- "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself."
- For true system-prompt level: `--append-system-prompt` (CLI) or the SDK's `systemPrompt`.

### Compaction

- "Project-root CLAUDE.md survives compaction: after `/compact`, Claude re-reads it from disk and re-injects it into the session."
- "Nested CLAUDE.md files in subdirectories and rules with `paths:` frontmatter reload as Claude reads files they apply to."
- "If an instruction disappeared after compaction, it was given only in conversation…"
- So: root CLAUDE.md plus everything it `@`-imports at launch is re-injected. A readme the agent read with the Read tool is not.

### AGENTS.md is now read natively

- "Claude Code can read `AGENTS.md` as your project instructions … without adding a `CLAUDE.md`, an import, or a setting."
- Needs Claude Code **v2.1.277 or later**.
- **Default rule (`claude-md-or-agents-md`):** AGENTS.md is read **only when there is no CLAUDE.md / .claude/CLAUDE.md / CLAUDE.local.md** in the working directory or above. If a CLAUDE.md exists, only CLAUDE.md is read.
- Setting `claude-md-and-agents-md` reads both (per directory, CLAUDE.md first). Set in `~/.claude/settings.json` under `pluginConfigs["agents-md@builtin"].options.instructionFiles`. **Ignored in project settings**, so a repo cannot turn it on for everyone.
- Subdirectory AGENTS.md loads when Claude reads a file there and that folder has no CLAUDE.md.
- Not read: `AGENTS.local.md`, `AGENTS.override.md`, anything under `.agents/`.
- Unavailable when the built-in `agents-md` plugin is disabled, sometimes in the first session after an upgrade, and (before v2.1.281) on Bedrock or with telemetry off.
- **Recommended for a repo that has both:** a CLAUDE.md that starts with `@AGENTS.md`, then Claude-only notes. "Keeping the import never makes Claude read AGENTS.md twice."
- A CLAUDE.md that only says *in words* "read AGENTS.md": "Claude sees AGENTS.md only if it decides to open the file." This is the repo's current pattern (a prose pointer to `ai/agents.md`).
- A symlink `CLAUDE.md -> AGENTS.md` works, but **not on Windows** (needs admin or Developer Mode; git checks it out as a one-line text file without `core.symlinks`). The owner is on Windows: use the import.

### `.claude/rules/`

- `.md` files, found recursively. Without `paths:` frontmatter they load at launch like `.claude/CLAUDE.md`. With `paths:` they load when Claude reads, writes or edits a matching file.
- Skipped when `project` is excluded from setting sources.

---

## 2. Claude Code: what survives compaction

Source: [Explore the context window, "What survives compaction"](https://code.claude.com/docs/fr/context-window) (the French page; the English URL `code.claude.com/docs/en/context-window` was blocked for fetching in this workspace — same content).

| Content | After compaction |
|---|---|
| System prompt and output style | Still applies |
| Project-root CLAUDE.md and unscoped rules | Re-injected from disk |
| Auto memory | Re-injected from disk |
| Skill descriptions | Rebuilt and re-injected (v2.1.304+) |
| Invoked skill bodies | Re-injected, capped at 5,000 tokens per skill and 25,000 in all; oldest dropped first; truncation keeps the top of the file |
| Rules with `paths:` and nested CLAUDE.md | Reload on demand (when a matching file is read again) |
| Files Claude read or edited | Up to five re-read, newest first; a file over 5,000 tokens comes back as a path only |
| Context that hooks added earlier | Summarized with the conversation |
| SessionStart hooks matching source `compact` | Run again; their output is added to the compacted context |

What this means here:
- A readme the agent read with the Read tool is **summarized away** (unless it is one of the five newest files, and under 5,000 tokens).
- Anything `@`-imported by the root CLAUDE.md comes back, because it is part of the root CLAUDE.md load.
- The Servex SDK `append` text is part of the system prompt, so it stays (the repo's own proof agrees).

---

## 3. Claude Code: hooks that can re-inject instructions

Source: [Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) (fetched 2026-10-30).

- **"Re-inject context after compaction":** a `SessionStart` hook with `"matcher": "compact"`. "Claude Code adds plain text your command writes to stdout to Claude's context."
- `SessionStart` sources: `startup`, `resume`, `clear`, `compact`, `fork`.
- `PreCompact` and `PostCompact` exist ("Before context compaction" / "After context compaction completes"); matcher values `manual`, `auto`. The guide's documented way to add context back is SessionStart `compact`, not PostCompact.
- `InstructionsLoaded` fires when a CLAUDE.md or rules file loads; load reasons include `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`. Useful as a test probe: it proves which files loaded and why.
- `FileChanged` (watch a file) and `CwdChanged` exist too. `FileChanged` could watch a "behind" flag file that Servex writes (see git section).
- Hook-added context is summarized at the next compaction, so a hook re-inject is a refresh, not a permanent copy.
- From the [hooks reference](https://code.claude.com/docs/en/hooks.md): every hook gets `transcript_path` ("may lag the in-memory conversation") and `cwd`. SessionStart stdout and `additionalContext` reach Claude, but **each string is capped at 10,000 characters**; longer output is saved to a file and Claude gets the path plus a 2,000-character preview.
- **PostCompact has no decision control** ("used for side effects like logging or cleanup"); it cannot add context. Use SessionStart `compact`.

---

## 4. Skills and the Agent Skills standard

Sources: [Claude Code skills docs](https://code.claude.com/docs/ko/skills.md) (Korean edition, fetched 2026-10-30); [The Agent Skills Open Standard](https://codex.danielvaughan.com/2026/05/05/agent-skills-open-standard-portable-skills-codex-cli-cross-agent/) (2026-05).

- Claude Code skills "follow the Agent Skills open standard" ([agentskills.io](https://agentskills.io)), with Claude-only extensions (invocation control, run in a subagent, dynamic context).
- **Standard fields:** `name` (lowercase, hyphens, matches the folder) and `description` (what and when). Optional `license` and others. Layout: `SKILL.md` plus optional `scripts/`, `references/`, `assets/`.
- Spec published December 2025, from Anthropic; governance moved to the Linux Foundation's Agentic AI Foundation (AAIF).
- **Where Claude Code looks:** managed, `~/.claude/skills/`, project `.claude/skills/` (and every parent up to the repo root), nested `<subdir>/.claude/skills/` (loaded when Claude first reads a file there), `--add-dir` folders. **Not `.agents/skills/`.**
- **Where Codex looks:** `.agents/skills/` in the current, parent and root folders; `$HOME/.agents/skills/`; `/etc/codex/skills/`.
- So the same SKILL.md works in both, but the **folder name differs**. One copy in `.agents/skills/` with `.claude/skills` as a link would break on Windows (same symlink problem as CLAUDE.md). A small sync script, or keeping skills where they are and listing them in AGENTS.md, avoids that.
- Cloud sessions load committed project `.claude/skills/` but not the machine's `~/.claude/skills/`.
- Skill bodies load only when invoked; descriptions load at start (about 100 tokens each).

---

## 5. Claude Agent SDK: system prompt and CLAUDE.md

Source: [Modifying system prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts) (fetched 2026-10-30).

- **No `systemPrompt`:** a *minimal* prompt (tool calling only, no Claude Code safety or coding guidance). This matches the repo's own finding (`systemPrompt: [""]` before 2026-10-23).
- **`{type: "preset", preset: "claude_code", append}`:** the full Claude Code prompt with your text added at the end. "Nothing is removed, so this is the lowest-risk customization." This is what Servex does now.
- **Custom string:** only your text. Also accepts an array with `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` to cache a static part.
- **CLAUDE.md is not in the system prompt in the SDK either:** "the SDK reads it and injects its content into the conversation as project context". Loaded when `settingSources` includes `'project'` (and `'user'` for `~/.claude/CLAUDE.md`). "Default `query()` options enable both sources." An empty `settingSources: []` loads no CLAUDE.md.
- **Recorded prompt (`snapshot`):** "Claude Code records the system prompt on a session's first request and reuses that record until the session is compacted." A changed `append` reaches a resumed session only after its next compaction. `snapshot: false` rebuilds each request (SDK v0.3.257+), at a cache cost. Keep it on in production.
- **Mid-session changes:** send them in a message, or as `additionalContext` from a `UserPromptSubmit` / `PostToolUse` hook (what Servex's role reminder does).
- **`excludeDynamicSections: true`** (SDK v0.2.98+): moves per-machine bits (auto-memory path) out of the system prompt so identical `append` text shares one prompt cache across agents and machines. Worth turning on for a fleet that shares one AGENTS.md block.
- **Seeing what Claude got:** `OTEL_LOG_RAW_API_BODIES=file:<dir>` writes each request body. This is the cleanest probe for a test: grep the logged `system` field for the AGENTS.md text.

### How to put AGENTS.md / a readme chain into the system prompt

1. **SDK (Servex):** read the files in node and pass them in `append`. Servex already does this for role readmes and `path` readme chains.
2. **CLI (`claude -p`, scripts):** `--append-system-prompt "$(cat AGENTS.md)"` or `--append-system-prompt-file` / `--system-prompt-file` (see [CLI reference](https://code.claude.com/docs/en/cli-reference)).
3. **Interactive Claude Code / VS Code / cloud sessions:** no project setting puts a file into the system prompt. The nearest thing is the root CLAUDE.md (and its `@` imports), which is a user-message reminder but **is re-injected from disk after every compaction**. Plus a SessionStart `compact` hook for anything extra.

---

## 6. AGENTS.md: the standard and who reads it

Sources: [agents.md](https://agents.md/) (fetched 2026-10-30); [agents.md compatibility list](https://www.mintlify.com/agentsmd/agents.md/compatibility/overview); [AGENTS.md and instruction files across coding agents](https://hidekazu-konishi.com/entry/agents_md_and_instruction_files_across_coding_agents.html) (2026-10-03, from each vendor's docs); [OpenCode rules](https://opencode.ai/docs/rules/).

### The standard

- Plain Markdown, no required fields, "a README for agents". 60k+ open-source projects.
- Stewarded by the Agentic AI Foundation (Linux Foundation).
- **Nesting:** "The closest AGENTS.md to the edited file wins." User chat prompts override it.

### Who reads it, and how

| Harness | Reads AGENTS.md? | Nesting and notes |
|---|---|---|
| **Codex CLI** | Yes, native | `~/.codex/AGENTS.md` (or `AGENTS.override.md`), then one file per folder from the git root **down to the working directory**, concatenated (closer = later = wins). Not below cwd. Cap `project_doc_max_bytes` 32 KiB. |
| **Claude Code** | Yes since v2.1.277 | Only if no CLAUDE.md exists (default). With a CLAUDE.md, use `@AGENTS.md`. Subfolder AGENTS.md loads on Read. |
| **Cursor** | Yes | Root and subfolders, combined; also reads root CLAUDE.md. Cursor CLI: root only. |
| **GitHub Copilot cloud agent** | Yes | AGENTS.md anywhere; "nearest takes precedence". A root CLAUDE.md can stand in. |
| **Copilot in VS Code** | Opt-in | `chat.useAgentsMdFile` (root); nested needs `chat.useNestedAgentsMdFiles` (experimental, off). |
| **Gemini CLI** | Needs config | Default `GEMINI.md`. Set `context.fileName: ["AGENTS.md", "GEMINI.md"]` in `.gemini/settings.json`. |
| **OpenCode** | Yes | Root AGENTS.md (found walking up), else CLAUDE.md; `~/.config/opencode/AGENTS.md`; extra files via `instructions` in `opencode.json`. Also reads `~/.claude/skills`. |
| **Aider** | Needs config | `read: AGENTS.md` in `.aider.conf.yml`. |
| **Jules, Amp, Devin, Windsurf, Zed, Warp, Junie, goose, Factory, Roo, Kilo** | Listed as supporting | Details not verified here. |

### Common ground

- Every tool reads a **root** AGENTS.md. Nested support varies; Codex and Claude Code load nested ones only on the path to the working folder (Codex) or on file access (Claude).
- So the **readme chain** (root to module) matches Codex's model exactly, and is the safe portable rule to state in words: "read every readme from the root down to your module".

---

## 7. OpenRouter-driven agents

Source: [OpenRouter: Claude Code integration](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration.md) (fetched 2026-10-30).

- Claude Code / Agent SDK talk to OpenRouter with `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, `ANTHROPIC_AUTH_TOKEN=<key>`, `ANTHROPIC_API_KEY=""`. This is what `Servex/ext/openrouter/provider.js` does.
- "Only guaranteed to work with the Anthropic first-party provider"; other models "may not work correctly".
- **What this means for instructions:** an OpenRouter model run through Servex uses the same Claude Code runtime, so it gets the same `append` system prompt and the same CLAUDE.md user-message injection. The model changes; the harness does not. So the Servex `append` path covers OpenRouter agents for free.
- A **different harness** driven by an OpenRouter key (OpenCode, Aider, Codex with a custom provider) gets instructions only from its own file rules: root AGENTS.md for most, config for Aider and Gemini. None of them will read `public/framework/ai/agents.md`.

---

## 8. Cloud sessions (Claude Code on the web)

Source: [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments.md), "What carries over from your setup" and "GitHub proxy" (fetched 2026-10-30).

- Fresh Ubuntu VM with a fresh clone. **Carries over:** the repo's CLAUDE.md, `.claude/settings.json` hooks and permissions (one-repo sessions), `.mcp.json`, `.claude/rules/`, `.claude/skills/`, agents, commands.
- **Does not:** `~/.claude/CLAUDE.md`, user skills and plugins, local-scope MCP servers, repo-declared plugins.
- `CLAUDE_CODE_REMOTE=true` in the VM, never locally: hooks can branch on it.
- Git goes through a proxy. It refuses branch deletes and tag pushes but **does not limit which branches a push updates**. Use GitHub rulesets for that.
- Seen in this workspace: `.mcp.json` points at `servex.localhost`, which does not resolve in the cloud. The repo hooks run here but post to a Servex that isn't there (they fail open).

---

## 9. Multi-agent git practice

### Common practice for keeping a clone aware of upstream

- **Developer machines fetch, they don't merge.** VS Code: `git.autofetch` (default `false`, but default `true` in its new agents window), `git.autofetchPeriod` default **180 s**. It runs `git fetch`; the status bar then shows incoming/outgoing counts. Merging stays a user action ("Sync" = pull then push).
  Source: VS Code `extensions/git/package.json` and `package.nls.json` at commit `f327482d` ([config](https://github.com/microsoft/vscode/blob/f327482d6b359f6f2b4d0966cf884920c16d4a6a/extensions/git/package.json#L3334-L3359)).
- Visual Studio's guidance: "Fetching checks if there are any remote commits that you should incorporate… If you see any, pull first" ([Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/version-control/git-fetch-pull-sync)).
- **`git maintenance` prefetch** (hourly) deliberately puts refs under `refs/prefetch/` "to avoid disrupting the remote-tracking branches. The end users expect these refs to stay unmoved unless they initiate a fetch." ([git-maintenance(1)](https://man7.org/linux/man-pages/man1/git-maintenance.1.html)). Git itself avoids moving things under a user without asking.
- `git status` shows "behind by N" **only from the last fetch**. It never contacts the remote. So "git status tells you as soon as it happens" means: something must fetch as soon as it happens.
- **Servers and CI react to webhooks.** GitHub: "subscribe to webhook events instead of polling" ([REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)). Webhook receivers must answer 2XX within 10 s and handle work async; verify the secret signature; dedupe by `X-GitHub-Delivery`; missed deliveries must be redelivered after downtime ([webhook best practices](https://github.com/github/docs/blob/fa7be01fa0b70f29d6e3733b8f3a187217eb1325/content%2Fwebhooks%2Fusing-webhooks%2Fbest-practices-for-using-webhooks.md)).
- **Cheap polling:** a conditional GET with `If-None-Match` returning 304 "does not count against the primary rate limit" when authorized; honor `x-poll-interval` (same REST page). `git ls-remote origin` is another cheap check (refs only, no objects).

### Why auto-merging into a live worktree is risky

- The agent working there has files open and a mental model of them. A merge under it changes files it already read; its next Edit can be based on stale text (Claude Code does notice "file changed on disk", but only for files it read).
- A merge or rebase over uncommitted work needs a stash or refuses. This repo already lost record lines to exactly this (2026-10-13; see current-setup.md §5).
- Conflicts mid-task leave the tree half-merged with no one deciding.
- The repo's own guard bans `git pull`/`rebase` in the main tree for this reason.
- So the safe pattern is: **fetch automatically, notify, and let the agent integrate at a safe point** (after a commit, before starting the next step, before landing).

### Worktrees and branches for agent fleets (2025–2026 practice)

- One worktree per agent is the standard isolation unit (Codex App makes one per thread; Claude Code has `--worktree` / `isolation: "worktree"`).
- Split work by **file ownership** so parallel agents touch disjoint files; serialize shared files.
- **Rebase onto the trunk before the final commit** (`git pull --rebase origin main` in the Codex guidance), merge in dependency order, run the full test suite after.
- Each commit should pass on its own ("atomic commits"), which makes rebases easy.
- Read-only conflict detection across worktrees with `git merge-tree` (the "Clash" tool) — this repo's `merge.mjs` already uses `git merge-tree`.
  Source: [Merge conflict prevention with Codex CLI](https://codex.danielvaughan.com/2026/04/25/codex-cli-merge-conflict-prevention-resolution-worktrees-clash/) (2026-04).
- **Merge queues** test each PR on top of the queue in order; Thoughtworks Radar notes it "simulates trunk-based development" ([Radar](https://www.thoughtworks.com/radar/tools/github-merge-queue), 2023, Assess). This repo's `.merge.lock` + `merge.mjs` is a local merge queue of size one.

### Webhook relay through Cloudflare

Source: [Durable Objects: Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/index.md).

- A Worker receives the GitHub webhook (public URL), verifies the signature, and forwards to a Durable Object.
- Servex holds an **outbound** WebSocket to that Durable Object (no open port at home). With `ctx.acceptWebSocket()` the DO hibernates while idle and "Billable Duration charges do not accrue during hibernation"; clients stay connected.
- The DO keeps the last N events in storage so Servex can catch up after a disconnect (GitHub won't resend on its own).

---

## 10. Checked in this workspace (2026-10-30)

- **Claude Code here is 2.1.312**, so native AGENTS.md (2.1.277+) and skill-description re-injection after compaction (2.1.304+) both apply to cloud sessions.
- **Git guard in a cloud clone** (`.claude/hooks/git-guard.mjs`, run with `CLAUDE_PROJECT_DIR` = the clone): `git rebase origin/michael/dev`, `git merge origin/michael/dev` and `git pull` exit 2 (blocked); `git push origin michael/dev` and `git push origin HEAD:main` exit 0 (allowed).
- **GitHub (REST, 2026-10-30):** `main` has ruleset 18735086 (PR required, no force push, no delete, default branch only). `michael/dev` has no rules. `michael/dev` is 7,368 commits ahead of `main`, 0 behind. Webhook list: not readable through the cloud proxy (403).
- **Upstream tracking (scratch repo):** a worktree branch with upstream = local `michael/dev` shows `## worktree/x...michael/dev [behind 1]` right after a commit lands on `michael/dev`, with no fetch. Default `push.default=simple` then refuses a bare `git push`; with `remote.pushDefault=origin` + `push.default=current` it pushes `worktree/x -> worktree/x` and status still compares with the trunk.
- **Readme chain sizes** (`readme_chain()` on this checkout): `public/framework/core/Page` 27,096 chars (~6.8k tokens), `public/framework/ai` 27,700, `Servex/agents` 20,798, `Server` 12,759. Root `readme.md` is 5,937 of each.
- **Skills:** 36 SKILL.md files; every `name:` matches its folder (Agent Skills rule). Largest: `documentation` 14.5 KB, `new-task` 9.6 KB, `finish-task` 9.4 KB (14.5 KB is about 3.6k tokens, under the 5,000-token re-inject cap).
- **Tunnel:** `Server/Tunnel.mjs` gateway passes only `/mcp/remote…`; the named tunnel `servex.lew42.com` (`Server/TunnelNamed.mjs`) is built but, per `Servex/ext/remote/doc/tunnel.md` on `michael/dev`, blocked on a Cloudflare token lacking Tunnel Edit + DNS Edit. A quick tunnel's hostname changes on each restart, so it can't take a GitHub webhook reliably.

## Gaps (not verified)

- `code.claude.com/docs/en/context-window` (English) was blocked; the French edition of the same page was used.
- The Codex AGENTS.md guide redirected to a host not in a search result; facts on Codex come from the [learn.chatgpt.com copy](https://learn.chatgpt.com/docs/agent-configuration/agents-md.md) fetched before the coordinator's rule, plus the 2026-10-03 survey.
- How Cloudflare routes requests between replicas of one tunnel: docs pages returned only navigation.
- Jules, Amp, Devin, Windsurf AGENTS.md nesting details.
- Whether `claudeMdExcludes` passed through SDK `settings` removes the CLAUDE.md message copy for Servex agents (proposal says: test before relying on it).
