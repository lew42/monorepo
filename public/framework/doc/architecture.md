# Architecture: the main classes at a glance

What each important class HAS and DOES, most useful first. `[X]` is an array of X. ✅ built · 🔶 decided, not built · 💭 proposed.
Keep it current: when a class changes shape, update its block here AND at the top of its own readme (the owner, 2026-10-01).

## Pages, items and lists

```js
class Page extends Item {            // 💭 "extends Item" needs the owner's OK (Page ✅ today)
  url, title
  items: Content                     // what's on the page; a sub-page is an item that grew
  view: View
  set(line)                          // ✅ one page.jsonl line: a method key calls, others are data
  route(name) → Page
}

class Item {                         // ✅ core/Item: the persistent object
  id, type                           // type = its class name, found through `types`
  data: {}                           // get(key), set({...}) → emits "change"
  items: Content                     // ✅ its children (a List today; 🔶 a Content), made on the first add
  parent: Item
  add(item), remove(item), move(parent, before)
  on(event, fn)                      // events bubble up to the root
  save()                             // ✅ whole-file write today → 🔶 each change = one line in the nearest page.jsonl
}

class Content extends List {         // 🔶 core/Item/Content.js: editing by id
  items: [Item]
  add({id, type, after}), set({id, ...}), move({id, after}), remove(id)
}

class List {                         // ✅ core/List: the plain array wrapper, upgrade once for every list
  items: [any]                       // 🔶 named `children` today
  view: ListView                     // 🔶 a part, made when first drawn; sortable by default
  add(x), insert(x, before), remove(x), each(fn), find(fn), on(event, fn)
}

class Card extends Page { }          // ✅ a smaller page (ai2/card.js; rules in core/Page/card)
class System extends Page { }        // 🔶 design, code, ui, ux, ai: shared top tabs, readmes, an inbox
class View { el }                    // ✅ core/View: the DOM side

class Saver { load(), append(line) } // ✅ ext/Saver (write today; 🔶 append, then a CloudSaver)
types = { register(Class, name), get(name | url) }   // 🔶 core/types: one registry for Page and Item
```

`page.items.add({...})` adds content. `page.items.items` is the raw array, and you rarely need it: use `each` and `find`.

## Servex: the agent system (Servex/)

```js
class Servex {                       // ✅ the always-on process, :8090 (proxy on :80)
  agents: Agents                     // spawn, message, stop, dormant, the working cap of 5
  sessions: Sessions                 // voice: one fast + one smart assistant, global
  dispatcher: Dispatcher             // routes a prompt to the right agent
  task_loop: TaskLoop                // node-led: re-prompts and escalates a task's steps
  heartbeat: Heartbeat               // status check → triage → escalate
  lifecycle: Lifecycle               // reaps finished or stuck agents
  pool: Pool, worktrees: Worktrees   // the quick-fix pool; per-task worktrees
  cards: Cards, inbox: Inbox, asks: Asks   // AI board cards; page inboxes; the asks ledger
  log: Log, stream: Stream           // single-writer logs; live streams to the browser
  usage: Usage, procmon: Processes   // usage meters; the process monitor
  mcp: MCP, proxy: ReverseProxy, ports: PortRegistry   // HTTP tools; *.localhost routing
}

class Agent {                        // ✅ Agents.Agent: one Claude Agent SDK session
  id, role, model, provider          // provider: anthropic | openrouter
  state                              // working | idle | dormant | stopped
  session_id, parent, cost, context
  send(text), stop(), revive()
}
// Agent tools are in-process node functions (agents/tools.js). The VS Code session uses the MCP servers.
```

## Dictation (ux/Dictate, ext/Chat, ext/Session)

```js
class Dictate { mic, whisper, buffer, autosend }       // ✅ the one widget
class ChatPanel { messages: [Message], composer }      // ✅ the chat it lives in
class Session { id, fast: Agent, smart: Agent, focus } // ✅ global; nav and pause markers
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
