# browser-cli-bridge — the ask, verbatim

> Also, we don't have a great way for the UI to communicate with AI sessions.
> Spawn an Opus agent, ask it to create a new task to design a socket -> cli
> injection for a claude session, so buttons and text inputs can communicate
> with claude sessions. And ask it to integrate it into the new framework/ai
> task system, so we can chat with claude directly from the browser.

— Mike, 2026-08-14, relayed by the `layout-tool` session.

## Scope

A **working** feature, not a paper design. A button or text input in the
browser sends a message to a Claude Code session; the reply comes back to the
browser and is recorded in the task's log.

Investigate before designing:

- `Server/` (express + ws + chokidar) and `public/framework/dev/Socket` — the
  bridge rides the existing dev socket or a sibling of it.
- How to actually inject into a live `claude` session. Weigh headless
  `claude -p --resume <id>` against a named pipe into an interactive process
  against the SDK's streaming-input mode. **Prefer the approach that does not
  require a patched or wrapped interactive terminal.**
- `ext/JSONL/readme.md` and `ext/AITask/readme.md` — the exchange must land in
  the task log and render in the existing viewer, not in a parallel store.

## Fences

- Localhost only, and it must **degrade to absent** on static hosting — not
  broken. Static compatibility is a hard constraint.
- No new npm dependencies. `ws`, `express`, `chokidar` are already there.
- Files under ~100 lines, comments near zero, a `readme.md` for the new ext
  recording decisions and traps.
- Autonomous: defer non-MVP to a phase-2 list rather than asking.

## Proposal — the outline

1. Investigate the socket, the server plugins, the log format, the CLI.
2. Prove the injection path on the CLI alone (a headless round trip).
3. Server: the plugin that spawns a turn and streams it back.
4. Browser: `ext/Ask` — `ask()` and the chat panel.
5. Integrate with the task system: a `chat` verb, rendered by `AITask`.
6. Test end to end in a real browser.
7. Readme, `page.js`, land.
