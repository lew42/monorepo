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
