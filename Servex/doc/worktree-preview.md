# A worktree waiting for review, open on your phone

**What it is.** When a task lands but its branch is not merged yet, its worktree now **stays** until the merge (or 48 quiet hours). If the task asked for a **preview**, its dev server also answers the home Wi-Fi. A link like `http://10.0.0.135:64832/` then shows on the [ready-to-merge card](/framework/ai/merge/) and in the task's log, so you can click through the work from your phone before you merge it.

Built 2026-10-28 (build F) from [the phone-preview study](/framework/core/Session/tasks/data-shapes/build/phone-preview/study.md), option A plus keep-alive. It goes live at the next Servex restart.

## How a task asks for it

One line in its task log, beside the `worktree` it already names:

```json
{"assign":{"worktree":"C:/Code/lew42/worktrees/my-task","preview":true}}
```

`"preview": "/framework/core/Session/"` opens that page instead of the root. Print the link at any time: `node Server/WorktreePreview.mjs <task dir or worktree>`.

## What happens

| When | Who | What |
|---|---|---|
| the task lands | `Server/on-landing.mjs` | does **not** close an unmerged worktree (`worktree-close: kept …`); writes one `preview: http://…` line, computed, never typed; asks Servex for a clean-up pass now (`POST /api/worktrees/tick`) |
| that pass, then every 10 min | `Servex/Worktrees.js` | `judge()` marks it `open` with `waiting: true`; `serve_previews()` puts its name on the `lan` list and starts or restarts its server on `HOST=0.0.0.0` (`Servex.host()`); `stop_idle()` skips it, because the phone hits the port directly and the proxy cannot restart it |
| the reaper | `Servex/Lifecycle.js` `kept()` | keeps that server (`WorktreePreview.held()`) |
| you open the merge list | `Server/ReadyToMerge.mjs` | the row's `preview` is the link; the card draws "Try it on your phone" |
| the branch merges | `Servex/Worktrees.js` | the server goes back to loopback, and the folder is removed once quiet (the usual merged rule) |
| 48 quiet hours, unmerged | `Servex/Worktrees.js` | the backstop: leftovers committed to the branch, folder removed, branch kept, a `ready-to-merge.jsonl` line |

Every landed, unmerged worktree is held, preview or not; only a preview goes on the LAN and stays running. A held worktree without a preview stays on loopback: its idle server may stop, and the proxy starts it again when you visit `<name>.localhost`.

## Limits

- **Home Wi-Fi only.** Off the Wi-Fi it needs the named tunnel plus Cloudflare Access (the study's option B, later).
- **The code is unreviewed,** and the LAN can reach it. That is the same exposure as the main site: the LAN socket is push-only, so a phone can reload and tail but never run a command or write a file ([lan.md](/framework/dev/Socket/doc/lan.md)).
- **Pool slots (`qf-*`) get no preview:** the slot is handed to the next task. A task that wants a preview takes its own worktree (`take_worktree` or `node Server/worktree-up.mjs`).
- **A locked worktree is never touched,** so it is not put on the LAN either.
- **The merge card is loopback only,** so it does not load on the phone. Open the link from the PC's card, or from the `preview:` line on the task's page, which the phone can open on the main site.

## Decisions

- **Hold every unmerged worktree, but serve only previews.** The alternative, keeping every waiting worktree's server running, costs memory for nothing: a loopback server is started again by the proxy when you visit it.
- **The LAN address (option A), not `?tree=` on the main server (option D).** D is safer (static files only) but cannot preview a worktree's `Server/` changes or its `page.jsonl` writes. D is not built; it would be a new `Server/` plugin, worth it only if the LAN exposure is ever too much.

## Code and test

- `Server/WorktreePreview.mjs`: the link, the LAN IP, the port (Servex's `ports.json`), `merged()`, `held()`.
- `Servex/Worktrees.js` (`judge`, `serve_previews`, `stop_idle`), `Servex/Servex.js` (`host()`, `POST /api/worktrees/tick`), `Server/Worktrees.mjs` (`on_landing()`, the 48-hour rule in `archivable()`), `Server/on-landing.mjs`, `Servex/Lifecycle.js` (`kept()`), `Server/ReadyToMerge.mjs` and `public/framework/ai/merge/ReadyToMerge.js` (the link on the card).
- Test: `node Server/WorktreePreview.test.mjs`. A scratch repo in the temp folder: a landed, unmerged worktree survives `judge()`, the CLI clean-up and on-landing; a merged one is still cleaned; a pool slot is left to `Pool.js`; the preview goes on the LAN and is not stopped idle.
