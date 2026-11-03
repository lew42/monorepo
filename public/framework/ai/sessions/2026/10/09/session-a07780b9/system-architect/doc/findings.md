# System architect run, 2026-10-09: findings in full

The one-screen version is the task page (`../page.js`). This file holds the detail.
Numbers come from `.claude/skills/system-architect/measure.mjs` (`../load-before.json`, `../load-after.json`).

## What a fresh agent reads before its first edit

| Piece | Words | Note |
|---|---|---|
| CLAUDE.md (root) | 3,758 | half of it is 2026-10-08 sections that restate each other |
| `public/framework/ai/CLAUDE.md` (old copy) | 1,428 | auto-loaded by Claude Code for any agent reading under `ai/`; an older law 5. **Renamed to `CLAUDE.copy.md`.** |
| MEMORY.md (owner's auto-memory, outside the repo) | 2,287 | ~90 dated notes, many saying "awaits the owner" for things decided since |
| Readme chain, root → ai | 2,188 | |
| 34 skill descriptions (always in the tool list) | 1,961 | |
| **Base, before any skill** | **10,254** | +1,428 under `ai/` before the rename |
| + task mastermind skills (sub-mastermind, code, finish-task, documentation) | 17,991 → 17,294 | |
| + minion skills (minion, code) | 14,830 → 13,831 | |

## Contradictions (fixed unless marked)

1. **Commit.** CLAUDE.md: commit after every working step. `minion`: never `git add`, never commit. `mastermind`: never commit or push. → Skills now say commit your own files by exact path; never push.
2. **Who changes skills.** `minion` and `sub-mastermind`: send skill fixes to `mastermind-servex-N`. The handover: that role is retired. → improvements.md line; the `system-architect` skill applies them.
3. **Servers.** `minion` and `mastermind` teach `PORT=… node server.js`; the `server-guard` hook refuses it. → Use the worktree's URL or `start_server`.
4. **Usage.** `new-task`: run `claude-usage.py`, write `usage.json` and `usage.jsonl` every 15 min. `check-claude-usage`: run the python script. `mastermind`/`servex-mastermind`: run `usage-now.mjs`, and "never call the usage script yourself". → One tool, `usage-now.mjs`; Servex refreshes the file.
5. **Model default.** `mastermind` ladder: Sonnet is the default spawn; same skill, 2026-10-08: minions default to Haiku. → Ladder rewritten to the newer rule.
6. **Write code yourself?** `sub-mastermind` "Default: do the task yourself" and "a few lines you make yourself, now" vs its own never-list "write code, CSS or scripts by hand — that is a minion's, even when it is two lines". → Never-list item removed.
7. **Questions to the owner.** "Where your words go" (in 4 skills): put what you need from the owner on the card as a question that waits in "Waiting on you". Law 5: never create a request that blocks on the owner. → Paragraph removed (CLAUDE.md already covers cards and chat).
8. **every-prompt:** "speed is the job, under ten seconds" vs "before you write anything, load the `page` skill". → Load step removed.
9. **master-assistant:** "never edit a file under `public/`" vs "keep the readmes fresh". → Readme duty removed.
10. *(Proposed)* **How many agents at once:** `mastermind` "3–6", memory note "≤8", `sub-mastermind` "about 10 of yours", `mastermind` "waves of about 20", "no cap". One number belongs in Servex's spawn gate, not in five sentences.
11. *(Proposed)* **todo.md vs keep going.** `mastermind`/`servex-mastermind`: unasked work goes to `ai/todo.md` "and let the owner pick". `mastermind` "How deep to go": under pace, keep going. Law 5 and the memory note "no parking on approval" lean to keep going.

## Stale facts (fixed)

- `syntax-guard.mjs` and `health-guard.mjs` are cited as active hooks; neither is wired in `.claude/settings.json`.
- `new-task`: "a new day needs `<date>/page.js` and a line in `ai/page.js` `children:`". No October day has one; days are routed without it.
- `minion`: "Write and Edit refuse any path under `.claude/`, even with bypassPermissions". This run edited skills with Edit under bypassPermissions.
- `documentation`: readme "about 150 words" vs CLAUDE.md "under about 100 lines". One rule now.

## Repeated text (removed from all but one home)

| Block | Was in | Now |
|---|---|---|
| The 5-step build order | sub-mastermind, minion, finish-task, documentation | sub-mastermind; one-line pointers elsewhere |
| "Where your words go" | mastermind, sub-mastermind, minion, every-prompt | CLAUDE.md (cards, chat) |
| "Keep the readmes fresh" | mastermind, sub-mastermind, servex-mastermind, master-assistant | CLAUDE.md + `documentation` |
| "No work in limbo" | mastermind, sub-mastermind, servex-mastermind | CLAUDE.md law 5 + each skill's "Resolve, don't park" |
| "Switching directory → load the chain" | mastermind, sub-mastermind, minion | CLAUDE.md "The readme chain" |
| "Before you write anything the owner reads" | sub-mastermind, every-prompt, finish-task | finish-task |
| "The three laws" | minion | CLAUDE.md |
| Owner's tabs, landing in your own log | twice each inside minion | once |

## Dead or retired systems still described

- **mastermind-servex** (retired per handover): still named as the skills owner and relay target. Fixed in minion, sub-mastermind, servex-mastermind (status line added).
- **Servex's generic `mastermind` role loads `servex-mastermind`** (`Servex/agents/roles.js`), a skill that tells its reader "you are not a builder, oversee quality". Domain masterminds (page, ai) get that skill. *(Proposed: map the role to `sub-mastermind`, or a slim `mastermind`.)*
- The v/3 board and `say.mjs` cards are still the route in `mastermind`, `master-assistant` and `every-prompt`, beside Servex's `create_card`/`card_reply`. Two card systems; which is current needs one sentence from whoever owns the board. Not changed.

## Friction that is a required step (proposed, not applied)

- **The build order makes every task spawn a docs-check reviewer, then `review.mjs`.** For a one-file fix that is two paid agents. Proposal: docs-check only when a readme changed; `review.mjs` sizing already allows `none`.
- **`mastermind` is 7,600 words**, mostly dated evidence. Proposal: a 2,000-word core; the evidence moves to `mastermind/doc/` and is linked.
- **Wire `syntax-guard.mjs`** in `settings.json` (a check beats the sentence repeated in two skills).
- **Prune MEMORY.md** to the ~20 notes still true (it is outside the repo; the owner's own file).
- **CLAUDE.md**: `../claude-md-proposal.md`, 3,758 → about 1,200 words, nothing removed that a skill or doc does not already hold. Where the dropped sections went: "No hard fences between roles" and "Design the class architecture" stay as one line each inside "Code is classes" and the mastermind skill; "A name is a name plus its scope" belongs in the `naming` skill; "Systems that shape every turn" (page inbox, review gate, cards) is folded into "The repo is the memory" and "The site is live"; the Haiku-pricing figures go to `public/framework/ai/system/models/`.

## Seen during the run

- Another agent's commit (bf3bb1416) swept this task's staged `git mv` into its own commit: the main tree's index is shared. The skills and the proposal now say `git commit -- <paths>`.
- A reload hold literally named `<your-slug>` (a skill's placeholder, run as-is) was held and auto-renewed by the ledger hook on this task's write.
