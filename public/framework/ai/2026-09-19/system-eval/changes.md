# The ranked list — seven changes, most valuable first

Each one: the change, the evidence, the exact edit, the line count, and what it would have prevented. Nothing here was applied — `.claude/**` was read-only to this task. Line numbers are against the files as they stood at 18:45 on 2026-09-19.

## 1. One script starts, messages and forks sessions — and it writes the launch line before the process exists

**The change.** `node .claude/sessions.mjs start <slug> --role minion --page /x/ --model <full id> --effort <level> --brief <requirements.md>` mints a random v4 uuid, appends one line to `public/framework/ai/sessions.jsonl`, writes the task's `task.jsonl` line 1 with `session_id` equal to that uuid, and runs `claude --session-id <uuid> -p "<prompt>" --model … --effort … --permission-mode bypassPermissions --output-format json` from the repo root with stdin closed. `message <id> "<prompt>"` runs `claude --resume <id> -p …` under a per-id lock. `fork <library-id> --n 3 -p …` forks a library. `list` prints the registry. The full design is in sessions.md.

**The evidence.** Tonight's launch of this task: the launch line carried the mastermind's id, so the ledger attributed nothing to this session and the Stop hook never gated it; the permission mode was not bypass, so the session read everything and wrote nothing in the repo; the six Sonnet minions started at 18:49 carry hand-typed ids (`a1c1d1e1-0001-4a19-9b01-000000000001`); the model-latency task measured 3 seconds lost per start when stdin is left open.

**The edit.** mastermind §"A minion is a CLI session with its own id" (lines 13–41, 29 lines) becomes 8: the three verbs as commands, one line on what the script guarantees, a link to the script's readme. §"Each cycle — 4. Spawn" and §"Minions keep their context" lose their command detail (−10). minion §"Before the first edit" loses the launch-line sentence: "your launch line exists; append your first `now`" (−4). new-task §1 loses the launch-line block and the slug-from-window-title bullet, §2 loses the usage refresh (−30, the script does both).

**Lines.** About −70 in the skills, +25 in a readme only the script's users read.

**Prevented.** Tonight's write-denied run; the ledger's silent misattribution; a minion no hook can gate; ids typed by hand; three seconds per start.

## 2. Delete the Agent-tool era from the mastermind skill; tiers.md is the one roles table

**The change.** Remove what the first section now forbids, and stop restating other skills.

**The evidence.** Lines 174–191 tell a sub-mastermind to run in the foreground, to `SendMessage` a parked worker, and that a landed agent's transcript can vanish — all facts about the in-process tool. Line 41 patches the contradiction ("where this skill still says `SendMessage`, read message by id") instead of removing it. Lines 267–283 restate tiers.md. Line 275 makes the mastermind's identity a `ListAgents` name. Three sections (325–344) say reports are one screen.

**The edit.** Delete 174–191, 41, 267–283; replace them with two lines: "The roles: `every-prompt/tiers.md`. Your identity is your session uuid — write it as `mastermind_session`." Keep §"Reporting — evidence, not essays" and point the other two reporting sections at CLAUDE.md's Presentation section (−25). Add one line under §"Never break the page" — the mistake-audit's proposal 3, unapplied: "The mastermind's own writes are briefs, cards and log lines. A hook, a stylesheet, a page or a script is a minion's, even when it is two lines." Shrink that section's audit procedure to a pointer at the master assistant (−12).

**Lines.** About −95, +4.

**Prevented.** A fast assistant ringing a name no CLI session has; two identity systems for one mastermind; the mastermind hand-editing live UI, which produced two of 2026-09-19's four owner-visible mistakes.

## 3. The master assistant is the Fable architect, may edit the skills, and absorbs the auditor

**The change.** One role, one skill, one owner for the improvements loop.

**The evidence.** The owner, 2026-09-19: "the master assistant could use Fable at its highest settings as the system architect … when the system fails try to update it." The skill says "Opus; Fable for an architecture question" and never edits. About 90 `improvements.md` entries wait across 15 files, the oldest from 2026-08-17; almost none has been applied (the mistake-audit deleted two today). The mastermind skill says "every cycle, read the improvements.md and apply the fail-safe ones" — and its own file shows a 2026-09-04 proposal still waiting. Two skills call themselves "the system architect".

**The edit.** master-assistant, header line: "Opus; Fable for an architecture question" becomes "Fable at max effort — the owner's choice, 2026-09-19. Observe; do not build. When the weekly Fable window is at its line, the owner may say Opus." §"Between questions you are the auditor" becomes a 20-line section carrying the auditor's core: what you read once, what you read per audit, at most five changes ranked by mistakes prevented per line of text, fail-safe edits applied by you, a `decision` line for the rest, the stop rule. §"Never": "edit a file under `public/` other than your process page" becomes "edit anything under `public/` except your process page — `.claude/skills` is yours". Delete `auditor/SKILL.md` (71 lines); move the three grading lines from `auditor/improvements.md` into `master-assistant/improvements.md`.

**Lines.** About −45 net.

**The alternative, written down.** The skill-roles decision at 17:20 kept them separate so that supervision stays cheap to re-read. But master-assistant is read once per session; `every-prompt` is the skill re-read every prompt. Keep them separate only if the audit section grows past a screen — then link its history instead of carrying it.

**Prevented.** A backlog that nobody owns; the same trap re-filed by a fourth agent because the third's line was never applied (heredoc: six filings).

## 4. One append helper replaces the encoding, clock and re-parse prose

**The change.** `node .claude/hooks/append.mjs <target.jsonl> <lines.json>`: every string value `"NOW"` becomes the local clock at the moment of the append; the trailing newline is sniffed; the lines are appended; every line of the file is re-parsed; a bad line exits non-zero and names itself. The file is written: `append.mjs` beside this page, 45 lines.

