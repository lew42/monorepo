# AITask — design notes and removed comments

## Class overview
A task's record: its `task.jsonl` (or a legacy `session.json`) rendered as three tabs — **Report** (the answer first: outcome, links, status, the step checklist, then the tables), **Session** (chat + the transcript), and **Requirements** (the brief) — so the answer is what a task page leads with.

This class IS the master template, and `report()` is its outline. Every part is a named method, so a task dir's own `page.js` overrides whichever it wants and inherits the rest — assign-based OOP, no options:

```js
export default new AITask({
    meta: import.meta,
    title: "panel",
    extra(m){ md("what this one uniquely needs to say"); },
});
```

Schema and design record: readme.md.

## first_sentence and outcome_cell
A row's outcome, trimmed to its first sentence — full text a click away (`fold`, the same expando `message.js` uses for a thinking block), so 21 agents don't cost 12,000px of paragraph.

## tab_bar
A local Asks · Requirements · Report · Session toggle, built from `ext/tabs`'s own CSS classes by hand (`web/nav/tabs/page.js` sets the precedent) — this is a JS-only swap between named sections of ONE page, not a routed page set, so `Page.prototype.tabs` (linkable urls over declared children) doesn't fit.

Returns `{ select }` so one tab can send the reader to another: the Asks tab's "the prompt" link opens Session at the message the ask was made in.

Every panel is created EMPTY, hidden, but not yet built — a tab's content builds on its own first select() only. Session's fn() pulls chat.js's history and feed.js's /ai-logs/ transcript (measured: 6MB+ on a long session) — nothing under it fetches until clicked.

A non-active panel is still hidden when this fills it, so chat.js's bubble() — scrollIntoView() on every history line, unconditionally — is a no-op on the `display:none` subtree. The active tab (Report) has no such call, so building it visible at start-up is fine.

## static into(base, ...args)
THE TASK PAGE, DRAWN INTO WHATEVER BOX IS CAPTURING NOW — the seam for a page that shows a task without navigating to it (AI 2's card column). `base` is the task dir's url, `/framework/ai/<date>/<slug>/`; it builds the same page the day's `route()` builds, and runs its own `content()`, so nothing here is a copy of the view. Pass `{ known_files }` (the dir's file names) when you have them, and a missing `requirements.md` is never fetched. Returns the page.

## route(sub)
A subtask's folder inside this task's folder is a task too (nested tasks, doc/nested.md) and opens with this same template. Only a folder holding a task.jsonl and no page.js is claimed — anything else (an `audit.md` routed as `audit/`, a subtask with its own page) falls through to Page.child().

## static has(url)
Does this file exist? One synchronous HEAD, because route() must answer now (Page.child() never awaits it). Used where no directory listing exists: task folders in the sessions store (ai/doc/task-folders.md).

## content()
`wide`, not the default `main` track. A task page is not prose: it is a wall of ask cards, a conversation with a rail beside it, and four tables of figures, and at 1280 the reading column gave all of that 602px — two of the three tabs were squeezed into a third of the screen. `wide` is main plus the breakout (890px at 1280, 1419 at 1920), and `ai.css` keeps every paragraph, heading and list inside it on `--measure`, exactly the way a page column does — so the prose is unchanged and only the things that wanted room get it.

## session() and legacy()
task.jsonl first, then the legacy session.json snapshot. It streams on the dev server, so a running task's own page follows its log.

`src` points the viewer at a manifest not beside its own meta — dynamic routes. The SPA fallback answers a miss with index.html; content-type is the 404.

A legacy task's task.jsonl never appears, so the probe would stand as a dead subscription; a dir with NEITHER file keeps its stream — that log is about to be written.

## requirements()
`known_files`, when the caller knows the dir's file names (`into()`'s callers do): no fetch for a file that is not there, so no 404 in the console.

NOT `listing`: core/Page/Log.js gives every page a `listing()` METHOD, so on a standalone task page `this.listing` was that function, `.includes` threw, and every task page drew its title and nothing else (2026-09-24); on an embedded one the option shadowed the method instead.

## report(m, req)
The outline: Asks · Requirements · Report · Session.

