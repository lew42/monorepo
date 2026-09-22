# Every skill, evaluated

Read once, whole, on 2026-09-19 between 18:41 and 18:59: all 45 files under `.claude/skills/` (about 3,050 lines; the copy-in re-count on 2026-09-19 at 19:39, after other work had touched several skill files, found 3,052 — 2,740 of prose once the two scripts and the forwarder are set aside), the five hooks (681 lines), `CLAUDE.md` (43 lines), and every `improvements.md`. The two user-level skills sit outside the folders this session was allowed to read. `check-claude-usage` also has a copy inside the repo, which is the one that loads, so it is graded from that copy; `fans` is graded from its description only.

**Verdicts:** keep · shrink · merge into X · split · delete. "Lines" counts the SKILL.md plus its side files.

| skill | lines | what it is for | is it earning its lines? | verdict |
| --- | --- | --- | --- | --- |
| mastermind | 369 | the executive: budget, the model ladder, the cycle, briefs, reporting | No. Eight dated owner-quote sections; about 80 lines of in-process spawn advice that its own first section now forbids; the roles table and the audit procedure restated from other skills; three sections saying "reports are one screen". | **shrink** to about 150: delete the Agent-tool era, point at tiers.md and the master assistant |
| minion | 76 | the worker's contract: its id, its brief, the laws, the never-list, landing | Mostly. The never-list is nine incident stories, five of them also written elsewhere, two about a Server/ crash the boot-test supervisor now prevents. | **shrink** to about 40: one line per never, a link each |
| every-prompt + cards, headless, tiers, trouble | 150 | the fast assistant: echo, card, relay, in seconds | Yes — reshaped today, and it is the only skill re-read every prompt. Its doorbell still rings a tab name with `SendMessage`; its improvements.md link points at a file that does not exist. | **keep**; the doorbell becomes a message by session id; the Routing paragraph is already in tiers.md |
| master-assistant | 60 | the supervisor: an opinion in two sentences, the process page | Yes, but it says Opus and "never edits". The owner said Fable at its highest setting, fixing the system when it fails. | **keep**, rewrite three lines; **absorb the auditor** |
| auditor | 87 | the audit procedure: what to read, at most five changes ranked by mistakes prevented per line | The procedure is good; the home is wrong — a second "system architect" beside the master assistant, loaded by nobody else. | **merge into master-assistant** as a 20-line section |
| code | 196 | house style and the traps that never throw | §1–§6 and §8, every line. §7 is about 90 lines of twenty dated stories; improvements.md holds twenty more, unapplied since 2026-09-04. | **keep**; §7 becomes one line per trap with a link; apply or archive the twenty entries |
| css + caveats, strategy | 208 | where a declaration belongs | §2–§7 yes. §1 is one 25-line paragraph stitching seven incidents; strategy.md restates §2–§4. | **shrink**: §1 to five lines; strategy.md down to its two one-liners and Ownership, moved into caveats |
| layout + caveats | 311 | the five sizing questions before the first factory call | The five questions and the measure cycle (about 90 lines) yes. Six owner-dated design essays are documentation wearing a skill's clothes, and the skill contradicts itself on auto-fill — three improvement entries say so. | **split**: questions + cycle stay (about 100); the essays become styles doc pages the skill links |
| new-task | 107 | open a task: the launch line, the steps bar, the day log | About 35 lines yes. Forty are BOM, heredoc and clock traps; the slug-from-window-title step and the usage refresh belong to the start script. | **shrink** to about 45 |
| finish-task | 78 | land: the landing line, the links, the day log | Yes; §3 is seventeen lines of the same encoding traps. | **keep**; §3 to three lines once the append helper exists |
| documentation | 88 | readme, page.js and doc/ made current | Yes; §3's two route paragraphs (14 lines) are trivia for a caveat line; one recurring improvement waits to be applied. | **keep**, shrink §3 |
| new-page | 53 | the blessed page shape and the parent's children line | Yes; step 3's three warning paragraphs (16 lines) are one line and a link. | **keep**, shrink step 3 |
| new-css-class | 54 | the class-name census | Yes; the classify()-name trap is written twice (steps 3 and 4); a recurring improvement (`page-<module>-` for core Page subclasses) waits. | **keep**, dedupe, apply the line |
| research | 129 | the research writer's credence discipline | Yes, for its domain; builders never load it. One warning is Agent-tool era. | **keep**, minus five lines |
| skill-improvement | 42 | the feedback loop's entry: one line when a skill let you down | Yes — cheap and right. The loop's other half (apply, then delete the entry) is the part not running. | **keep** |
| ui-test + drive.mjs | 297 + 130 | prove a gesture headless | Verbs, plan and drive-or-force (about 90 lines) yes. Traps is 83 lines of bullets and "pick the root first" 36 more; a specialist skill loaded only for gesture proofs. | **shrink** to about 130; the rest to a traps.md loaded on demand |
| fork-claude-session | 325 | forking and CLI sessions — the reference the new start script leans on | Half is cache economics and a stale model table; Step 1 (hunting the current id) dies once the script knows every id. The measured stories (fork a library, effort is a cache key) earn theirs. | **shrink** to about 120 and rename `sessions`: the three verbs and the measured facts |
| check-claude-usage (two copies) | 106 | the usage meter | About 30 lines. Its pacing rule contradicts the mastermind's; its snippet writes a BOM the other skills forbid; it cites a RULE#16 that CLAUDE.md no longer has; every headless run now reports the same numbers for free. | **shrink** to about 30, one copy |
| fans (user level) | unread | machine hygiene: what is burning a core | Could not be read from this session (outside the allowed directories). Its coupling "whenever you use check-claude-usage" is odd. | **keep**, unread |
| assistant/ | 5 | a forwarder to `every-prompt/say.mjs`; no SKILL.md; uncommitted | No. Eighteen files still name the old path — all landed briefs and logs. | **delete**, once ledger.mjs's marker string drops the old name |

