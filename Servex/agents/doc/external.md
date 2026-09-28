# External agents — a VS Code tab is one you can message

Every agent Servex spawns lives in one process, in the `live` Map (`Agents.js`). A VS Code tab, or
a terminal running `claude`, is a REAL Claude session too, but Servex never started it and holds
no process for it — until now it could not be listed, messaged, or told when the owner spoke into
a card it made. `External.js` closes that gap with the smallest thing that works: a registry row
and a file.

## Register once

```
register_session({ id: "vscode-recursive-pairs", session_id: "<$CLAUDE_CODE_SESSION_ID>" })
```

Call it near the start of a session, from inside that session (it needs its own session id — the
same value a terminal would pass to `claude --resume`). From then on:

- **`list_agents`** shows it: `{ id, kind: "external", session_id, state: "external", … }`, in the
  very same `registry.json` every real agent's row lives in — `registry.js` needed no change, its
  `read()`/`save()` already take any shape.
- **`send_to_agent`** to that id no longer throws "no agent" or tries to resume a session Servex
  does not hold: it appends one line to the id's own **inbox file**.
- **Any card that id creates** (`create_card`'s `by` — already recorded, nothing to add there)
  forwards the owner's fresh words on that card to the same inbox.

## The inbox is a file, not a queue

`logs/inbox/<id>.jsonl`, under Servex's home (`home.js`'s `place()`, so `SERVEX_HOME` moves it with
every other log). One line per message:

```json
{"from": "mastermind-servex", "text": "…", "reply_to": "log agent-host", "at": "2026-09-28T14:02:03-05:00"}
```

Read it the same way any long log is read — tail it. A tab does this with one `Monitor` call that
never really "expires" in practice: it is re-armed at the start of every turn. The
`servex-mastermind` skill (`.claude/skills/servex-mastermind/SKILL.md`) has the exact command.

## The one line in `Agents.send()`

```js
send(id, text, note){
	const agent = this.live.get(id);
	if (agent && agent.state !== "stopped") return agent.send(text, note);
	if (this.external?.has?.(id)) return this.external.deliver(id, text, note);
	return this.wake(id).send(text, note);
}
```

`this.external` is set once, by `External.install()` itself (`this.servex.agents.external = this`)
— `Servex.js` only has to construct and install it, the same one-line shape every other module in
this dir uses (`Layers`, `Global`, `Cards`):

```js
this.external = new this.constructor.External({ servex: this }).install();
```

An external id is never in `live`, so `send()`'s first branch always falls through, and it has no
session `wake()` could reopen — checking `external.has(id)` before `wake()` is what keeps a real
send to a real external agent from ever reaching `wake()`'s "never got a session" throw.

## Policy needed no change

`send_to_agent`'s policy check (`policy.js`, outside this fence) already buckets any id it does not
recognise as `kind: "worker"` — the same bucket a minion or a helper falls into. An external id is
addressed exactly like a live worker agent already was: the owner, `mastermind-servex` and the
`dispatcher` may always message it, and anyone else may once it has messaged them within the last
30 minutes (the `reply` rule). Nothing about registering as external needed a new row in that
table.

## What is not covered

**A Servex restart.** `Agents.revive()` (in `Agents.js`, outside this file's fence — that file may
only be touched on its send path) walks every registry row that is not live, and reopens the ones
it judges were alive a moment ago. An external row has no `agent-<id>.jsonl` log for it to check —
its lines go to `inbox/`, a different file — so `revive()` cannot tell "still alive elsewhere" from
"gone", and buries it as `gone`. The row still keeps its `session_id` and `kind: "external"`, so
calling `register_session` again fully restores it; a tab that already re-arms its Monitor every
turn can re-register in the same breath. Left for whichever task next opens `revive()` — teaching
it a third kind (live / revivable-by-resume / external-reregisters-itself) is a few lines there,
not here.

## Files

`External.js` (the class) · `External.test.mjs` (fakes `cards`/`mcp`/`log`, but a REAL `Agents`
host with a scratch registry dir, so the test proves the actual `send()` hook) · the one line in
[`Agents.js`](../Agents.js)'s `send()` · the one install line in [`Servex.js`](../../Servex.js).
