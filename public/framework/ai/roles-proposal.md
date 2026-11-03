# Roles proposal: one file per role, no reliance on Claude skills

Proposal only, nothing changed. Data: 2026-10-12 to 2026-10-26, from `registry.json` (3851 agents) and `skills.jsonl` (1541 spawn logs) plus `skill:` lines in session/task logs. Script: [usage.mjs](sessions/2026/10/26/session-264f7d21/mastermind-roles-auditor/usage.mjs) (`node usage.mjs 2026-10-12`). Spend is the registry's `cost`; a mastermind's figure may include its children (double counting), so treat spend as a ranking, not a bill.

## Findings in three lines

1. **Half the work is already done.** `mastermind`, `minion`, `reviewer`, `clarity` already ride in the SYSTEM prompt as `Servex/agents/roles/<name>.md` (`roles.js:162-185`, `Agents.js:230,1293`). What is left is roles that still point at Claude skills (`page`, `research`, `every-prompt`, `master-assistant`, `voice-assistant`, `log-assistant`), and posture that lives in a 290-line `roles.js` instead of in the role file.
2. **`helper` is a hole.** 81 spawns, about $941, and no `helper` row in `roles.js`: those agents get no role text and no posture. Either they are one of the real roles under a wrong word, or they run bare.
3. **Skills do get called, mostly the ones already in role text.** 425 spawns put role text in the system prompt, 1116 in the first message (which `/compact` summarises away). Agents also call the Skill tool by hand: `finish-task` 137, `minion` 93, `page` 44, `sub-mastermind` 58, `figma:figma-use` 32. Those on-demand loads do not survive compaction.

## 1. Before and after

```
BEFORE
Servex/agents/
  roles.js            ROLES{15 rows}, ROLE_LIST, canonical(), defaults(), compact_after(),
                      opening(), role_system(), path_parts(), path_check(), path_note(),
                      role_reminder(), role_readme(), skill_text(), injected()   (292 lines)
  tiers.js            model(tier), provider(tier)
  roles/
    readme.md         index of roles
    mastermind.md     7600 words, 5 alias words (task-/sub-/ai-system-/servex-mastermind)
    minion.md  reviewer.md  clarity.md
    core-page-mastermind.md  vscode-mastermind.md
    ai-system-mastermind.md  servex-mastermind.md      <- 60 and 21 words: "moved" stubs
.claude/skills/       37 dirs, SKILL.md each (role skills + craft skills + tools)
public/framework/core/Role/Role.js   Role.from_rows(ROLES)

AFTER
Servex/agents/
  roles.js            RoleRegistry (thin: scan roles/, parse, lookup, canonical)   ~80 lines
  Role.js             class Role (one parsed .md)  [moved from core/Role, see change 8]
  tiers.js            unchanged
  roles/
    readme.md         generated index (name, model, effort, one line)
    mastermind.md     front matter + text   (absorbs page, sub-mastermind, servex-mastermind,
                                             system-architect, directory/page-mastermind)
    minion.md  reviewer.md  clarity.md
    voice.md          (voice-assistant + session-smart + voice-mastermind, one file each section)
    assistant.md      (every-prompt / page-assistant / master-assistant, only if still spawned)
    helper.md         (whatever `helper` really is, see change 2)
.claude/skills/       craft skills only: code css layout color content navigation ui make figma
                      documentation finish-task new-task new-css-class past-work review ...
```

Front matter (the posture, at the top of every role file):

```yaml
---
name: mastermind
aliases: [task-mastermind, sub-mastermind, ai-system-mastermind, servex-mastermind]
prefix: mastermind
tier: architect          # model derived from tiers.js
effort: high
permission_mode: bypassPermissions
dormant_after: 0
tools: all               # or a list
compact_after: { tokens: 150000, sleep: 100000 }   # null = never
default_path: null       # ai-system-mastermind alias gets public/framework/ai
includes: [page, documentation]   # skill texts to inline (see section 6)
---
```

## 2. Every move