## One rule, written many times — and where it should live once

| the rule | written in | should live in |
| --- | --- | --- |
| never kill or restart the dev server; never drive the owner's tabs | minion, mastermind (Briefs), every-prompt, ui-test twice, layout caveats | one line in CLAUDE.md's "The site is live" section |
| never `git stash` | minion, mastermind | the same line |
| never `find /` | minion, mastermind, mastermind/improvements (which proposes a PreToolUse hook, 2026-09-04, unapplied) | the hook; zero sentences |
| a shell string eats backslashes, backticks and apostrophes — write files with the Write tool | code §7 twice, new-task, minion, finish-task, ui-test; research says the opposite | one line in CLAUDE.md's traps (the mistake-audit's proposal 2, pending) plus the append helper |
| never write a `.jsonl` with `Out-File` (BOM) | new-task, minion, finish-task; check-claude-usage's own snippet uses `Out-File` | the append helper; zero sentences |
| a backtick inside `css()` blanks every page | CLAUDE.md, code, css caveats, mastermind, minion | CLAUDE.md only — the syntax guard is the rule now |
| `node --check` proves parsing, not booting; a Server/ save restarts every server | minion twice (14 lines), code/improvements | nowhere — the boot-test supervisor exists since 16:38 today |
| timestamps come from the clock; re-parse after every append | new-task, finish-task twice | the append helper stamps and re-parses |
| the three laws | CLAUDE.md, minion, mastermind, code, documentation, every brief | CLAUDE.md; skills point |
| the four tiers table | tiers.md, mastermind (17 lines) | tiers.md |
| a page region takes `.pad`, a framed box `.card`, a control its own `em` | css, layout, new-css-class | css; the other two link |
| reports are one screen; conclusions first; nest detail | mastermind, three sections; CLAUDE.md's Presentation section | CLAUDE.md; one pointer |
| what counts as a fail-safe skill edit | mastermind, auditor, skill-improvement | the master assistant, after the merge |

## Contradictions — and which side moves

