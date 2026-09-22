# mistake-audit — why did the system let today's mistakes through, and what is the smallest change that stops them

Load the `minion` skill first. Then this brief. Model: Opus. **Time box: about an hour. The deliverable is one screen.**

**Three laws.** Less is more — and this task is the test of it. Clear beats brief by far. Prioritize (the mistake that hurt the owner most, first).

## The owner's words (2026-09-19)

> as the mastermind, you need to instruct your minions never to break the page. It might happen on occasion, but try to make updates that do not produce errors. […] you should be auditing any of these kind of mistakes as they happen. Spawn a minion, explain to it what went wrong, and ask it to look at the system, to look at the skills, and to try and figure out what went wrong and how the skills could be improved. But be very clear that it's not about adding new rules necessarily all the time. It might be about reshaping existing rules, maybe removing a rule if it's really bad. The idea is that we want to produce correct outcomes. And we don't want to devolve into analysis paralysis where we're not getting improvement and we're just spending a ton of time writing [things] down.

And earlier the same day: "I'm not sure if I trust our layout and design system to try and fix it because it's just making blunders all over the place."

### More from the owner, mid-task — the decision auditor (a fifth section of the deliverable)

> you could spawn an auditor, maybe create an auditor skill — call it a decision auditor. Its sole job is to study the design system: load CLAUDE.md and all the skills. Within those skills we already have a skill-improvement section; maybe we just need a log for each skill. Whenever a skill is used: what was the purpose, did the skill work properly? Every time a skill is used it should be used correctly. When we identify a skill was used incorrectly, file a report into the skill's folder or log — whatever you decide — and use an auditor minion to [review them]. You probably want a persistent instance — can't you branch off a specific session at a checkpoint so it's preloaded, or just start it fresh with the proper prompt: you're an auditor.

> the AI doesn't always make the right decisions. In uncertain decision areas, especially with multiple potential options and a lot of caveats, the AI makes a best guess, but that's not always correct. So in terms of judgment calls … you as the mastermind need to trigger the audit: spawn a minion that loads all the skills and CLAUDE.md — it's like a system architect — and use a better model, Opus, maybe even Fable. As the mastermind, you evaluate whether the audit produces any useful results. Especially if you're using Fable, make sure it's recording its progress. Both the mastermind and the auditor can add notes — opinions, feedback, whatever — to the log for the skill. Then we can digest that on the next runs.

What already exists, so the design sits on it rather than beside it: the PostToolUse hook logs a
`skill: <name>` line into the task ledger; every skill has an `improvements.md` and a
`skill-improvement` skill; a landed minion can be woken again with its whole context by
`SendMessage`. Design the SMALLEST version that produces correct outcomes — say what a misuse
report is, who files it, what the auditor does with them and on what cadence, and whether a
persistent auditor is the right shape. If an `auditor` skill is warranted, write it (under 60
lines) at `.claude/skills/auditor/`; if not, say what replaces it.

## What went wrong today — four cases, with the evidence

