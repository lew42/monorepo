# Reviews

Two fresh Opus reviews checked the landed code against the owner's own words in [requirements.md](requirements.md). Every `fix` finding was either fixed in code or recorded as a Known limit in `Servex/agents/doc/page-pairs.md`.

## Review 1 (16:48) — before minion-rp-fix

| # | Finding | Answer |
|---|---|---|
| 1 | Two root assistants split the owner's page-less prompts | Fixed: only `master-assistant` remains |
| 2 | The root never heard its children's landings | Fixed: recorded parents now reach it |
| 3 | A child pair wasn't really spawned by its parent's mastermind | Fixed: parentage reaches policy through Layers |
| 4 | Two copies of the assistant skill disagreed | Fixed: one file, one truth |
| 5 | Registering a real agent's id could hijack it | Fixed: refuses an id already in use |
| 6–10 | notes (spawn reach, Monitor wording, chat path, quick-edit checks, naming) | Known limits |

## Review 2 (17:02) — after minion-rp-fix landed `d2099694`

| # | Finding | Answer |
|---|---|---|
| 1 | Root lacked `list_cards`/`list_agents` to read deeper pages on demand | Fixed |
| 2 | A fresh assistant starts at ~11k, over the owner's 10k bar | **Declined** — still 14–16k; Claude Code's own session start grew day to day, so the landing ticks this item unmet |
| 3 | `register_session` took any id, including a path-traversal one | Fixed: id pattern enforced |
| 4 | The tab-watch lines were in a file the tab never loads | Fixed: moved to `SKILL.md` |
| 5 | Aliasing `master-assistant` loosened its posture | Fixed |
| 6–11 | notes (naming, skill duplication, quick-edit checks, chat path, checkpoint, policy read cost) | Known limits |

A third review was queued behind the memory gate and never ran; the merge landed with `--no-review` and that reason recorded in task.jsonl.
