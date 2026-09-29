# Where each piece actually lives

Written for the next agent who touches this page — not for the owner. Read, not guessed:
every row below was found by opening the file named.

| What | File | Class / object | How the browser reaches it |
|---|---|---|---|
| Per-page dictation (the microphone) | `public/framework/ext/drawer/tabs/dictation.js` | embeds `ux/Dictate/playground/Playground.js`'s shared `pg` instance | opened from the ☰ drawer on any page; the playground also has its own url, `/framework/ux/Dictate/playground/` |
| The composer that sends a message (typed or dictated) | `public/framework/ext/drawer/tabs/ai.js` | `send()` (exported) | drawer's AI tab; tries `POST http://servex.localhost/api/page-ai` first (route does not exist yet), falls back to the dev bar's Ask bridge |
| Fast assistant (per card) | `Servex/agents/Layers.js` | `Layers.assistant(card)` → `Layers.record(card).assistant` = `{id, session_id, cwd}` | Servex mints it; a page reads it at `GET /api/card-agents?card=<id>` (`Layers.agents_of()`) |
| Manager (per card) | `Servex/agents/Layers.js` | `Layers.ask_manager()` → `Layers.record(card).manager` | same route, role `"manager"` |
| Task mastermind (a whole task, own worktree) | `Servex/agents/Dispatcher.js` | spawned with role `"task-mastermind"`, `cards.attach(folder, agent.id)` on line 145 makes it hear every prompt on its card too | `GET /api/agents` (all live agents; no card filter) |
| The chat-room echo (assistant AND mastermind both hear every prompt) | `Servex/cards/Cards.js` — `forward(id, prompt)` (~line 287), called from the `POST /card/append` route (~line 320); `Servex/agents/Dispatcher.js` line 145 attaches the mastermind | `Cards.forward` loops `this.attached(card)` and calls `this.agents.send(agent, text, …)` for each live, non-minion one | not a route of its own — it fires inside the same append the owner's own message already goes through |
| The agent host — every live session, in one process | `Servex/agents/Agents.js` | `class Agents` — `this.live` is a `Map<id, Agent>`; `export const agents = new Agents()`, one per process | `GET /api/agents` → `agents.list()` → `[...this.live.values()].map(a => a.card())` |
| One held-open session | `Servex/agents/Agents.js` | `Agents.Agent` (a static on `Agents`) — wraps the SDK's `query()` | its row in the same `/api/agents` array |
| Session ids, on disk (survives a Servex restart) | `Servex/agents/registry.js` | `Registry`, one JSON file, `%LOCALAPPDATA%/lew42/servex/registry.json` | `GET /agents` (registry rows, includes agents no longer live) |
| `resume` / `fork` a session | `Servex/agents/Agents.js` | `Agents.spawn({resume, fork})`; the SDK's own `resume`/`forkSession` options | the `spawn_agent` MCP tool, or `claude --resume <id>` in the session's original `cwd` |
| Who is who, the whole hierarchy | `public/framework/servex/doc/roles.md` | — | `/framework/servex/doc/roles/` |