```
Servex/agents/roles.js ROLES{} rows (15)      -> front matter of Servex/agents/roles/<name>.md
public/framework/core/Role/Role.js            -> Servex/agents/Role.js      (core must not know Servex roles; or keep and import)
public/framework/core/Role/roles.json,RoleView.js  -> keep (the site view), fed by RoleRegistry
.claude/skills/sub-mastermind/SKILL.md        -> merged into roles/mastermind.md "Owning one task"  (already pointer-like, 120 words)
.claude/skills/servex-mastermind/SKILL.md     -> deleted (109 words, alias of mastermind at public/framework/ai)
.claude/skills/system-architect/SKILL.md      -> public/framework/ai/mastermind.md (already the path file for that folder)
.claude/skills/voice-mastermind/SKILL.md      -> Servex/agents/roles/voice.md
.claude/skills/voice-assistant/SKILL.md       -> Servex/agents/roles/voice.md
.claude/skills/master-assistant, every-prompt -> Servex/agents/roles/assistant.md (or retire, change 6)
.claude/skills/minion, mastermind, clarity, review (role pointers) -> deleted once nothing calls Skill("minion") (93 hand calls today, see change 7)
```

Renames and merges:

- `core-page-mastermind` -> deleted. It is `mastermind` at `path: public/framework/core/Page/`; its 305 words (read order: Item, Page, JSONL, Router) become `public/framework/core/Page/mastermind.md`, which `path_parts()` already loads.
- `page-mastermind`, `directory-mastermind`, `manager` -> alias of `mastermind` (they differ only in effort/permission: `plan` mode for directory).
- `checker`, `voter` -> `reviewer` with a `variant`, or deleted (0 spawns).
- `vscode-mastermind.md` -> keep if a tab still uses it, else fold into `mastermind.md`.
- Removed rows: `session-fast`, `assistant`, `page-assistant`/`card-assistant`, `log-assistant`, `voter`, `checker`, `core-page-mastermind` (see table 5).

## 3. Class sketches

```js
// Servex/agents/Role.js — one role file, parsed
export default class Role {
	name; aliases = []; prefix; tier; effort; permission_mode;
	dormant_after = 0; tools = "all"; compact_after = undefined; default_path = null; includes = [];
	text;                                   // body, move comment stripped
	static parse(file, source){ /* front matter -> fields, rest -> text */ }
	get model(){ return model(this.tier); }
	get provider(){ return provider(this.tier); }
	defaults(){ return { model: this.model, effort: this.effort, permission_mode: this.permission_mode, provider: this.provider }; }
	system({ path }){ /* "# Your role" + text + includes + path_parts(path).block */ }
	reminder(){ /* title, bold leads, headings, file path (today role_reminder) */ }
}

// Servex/agents/roles.js — the thin loader
export default class RoleRegistry {
	dir; roles = new Map();                 // name -> Role
	load(){ /* readdir(dir) *.md except readme.md -> Role.parse */ }
	canonical(word){ /* name or alias -> Role | undefined */ }
	get(word){}  list(){}
	compact_after(word){}  alias_path(word){}
}
export const roles = new RoleRegistry(ROLES_DIR).load();   // old helpers (defaults, role_system, ...) become 1-line wrappers, then go
```

`path_parts` / `path_check` / `path_note` (spawn-at-path, `roles.js:191-222`) are a different job; move them to `Servex/agents/PathContext.js` (class `PathContext {dir; files; missing; block; check()}`).

## 4. Numbered changes, each approvable alone

