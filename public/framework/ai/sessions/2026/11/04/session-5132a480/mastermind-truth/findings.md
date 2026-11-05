# What defines a mastermind today? — findings

Read-only run, Haiku, no code or doc changed. Receipts are the command, or `path:line` with the quoted text.
Note: during the run, clarity-mastermind-truth reported it had turned `public/framework/ai/doc/agent-rules.md` into a link. My reads of that file came before its edit; re-check it before acting on the line counts below.

## 1. Every place that tells a mastermind how to behave

| File | Last commit (author date) | Lines / words | Role |
|---|---|---|---|
| `Servex/agents/roles/mastermind.md` | 2026-11-03 | 259 lines / 7,873 words | Role text. Loaded by Servex into the spawned agent's system prompt (see §2). |
| `Servex/agents/roles.js` | 2026-11-02 | 293 lines | Role table: `mastermind` row (line 57), alias words (line 53, 129), compaction (line 34). |
| `Servex/agents/roles/readme.md` | (not checked) | 46 lines / 866 words | Index of roles. Says its word target is 400, and gives mastermind 5,251 words (stale; the file is now 7,873). |
| `.claude/skills/mastermind/SKILL.md` | 2026-10-22 | 6 lines | Pointer to roles/mastermind.md. |
| `.claude/skills/servex-mastermind/SKILL.md` | 2026-10-25 | 6 lines | Pointer to roles/mastermind.md. |
| `.claude/skills/sub-mastermind/SKILL.md` | 2026-10-25 | 6 lines | Pointer to roles/mastermind.md, section "Owning one task end to end". |
| `Servex/agents/roles/ai-system-mastermind.md` | (not checked) | 6 lines | "# Moved" stub. No code reads this file (see §3). |
| `Servex/agents/roles/servex-mastermind.md` | (not checked) | 3 lines | "# Moved" stub. No code reads this file. |
| `Servex/agents/roles/core-page-mastermind.md` | (not checked) | 19 lines | Real subject role (`core-page-mastermind` row, roles.js:50). Not a mastermind alias. |
| `CLAUDE.md` | 2026-10-29 | 60 lines | Laws for every agent; says "This file rules". Lines 11 and 36 touch mastermind behaviour. |
| `public/framework/ai/doc/agent-rules.md` | 2026-11-03 | 57 lines | Long form of the safety and cost rules; CLAUDE.md points here. |
| `public/framework/ai/mastermind.md` | (not checked) | — | The AI-system architect's own text. Loaded only when a mastermind is spawned at `public/framework/ai/` (roles.js:189–207). |
| `public/framework/ai/readme.md`, `public/framework/ai/doc/task-queue.md` | — | — | Descriptive, not instructions; they carry the "5-agent cap" claim (see §3). |

The sub-mastermind skill and the old `task-mastermind` word are not separate texts any more: `roles.js:53` makes them aliases of the `mastermind` row.

## 2. What a spawned mastermind receives, and what a VS Code tab receives

**Spawned mastermind (`spawn_agent({role: "mastermind"})`).** Traced in code:

