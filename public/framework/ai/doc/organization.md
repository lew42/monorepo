# What goes where, when and why

One screen. A rule an agent must remember is a weak rule; prefer the script. Live results: [System](/framework/ext/System/). Code: `ext/System/System.js`; each module keeps its own `system.js`.

| Area | Always | Usually | Enforced by | The check |
|---|---|---|---|---|
| Navigation | Every page is named by its parent (`children:` or a readme link) | New page also gets a card/index preview | `NavigationSystem` (script, hourly); `merge.mjs` smoke follows links | `node Server/systems-beat.mjs` lists orphans |
| Readmes | Short index, under ~100 lines, links resolve | Updated in the same commit as the change | `ReadmeSystem` (script, hourly); `Server/doc-check.mjs` on landing | beat output; `doc-check.mjs <task dir>` |
| Documentation | A module has `readme.md`, `page.js`, `doc/`; the readme points, `doc/` explains | Decisions and the alternative go in `doc/` | `doc-check.mjs` (on landing) | module card shows missing parts |
| Tasks / sessions | A task is opened before the first edit and landed after (`new-task`, `finish-task`) | Cards say what the owner should read | Servex `TaskLoop` + `Heartbeat` (every few minutes) | `task_loop_status` |
| Commits | Small, after each working step, on a branch or worktree; merged through `Server/merge.mjs` | Message says why | `merge.mjs` review gate | `git log`, merge refusal |
| Naming | Class file = class name, capitalised; one class per file | A name is a name plus its scope | `code/patterns` census script | census output |

## The System class
In plain terms (owner, 2026-10-12): a system is a README system, an on-demand skill for a directory. The class bridges the readmes an AI loads and the code that checks them. Not every system is AI-only: layout and content can be done by a human too. It is composition, not a `Page` subclass; extend `Page` only for a plain documentation-page template. Notes about a system go on its page with `page_add`, not new files.

A `System` is anything we keep in order. It documents itself (`root`, `readme`, `rules` with `enforced_by`), `check()` returns findings computed from real files, `heal(finding)` may fix one, `report()` packages the result. Subclass it: `ReadmeSystem`, `NavigationSystem`. A manager, `Systems`, runs them all and appends to `results.jsonl`, which the page streams.

```
System            name, root, readme, rules[], check(), heal(), report()
 ├ ReadmeSystem      length + broken links
 └ NavigationSystem  orphan pages
Systems           (manager) all[], run() -> results.jsonl
```

## Heartbeat and pace
`node Server/systems-beat.mjs` is one cycle: skip when `usage-now.mjs` exits 2, otherwise run every check and append the result. The system-architect wakes hourly (`ScheduleWakeup`/loop), runs it, files a short card, and may make at most `heal_limit` (3) safe fixes. Too fast changes nothing; hourly fits because a readme or link rarely changes faster. See [decisions](organization-decisions.md).

Earlier asks: `2026/10/03/now/system-class-build-interrupted-by-a-serv`; system-architect skill and `ai/2026-10-09/system-architect/`.