| # | Change | Risk | Test |
|---|---|---|---|
| 1 | Add `Role.js` + `RoleRegistry`; read front matter from role files; keep `ROLES` as fallback for rows with no file yet | low: additive | parse `minion.md`: `name`, `effort`, `compact_after===null`, `model` equals `model("scan")`, aliases of mastermind canonicalise; under 1 s |
| 2 | Find what `helper` is (81 spawns, $941, no row). Grep callers; give it a real role file or make the caller say the right word | **medium: live spend with no instructions** | `canonical("helper")` returns a Role; a spawn of it logs `skills` with `where:"system"` |
| 3 | Move the 11 remaining posture rows into front matter of role files (mastermind, minion, reviewer, clarity first) | low | `defaults("reviewer")` before/after deep-equal |
| 4 | Delete `core-page-mastermind` row + role; add `core/Page/mastermind.md`; callers spawn `mastermind` with `path` | low: `path_parts()` already loads it | `path_parts("public/framework/core/Page").mastermind` is that file |
| 5 | Delete the two "moved" stubs (`ai-system-mastermind.md`, `servex-mastermind.md`); alias + `default_path` live in `mastermind.md` front matter | low | `alias_path("ai-system-mastermind")==="public/framework/ai"` |
| 6 | Remove retired rows: `session-fast` (34 spawns still happening, find its caller in `Sessions.js` first), `assistant`, `page-assistant`, `card-assistant`, `log-assistant`, `voter`, `checker` | medium for `session-fast` (still spawned); low for the 0-spawn rows | each removed word: `canonical()` returns undefined and `grep` for the word in `Servex/` is empty |
| 7 | Add `includes:` so a role inlines craft-skill text (section 6); remove "Load the X skill" from the minion/mastermind texts that tell agents to call Skill | medium: role text grows (mastermind is already 7600 words, about 10k tokens) | `role_system("mastermind")` contains the included skill's first line; word count under a cap |
| 8 | Collapse `role_system`/`opening`/`injected`/`skill_text` into `Role.system()`; drop the first-message fallback once `SERVEX_ROLE_IN_SYSTEM` is always on | medium: the 1116 first-message spawns show the fallback still fires | spawn dry-run: system prompt contains role text, first message is only the pointer line |
| 9 | Move `path_*` to `PathContext.js` | low: pure move | existing `path_check` cases pass unchanged |
| 10 | Generate `roles/readme.md` index from the registry (`node Server/Roles.mjs`) so it cannot go stale | low | script output equals checked-in index |
| 11 | Shrink `mastermind.md` (7600 words): move reference sections (Briefs, Reporting, Slots, Models) into linked docs; keep the top rules in the file | medium: it is the most-used role | `role_reminder("mastermind")` unchanged; a fresh mastermind spawn still passes smoke |

Order: 1, 3, 2, 4, 5, 9 first (safe, small). 6, 7, 8 second. 11 last.

## 5. Usage and verdicts

Roles (spawned since 2026-10-12):

| role | spawned | spend (registry) | verdict |
|---|---|---|---|
| clarity | 427 | $93 | keep (woken per landing; Sonnet) |
| reviewer | 363 | $187 | keep; fold `checker` in |
| minion | 297 | $691 | keep |
| task-mastermind | 166 | $645 | merge: already an alias of `mastermind` |
| mastermind | 152 | $3502* | keep, the one planner |
| **helper** | 81 | $941 | **unknown role: investigate (change 2)** |
| session-smart | 52 | $63 | keep, move to `voice.md` |
| session-fast | 34 | $0.5 | retire after `Sessions.js` stops spawning it |
| voice-assistant | 21 | $844 | keep, move to `voice.md` (spend is high for Haiku, check) |
| assistant / card-assistant | 2 / 2 | $0.4 each | retire |
| master-assistant | 1 | $0.06 | retire |
| directory-mastermind | 1 | $0.75 | merge into `mastermind` (`plan` mode via a spawn option) |
| ai-system-mastermind | 1 | $74 | alias only |
| fixer / dispatcher / sessions | 1 each | small | not in `roles.js`; code-spawned, leave |
| **0 spawns:** core-page-mastermind, page-assistant, page-mastermind, checker, voter, log-assistant | 0 | 0 | retire (merge page/core-page into `mastermind`) |

\* includes children, likely double counted.

Skills (loads = role-injected at spawn + hand Skill-tool calls, both logged):

