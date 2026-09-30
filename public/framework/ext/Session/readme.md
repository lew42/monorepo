# Session — one ✦ press is one voice session, answered by a fast and a smart assistant

A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one file: `<home>ai/<session>.jsonl`. A fast assistant answers each line in a few seconds; a smart one thinks, decides, and starts masterminds.

## Use

```js
import { start, say, nav, watch, entry } from "/framework/ext/Session/Session.js";

const { session, file } = await start({ path: location.pathname });
const stop = watch(file, line => draw(entry(line)));   // every line, old and new
await say({ session, text: "can you hear me?", via: "voice" });
await nav({ session, from: "/a/", to: "/b/" });
const unlive = stream(session, ev => ev.kind === "stream" ? panel.stream(ev.role, ev.text) : draw(ev.line));
const unquiet = report_quiet(() => session);   // tell Servex each time the owner goes quiet
```

**The assistants answer when you stop talking.** A spoken line carries the floor; Servex holds it
from both assistants until the page reports 2.5 s of silence (`quiet`), then sends them the
whole thought. The fast one mostly stays silent. Replies stream in token by token over
`stream()`. Detail: [doc/sessions.md](./doc/sessions.md).

## Watch out

- It needs Servex (`Servex/agents/Sessions.js`, routes `/api/session/new|say|nav|quiet` and `/api/session/<id>/stream`). A Servex that has not been restarted since this landed answers 404.
- A page that never calls `report_quiet()` still works: a held line is released after 8 s anyway.
- Each Start spawns two real agents, so the demo costs a few cents a press.
- Replies are the agents' own final text for a turn, written into the file by Servex; there is no reply tool. The fast one's `(listening)` and short fillers are written as invisible `{skip}` lines instead.

## More

- Page: [/framework/ext/Session/](/framework/ext/Session/) · the file format and the agents: [doc/sessions.md](./doc/sessions.md)
- The design: [ai/2026-09-29/voice-sessions/design.md](/framework/ai/2026-09-29/voice-sessions/design.md)