**The evidence.** new-task lines 27–51 (BOM, `Add-Content` ANSI, "three ways a line is silently wrong"), finish-task lines 37–53, minion bullets on the heredoc and the BOM, code §7's two heredoc bullets — about 60 lines citing fifteen dated incidents: two BOMs, one ANSI byte, six heredocs, three clock drifts, three torn or incomplete lines.

**The edit.** Each of those passages becomes one line: "Append with `.claude/hooks/append.mjs`; it stamps the clock and re-parses the file." Keep one sentence in new-task on what a line is (one object, one verb).

**Lines.** About −55, +8.

**Prevented.** All fifteen, mechanically.

## 5. A trap is one sentence and a link; the story stays in the task log

**The change.** The rule for every ⚠ paragraph in a SKILL.md: name the trap, name the check, link the task or doc that holds the story. Detail is never deleted — every story is already in a task log, or gets a link to one.

**The evidence.** The mistake-audit found that three of four failing agents never loaded the skill holding the rule, and that "one line in a 400-line skill" is not findable when needed. The owner: "getting reports with details I can't follow doesn't help me at all." 297 date stamps in 37 skill files.

**The edit.** code §7 (about 90 lines to about 35); css §1 (25 to 6); layout's ⚠ paragraphs (about 60 to 20); ui-test §Traps and §"Pick the root first" (about 120 to 35); new-page step 3 (16 to 5); minion's never-list (25 to 12); new-css-class steps 3–4 (dedupe, −8).

**Lines.** About −280 net.

**Not fail-safe as one blanket edit** — it moves text, so the master assistant does it skill by skill and each pass is one commit.

**Prevented.** The next agent who skims past the rule that matters because it sits in a wall.

## 6. Fix the ten contradictions

Each is a two-line edit; the list with both sides is in skills.md. Pacing: check-claude-usage §Pacing and §Overnight become "the rule is in the mastermind skill" (−20). research lines 119–120 (−2, +1). check-claude-usage line 30 (`Out-File` to a redirect) and line 88, mastermind lines 104 and 127 (RULE#16, RULE#1 become plain references to CLAUDE.md). layout Q3: "a wall of unknown length takes `auto-fill`; a known or small count writes its columns out or takes `auto-fit` — framework.css's own `.grid.auto` is `auto-fit`" (+1; then delete the three improvement entries, −6). tiers.md's model column: "set per run by the owner" (±0). master-assistant's model line is change 3. **Lines.** About −30.

## 7. Delete the dead weight

The subtractions below — no replacement text.

---

# Subtractions — delete these and lose nothing

- **`.claude/skills/assistant/`** (the five-line forwarder), the `"assistant"` string in `ledger.mjs` line 122, and the §prompt-relay mentions of the old name in `.claude/hooks/readme.md` — after checking that the 18 files naming `skills/assistant` are all landed briefs and logs (they are).
- **mastermind** lines 174–191, 41, 267–283; the audit procedure at 308–323 down to a pointer; two of the three reporting sections at 325–344; "RULE#16" at 104 and "RULE#1" at 127.
- **minion**: the two Server/ bullets (`node --check` proves parsing; a save under Server/ restarts every server) — the boot-test supervisor landed at 16:38 today; and the launch-line sentence in §"Before the first edit".
- **code §7**: the backtick story (the hook exists; the one-liner stays).
- **css/strategy.md** §1–§4 (the ladder, container or item, token or declaration, which layer — all in SKILL.md §2–§4); keep "Two one-liners" and "Ownership" by moving them into caveats.md. About −40.
- **fork-claude-session**: Step 1 (finding the current id; the script knows every id), −20; the "Sizing the library" table with its `claude-opus-4-8` and `claude-sonnet-4-6` rows, −25; §"Relation to `subagent_type: fork`", −6; Step 3's "Caveat, unmeasured" paragraph, −8.
- **new-task**: §1's first bullet (the slug from the VS Code window title), −2; §2's usage-refresh block, −12; the `note` verb paragraph (a v2 board verb), −5.
- **every-prompt**: the second half of §Routing (duplicated in tiers.md), −4; the link to a non-existent `improvements.md` (create the file or drop the line).
- **check-claude-usage**: one of the two copies (the repo one wins the name), −101; §Pacing and §Overnight, −22.
- **research**: the "Dig in the foreground" warning (Agent-tool era), −5.
- **improvements.md entries already applied or declined**: layout 2026-08-17 (declined in its own text); layout 2026-09-01, both ("Added: …"); the three auto-fill entries once change 6 lands; the css §1 entries once change 5 lands. About −12 now.
- **The fail-safe definition** in three places — one, after change 3.

**Total.** About 350 lines go outright and about 280 more through the trap rule: roughly 600 of 2,740 prose lines, a fifth of the system, with every story still reachable by a link.

# What today's related work already covers

- **mistake-audit** (15:22): five proposals with alternatives. Its proposal 2 (harness traps into CLAUDE.md) is covered by changes 4 and 5; proposal 3 (the mastermind writes no code) is folded into change 2; proposal 5 (the auditor's shape) is reversed by change 3 with the reason written out; proposals 1 (a picture of the whole thing at landing) and 4 (the landing names the skills loaded) stand, and change 1 makes 4 unnecessary — the ledger will record every skill load once the launch line carries the right id from birth.
- **skill-roles** (17:12): five contradictions for the mastermind skill — all five were fixed in the 214-line edit that followed.
- **The four process-redesign cards** (16:54): a lean mastermind (changes 2 and 5), one long-lived minion per page (the registry's `page` field and `message`), a fast lane for small changes (the script's `--lean` profile, sessions.md), the assistant as the front (done — `every-prompt`).
