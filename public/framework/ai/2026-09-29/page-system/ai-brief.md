# Minion brief: core/Page/ai/ — the page-based AI system, documented and SHOWN

Load the `minion` skill first, then `page`, `new-page`, `content`, `code`. Owner's words: `public/framework/ai/2026-09-29/item-ui/owner-words.md` (the first part, up to "Spawn a UI or UX mastermind"). Program card dir: `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

> "we have AI kind of per page. This paging mastermind should definitely look into the ... AI systems that we have per page. And so core slash page slash AI should be a page dedicated to documenting the page-based AI system. And so that's primarily the uh, dictation per page, the fast assistant per page, the, the way that the session IDs and the SDK work. Like if there's any object-oriented structure with the SDK ... And all the agents, like how there's if there's an array of agents somewhere, I want to see what that uh, that JavaScript structure looks like in rendered form. So like little debug widgets."

Also from the same message: a manager or mastermind per page ("there's a fast assistant on a page and, and also kind of a, a manager or whatever, I forget how that works").

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/; Servex itself answers on http://localhost/ — the dashboard — and its MCP/HTTP routes; read, never restart it). Edit only there, commit by exact path.

**Fence:** `public/framework/core/Page/ai/**` only. Do NOT edit `core/Page/page.js` or `core/Page/readme.md` — I add `ai` to the children and the readme line through another minion. Until then, load your page by its own url to test.

## Find first (read, don't guess)

Where each piece actually lives: per-page dictation (look at `ux/Dictate/`, the drawer's Dictation tab in `ext/drawer/`), the per-page fast assistant and the per-page manager/mastermind (grep `Servex/` for how a page/card gets its agents: `Servex/agents/`, `card-assistant.md`, `Agents.name`, `page:` in spawn), how a session id is minted and resumed (`spawn_agent`'s `resume`/`fork`, `list_agents` rows, the SDK wrapper — which class/object holds the agents: an array? a Map?), and the HTTP route the browser can read it from (e.g. `GET /agents`). Write what you found as `doc/where.md`: one row per piece — what, file, class/object, how the browser reaches it.

## Deliverables

1. **The page `/framework/core/Page/ai/`** (`page.js`, `readme.md`, `doc/`). Level 1 is one screen, shown: the parts as linked icon tiles (Dictation · Fast assistant · Manager/mastermind · Sessions and the SDK · The agents list), each one a child page or a `doc/*.md` one click down.
2. **Debug widgets — the real JS structures, rendered live.** At minimum: the agents list as the browser can fetch it (each agent: id, role, model, state, session id, parent, page/card), and the one agent-host object's shape (its fields/methods as a nested list). Render each as a small nested icon-item view: property names shown with a leading dot (`.session_id`), values beside them, objects nested and indented. task-mastermind-item-ui is building a default object view (`instances as nested items`); check `public/framework/ai/2026-09-29/item-ui/` and `core/Item/`/`ui/` for it — if it has landed, use it; if not, build the smallest local version inside your fence (`ai/ObjectView.js`, under 60 lines, `ux/Tree` or plain nested lists) with a comment saying it is replaced by item-ui's view when that lands. The fetch must fail soft: no Servex → one plain line saying so, never a console error.
3. **Sessions and the SDK, in plain sentences:** how an agent's session id is made, where it is recorded (task.jsonl line 1, `list_agents`), how to go back and talk to one (`claude --resume <id>` in its cwd, or `spawn_agent` with `resume`), and whether the SDK has an object structure (name the class/function).
4. `readme.md` — the index (what · use · watch out · more), short.

## Proof

- Load `http://localhost:51061/framework/core/Page/ai/` headless at 1920: zero console errors, zero failed requests (a Servex fetch that fails is caught, not a failed-request error — if it cannot be avoided cross-origin, fetch through whatever route the site already uses for agents). Shot to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\ai-1920.png`, and look at it: the widgets must show real agents.
- Every spawn sets `windowsHide: true`. Budget about $3.

Reply with the commit hash, the shot path and a checklist of deliverables 1–4, proof beside each. Then stop.