1. **Pacing.** The mastermind says "aim about 20 points under the pace line"; check-claude-usage says "used% must not exceed elapsed%, no fixed cap". The owner's later word (2026-09-18, "better to have somebody doing something") wins; check-claude-usage's Pacing and Overnight sections go.
2. **Heredocs.** research (lines 119–120) says "use a Bash heredoc instead"; code, minion and new-task say never. research moves: name the guard that refused `summary.md`, and say to write the file another way.
3. **The BOM.** check-claude-usage's snippet (line 30) writes `usage.json` with `Out-File -Encoding utf8`, which is the BOM new-task and minion forbid. The snippet moves to a plain redirect, or to the append helper.
4. **Walls.** layout Q3 says "walls take `grid auto-fill`"; its improvements.md says three times that a small or known count wants `auto-fit`, and framework.css's own `.grid.auto` is `auto-fit`. The skill moves; the three entries are then deleted.
5. **The master assistant's model and hands.** The skill says Opus and never edits; the owner says Fable at its highest setting, updating the system when it fails. The skill moves.
6. **The mastermind against itself.** Its first section says "never the in-process Agent tool"; lines 174–191 are procedures for that tool. The old lines go.
7. **Which model runs which role** is written four ways: tiers.md (Fable), the process-redesign card (Opus, Fable for architecture), tonight (Opus and Sonnet), the master-assistant skill (Opus). One line in tiers.md: the owner sets the model per run.
8. **Two identity systems.** `mastermind_session` is a tab NAME for `SendMessage`; everything else is a uuid. A CLI session has no name, so the uuid wins and the doorbell becomes `claude --resume <id> -p`. `Server/plugins/CardAnswer.js` rings by name too.
9. **The launch line's id.** new-task reads `$env:CLAUDE_CODE_SESSION_ID`; the brief says not to trust it; the start script makes the question moot, because it minted the id.
10. **RULE#16 and RULE#1** (mastermind lines 104 and 127, check-claude-usage line 88) refer to a CLAUDE.md that has three laws and no numbered rules.

## Suggestions written as laws

The owner objected twice, and the mastermind skill carries the rule ("Suggestions, not laws") — beside 38 `never`/`always` of its own. Across the skills: 231 `never`/`always` in 35 files; 297 date stamps in 37. Examples: layout's rhythm section says "never both in one box, never `flow` inside a card" a screen below a section titled "suggestions, not laws"; css §2 opens with "No inline styles"; the minion's never-list is nine bullets long. The shrink pass (change 5) rewrites each as the observation plus the check, and keeps `never` only for what has actually broken the site: a blanked page, a stash that took a sibling's work, a killed server.

## What a check would do better than a sentence

| the sentence today | the check |
| --- | --- |
| never `find /` (two skills) | a PreToolUse hook that refuses it — proposed 2026-09-04, still a sentence |
| BOM, torn line, clock drift, missing brace, re-parse (about 45 lines in three skills) | the append helper: stamps the clock, sniffs the trailing newline, appends, re-parses, fails loudly |
| a Server/ save must boot (14 lines) | done — the boot-test supervisor |
| a backtick in `css()` (five places) | done — syntax-guard.mjs |
| an import that parses but 404s (two long improvement entries) | done — health-guard.mjs |
| "which skills did the agent load?" (unanswerable today) | the ledger, once the launch line carries the minion's id from birth |
| refresh usage.json every fifteen minutes (12 lines) | read `rate_limit_event` off every headless run — free, measured by model-latency |

## The gaps between what the owner said today and what the skills say

- **Fable, observing, fixing the system when it fails** — the skills say Opus and "never edits". The skill moves (change 3).
- **The fast assistant starts the master assistant with the resume API and relays every prompt** — every-prompt never starts anything and relays to the mastermind by tab name; the board said at 17:19 that a master assistant was "online", and nothing on disk can confirm it. The skill moves: `start --role master`, then `message` (change 1).
- **"Each path could have" a session** — the mastermind says "one page, one minion" and has nowhere to write which page. The registry's `page` field (sessions.md).
- **Sessions tracked and reloadable** — today: an id in a task's first line when someone writes it, and a hand-kept list in handover.md. The script and its `list` verb.
- **Subtract, do not add** — about 90 improvement entries wait; the shrink pass and the loop's new owner.
- **Two assistant skills?** No: one skill (`every-prompt`) and a five-line leftover (`assistant/say.mjs`). Delete the leftover.
- **Do the skills describe the design?** Roughly half. The roles exist; the mechanics (start, message, fork, a list of live sessions, who edits the skills) do not yet.