| skill | loads | verdict |
|---|---|---|
| minion | 187 injected + 93 called | move into role file (already is); delete pointer after callers stop |
| clarity | 333 injected | role file already; drop skill pointer |
| sub-mastermind | 163 + 58 | merge into `mastermind.md`, delete |
| servex-mastermind | 111 + 28 | delete (alias) |
| page | 176 + 44 | **include** in `mastermind` (and page work); keep as skill for other tabs |
| review | 163 + 4 | role file `reviewer.md` carries it; delete pointer |
| finish-task | 137 called | keep as skill (a short procedure) but inline its 5 lines in minion/mastermind |
| documentation | 21 | keep as skill |
| code | 23 | keep as skill |
| check-claude-usage | 20 | keep (tool) |
| figma:figma-use | 32 | keep (plugin) |
| system-architect | 5 | move into `public/framework/ai/mastermind.md` |
| fans | 4 | keep (diagnostic tool) |
| past-work | 1 + brief step | keep; mastermind brief already inlines its output |
| voice-mastermind, voice-assistant | 3 / 0 | move into `voice.md` |
| master-assistant, every-prompt | 0 / 1 | retire with the assistant rows |
| **zero use:** auditor, color, fork-claude-session, log-assistant, make, new-css-class, openrouter, research, skill-improvement, ui | 0 | retire or keep dormant as tools: `color`, `ui`, `make`, `new-css-class`, `openrouter` are reference skills a UI agent may load rarely; `research` and `log-assistant` retire |

Caveat: zero in 14 days is not zero ever; reference skills are cheap on disk and cost nothing unloaded, so the only retire-now rows are the dead role pointers.

## 6. Text that must move INTO role files

An agent needs these after `/compact`; the first message and any Skill-tool result are summarised away, only the system prompt and the tail hook survive (`Agents.js:1285-1328`, [compaction.md](doc/compaction.md), [context-drift.md](doc/context-drift.md)).

- **Mastermind:** `sub-mastermind` (task-owner procedure; already merged into `mastermind.md` as "Owning one task") and `page` (every UI mastermind). Alternative: leave `page` as a skill and inline only its 10 hard rules.
- **Minion:** `finish-task` (5-line landing procedure, called 137 times by hand) and the `new-task` open step. Alternative: put them in the front-matter `includes`.
- **Reviewer:** `review` skill text (the pointer already resolves to the role readme).
- **Voice roles:** `voice-assistant` + `voice-mastermind` (the owner talks to them for hours; they compact often).
- **Path masterminds:** their `mastermind.md` already lives in the folder and rides in the system prompt, so `system-architect` and the Page reading list belong there.
- **Stay as skills:** `code`, `css`, `layout`, `color`, `content`, `navigation`, `ui`, `figma*`, `documentation`: task knowledge an agent loads once to do a job and does not need to survive a compaction (if it matters again, it re-loads).

## 7. Compaction policy, for the front matter

`compact_after` is today `{tokens}` per row: one nudge when an idle agent passes it, never auto mid-flight; minions `null`; default 200k; sleep-compact at 100k before going dormant; auto-compact past 400k (`roles.js:27-35`, `Agents.js:1617-1670`). Keep exactly this, written as the `compact_after` field. Alternative: one global policy plus per-role `null`; rejected because mastermind (150k) and voice roles already differ.

## 8. Mechanism recommendation: skill vs readme pointer vs load tool

What a skill is: text an agent chooses to load, which lands in context as a tool result. Nothing carries it through compaction, and nothing says it was needed. The ways to get text to an agent:

| | when it arrives | survives compaction | logged | fails silently |
|---|---|---|---|---|
| Skill (on demand) | agent decides | no | yes (`"msg":"skill: X"` in session and task logs, via `ledger.mjs`) | yes: not loading is invisible |
| Pointer in the system prompt ("for X read path/readme.md") | agent decides | the pointer does; the text read does not | no: a plain `Read` has no per-readme count (`ledger.mjs` counts only Skill calls) | yes |
| Tool (`load_module`, `readme_modules`, in `Experts.js`) | agent decides | no (a result) | not verified: I found no per-call log line for it in `tools.js` | partly |
| Inlined into the system prompt at spawn (role text, readme chain, `mastermind.md`) | before turn 1 | **yes** | yes (`skills.jsonl`, `where: "system"`) | **no** |

