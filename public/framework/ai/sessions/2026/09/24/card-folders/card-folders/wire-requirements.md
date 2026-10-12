# Minion brief — wire the card store into Servex

Load the `minion` skill first, then `code`. Worktree `C:\Code\lew42\worktrees\page-cards`. Do not commit; I do.

## The owner's words

> "I'd rather have a create page skill that does it programmatically without error"
> (handoff2 item 7) "every agent on a card [should] see all of their messages."

Read `Servex/cards/readme.md` and `Servex/cards/Cards.js` first — it is built and tested
(`node Servex/cards/test.mjs`). Your job is only the wiring, and every edit is small.

## Deliverables

1. **`Servex/Servex.js`** — four touches, nothing else:
   `import Cards from "./cards/Cards.js";` · `static Cards = Cards` beside the other static parts if
   that is the file's pattern · construct `this.cards = new this.constructor.Cards({ agents: this.agents, log: this.log })`
   right after `this.agents = …` · in `routes()` call `this.cards.routes(router, cors)` right after the
   `/log/cards/:slug` routes (the `cors` const is local there) · in `tools()` add
   `for (const tool of this.cards.tools()) this.mcp.tool(tool);` after the agent tools.
   ⚠ Another team added `/api/agents/:id/message` between `/api/agents` and `/agents` — do not touch
   those lines, and do not touch `initialize()` beyond the one constructor line.
2. **`Servex/agents/Assistant.js`** — `card_reply()`: if `this.servex.cards?.canonical(card)` resolves,
   append `{"message": {by: from || "agent", text, kind: "reply"}}` to that card folder instead of the
   old `cards/<slug>` log; otherwise the old path, unchanged (the Live card stays on its old log).
   `mirror()`: the same switch. A sub-card id `<card>/<sub>` that resolves as a folder goes to the folder.
3. **`Servex/agents/Dispatcher.js`** — right after it spawns a task mastermind for a task that names
   `task.card`, if `this.servex.cards?.canonical(task.card)` resolves, call
   `this.servex.cards.attach(<that id>, agent.id)` — the attach sends the mastermind the card's whole log
   and from then on Servex forwards the owner's new prompts on that card to it. Minions are never attached.
   Check what `attach()` returns and that it cannot throw into the Dispatcher (wrap it).
4. **Proof without restarting the real Servex** (never run `sustain.mjs`, never stop the running Servex):
   `node --check` all three files; then a scratch script in
   `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-worktrees-page-cards\2a1fcc71-6ce1-4224-b379-eef0fe42020f\scratchpad\`
   that imports `Servex/Servex.js` WITHOUT booting it (just the module — check it loads), builds a real
   express router with `Cards.routes()`, listens on a free port, and exercises create → append prompt →
   GET /card through HTTP against a scratch root. Also call `Assistant.prototype.card_reply` with a fake
   `this` to show both branches.

## Fence

Only those three files. Nothing in `public/`, nothing in `Servex/cards/` (report a bug there to me instead).

## Done

Append one `log` line to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\card-folders\task.jsonl`
with `node .claude/hooks/append.mjs` (run from the main tree). Last message: the diff stat and what the proof printed.