1. **Every page went blank, twice (14:51 and 15:05).** The sidebar-repair minion (Opus) wrote backticks inside a comment inside the `css(`…`)` template in `public/framework/ui/tree/tree.js`. That ends the template; the module does not parse; every page imports it. The owner was using the site both times. `CLAUDE.md` names this exact trap ("one backtick inside css(`…`) kills every page") and the `css` skill does too; the minion's brief said "every edit in one write, loaded headless within a minute". After the first break the mastermind messaged the minion and added a `node --check` line to the minion skill — and the second break happened fourteen minutes later anyway (the message was still queued, or was not acted on). What finally stops it is mechanical: `.claude/hooks/syntax-guard.mjs`, called from the PostToolUse hook, checks every `.js` write and stops the agent at once if it does not parse. **Question: a rule that was written in three places did not prevent this; a 30-line hook does. Which other written rules are really jobs for a check?**
2. **The site sidebar shipped looking wrong** (2026-09-18: `ai/2026-09-18/site-sidebar-tree/`, `sidebar-filter/`, `tree-fixes/`): 46.5 px tree rows, labels 80 px in, a 9 px fold glyph, the filter in a bordered card inside the rail, icons off the label's centre line, a footer floating over a white block. The builders kept **one** 170 px crop between them and no picture of the whole rail; each landed saying it was verified. The mastermind had paused the critic pass for budget. The cause in the CSS: the old flat menu's roomy link chrome (`padding: 1em; gap: 1.3em`) was carried onto tree rows — the same class of blunder as the "fat nav" of 2026-09-06 (git log, `a8888975`), which already produced a rule. **Question: the rule existed; why did it not fire? Is it findable at the moment a builder needs it, or is it one line in a 400-line skill?**
3. **The mastermind broke its own hook** while adding the guard (15:07): a Python script written through a bash heredoc had its backslashes eaten, `ledger.mjs` stopped parsing, restored from a backup within seconds. The same heredoc trap had already bitten three times in two days and was already written down — in the minion skill, which the mastermind does not load. **Question: where should a harness trap live so that the one who needs it sees it?**
4. **The V2 board's spacing was wrong at 3440** — the mastermind hand-wrote fixed `rem` paddings, against the design system's own tokens (`--pad`, `--gap`, container units), with a comment claiming the opposite principle. The owner caught it in one look.

## What to do

- Read the skills as an agent meets them: `.claude/skills/*/SKILL.md` (sizes first: `wc -l`), their `caveats.md` and `improvements.md`, `CLAUDE.md`, and the briefs of the four tasks above. For each case answer in two or three sentences: what did the agent have in front of it at the moment of the mistake, and why was that not enough? (Too long to find? Stated as a principle, not as a check? Contradicted elsewhere? Not loaded by that agent at all?)
- Then propose **at most five changes, ranked by mistakes prevented per line of text**. For each: what it replaces or removes, the exact new wording or the check, and which of the four cases it would have stopped. Prefer, in this order: (a) a mechanical check over a sentence (a hook, a `node --check`, a required full-width screenshot in the landing that the mastermind actually opens); (b) **deleting or merging** text so the rule that matters is findable — give line counts before and after; (c) rewording a principle into the one observable thing to do; (d) a new rule — last, and only with a rule removed to pay for it.
- **Apply the fail-safe ones yourself** (correcting something wrong, merging duplicates without changing what is decided, moving a harness trap to where every agent sees it, deleting an `improvements.md` entry that is already applied). Anything that changes what a skill DECIDES, hardens a number, or adds a required step is a **proposal**: write it as a `decision` line in your task.jsonl with its alternative, for the owner's Approve / Improve. **Never edit `CLAUDE.md`** (it says: do not edit without asking) — propose.
- Also write, as a proposal (do not edit the mastermind SKILL.md — the mastermind will): the four-line section "Audit a mistake when it happens" — when to spawn this audit, what to hand it, the time box, and the stop rule that keeps it from becoming analysis paralysis.
- Say plainly what you would NOT change, and why. "The skills are fine; the process skipped the critic" is an allowed finding.

## Deliverable

A `page.js` in your task dir, one screen: the four cases each as a card (what happened in one sentence · why the system let it through · the change), then the ranked changes with before/after line counts, then what is applied versus what waits for the owner. No essay. Numbers: total lines of skill text before and after your fail-safe edits.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/mistake-audit/`); `documentation`; `finish-task`.
- **Fence:** `.claude/skills/**` except `mastermind/SKILL.md` (fail-safe edits only, as defined above — everything else is a proposal), your task dir. Read anything. Not `CLAUDE.md`, not `.claude/hooks/**`, not `.claude/settings.json`, nothing under `public/` except your task dir.
- Other minions are reading these skills right now: make each skill edit in one write, and keep every skill loadable at every moment.
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never drive the owner's tabs.** Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing in this shell. Write files with the Write or Edit tool — a bash heredoc eats backslashes and fails on apostrophes in this harness. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — the one-sentence finding per case, the changes applied, the proposals waiting, the line counts, the link.