Evidence from the counts (since 2026-10-12): hand `Skill` calls are frequent where the skill is a procedure the agent reaches for at a known moment: `finish-task` 137, `minion` 93, `sub-mastermind` 58, `page` 44. They are near zero where the trigger is vague (`auditor`, `research`, `skill-improvement`, `ui`: 0). So on-demand loading works when a visible moment calls for it ("I am done": finish-task) and fails where the agent must notice it needs it. I have no counts for pointer-followed reads, because nothing records them, so "is a pointer as reliable as a skill" is unmeasured. It should be no worse than a skill description (both are one line the agent reads, then decides), but it loses the logging a skill has.

Recommendation, one rule with two layers:
1. **Anything a role must always know is inlined at spawn** (role file, path readme chain, `<path>/mastermind.md`). Never behind a pointer or a skill. Changes 1 to 11 finish moving the rest in.
2. **Everything else is a readme pointer written as a trigger, "when you are about to X, load module Y"**, and the loading is done by `load_module` (one tool, one call, one log line), not a bare `Read` and not a Skill. A skill is kept only for a standalone utility (section 9). One mechanism for reference text means one place to measure.

Change 12 (low risk): make `load_module` write one line per call to a `loads` log (`agent`, `role`, `module`, `bytes`, `ts`), the same shape as `skills.jsonl`. Test: spawn a minion, have it call `load_module core/Page`, check the line exists with its agent id.

