# Sessions — decisions

## Why a script, not a live route

The owner wants a live sessions list, and the obvious way to build one is a real Servex route,
`GET /api/sessions`, answering one row per session straight from the agent registry and the
machine's own Claude session files. This task asked for exactly that
(`Servex/agents` inbox note, 2026-10-02, from `task-mastermind-panel2-sessions`), with the full
row shape it would need. No reply had landed by the time this tab had to ship, and this task's
own write fence is `public/framework/ai/` plus two named files — it cannot add anything under
`Server/` itself to build the route another way.

A browser page also cannot read a local `.jsonl` file by itself (no filesystem access), so for
the VS Code/CLI half of the list, SOME node process has to do that scan. The smallest thing that
works today: a plain script, `sessions.mjs`, run by hand, writing one JSON snapshot this tab
fetches. Servex's own agents are different — `GET /api/agents` already exists and answers live —
so the page polls that directly instead of waiting on the snapshot for those rows, and only the
VS Code/CLI half goes stale between script runs.

**What a real route would still add, that this cannot:** a Servex-sourced row's `last_prompt_first_
line` (`GET /api/agents` carries no transcript at all), and sessions outside this one machine's
`c--Code-lew42-monorepo` project folder (a worktree runs its own session files under a differently
-named folder, keyed by its own path — e.g. this very task's own session lives under
`C--Code-lew42-worktrees-panel2-sessions`, not the folder `sessions.mjs` scans). Both are
one-line additions once the route exists; neither is worth hand-rolling twice.

## The VS-Code-vs-CLI heuristic, checked against real data

Every session's own `type: "user"` lines carry a `turnOrigin` field: `"human"` when a person
typed it, `"sdk"` when a program sent it, and — found only by reading a real file —
`"task_notification"` for the harness telling itself a background task finished. The rule:
look at the LAST real (non-sidechain, non-task-notification) user line in the session; `"human"`
tags it `vscode`, anything else tags it `cli` (a Servex-spawned agent's own session never reaches
this scan at all — its `session_id` is already in Servex's own agent list, excluded before the
file scan runs).

Checked against two real sessions before shipping: the task's own named test case,
`361c4d18-e878-4c04-9537-444e847e13d5` (a real, interactive VS Code mastermind tab), and a
Servex-spawned `task-mastermind-framework-home` session. The FIRST version of this script used
whichever user line was simply last in the file, which for `361c4d18` was a `task_notification`
line (the harness noting a background sub-task finished) — tagging a genuinely interactive
session `cli`. Excluding `task_notification` lines from the scan fixed it; re-verified after the
fix that `361c4d18` tags `vscode` with a real, human-written last prompt.

## Open: a Servex row's time is when it started, not its newest activity

`merge()` reads `a.started_at` for a Servex row because `GET /api/agents` carries no
last-activity field — only `started_at`, `turns` and `cost`. "Newest activity first" is exactly
right for VS Code/CLI rows (their own transcript's real last timestamp) and only approximately
right for Servex rows, which sort by when the agent began, not its latest turn. A long-running
agent that started early but just replied would sort behind one that started later and has gone
idle. Noted, not fixed: the same real route this task already asked for (`doc/decisions.md`
above) would carry a true last-activity field; patching around its absence here would be the
same kind of guess this task avoided for the Inbox tab's own data source.

## Open: `css-scopes.txt` reservation

`sessions-` is free (grep across `public` found only JS property accesses like `proc.sessions`,
never a CSS class) but this task's fence doesn't include
`public/framework/styles/css-scopes.txt`. Whoever next can write that file should add:

```
sessions-    ai/sessions
```

## Open: only one project's session files are scanned

`sessions.mjs` only reads `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` — the
main checkout's own sessions. A session run from a worktree (including this very task's own)
writes to a differently-named project folder and never shows up here. Scanning every
`c--Code-lew42-*` folder would catch them, at the cost of reading many more files on every run;
left as a known gap rather than guessed at, since nobody has asked for worktree sessions to show
here yet.
