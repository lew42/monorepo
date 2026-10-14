# Minion: merge — finish the merge of michael/dev into worktree/recursive-pairs

Load the `minion` skill first. Shared rules: `../common.md` (worktree, windowsHide, no live Servex).

**State:** in `C:\Code\lew42\worktrees\recursive-pairs`, `git merge michael/dev` is in progress with conflicts in 7 files:
`.claude/skills/minion/improvements.md`, `.claude/skills/servex-mastermind/SKILL.md`, `Servex/agents/Global.js`, `Servex/agents/Layers.js`, `Servex/agents/card-assistant.md`, `Servex/agents/policy.js`, `Servex/agents/roles.js`.

**Our side** (the branch) is this task's work: read `../pairs/proof.md`, `../roles/proof.md`, `../inbox/proof.md` and the docs `Servex/agents/doc/page-pairs.md`, `page-roles.md`, `external.md` to know what each hunk is for.
**Their side** (michael/dev) landed since 09-28: task-loop (TaskLoop, heartbeat, spawn opens the task), module-experts, readme-chain (a fresh directory-bound agent starts with the readme chain), dictation lag (card prompts reach the assistant after 1.5 s), the drawer's selected-element chip reaching the card-assistant, Pool/Usage/tidy landed. `git log --oneline 38bfb384..michael/dev -- Servex/agents .claude/skills` lists them.

## Deliverables
1. **Resolve every conflict by keeping both sides' intent.** Never take "ours" or "theirs" wholesale. Where they truly contradict, prefer ours for the recursive-pairs rules (feed cut to direct children, policy kinds incl. `external` and `mastermind-servex-N`, page pairs and lifecycle), and theirs for everything else; log each such call as a `decision` in `task.jsonl` beside this brief.
2. **Tests green** after the merge: `node Servex/agents/layers.test.mjs`, `policy.test.mjs`, `global.test.mjs`, `External.test.mjs`, and every other `Servex/agents/*.test.mjs` that passed on michael/dev.
3. **A private Servex boots** from the worktree (port 8590, own SERVEX_HOME and SERVEX_LAYERS_FILE, recipe in `../common.md`) and answers `GET /api/page-agents?page=/` and `POST /api/page-ai` for `/notes/` with a reply line in `public/notes/ai/chat.jsonl` (delete that test file afterwards). Kill it when done.
4. Commit the merge (`git commit --no-edit` plus a body line). Don't touch `public/framework/ai/sessions/2026/09/cards/page.jsonl` or `public/framework/core/Page/jsonl/page.jsonl` — a server rewrites them; never commit them.

End with one paragraph: the merge commit hash, test counts, the boot proof, and any hunk you were unsure about.

