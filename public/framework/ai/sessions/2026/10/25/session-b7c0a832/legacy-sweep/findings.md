# Legacy sweep findings (2026-10-25)

Done: `OR_ONLY`/`OR_MODEL` removed from `Servex/agents/tiers.js` (and `Agents.js`, `Server/ModelsNow.mjs`); the OpenRouter spawn pause is now opt-in (`SERVEX_OPENROUTER_PAUSED=1`), so an explicit `/` model or `provider: "openrouter"` works again; `task-mastermind` and `sub-mastermind` are aliases of `mastermind`, the old text kept at `Servex/agents/doc/task-mastermind-long-form.md`. `VOICE_MODELS`, `session-backend.txt` steering text in `session-smart.md`, and the role readmes were already clean before this task (only history notes in `handover.md` mention it). The switch file itself stays: it is the owner's "ask for OpenRouter" for the voice seats and Refine, and the automatic fallback writes it when Claude refuses.

Other legacy roles and switches (what, where, keep or retire, why):

- `assistant` / `every-prompt`, `roles.js`: retired in the row (`retired: "voice-assistant"`), still named by 2 callers. Keep until those callers move.
- `session-fast`, `roles.js`, `Sessions.js`: retired for voice 2026-10-17 but `Sessions.js` still spawns it by name. Keep; retire once the Sessions brief lands.
- `master-assistant`, `roles.js`, `Global.js`: word retired 2026-09-29, code row used by `Global.js`. Keep.
- `manager` alias of `page-mastermind`, `card-assistant` alias of `page-assistant`: old words with callers in `Layers.js` and `policy.js`. Keep.
- `log-assistant`, `voter`, `checker` rows: no `role:` caller in `Servex/*.js`; `voter` is used by research collabs (skill `research`), `checker` by reviews. Keep; verify `log-assistant` before retiring (not obvious).
- `ai-system-mastermind`, `servex-mastermind`: aliases with `ALIAS_PATHS`, already one role. Keep.
- `SESSION_BACKENDS` `"local"` in `Sessions.js`: works only for session-fast; keep, documented in `dictate-backend.md`.
- `SERVEX_OPENROUTER_PAUSED`: kept, flipped to opt-in (the comment already said so; the code had it default-on).
- `core-page-mastermind` row: a path-less subject mastermind that duplicates `mastermind` at `core/Page`. Keep until the owner folds it; not obvious.
- Tests: all `Servex/agents/*.test.mjs` pass here except `prompt-tasks.test.mjs`, which fails on an unrelated `Prompt` item type (the task `core/Task: Prompt extends Task`, not this change).
- Voice auto-flip (`Sessions.js` writes `session-backend.txt = openrouter` when Claude refuses a voice session): keep. It is the fallback that keeps the owner talking when Claude is refused, and it moves only the voice seats and Refine; undo with `node Server/ModelsNow.mjs --backend anthropic`. Expiring it is the one change worth a later task.
- Posture note: callers that still pass `task-mastermind` or `sub-mastermind` now get the `mastermind` row (architect/high, same Sonnet 5.5), not manager/medium. The Dispatcher moved to `page-mastermind` so queued tasks keep manager/medium and the `page` skill.
