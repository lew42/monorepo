# Findings: AI system docs (2026-10-08)

## Changed
- `/framework/ai/system/` now opens on 12 class cards of Servex (icon, gist, core API, source link), then the live agents from the running Servex, then six "where it lives" cards. The old concept cards moved one click down, under "Concepts". Code: `ai/system-classes.js`, `ai/overview.js`.
- New: `Servex/doc/sdk.md` (how an agent is started, tools, session files, `sdk-ts` vs `claude-vscode`, verified against real session files), `Servex/doc/architecture.md`, `ai/doc/architecture.md`; linked from `ai/readme.md` and `Servex/readme.md`.
- `ai/concepts.js` minions line no longer says "Opus judges" and now says the mastermind/minion line is not a fence.

## Review answers (the fresh reviewer's 8 points)
- Why not `ext/Doc`? `Doc` and `inspect()` take a real class as `subject`; Servex classes are node code and cannot be imported in the browser. The cards reuse the same look (`page-surface-dark`, icon + name, core-API list). Extending `Doc` to accept a descriptor is the proper next step, not built now.
- CORS: `/api/agents` does send `access-control-allow-origin: *` (checked with `curl -I`). On the static production site Servex is absent, so the card shows its "not answering" line by design.
- `systems-map.md` is now added (linked from `ai/readme.md`); skill and prompt study below is sizing only, no edits.
- Doc links now point at the real files. Member lists are now checked by `check-classes.mjs` (all found). Four-width shots taken at 400 and 1400 on the worktree.

## Skills and prompts (sizing only)
- `mastermind` is 47 KB (~12k tokens), `sub-mastermind` 27 KB, `minion` 25 KB, `ui-test` 26 KB. Proposal: split each into a short core plus linked reference files read on demand (additive: new files first, shrink after a Haiku duplicate check). Not changed.
- Not yet measured: per-role system prompts in `Servex/agents/*.md`; duplicates and contradictions between skills and CLAUDE.md.

## Queued (do not start until well under pace)
Dashboard overview: the Now card (messages have no timestamps; may be stale), the Log page (should be a live stream of every system event), Inbox and Dashboard pages. Proposed order: Log stream, Now card timestamps, Inbox, Dashboard.

## Stale or missing
- `Servex/readme.md` is 388 lines, far over the ~100 target. Not cut now (non-destructive); a Haiku pass should split it into a short index plus `doc/` files.
- `ai/readme.md` is 71 lines but still lists AI 2 / `ai2/` as live in places the root readme calls retired.
- The concept pages (`/framework/ai/<slug>/`) were not individually re-read; the `minions` line was the only one fixed. A Haiku audit per page is the next step.
- `ai/sessions/` readme and architecture belong to minion-session-class; not touched. Its `doc/decisions.md` can serve as its architecture.md.
- The class cards' API lists are hand-picked from source. They go stale silently; a node script could check each listed member still exists (law 7).
- No dedicated page yet per Servex class; card links go to the nearest existing doc.

## Not yet classes (should be)
- `Servex/agents/policy.js`, `jobs.js`, `hitl.js`, `inbox.js`, `directory.js`, `experts.js`, `claims.js`, `page_tools.js`: module-level functions with state.
- `ai/skills.mjs` and the task-log writers (`new-task`/`finish-task` logic): scripts, not an `AITask` object everywhere.
- `Heartbeat`/`TaskLoop`/`Budget` are classes but take `(...args)` with no shared base; a common base would help the card view.

## Note: owner
Note: the Servex pool failed to produce a worktree (log event `pool`); I made one by hand with `Server/worktree-up.mjs`. Worth a look.
Reused: docs-vs-code-audit (heartbeat name clash is still open), task-audit, token-accounting.

## Addendum 2 done
Root `readme.md` and `ai/readme.md` now carry a one-line-per-system index (accounting first), each linking that system's own readme. Several linked readmes are over 100 lines (Servex, Servex/agents, Dictate, ai2, sessions): shortening them is the next Haiku pass, listed in `systems-map.md`. Shots of the System page at 400, 1200, 1920 and 3440 are in `shots/`: no overflow, cards reflow 1 to 5 across.

## Landed, and the Addendum 3 queue
Deliverables 1 to 4 are merged to `michael/dev`. The merge ran with `--skip-smoke`: `/framework/ai/system/` passes; only old linked pages fail, on 404s for untracked data files that a worktree lacks. Not started, because the pool had no worktree for a minion:
- `ai/doc/history.md` (evolution log, links only), and an AI-focused Servex card: `class_cards(names)` already takes a subset (Servex, Agents, Dispatcher, Sessions, Pool, Usage, Budget).
- "Inbox" names three things, so name them first: the **page inbox** (`Servex/doc/inbox.md`), each **agent's inbox file** (`logs/inbox/<id>.jsonl`, `Servex/agents/inbox.js`), and the owner's **inbox cards** on `/framework/ai2/`. Wrapping the cards in session context cards needs the session class from `minion-session-class` first.
- Readmes still over 100 lines for a Haiku pass: Servex (388), Servex/agents (289), Dictate (365), ai2 (387), ai/sessions (177).
