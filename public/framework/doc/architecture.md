# Architecture: the main classes at a glance

A quick map of what each important class HAS and DOES, in pseudo-JS. `[X]` is an array of X. ✅ built · 🔶 decided, not built · 💭 proposed.
Keep this file current: when a class changes shape, update its block here (the owner, 2026-10-01).

## Pages and content (design: ai/2026-09-30/proposal-flow/page-item-design.md)

```js
class List {                         // ✅ core/List (array today named `children` → 🔶 `items`)
  items: [any]
  view: ListView                     // 🔶 a part, made when first drawn; sortable by default
  add(x), insert(x, before), remove(x), each(fn), find(fn), on(event, fn)
}

class Content extends List {         // 🔶 core/Item/Content.js
  items: [Item]
  add({id, type, after}), set({id, ...}), move({id, after}), remove(id)
}

class Item {                         // ✅ core/Item (persists by whole-file save → 🔶 page.jsonl lines)
  id, type, data: {}, parent: Item
  content: Content                   // 🔶 rename of `items`; made on the first add
  get(key), set({...}), on(event, fn), save()
}

class Page extends Item {            // 💭 "extends Item" needs the owner's OK; Page ✅ today
  url, title, view: View
  content: Content                   // what's on the page; sub-pages are items that grew
  route(name) → Page, set(line)      // ✅ page.jsonl replay: a method key calls, others are data
}

class Card extends Page { }          // ✅ ai2/card.js · core/Page/card (the rules)
class System extends Page { }        // 🔶 design, code, ui, ux, ai: shared top tabs, readmes, an inbox
class View { el }                    // ✅ core/View: the DOM side

class Saver { load(), append(line) } // ✅ ext/Saver (write today; 🔶 append)
types = { register(Class, name), get(name | url) }   // 🔶 core/types: one registry for Page and Item
```

## Servex: the agent system (Servex/)

```js
class Servex {                       // ✅ Servex.js, the always-on process (:8090; proxy on :80)
  agents: Agents                     // spawn, message, stop, dormant, the working cap of 5
  sessions: Sessions                 // voice sessions: one fast + one smart assistant, global
  dispatcher: Dispatcher             // routes a prompt to the right agent
  pool: Pool, worktrees: Worktrees   // the quick-fix worktree pool; per-task worktrees
  task_loop: TaskLoop                // node-led: re-prompts and escalates a task's steps
  heartbeat: Heartbeat               // status checks → triage → escalate
  lifecycle: Lifecycle               // reaps finished or stuck agents
  cards: Cards, inbox: Inbox, asks: Asks   // the AI board's cards; page inboxes; the asks ledger
  log: Log, stream: Stream           // single-writer logs; live streams to the browser
  usage: Usage, procmon: Processes   // usage meters; the process monitor
  mcp: MCP, proxy: ReverseProxy, ports: PortRegistry   // tools over HTTP; *.localhost routing
}

class Agent {                        // ✅ Agents.Agent: one Claude Agent SDK session
  id, role, model, provider          // provider: anthropic | openrouter
  state                              // working | idle | dormant | stopped
  session_id, parent, cost, context
  send(text), stop(), revive()
}
// tools: in-process node functions (agents/tools.js), not HTTP. The VS Code session uses the MCP servers.
```

## Models and tests (ai/2026-09-30/openrouter-harness)

```js
provider = { daily cap, weekly pace, ledger }   // ✅ the OpenRouter spend guard

class AITest extends Page {          // 🔶 ai/tests/SLUG/page.jsonl
  prompt (a file), criteria, expected, judge
  confidence, differentiation        // weight = differentiation × confidence
  runs: [{ model, effort, score, cost }]
}

class Exploration extends Page {     // 🔶 ai/explore/SLUG/page.jsonl
  suggest: [{ item, by, rank, weight }]
  avoid:   [{ item, by, why }]       // ranked by count, mean weight and spread
}
```

## Dictation (ux/Dictate, ext/Chat, ext/Session)

```js
class Dictate { mic, whisper, buffer (the text area), autosend }   // ✅ the one widget
class ChatPanel { messages: [Message], composer }                  // ✅ the chat it lives in
class Session { id, fast: Agent, smart: Agent, focus: card }        // ✅ global; nav and pause markers
```
