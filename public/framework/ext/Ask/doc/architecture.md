# Ask architecture — one turn is one fresh process, bound to one tab

Ask lets the browser talk to a Claude Code session on the dev server. The browser calls `ask()`, `thread()`, `start()` or `chat()` in [`Ask.js`](/framework/ext/Ask/Ask.js); the dev server runs one `claude -p` process per turn in [`Server/plugins/Ask.js`](/framework/ext/Ask/) (class `Ask`). The main entry is [`Ask.js`](./../Ask.js); the readme is [`readme.md`](./../readme.md).

## A turn is a process, not a pipe

**Decided:** every turn starts a new `claude -p --resume <id>` process that takes one turn and exits.
**Why:** the transcript on disk is the continuity, so there is no child to supervise or reconnect to.
**Instead:** a pty wrapped around an interactive `claude`. It would give mid-turn steering, but needs a child to keep alive.
**Detail:** [process](./process.md)

## The first message forks, every later one resumes

**Decided:** the first browser message on a task passes `from` and runs `--resume <id> --fork-session`; later messages pass `resume` with the fork's id.
**Why:** a headless turn must never write into a transcript a human still has open in a terminal.
**Instead:** resuming the task's own session, which would share its transcript with a human.
**Detail:** [fork](./fork.md)

## A turn is bound to the tab that asked

**Decided:** the server tells the turn the asking tab's id, and claims that tab for the length of the turn, so the `site` MCP tools act on that tab only.
**Why:** two windows on one page look identical by path, so a turn could drive the wrong one.
**Instead:** matching tabs by path, which is refused when ambiguous.
⚠ The turn's claim overwrites a claim made by hand on that tab, and releases at the end.
**Detail:** [decisions](./decisions.md#a-turn-is-bound-to-the-tab-that-asked)

## Tools are opt-in per call

**Decided:** a call gets the built-in tool set only if it passes `tools`; `tools: ""` removes the built-ins.
**Why:** a page asking a question should not get a full agent by default.
**Instead:** a fixed tool list per server, which would have needed one config per caller.
⚠ `tools: ""` does not remove the `site` MCP server, because `--tools` never governed MCP servers.
**Detail:** [decisions](./decisions.md#a-turn-is-bound-to-the-tab-that-asked)

## The task path is the fence

**Decided:** a `task` must be a path under `public/`, with no `..` segment and an `ai` segment, before anything is written.
**Why:** browser input reaches a file write, so the path is the only gate.
**Instead:** a database of task ids, which would move the fence into a store nobody reads.
**Detail:** [task](./task.md)

## Off localhost, the same turn rides a LAN route

**Decided:** `ask()` off localhost posts to `POST /ask/turn`, which accepts only loopback or this machine's own Wi-Fi with its own `Host` header.
**Why:** the dev socket refuses every non-loopback connection on purpose, so a phone needs a separate door.
**Instead:** opening the dev socket to the LAN, which would expose `rpc:cmd`.
⚠ The route returns the same tools and `--resume` as `rpc:ask`, but without streaming or `shot`.
**Detail:** [decisions](./decisions.md)

## One switch decides edit mode

**Decided:** `edit()` is true only when the dev socket is live and the rail's toggle is on; every editor control reads this one function.
**Why:** one switch lets the owner preview the production site on localhost.
**Instead:** each control checking the socket itself, which drifts.
**Detail:** [decisions](./decisions.md#edit-mode--the-one-devproduction-switch-2026-09-18)

## The exchange is a verb in the task's own log

**Decided:** a chat message is a `{"chat": …}` line appended to the task's `task.jsonl`, and `TaskJSONL` replays it into `chats[]`.
**Why:** one store means the conversation survives a reload and is never copied.
**Instead:** a parallel chat file, which would need its own sync.
**Detail:** [record](./record.md)

## A reply's turn writes nothing itself

**Decided:** the browser appends the reply's `ask`, `decision` or `log` lines; the turn only returns text.
**Why:** a malformed block is then dropped, not half-written into a log.
**Instead:** letting the turn write its own lines, which made broken JSON possible.
**Detail:** [reply](./reply.md)

## Picking an element sends its readme with it

**Decided:** `pick()` resolves to the element, and `describe()` puts the page's readme and decisions into the prompt.
**Why:** an answer can then cite the page's own rules rather than guess.
**Instead:** sending only the selector.
**Detail:** [picking](./picking.md)
