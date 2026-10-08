# Recursive pairs: every page has its own two agents

Merged into michael/dev as `062156e1`. The live Servex was restarted and answers the new routes.

## The owner's asks, each with its proof

| Done | Ask | Proof |
|---|---|---|
| ✅ | One pair per page, recursive: `assistant-<page>` + `manager-<page>`, `/` is the root, each records its parent | [pairs/proof.md](pairs/proof.md) 1 ⚠ ids say `manager-`, not `mastermind-` (kept so live cards keep their agents) |
| ✅ | One skill per role, scoped by directory | [roles/proof.md](roles/proof.md) 1, [fix/proof.md](fix/proof.md) 4 |
| ✅ | Each agent hears only its role: no every-card feed; root hears page-less prompts + direct children's landings | [fix/proof.md](fix/proof.md) 1–2 |
| ✅ | Parent and child talk both ways; `mastermind-servex-N` counts as the mastermind | [roles/proof.md](roles/proof.md) 3, [fix/proof.md](fix/proof.md) 3 |
| ✅ | Assistants make safe quick edits through a pooled worktree | tools and rules are in; the rule is prompt text, not checked in code |
| ✅ | Fresh, not compacted: one checkpoint line, then a fresh start | [pairs/proof.md](pairs/proof.md) 6 |
| ✅ | The root assistant runs on Opus | `master-assistant`, `claude-opus-5-5`, first context 3.7k ([fix/proof.md](fix/proof.md) 1) |
| ✅ | A VS Code tab is an agent you can message | live 09-29: `register_session` + `send_to_agent`, reached the tab in 5 ms on a private Servex ([inbox/proof.md](inbox/proof.md)) |
| ✅ | Created on first use; stopped after 5 idle minutes; at most 4 | 3 assistants, 694 MB → 0 processes, 0 MB at 300 s ([pairs/proof.md](pairs/proof.md) 3–4) |
| ✅ | Resume or fresh, with start times | warm 2.3 s, resume 3.1 s, fresh 3.1–3.6 s |
| ✅ | The same reaper for idle task masterminds, after 15 minutes | [roles/proof.md](roles/proof.md) 5 |
| ✅ | A pair for any page, for the drawer | `POST /api/page-ai`, `GET /api/page-agents`: [interface.md](interface.md) |
| ❌ | One recycled assistant whose context begins under 10k | begins at 14–16k; a Claude Code session's own start grew between 09-28 and 09-29 (the same code measured 11k the day before) — [fix2/proof.md](fix2/proof.md) item 2 |

## Reviews
Two fresh Opus reviews ([review.md](review.md)); every `[fix]` finding was fixed in code or recorded under Known limits in `Servex/agents/doc/page-pairs.md`. A third review could not start (the memory gate), so the merge ran with `--no-review` and that reason.

