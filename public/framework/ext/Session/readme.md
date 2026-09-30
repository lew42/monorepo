# Session — one ✦ press is one voice session, answered by a fast and a smart assistant

A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one file: `<home>ai/<session>.jsonl`. A fast assistant answers each line in a few seconds; a smart one thinks, decides, routes your words to work already in flight, and starts masterminds. Pressing ✦ again within an hour continues the same session, on the phone or the PC alike.

- **The two roles:** `session-fast` is the fast assistant, `session-smart` the smart one (`Servex/agents/session-fast.md`, `session-smart.md`).
- **The routes:** `/new` starts a session (or continues this page's from the last hour), `/say` sends one owner line to both assistants, `/nav` records a move to another page. `/resume`, `/floor` and `GET /api/sessions` are the rest ([doc/sessions.md](./doc/sessions.md)).

## Use

```js
import { start, resume, recent, say, floor, nav, watch, entry } from "/framework/ext/Session/Session.js";

const { session, file, resumed, previous } = await start({ path: location.pathname });
const stop = watch(file, line => draw(entry(line)));   // every line, old and new
await say({ session, text: "can you hear me?", via: "voice", floor: "speaking" });
await floor({ session, floor: "done" });               // the owner stopped talking: the held fast reply lands
await nav({ session, from: "/a/", to: "/b/" });
const rows = await recent(location.pathname);          // this page's sessions, newest first
await resume(rows[0].session);                          // continue one
```

## Watch out

- It needs Servex (`Servex/agents/Sessions.js`). A Servex that has not been restarted since a change here answers 404 on the new routes.
- The first line you say starts two real agents, so the demo costs a few cents. They stop after 5 quiet minutes and wake on the next line, and at most 2 pairs run at once.
- Each folder's `ai/log.jsonl` is the index of its AI work (sessions, tasks, decisions), not `page.jsonl`.
- Ordinary replies are the agents' own final text for a turn; refined lines (`level`: `clean`, `edit`, `summary`) come from the `session_line` tool.
- Sessions are listed and resumed per **project**, not per host: the phone on `10.0.0.135:8481` and the PC on `monorepo.localhost` see the same ones; two different sites never mix ([doc/sessions.md](./doc/sessions.md)).
- For the ✦ sheet (`ext/drawer/rail.js`): `start()` on the first sentence, `recent(page, {limit: 1})` on open for the one-line resume offer, `resume(id)` when it is tapped, and `say({floor, cues})` + `floor()` for the floor.
- `start({path, fresh: true})` always begins a new session, even if this page spoke within the last hour — that is what the ✦ sheet's "New session" button sends on its next sentence, so the button actually starts fresh instead of silently continuing.
- `start({path, card})` makes an AI 2 card the session's home (`/framework/ai/<card>/`) instead of the nearest folder to `path`, so a card page can be a voice session's home too: [doc/sessions.md](./doc/sessions.md#card-sessions).

## More

- Page: [/framework/ext/Session/](/framework/ext/Session/) · the file format, routes, levels and sleep/wake: [doc/sessions.md](./doc/sessions.md)
- The design: [ai/2026-09-29/voice-sessions/design.md](/framework/ai/2026-09-29/voice-sessions/design.md)
- Open items: [doc/decisions.md](./doc/decisions.md)