Measurement plan (a node script, per compute-don't-recall): each role's front matter gets a `loads:` list of modules it should read before a kind of work. A script `Servex/agents/loads-audit.mjs` joins the `loads` and `skills` logs by agent id and prints, per role: agents spawned, percent that loaded each expected module, median turn of the first load. A role under about 80 percent on a module has that module inlined (layer 1) or its pointer reworded. Run weekly. Until change 12 lands the only proxy is skill-load counts, which cannot say what was missed.

## 9. Skills to keep

Genuinely on-demand, standalone utilities with no role identity in them. They cost nothing unloaded.

- `check-claude-usage`: runs a script and reads the numbers (20 loads).
- `fans`: diagnoses process spin on this machine (4).
- `finish-task`: a short close-out procedure. Keep, and also inline its 5 lines in `minion.md` and `mastermind.md`: 137 hand loads show agents need it, and a step someone must always do is a candidate for a process step (section 11).
- `documentation`, `code`, `css`, `layout`, `navigation`, `content`: reference for a kind of edit, loaded when a task touches that area.
- `figma` and the `figma:*` plugin skills (32 loads for `figma-use`): plugin-owned, not ours to move.
- `past-work`: a computed search; its output is already inlined into briefs.
- Rarely used reference skills (`color`, `ui`, `make`, `new-css-class`, `openrouter`): keep dormant; 0 uses in 14 days.
- `skill-improvement`, `auditor`, `fork-claude-session`: keep only if a caller still names them; otherwise retire.

## 10. Role-level text still living in skills

Each of these says who an agent is or what it must always do, so it belongs in a role file (system prompt), not behind a load:

| skill | role-level content | move to |
|---|---|---|
| `minion` (93 hand loads) | the never-list, how to report, log shape | `minion.md` (partly there; delete the pointer) |
| `sub-mastermind` (58) | owning one task end to end; three-message report | `mastermind.md` (already folded in; delete skill) |
| `servex-mastermind`, `system-architect` | alias text, AI-system keeper posture | `mastermind.md` at path `public/framework/ai/` |
| `review` (163 injected + 4 called) | what a reviewer checks and how it answers | `reviewer.md` (a phase, section 11) |
| `clarity` (333 injected) | the clarity pass | `clarity.md` (a phase, section 11) |
| `finish-task` | landing steps every agent must do | inline in `minion.md` and `mastermind.md` |
| `page` | page-building rules | `mastermind.md` when the path is a page module |
| `voice-assistant`, `voice-mastermind`, `master-assistant`, `every-prompt` | voice posture and routing | `voice.md` |

"Should be used but is not" can only be answered from a log of loads. The decisive check is `finish-task`: agents that ended with no close-out line are the silent skips. Change 12's script reports it.

## 11. Role vs process

- **Role** = who an agent is: system-prompt text, model, posture, set at spawn, lasting the agent's life.
- **Process** = a sequence node walks an agent through (`core/Task/Process.js`, `Servex/ProcessRunner.js`). Steps are sessions (`run: fresh | same | owner | wait`); when step N completes, node injects step N+1's prompt with the earlier outcomes. Templates `build`, `design`, `investigate` are in `core/Task/processes/`. It runs outside the SDK context, so compaction cannot drop it. Only 6 Process task files exist and 1 is real; a step can launch a session but not call a node function yet.

A role that is really "a step someone must always do after X" should become a process phase with a node-written prompt. A role that is an identity across many turns stays a role.

| today's role | becomes | saves | risk |
|---|---|---|---|
| `reviewer` (363 spawns) | phase `review` (BuildProcess `improve-plan` and `review` already use `role: reviewer`; DesignProcess `review-shots`, `review` too) | no standing agent to remember to call; a skipped review is visible (step not done, task not landed) | the step's session still needs posture text, so keep `reviewer.md` and let the phase supply the prompt; a task with no process stays unreviewed |
| `clarity` (427 spawns, woken per landing) | phase after `execute` | no waiting agent holding RAM; the pass cannot be skipped | today's per-landing wake is the only trigger for work outside a process; convert after processes cover those tasks |
| `checker` (0 spawns) | deleted; its job is the `review` phase | one fewer row | none |
| `mastermind`, `minion`, `helper`, voice rows | stay roles | n/a | n/a |

Order: do not convert until processes are in real use (1 real file today). Convert `reviewer` first, since its phases already exist; `clarity` second, once its trigger is a step and not a wake-up.

Change 13 (medium risk): add `phase: true` to the front matter of `reviewer`, `clarity`, `checker`. A phase role is spawned by `ProcessRunner` with a node-written prompt; a hand `spawn_agent` of it warns once. Test: run the `build` template on a toy task, check `improve-plan` and `review` sessions start by themselves in order and the task will not land until both finish. Follow-up: let a step call a node function (for example `finish-task` as code), which removes the largest silent skip.

## 12. Owner direction 2026-10-27: condense roles; what `helper` and `voice-assistant` cost

Approved: delete roles that give no benefit (the six zero-spawn rows, change 1 onward, and `checker` by change 13). Two spend questions, read from `node Server/role-spend.mjs` and the code:

- **`helper`: $263 this month (141 sessions, W42 $219, W43 $44), 0 spawned.** (The earlier audit's 81 spawns / $941 came from a different count; the script's number is the one to trust until the two are reconciled.) It has no role text of its own: it is the default `role` for a Process step (`Servex/ProcessRunner.js` 97, `s.role ?? "helper"`), the role the old `Assistant.js` `help` tool spawns (line 295, Sonnet, low effort), and the second role a "worker" may spawn (`policy.js` 151). So it is a bare agent that takes whatever the step or brief says. Recommendation: keep one generic row, but give a Process step a real role (`minion` for doing, `reviewer` for checking) so the cost shows under a role that says what it is, and stop `Assistant.js` spawning it (that assistant is the retired path, system-proposal change 27). Then `helper` is deleted, not renamed.
- **`voice-assistant`: $1,500 this month, $1,263 in W44 alone, 21 sessions (about $60 each), on Haiku at low effort (`tiers.js` 6, `roles.js` 98).** It is the fast seat, woken once per owner sentence (`Sessions.js` 454-471), so one session is hundreds of turns on a growing context. That is the single largest role cost. Hypothesis, not measured: cost grows with sentences because every wake re-reads the whole history. Cheap tests, in order: (1) measure cost per wake against session length from the transcripts (a script, law 7); (2) if it grows, start the seat with only the last N sentences and its open Prompt instead of a resumed full context; (3) after system-proposal change 28 the seat writes one `parts.add` per sentence and never revises, which also makes N small by construction.
