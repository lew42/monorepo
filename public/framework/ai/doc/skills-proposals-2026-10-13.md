# Skills review, 2026-10-13: what was cut, and what still needs a decision

The skills every agent loads had grown to 34,140 words. This review measured them by script, found the rules that disagree or describe retired systems, applied the safe fixes, and lists the rest here as proposals. The task and its log: [skills-review](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/). The owner's ask: [requirements-6.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-6.md), ask 5.

| | Before | After |
|---|--:|--:|
| Words in all 33 skills | 34,140 | 27,522 (−19%) |
| Rule lines (never / always / must) | 225 | 189 |
| Dead links | 9 | 7 (all 7 are template examples) |
| Open `improvements.md` entries | 45 | 27 |

The numbers come from [`Server/SkillCensus.mjs`](/Server/SkillCensus.mjs): [census before](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/census-before.md), [census after](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/census-after.md).

---

## ✅ One `make` skill: name it, place it, class it, show it

> "creating a new file, what the file name is and what goes in it, that's some of the most important questions and we're doing a really bad job" · "one big skill could do choosing names, choosing file names, choosing locations, making things object oriented whenever possible, creating simple views to see the object-oriented classes updating in real time"

[`.claude/skills/make/SKILL.md`](/.claude/skills/make/SKILL.md) now replaces `naming` and `new-page`, so one skill covers making anything new. You load it before creating any file, folder, page, class or name. It asks four questions in order:

1. **Name it:** the old `naming` skill, condensed. Brainstorm with cheap agents, pick for clarity, and use plural folders only for collections.
2. **Place it:** your new rule. A file about a module lives in that module's folder, and a strictly AI class lives under `framework/ai`. Task records go where `TaskDirs.mjs` puts them, scratch stays out of the repo, and every new file is linked from where a reader already is.
3. **Class it:** one class per file, and the architecture comes first. The detail stays in the `code` skill.
4. **Show it:** every class gets a live view of its own state, the rendered view and the instance side by side.

The page mechanics that were `new-page` moved word for word to [`make/page.md`](/.claude/skills/make/page.md). `naming/` and `new-page/` moved to `.claude/skills-archive/`; nothing was deleted. *Why it counts as safe:* the decisions are the same, apart from your one new rule. *The alternative:* keep three skills and only add the placement rule. That was rejected because you asked for one skill twice.

⚠️ A `make` skill only helps if agents load it. Whether they do will show in the census's load count over the next two weeks.

---

## ✅ Applied (safe: nothing a skill decides was changed, every cut text is in git or one click away)

- **`ui-test` and `fork-claude-session` became short indexes** (4,115 → 345 and 2,938 → 290 words). Their full text moved, word for word, to a `reference.md` beside each one that the index links. Together they were loaded once in 14 days.
- **The usage conflict, resolved.** The `check-claude-usage` skill (loaded 30 times in 14 days) told agents to run `claude-usage.py` and write `usage.json`. Three other places say never do that, because Servex refreshes it: CLAUDE.md, `mastermind` and `new-task`. The skill now says `node Server/usage-now.mjs` in this repo.
- **The v/3 board rules, retired.** `mastermind` and `minion` told agents to post cards to `ai/board.jsonl` through `say.mjs`. `mastermind` also said "every request gets a card first (`create_card`)", so there were two card systems in one skill. Only `create_card` / `card_reply` remain. The 10-minute `state` card is gone too, which also ends its clash with "idle is not a reason to wake".
- **A self-contradiction in `mastermind`, fixed.** One line said a direct question gets "a short chat answer". The owner's newer line in the same skill (2026-10-13) says a direct question gets a permanent page and an `owner_note`, never a temporary reply. The newer one stays.
- **Who runs the review.** `finish-task` told every lander to run `review.mjs`, but `minion` says the mastermind does it. `finish-task` now says the review is run by whoever owns it.
- **Repeats folded:** `sub-mastermind` now points to `finish-task` for the outcome checklist instead of copying it, and `minion` points to `new-task` for how `append.mjs` works.
- **Stale facts fixed:** `minion`'s path for a task with no brief (now made by `TaskDirs.mjs`), "RULE#1" and "RULE#16" (CLAUDE.md has no numbered rules), `auditor`'s claim that every skill has a `caveats.md`, and `system-architect`'s usage script, which misses every task since the 10-12 move.
- **Dead links fixed** in `documentation`, `new-page` and `every-prompt`.
- **18 old `improvements.md` entries deleted.** They were already folded into their skill (marked "applied 2026-09-30") or no longer applied.

---

## ⬜ Proposed: CLAUDE.md (ask first; nothing here was applied)

1. **The reload hold holds the wrong folder.**
   - *As it is:* "`node Server/hold.mjs on "<you> — <what>"`, write the whole batch…"
   - *Should be:* "`node Server/hold.mjs on "<you> — <what>" --paths "<the globs you will write>"`…"
   - *Why:* without `--paths`, `hold.mjs` holds only `public/framework/ai/**` (`DEFAULT_PATHS`, Server/hold.mjs:96). So following CLAUDE.md word for word leaves every other page reloading on every write. Agents hit this twice (`sub-mastermind` and `minion` improvements, 2026-09-24). Changing the default in `hold.mjs` to all of `public/` would fix it without a CLAUDE.md change; that is Servex/Server code, so it is listed below too.
2. **The readme-chain link is dead.**
   - *As it is:* "The readme chain: … (`/framework/ai/readmes/`)"
   - *Should be:* "(`ai/doc/readmes.md`, `Servex/doc/readme-chain.md`)"
   - *Why:* `/framework/ai/readmes/` does not exist.
