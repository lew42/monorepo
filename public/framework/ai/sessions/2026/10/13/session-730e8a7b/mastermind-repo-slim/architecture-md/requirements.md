# architecture.md per module: the conclusive decisions and why, nothing else

Budget: $15. Load the `sub-mastermind` and `documentation` skills first. The owner's raw words: `../requirements-2.md`, ask 4 ("an architecture.md for each module… the conclusive decisions and why… alternatives and trade-offs… not 'the decision was reversed three times'… keeping context to a minimum for new agents: just tell them what they need to know"). Your log is this dir's `task.jsonl`. CLAUDE.md: readmes point, docs explain; link don't regenerate; never destructive (decision logs stay where they are, they are just not what a new agent reads first).

## What exists

- Some modules already have one: `public/framework/styles/doc/architecture.md`, `Servex/doc/architecture.md`; CLAUDE.md says "an `architecture.md`-style doc beside it holds decisions". Many modules have `doc/decisions.md` (the log, with dates and reversals) instead. The `documentation` skill decides what a module's docs must contain.
- Census first, by script (`Server/ArchitectureCensus.mjs`, read-only): every module dir under `public/framework/{core,ext,ui,ux,web,styles}`, `Server`, `Servex` with a `readme.md`: has `doc/architecture.md`? has `doc/decisions.md`? how many `decision` lines in its task logs? how many files import it (from `PastWork.mjs`'s method)? Rank by importers.

## Deliverable

1. **The shape, once:** a template in the `documentation` skill (`.claude/skills/documentation/SKILL.md`, a short section plus a linked `architecture-template.md`): title; one paragraph of what the module is and the pattern it uses; then one entry per conclusive decision: the decision in one sentence, why in one or two, the alternative(s) and the trade-off in one, and a link to the log entry or task that decided it. No dates in the body unless a date is the decision; no "the owner said on…"; no reversal history. Under 80 lines for most modules. The readme links it in its "More" line.
2. **The top 12 modules by importers** get a real `doc/architecture.md`, written by Sonnet minions from the module's readme, decisions.md and the `decision` lines in its task logs (a Haiku minion extracts the decision lines into the minion's brief first, so the writer reads a page, not a log). One minion per module, briefs with exact file lists; you review each against the template and the code (does the code actually do what the decision says?). Where a module already has one, bring it to the shape only if it is off; never shrink a doc that is already good.
3. **The rule for everyone:** one line in `public/framework/readme.md`'s docs section and in the `documentation` skill: a module's readme gives the one-line overview and links `doc/architecture.md` for decisions; `doc/decisions.md` (the log) is history, read when you need to know how a decision moved.
4. Report on your card: the census counts (modules, with/without), the 12 written with links, the rule's wording.

Fence: `doc/architecture.md` and the one readme link line in the modules you take (list them in your log before starting), `.claude/skills/documentation/**`, `public/framework/readme.md` (one line), `Server/ArchitectureCensus.mjs`, this task dir. Worktree, `merge.mjs`. Do not touch the modules the sibling tasks own today: `ux/Dictate`, `core/Page/ext/Inbox`, the catalog page.
