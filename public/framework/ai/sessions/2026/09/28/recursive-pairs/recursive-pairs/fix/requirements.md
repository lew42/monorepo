# Minion: fix — answer the fresh-eyes review

Load the `minion` skill first. Shared rules: `../common.md`. The review: `../review.md` (11 findings). Owner's words: `../requirements.md`. What was built: `../pairs/proof.md`, `../roles/proof.md`, `../inbox/proof.md`, docs `Servex/agents/doc/page-pairs.md`, `page-roles.md`, `external.md`.
Worktree `C:\Code\lew42\worktrees\recursive-pairs` (branch head a6ab769c). **Fence:** `Servex/agents/` (Layers.js, Global.js, policy.js, roles.js, External.js, Agents.js, card-assistant.md, their tests and docs), `.claude/skills/every-prompt/page-assistant.md`, `.claude/skills/servex-mastermind/SKILL.md`. Private Servex port **8690** (own SERVEX_HOME and SERVEX_LAYERS_FILE). Never restart the live Servex.

## Decisions already made (do these, don't reopen them)
1. **One root assistant.** The page `/` resolves to the existing `master-assistant` id: Layers never spawns a second `assistant-root`; a send to `/` (POST /api/page-ai with page "/") is delivered to `master-assistant`, whose lifecycle stays Global's. Make sure the owner's page-less prompts still reach it (check what Global's `heard()` used to forward and restore just that part, not the every-card feed). `master-assistant` runs on the Opus/architect tier (D7): check and prove.
2. **Landings reach the root.** `Global.direct_child()` also counts a top-level page's manager (its layers.json `parent` is the root's manager, or the root). Prove: a `manager-<card>` landing reaches the root assistant; a sub-card manager's does not.
3. **Parentage is real for policy.** `Policy.parent(id)` falls back to Layers' recorded `parent` when the live agent has none that matches, so `manager-<card>` and `manager-root` (the root pair's mastermind; name it what Layers already mints) may message each other under the "tree" rule. The runtime spawn parent of a manager stays its own assistant (it must keep waking the assistant). Prove both directions with a policy test on real page-pair ids.
4. **One assistant text.** Layers reads `.claude/skills/every-prompt/page-assistant.md`; `Servex/agents/card-assistant.md` is deleted (update any reader and the docs). Make the text true for the tools it actually has (Read/Edit/Write/Bash are allowed; drop "you have no file-read tool").
5. **register_session refuses** an id that belongs to a registered non-external agent, with a clear error. Test it.
6. **External ids may message, not spawn.** policy: an external id messaging out is treated like the owner for messages; `spawn()` refuses it. Test it.
7. **The Monitor sentence is true in both skills.** Find out what the Monitor tool really allows (load its schema via ToolSearch "select:Monitor"): if it can run without expiry, both say so and how; if not, both say the real limit and that the tab re-arms it at the start of each turn.
8. Findings 8, 9, 10 are notes: leave the code, but add one line each to `Servex/agents/doc/page-pairs.md` under a "Known limits" heading.

## Done means
All `Servex/agents/*.test.mjs` green; a private Servex boots and answers `/api/page-agents?page=/` (showing master-assistant) and a `/notes/` page prompt; commits in the worktree (only your files; never commit `public/**/page.jsonl`, a server rewrites them). Write `proof.md` beside this brief: each numbered item above with its proof. End with one paragraph: commit hashes and anything unproven.

