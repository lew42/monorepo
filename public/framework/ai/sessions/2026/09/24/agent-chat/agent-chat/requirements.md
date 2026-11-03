# Talk to any running agent from the Live card

## The owner's words

"It would be cool if I could click into [an agent] and then send it messages just from my browser, on the live tab or the live sub page."

## Deliverables (from servex-mastermind-opus)

1. Servex: `POST /api/agents/:id/message` {text}. Loopback only and cors, like `/api/assistant/message` in Servex/agents/Assistant.js. It calls the agent's `send()` with `from: "owner"`, queued behind its current turn. An unknown or stopped id is refused with a clear error.
2. On the Live card, each row in "Running now" can be clicked. It opens that agent's conversation inline, in one column, with no inner scroll box: its recent lines from the `agent-<id>` log (`GET /log/agent-<id>`), live as they arrive, plus a text box that posts to the new route. The fast assistant's own row keeps working as it does today.
3. Proved headless: click a row, send "reply with the word pong", see the pong appear — against a cheap Haiku agent spawned for the test and stopped afterwards.
4. The route goes live only after `node Servex/sustain.mjs --restart` — the very last step, never `--force`.

## Fence

`Servex/Servex.js` (the route only), `public/framework/ai2/live.js`, `public/framework/ai2/ai2.css`, `public/framework/ai2/readme.md`, `public/framework/ai2/doc/`, `Servex/readme.md` / `Servex/doc/` (one line for the route). Worktree `C:\Code\lew42\worktrees\agent-chat`, branch `worktree/agent-chat`.
