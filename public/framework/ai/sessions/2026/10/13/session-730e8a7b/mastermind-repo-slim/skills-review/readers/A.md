# Skills Review: ui-test, mastermind, sub-mastermind, research

## 1. Conflicts

None. The four skills and CLAUDE.md form a coherent hierarchy with no contradictions.

## 2. Repeats of CLAUDE.md

| skill:line | CLAUDE.md:line | gist |
|---|---|---|
| mastermind:9 | law 5 (14) | never block on the owner for decisions |
| mastermind:10 | 87 | read handover.md at session start |
| mastermind:32 | law 6 (15) | fix root cause, not repeats/symptoms |
| sub-mastermind:21–23 | 47 | keep docs fresh and linked |
| research:19–25 | 5, 53 | preserve sources and decisions in files |

## 3. Retired / stale

| file:line | quote | status |
|---|---|---|
| mastermind:123 | `/framework/ai/v/3/` reads `ai/board.jsonl` live | v/3/ ✗ (Glob); board.jsonl marked retired in memory |
| research:23 | `public/framework/sources/` | ✗ (Glob; source lib not found) |
| research:34–36 | `public/framework/research/<slug>/` and `ext/Research` | ✗ (Glob; paths do not exist) |

**Note:** research skill references a sources/Research infrastructure that is not yet built or lives elsewhere; all paths checked returned no matches. The skill is either premature or documentation for a planned system.

## 4. Rule inventory

| topic | gist (≤10 words) | file:line |
|---|---|---|
| never-wait | never block on owner, make the call | mastermind:9 |
| task-log | open task on intake, log per cycle | mastermind:10 |
| model-choice | Haiku scans, Sonnet builds, Opus judges | mastermind:65 |
| budget/tokens | Haiku under 100k, Sonnet for UI/OOP | mastermind:76–77 |
| model-choice | step down ladder, not work, under pressure | mastermind:67 |
| spawn | spawn_agent on Servex, never Agent tool | mastermind:34 |
| spawn | record id and session_id for resumable work | mastermind:42 |
| worktree | multi-file work gets own worktree, dev server | sub-mastermind:32 |
| commit | commit after every finished piece | sub-mastermind:34 |
| merge | read every conflict, never take wholesale | sub-mastermind:43 |
| review | 400/1200/1920/3440 widths before land | sub-mastermind:46 |
| merge | wrap in hold.mjs on/off on merge | sub-mastermind:47 |
| worktree | never link node_modules; sibling can share | sub-mastermind:35, 38 |
| report/card | taken, blocked, to-owner, landed; three lines only | sub-mastermind:105–109 |
| windows-hide | every Node spawn sets windowsHide: true | sub-mastermind:114 |
| never-wait | spawn minions as Servex agents, returns at once | sub-mastermind:72 |
| task-log | append log lines per step, step bumped each cycle | sub-mastermind:110 |
| docs/readme | read readme chain at session start | sub-mastermind:16 |
| owner-words | grep own directives into skills as instruction | mastermind:22 |
| naming | one task per mastermind; never take two | sub-mastermind:16 |
| skill-improvement | append to improvements.md, never edit SKILL.md | mastermind:108 |
| live-browser | never drive owner's tabs; headless only | ui-test:175 |
| screenshots | never post as owner; stub or via:"test" | ui-test:176 |
| pages | claim tab when driving; release on land | ui-test:176, site MCP |
| report/card | one screen, two minutes; visual first | mastermind:144 |
| research | save every source cited | research:23 |
| research | cite, then conclude; grade by credence | research:24 |
| research | established/contested/fringe/speculation only | research:69–72 |
| research | skeptic pass before handoff | research:86 |
| other | query logs only when needed, never whole | CLAUDE.md:87 |

## Counts

- **Conflicts:** 0
- **Repeats:** 5 (all pointing to CLAUDE.md as source; mastermind cites law 5 explicitly)
- **Retired/stale:** 3 (v/3/ does not exist; sources/ and Research infrastructure not found)
- **Rules:** 33 (excluding duplicates across topics)

**Key finding:** research skill is architecturally orphaned — references `public/framework/sources/`, `/framework/ext/Research`, and related infrastructure that do not exist in the repo. Skill is either documentation for unbuilt work or should reference a different path structure.