3. **Name the one usage command.**
   - *As it is:* "every mastermind reads the usage snapshot when it starts and before each spawn (`ai/usage.json`; Servex injects it)."
   - *Should be:* "… reads `node Server/usage-now.mjs` when it starts and before each spawn (it reads Servex's snapshot, `ai/usage.json`; never write that file)."
   - *Why:* this is the rule the `check-claude-usage` skill broke. Naming the command in CLAUDE.md makes it the one route.

---

## ⬜ Proposed: skills (they change what a skill decides)

1. **The fast assistant and the master assistant still run on the retired board** (`every-prompt`, `master-assistant`). Both skills are built on `say.mjs` cards to `/framework/ai/v/3/`, and Servex still has roles for them. Server code still writes `board.jsonl` too (`Server/health.mjs`, `Server/plugins/Assistant.js`, `CardAnswer.js`). *Proposal:* decide whether the board stays as the dev bar's live log, then rewrite both skills around `create_card` or archive them. *Why not applied:* retiring a role is Servex code.
2. **`minion` (3,033 words, read at every spawn: 87 loads in 14 days) should be an index of about 600 words.** Keep the brief, the first edit, the never-list as one line per rule, and landing. Move the incident histories (dates, costs, what broke) to `minion/reference.md`, the way `ui-test` now works. *Why not applied:* a never-rule one click away might stop being followed, so measure first. Try it on one batch of minions and compare their mistakes.
3. **The same for `mastermind` (3,919) and `sub-mastermind` (2,479).** About a third of each is the same text (readme upkeep, the merge rules, resolve-don't-park, spawning). *Proposal:* `mastermind` keeps budget, routing and judging, and links `sub-mastermind` for running one task.
4. **One never-list, linked from every role.** These rules appear in three or more places:
   - never drive the owner's tabs: `minion`, `mastermind`, `sub-mastermind`, `ui-test`;
   - don't start servers by hand: `minion`, `sub-mastermind`, `mastermind`;
   - `windowsHide` on every process: `minion`, `sub-mastermind`, `fork-claude-session`;
   - commit by exact path: CLAUDE.md, `minion`, `finish-task`, `mastermind`, `sub-mastermind`;
   - resolve, don't park: CLAUDE.md, `mastermind`, `minion`, `sub-mastermind`.

   *Proposal:* keep the list in `minion` (every worker loads it) and replace the others with a link.
5. **Two ways to claim a topic.** `mastermind` writes `assign.topics` into its run log; `sub-mastermind` calls Servex's `claim_topic`. *Proposal:* use `claim_topic` everywhere, since it is the one other agents can query (`list_claims`).
6. **Fold the tiny design skills.** `color` (99 words), `ui` (97) and `navigation` (108) each point to a page under `/framework/design/` and had 0, 0 and 1 loads in 14 days. *Proposal:* fold all three into `page` as one line each. `new-css-class` (86 words) already says it is "folded into css", so archive it once `minion` and `code` stop naming it.
7. **`mastermind`'s "thinkers and doers" line still clashes with "a 5–10 second job is yours".** The skill says both "hand each step to a cheap minion" and "do small jobs yourself". *Proposal:* merge them into one bullet: delegate for parallel work or a fresh context; do a short job yourself.
8. **`new-task` calls `note` "/framework/ai/v/2/'s own board verb".** If v/2 is retired too, drop that sentence.

---

## ⬜ Proposed: tools instead of sentences (Servex/Server code and hooks, outside this task)

Most of the 27 `improvements.md` entries still open describe a tool that misbehaves. A fix in the tool removes the warning from every skill.

- **`hold.mjs`**: default to all of `public/`, not only `ai/**` (see CLAUDE.md item 1).
- **`worktree-up.mjs`**: it is reported three times as never returning and never writing `.worktrees.json` (`sub-mastermind` improvements, 2026-09-24). Check whether that is still true; if so, fix it.
- **`syntax-guard.mjs`**: both `minion` and `mastermind` say it "exists but is not wired in `settings.json`". It is still not wired today. Wiring it in would replace the "run `node --check` after every write" rule. This needs `settings.json`, so ask first.
- **`jsonl-guard.mjs`**: it blocks any Bash command that mentions a `.jsonl` path, even a node script that edits a `.md` file and only quotes a `.jsonl` name in its text. That happened during this review. The guard should only block a command that writes to a `.jsonl` file.
- **A merge into the main tree stashes other agents' uncommitted edits.** At 17:38 today, a merge into the main tree stashed this review's uncommitted `make` files, and they vanished from the tree. They were recovered from the stash commit (`0283e997`) and committed as `08af2e3d0`. *Proposal:* a merge that finds a dirty tree should refuse with a list of the dirty files, never stash them. Until then, agents need to commit within seconds of writing.
- **`merge.mjs` review gate**: it reads task logs from the main tree only, so a review written inside a worktree is invisible to it (`minion` improvements, 2026-10-01). Read the worktree's copy too, or say so in the refusal message.

---

## How it was found, and a caveat about the method

- Four Haiku readers each read about 12k words of skills (plus CLAUDE.md), or all the `improvements.md` files: [readers/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/readers/A.md).
- ⚠️ Haiku found **0** conflicts. Opus, reading the same files, found the five fixed above. Haiku also called two existing folders missing (`ext/Research`, `public/framework/sources`). So Haiku works for inventories, not for judging conflicts; judging stays with Opus. This is logged as an experiment in the task log.
