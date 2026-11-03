# Skills Review: Conflicts, Repeats, Stale, Overlaps, Rules

## 1. Conflicts

None found. Skills that reference related topics (code, page, layout, design) are well-scoped by their trigger and none contradict each other. `decide` and `auditor` address different stages (execution vs. judgment), not conflicting approaches.

## 2. Repeats of CLAUDE.md

| Skill | CLAUDE.md | Gist |
|-------|-----------|------|
| code:8-16 | 67-71 | Write classes not function bags |
| code:46-48 | 67 | Comments one line pointer |
| code:51-52 | 109 | No DOM after await |
| new-page:40 | 32 | Route everything |
| navigation:9 | 32 | Route everything |
| content:9 | 26 | Show it then tell it |
| clarity:24 | 20 | Shown not told |
| decide:21-22 | 14 (Law 5) | Nothing waits on owner |

## 3. Retired / Stale

| Item | File:Line | Quote |
|------|-----------|-------|
| auditor reference | auditor:16 | "every `.claude/skills/*/SKILL.md` with its `caveats.md` and `improvements.md`" — only css and layout have caveats.md (30 skills lack it) |
| CLAUDE.md reference | check-claude-usage:88 | "CLAUDE.md RULE#16" — CLAUDE.md has no numbered rules; content is there but numbering is wrong |

All other file paths verified as live: `/framework/design/`, `Server/PastWork.mjs`, `/framework/ai/v/3/`, `.claude/skills/*/improvements.md`.

## 4. Overlapping Skills

| Skills | Overlap | Mitigation |
|--------|---------|-----------|
| page, layout, color, ui, navigation, content, css | all point to /framework/design/ or /framework/code/ subsystems | hierarchical entry points, not true overlap; page is overview, others are topic-specific |
| clarity, content | both address writing for owner | clarity is reactive audit (after landing), content is preventive (before writing) |
| code, new-page, page | all deal with pages | code is for JS, new-page is for page creation, page is for page design — scoped triggers |
| css, new-css-class | naming and CSS | css skill explicitly routes naming to new-css-class (line 3) |

## 5. Rule Inventory

