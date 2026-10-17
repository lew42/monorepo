# Checkup: Servex (2026-10-17)

Everything below is committed on `michael/dev`. Three Servex changes (the nudge, the new `skill` tool, the quicker Refine outline) only take effect after one `node Servex/sustain.mjs --restart`, which this checkup did not run.

| Task | State | What is open | Decision | Next |
|---|---|---|---|---|
| [compact-nudge](/framework/ai/sessions/2026/10/16/voice-20261016/compact-nudge/) | Code on dev (`e0a0b1ead`, 7 files, `compact-nudge.test.mjs`); review verdict pass; review records committed | Servex restart | none needed; `needs_restart` line written in its log | restart when nobody is mid-step |
| helper-cost-fix | Landed (`a392e2049` on dev, independently reviewed by `cost-fix-review`); agent was idle | nothing | stopped, reason logged | none |
| Dormant expensive agents (`mastermind-voice-opus` $694, `mastermind-task-system` $343) | dormant, costing nothing | nothing | leave dormant; rule written in [Servex/doc/dormant.md](/Servex/doc/dormant.md) | an agent past about $100 is read, not woken |
| Handover loose end 1: per-prompt hook | Answered in [remote-tools.md](/Servex/ext/remote/doc/remote-tools.md) | words the voice model never forwards | `ask_mastermind` is the door (stamped `chat` lines in the voice mastermind's task log); no two-line change closes the rest | say "forward every request verbatim" in `RemoteMCP.INSTRUCTIONS` if wanted |
| Loose end 3: `skill` tool | Built: `skill_tools()` in `Servex/agents/tools.js`, test `skill-tool.test.mjs` (6 checks pass) | live after restart | built (under 30 minutes) | none |
| Loose end 5: coordination rule | Paragraph in `.claude/skills/mastermind/SKILL.md`, source line in its `improvements.md` | none | done as a should | none |
| Loose end 9: `home` at spawn | `spawn_agent`'s `task.home` written into line 1 by `open_task()` (`Agents.js`) | nothing reads it yet | small version built | task system may group by it |
| Stray `ai/ai/v-bn4knay.jsonl` | Not a bug: `Sessions.js` writes `<home>ai/<id>.jsonl` and that home was `/framework/ai/`; file is git-ignored | none | nothing to move; todo entry corrected | the flat `quick-fix/` path stays in the todo |
| Follow.js browser events | One line added to [ai/todo.md](/framework/ai/todo.md) | not started | queued | none |
| Refine live outline lag (asked by checkup-refine-voice) | `LiveRefine.MAX_WAIT_MS` 6000 to 2000 (`10c2fe0da`) | restart | took the shorter wait | measure after the restart |

## Decisions made for the owner

- **Dormant agents stay dormant, not stopped.** Stopping saves nothing and a stopped agent resumes by session id anyway; it would win only if a long `list_agents` became a problem (it is live-only by default now).
- **The stray path is left alone.** Moving it would break `sessions.json`'s pointer to a file that is git-ignored; the alternative (skip the doubled `ai/` for homes that are already an `ai/` folder) changes where new sessions point.
- **`skill` was built, not briefed.** Tested with a direct handler test rather than curl on a private port, which would have started a second Servex; the alternative is a curl check after the restart.
- **Refine wait cut to 2 s, not "no wait on an empty queue".** The alternative is faster but costs one extra model call per dictation.

## Needs the owner

Nothing. (One Servex restart is queued in `compact-nudge/task.jsonl` as `needs_restart`.)

## Hand-offs from the sessions checkup (2026-10-17)

| Hand-off | State | Proof |
|---|---|---|
| Session-record regex in `LogSweeper.ALLOW` | Done: `page\|inbox\|prompts\|essence\|review\|files.jsonl` under `public/` plus a session's `digest.json`; caches stay out. Also allowed `ai/handover.md` (and carved it out of the `.md` DENY) so the computed block gets committed | `LogSweeper.test.mjs`, new `allowed()` checks for 10 yes and 6 no paths |
| `HandoverNow` once a day from `TaskLoop` | Done: `handover_daily()` beside `follow_up_daily()`, judged by the block's own `computed <date>` stamp | new `TaskLoop-handover.test.mjs` (runs once, not again today, nothing without the file) |

Both apply after the one queued Servex restart. Alternative for the second: the file mtime, rejected because people edit `handover.md` by hand. Sweeping `handover.md` commits the whole file, hand edits included.