**Asks comes first and opens by default whenever the log carries any** — what the owner asked for outranks what a session did about it. Without asks the page is what it always was: Report open, the answer before the brief. A task with only a brief (proposed, not yet running) has nothing to tab between.

A url carrying `?m=<uuid>` or `#m-<uuid>` names one message of the transcript, so it opens Session instead and scrolls there.

Override a part, not this — unless you mean to reorder them.

## asks(m, to_prompt)
Everything the owner asked for, as preview cards, with the "needs you" strip above them. See `asks.js`.

Redrawn on a streamed append only when something this tab SHOWS has changed — the owner's order, or the set of items waiting on the owner. Every other append (a log line, an agent landing) leaves it alone, because rebuilding the wall re-fetches every serving task's manifest and closes whatever sheet the reader had open. `sign()` is that test.

A statement, not an expression: a captured callback's RETURN VALUE is appended too, which would move the tab to the end of its own wrapper.

## decisions(m)
Every choice this task made, with Approve / Improve on each. See `decisions.js`.

The open row and the note box are held HERE, not in the module, so a verdict arriving over the socket can redraw the whole tab without closing what the reader had open — `state.redraw` is the seam that does it.

A statement, not an expression: a captured callback's RETURN VALUE is appended too, which would move the tab to the end of its own wrapper.

## streamed(m)
Every panel that draws from the manifest, redrawn on each appended line.

Each one is guarded because a tab's panel is not built until the reader first selects it (`tab_bar`) — before this existed the callback said `this.$live && …`, so on a task that opens on Asks NOTHING streamed.

A reply filed from ANY tab arrives here as an appended `chat` line, so every reply thread on this page redraws itself from the log — no reload, and a second window follows along. `ext/Ask/reply.js`.

## status(m)
Where this is right now — the same `now` the card shows, above the checklist so it reads before any history. Redrawn with the rest of $live: a live task streams new `now` lines in place, not just on first paint.

Landed: `outcome` below is the truth, a stale `now` is not shown. No `now` and no open agent: nothing, since a placeholder would lie just as loudly.

## refresh(m)
The manifest's own part of the page, redrawn in place on every streamed append — the chat panel and the feed hold state a redraw would wipe.

Outcome and links lead: they're the answer, above the 12,000px of tables below them.

One line, above the answer: what the answer cost is read WITH it (the owner: "then we can compare outcomes"), and below a long outcome it was off-screen.

## outcome(m)
The answer. Silent until the task has landed and said one.

## links(m)
The pill row of this task's own deliverable links — `card.js`'s row, reused so the task page never drops what the card already shows.

## unparsed(m)
Lines that failed `JSON.parse` — whatever state they carried is missing from everything on this page, so say so instead of rendering a plausible record.

## head(m, req)
Requirements — `requirements.md` rendered whole when there is one, else the request verbatim. Its own tab, so the plan never competes with the answer for the fold.

## checklist(m)
The step outline, checked off. Silent for a task that declared none.

## cost(m)
What this task cost in dollars — its Servex agent plus every agent under it: the root, its own share, its minions', how many agents. "Not tracked" when the log carries no `cost_usd` (`Server/task-cost.mjs` writes it). See cost.js.

## extra(m)
Nothing by default — the hook a task's own page.js fills.

## shots(m)
Screenshots this run logged — ext/JSONL's `shot` verb. Silent without any.

## chat(m)
Talk to this task's session from the page. The first message FORKS the task's own session — a headless turn must never share a transcript a human still has open — and the fork's id lands as `chat_session_id`. See ext/Ask.

Folded, and it is the fold that matters: open, the composer and its history were the whole first screen of the Session tab and the conversation the tab is FOR began below the fold. Talking to a session is a tool you reach for; reading it is why you came.

## composer(m)
A thread's path under `public/` — the one shape every Ask RPC takes.

## log(m)
The transcript, read as a conversation — `conversation.js`.

No `session_id` in the manifest means NO log at all, and the renderer would just return silently, which reads as "the server can't serve it". Say which.

An agent that ran in its OWN session has its own transcript; one spawned inside this session is a sidechain and is already folded into the steps above, so it is not listed twice.