| Topic | Gist (≤10 words) | File:Line |
|-------|-----------------|-----------|
| commit | decision always written by Server/decide.mjs | decide:8-10 |
| commit | append-only improvements.md for skill feedback | auditor:48-58 |
| commit | no hand-written decisions, tool ensures consistency | decide:8-10 |
| commit | decision has rank, options, caveats, then-children | decide:14-18 |
| commit | mv to skills-archive/ with reason on deletion | system-architect:28 |
| worktree | N/A | — |
| merge | check at four widths before merging layout | layout:15-16 |
| merge | screenshot four widths before merge | layout:15-16 |
| review | load page, layout, css, content skills first | review:12-13 |
| review | read shots in horizontal bands | review:52 |
| review | one system at a time in specified order | review:35-46 |
| review | one line per question: yes/no/n/a + evidence | review:58 |
| review | report shape: verdict line first, numbered findings | review:67-86 |
| screenshots | headless-only, never owner's tab | clarity:33 |
| screenshots | use mcp__site__shot or Server/browser.mjs | clarity:33 |
| task-log | log findings as you go in task.jsonl | auditor:63-64 |
| task-log | agents append to improvements.md on skill failure | system-architect:43-44 |
| report/card | answer as card via say.mjs say command | every-prompt:16 |
| report/card | post card to refine fast tier, never rewrite | master-assistant:26-28 |
| report/card | send verdict to flags.jsonl validated line | clarity:49-50 |
| report/card | inbox file at logs/inbox/<id>.jsonl | every-prompt:50-54 |
| report/card | monitor inbox with timeout 30min re-armed | every-prompt:56-59 |
| report/card | process page: roles, decisions, audits, issues | master-assistant:30-38 |
| owner-note | inbox is Servex fact not design fact | page:12-13 |
| owner-note | preserve owner's words never rewrite | master-assistant:28 |
| owner-note | relay owner's words verbatim not summarized | every-prompt:25-29 |
| spawn | route to expert or mastermind one line | every-prompt:31-37 |
| spawn | send message to mastermind as doorbell | every-prompt:18-19 |
| spawn | Haiku minion to judge past-work output | past-work:18-20 |
| budget/tokens | spend before wide fan-out or long run | check-claude-usage:40-44 |
| budget/tokens | state cost when proposing expensive approach | check-claude-usage:43 |
| budget/tokens | check ~15min cadence during orchestration max | check-claude-usage:48-52 |
| budget/tokens | pace rule: used% ≤ elapsed% per window | check-claude-usage:72-77 |
| budget/tokens | never wake owner to spent window morning | check-claude-usage:88-92 |
| windows-hide | every process started with windowsHide: true | code:52 |
| servers | N/A | — |
| live-browser | never mcp__site__pages, claim, eval on owned tab | clarity:33 |
| docs/readme | every skill has improvements.md feedback log | auditor:16 |
| docs/readme | architecture.md holds decisions with sessions | code:25 |
| docs/readme | design architecture before building >1 class | code:23-24 |
| naming | say thing in one plain sentence first | naming:10 |
| naming | brainstorm 3-5 cheap clones in parallel | naming:11 |
| naming | pick for clarity rule out needs-explaining | naming:12 |
| naming | log pick as decision with runner-up | naming:13 |
| naming | plural many instances, singular one thing | naming:15-22 |
| naming | title 5-8 words starting familiar concept | content:10 |
| naming | file/class/folder capitalised match each other | code:12 |
| naming | never new ClassName (use this.constructor) | code:40 |
| naming | never static View inside class body | code:40 |
| naming | helpers are methods or statics not functions | code:13 |
| naming | page method never render() collides core | new-page:35 |
| naming | icon Material Icons only Symbols fail silent | new-page:55-58 |
| naming | reserved prefixes, census, declared, prefix, scopes | new-css-class:10 |
| page-tools | call create_page never hand steps | new-page:13-15 |
| page-tools | route everything each view has own URL | new-page:37-42 |
| page-tools | children makes name routable not linked | new-page:45-48 |
| page-tools | only declare children with page.js or .md | new-page:49-50 |
| page-tools | skip page_work() only no topic match | new-page:36 |
| hold-reload | N/A | — |
| skill-improvement | run measure.mjs measure before analyzing | system-architect:14-17 |
| skill-improvement | apply safe half yourself one commit each | system-architect:26-28 |
| skill-improvement | propose: changes skill decides, removes step | system-architect:29-31 |
| skill-improvement | mastermind owns system readmes doc/ freely | system-architect:37 |
| skill-improvement | aim fewest skills 10-20 lines each | system-architect:37 |
| skill-improvement | audit max five changes ranked by impact | auditor:37-40 |
| skill-improvement | audit time-boxed one hour one screen | auditor:62 |
| skill-improvement | five changes ceiling zero valid answer | auditor:66-67 |
| skill-improvement | something unexpected two defects thing + root | skill-improvement:8-12 |
| skill-improvement | append one line skill's improvements.md only | skill-improvement:15-23 |
| skill-improvement | evidence not opinion in improvements line | skill-improvement:17-23 |
| skill-improvement | which skill should have warned you | skill-improvement:25-30 |
| owner-words | ten seconds owner gets point no scroll | clarity:24 |
| owner-words | every element passes page tests evidenced | clarity:25-26 |
| owner-words | short ≤60 words, outcomes ≤120 only | clarity:29 |
| owner-words | failure becomes rewrite not critique | clarity:43 |
| owner-words | could owner get this in ten seconds | content:10 |
| owner-words | link every mention concept own page | content:11 |
| owner-words | only important things overview dig in | content:17-18 |
| owner-words | label every piece raw cleaned refined | content:19-22 |
| never-wait | owner doesn't read chat write card | every-prompt:8-9 |
| never-wait | under ten seconds two three sentences | every-prompt:22 |
| never-wait | never reason deeply build edit decide | every-prompt:40-44 |
| never-wait | read handover.md if no mastermind | every-prompt:46-48 |
| never-wait | supervise not fast not builder role | master-assistant:7-10 |
| never-wait | reply one two sentences opinion stop | master-assistant:19-24 |
| never-wait | master-assistant never build edit touch servers | master-assistant:49-50 |
| never-wait | log-assistant never mechanical append | log-assistant:43 |
| never-wait | log-assistant never edit entry in place | log-assistant:44 |
| never-wait | faster assistant echo relayed, answer card | every-prompt:14-19 |
| never-wait | on/over line finish flight start nothing | check-claude-usage:81-82 |
| other | read design system readme chains first | review:12-13 |
| other | what four kinds of write: hand sys arch | system-architect:21-25 |
| other | past-work script searches you judge output | past-work:10-16 |
| other | climb CSS ladder stop first rung | css:14-16 |
| other | constrain container never items in CSS | css:15 |
| other | class nonexistent paints nothing throws | css:16 |
| other | page extends Page view extends View | code:14 |
| other | subclass to vary never copy | code:15 |
| other | one class is manager orchestrator | code:23 |
| other | view class attached after not nested | code:28-40 |
| other | @layer util beats theme regardless spec | css:15 |
| other | create doc/ only topic worth URL | new-page:59 |
| other | rail/sidebar stays still work updates | navigation:9-10 |
| other | sheet/modal owns URL returns on close | navigation:10-11 |
| other | selected item opens column never expands | navigation:11-12 |
| other | glyph icon() fixed 1em square always | ui:9 |
| other | frame only click target centering grid | ui:9-10 |
| other | toggle state aria-pressed never class | ui:10 |
| other | widget core row one line every width | ui:11 |
| other | color token never literal --surface etc | color:9 |
| other | contrast 4.5:1 body 3:1 large/UI | color:10 |
| other | --wash page ground card w/ it invisible | color:10 |
| other | muted text .muted class not var | color:11 |
| other | dark mode light-dark() one theme | color:12 |
| other | decided default recommended path executes | decide:21-22 |
| other | owner-only for keys money destructive | decide:24 |
| other | earlier proposal stands if both reasonable | log-assistant:33-34 |
| other | non-destructive rename (script dry-run) | naming:22 |

---

**Tallies:** Conflicts 0, Repeats 8, Stale 2, Overlaps 4 (well-mitigated), Rules 104 across 19 topics. No major structural issues; audit recommendations: reword auditor:16 to reflect current caveats.md distribution, fix check-claude-usage:88 reference (no RULE#16 in CLAUDE.md).