- System prompt (the preset's `append`): `role_system()` in `Servex/agents/roles.js:182–187` returns `# Your role (Servex)` plus `parts_of(role)`. For `mastermind` that is `mastermind.md` only (the row has no `skills` key, roles.js:54). Set in `Servex/agents/Agents.js:235` (`role_system(spec.role, {path})`) and `Agents.js:1349–1350` (`role_prompt()`).
- If a `path` is given, `role_system` also appends `path_parts(dir).block` (roles.js:189–207): the path's readme chain plus `<path>/mastermind.md` or `<path>/ai/mastermind.md`. Checked by `path_check` and logged to the `skills` store (Agents.js:238–239).
- First message: `whoami(...)` plus `opening(role, prompt, {in_system})` (Agents.js:243–244). With `in_system` true it only says "[Servex put … in your system prompt … don't call the Skill tool for it.]" (roles.js:166–172). The role text is not repeated there.
- `SERVEX_ROLE_IN_SYSTEM=0` puts the text in the first message instead (Agents.js:235).

**VS Code tab.**

- Claude Code loads `CLAUDE.md` automatically (root and user-level).
- `.claude/settings.json` runs `session-page.mjs` on SessionStart (verified in the hooks list), and `ledger.mjs` on resume.
- The mastermind text reaches a tab only when it is asked for: `/mastermind` loads `.claude/skills/mastermind/SKILL.md`, which says "Read `Servex/agents/roles/mastermind.md` whole". CLAUDE.md line 11 says a tab "reads it by hand".

## 3. Contradictions and named things that do not exist

Undeniable (the receipt alone proves it):

1. **"task mastermind" is named as a role readme but there is no such row.** `CLAUDE.md:11`: "`Servex/agents/roles/readme.md` lists them (minion, mastermind, task mastermind, reviewer, clarity)". `roles/readme.md` has no task-mastermind row; `roles.js:53` makes `task-mastermind` an alias of `mastermind`.
2. **Concurrency number: the readme says 3–6, the code says 8, the docs say 5.** `mastermind.md:70`: "~3–6 agents at once the practical ceiling". `Servex/agents/Agents.js:914`: `return Number(process.env.SERVEX_WORKING_CAP) || 8;`. `public/framework/ai/readme.md:17` and `doc/task-queue.md:12` both say "Servex's 5-agent cap". (`mastermind.md` also says 8 in its Spawn section, so the file disagrees with itself.)
3. **Two wake-up mechanisms are prescribed.** `mastermind.md:35` ("set a one-shot wake-up (`CronCreate`, `recurring: false`)") and `mastermind.md:125` ("`ScheduleWakeup` with `/mastermind` … 1200 s fallback"). Both tools exist in this session's deferred list.
4. **Architect tier vs the readme's model advice.** `Servex/agents/tiers.js:9`: `architect: { model: "claude-sonnet-5-5" }`; `tiers.js:7`: "ALL TIERS SONNET (…Opus is for a stated reason only)". `mastermind.md:88` says "**Opus** judges". The `mastermind` row is `tier: "architect"` (roles.js:57), so a mastermind runs Sonnet by config while the table in `roles/readme.md` says "architect (high)". The owner's rule ("Sonnet by default, no Opus without a reason") is in agreement with tiers.js; the readme's Opus line is the odd one out.
5. **Stale site links.** `public/framework/ai/readme.md` links `/framework/servex/doc/sdk.md`, `architecture.md`, `budget.md`; none resolves under `public/` (the files exist as `Servex/doc/…`). `public/framework/ai/doc/agent-rules.md` links `../sessions/2026/10/24/session-e00f55c9/past-work-per-file-docs/`, which does not exist. Receipt: a script resolving every markdown link in the 14 files listed in §1 (`node` one-liner, output: 5 misses listed above, the agent-rules link being the one clarity may already have changed).
6. **Stale word count.** `roles/readme.md` quotes "mastermind 5,251" words (2026-10-22); `wc -w` gives 7,873 today.
7. **Dead stub files.** `Servex/agents/roles/ai-system-mastermind.md` and `servex-mastermind.md` (both "# Moved") are read by no code: `grep -rn "roles/ai-system-mastermind\|roles/servex-mastermind"` outside `roles/` finds nothing; `roles.js` uses `readme: "mastermind"` and aliases by word.

Questionable (needs a judgment; what would settle it is noted):

8. **"Never push." vs "merge.mjs pushes michael/dev".** `mastermind.md:6` ends the Start paragraph with "Never push." `CLAUDE.md:36` says `merge.mjs` pushes michael/dev after each landing. Probably "push" means "push to origin by hand", but the line does not say so. Settle by asking the owner which it means, or by writing "never push by hand; merge.mjs pushes" in the role text.
9. **`mastermind-deputy` is named as a live top mastermind.** `mastermind.md` ("Masterminds propose; the top mastermind green-lights … today `mastermind-deputy`") and `doc/task-queue.md` name it. No code in `Servex/agents/` or `Servex/doc/` defines or spawns it (grep: only `roles/mastermind.md` in those trees). It may be a live session name, not a role; check `list_agents`.
10. **Compaction threshold vs the advice to keep an agent.** `roles.js:34` `MASTERMIND_COMPACT = { tokens: 150000 }`, and roles.js:27–33 says compaction is the agent's choice and never automatic mid-flight. `mastermind.md:79` says "100–200k is no reason to switch … think about a fresh agent around 300–500k". Not a hard clash (compact is not switch), but the numbers differ and no one has said which one the owner wants.
11. **The owner's distinction for minions.** `Servex/agents/roles/minion.md` (117 lines) says a minion's part of the build order is "the order is in `sub-mastermind`" (line 6), which now points at a section of the mastermind text, and line 38 explains `spawn_agent`'s `task: {dir}` option, which a minion has no reason to need. Whether that breaks "a minion doesn't need to know how to spawn" is a judgment call.
12. **Duplicated laws.** The "never wait on the owner", "owner approves merges" and "masterminds propose" rules appear in CLAUDE.md (laws 4–5, Ask before), in `agent-rules.md`, and in `mastermind.md`. Today they agree in substance; the risk is drift, not a present contradiction.

## 4. Minion, briefly

Same mechanism as the mastermind (roles.js `minion` row, `readme: "minion"`, bypassPermissions, scan tier, Haiku): its text goes in the system prompt. Its file names no spawn procedure except the two items above (minion.md:6, :38). The owner's split holds in the row and mostly in the text.

## 5. Recommendation

**One source of truth: `Servex/agents/roles/mastermind.md`.** It is the file `roles.js` loads into every spawned mastermind, and all three skills already point at it. Keep it as the only long text.

Smallest changes, each with a check that shows it worked:

- Make `roles/readme.md`'s table and `CLAUDE.md:11` agree: drop "task mastermind" from the list (it is an alias). Check: `grep -n "task mastermind" CLAUDE.md Servex/agents/roles/readme.md` returns nothing that says it is a role. *CLAUDE.md says "do not edit without asking"; this one line needs the owner's yes.*
- Delete `Servex/agents/roles/ai-system-mastermind.md` and `servex-mastermind.md` (no reader, §3.7). Check: the grep in §3.7 still finds nothing after removal and `node Servex/agents/...` tests (`path-mastermind.test.mjs`) pass.
- Fix the concurrency sentence in `mastermind.md:70` to the code's default (8, `SERVEX_WORKING_CAP`), and the "5-agent cap" in `public/framework/ai/readme.md:17` and `doc/task-queue.md:12`. Check: grep for "5-agent" returns nothing.
- Choose one wake-up mechanism for the mastermind and delete the other line (§3.3). Needs the owner's pick between a one-shot CronCreate and a ScheduleWakeup loop.
- Replace the three `/framework/servex/doc/…` links in `public/framework/ai/readme.md` with the real paths (`Servex/doc/…`) or the matching site path. Check: `node` link resolver in §3.5 reports no misses.

Questionable items (§3.8–3.11) are the owner's calls, not fixes.
