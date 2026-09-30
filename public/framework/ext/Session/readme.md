# Session — one ✦ press is one voice session, answered by a fast and a smart assistant

A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one file: `<home>ai/<session>.jsonl`. A fast assistant answers each line in a few seconds; a smart one thinks, decides, and starts masterminds.

## Use

```js
import { start, say, nav, watch, entry } from "/framework/ext/Session/Session.js";

const { session, file } = await start({ path: location.pathname });
const stop = watch(file, line => draw(entry(line)));   // every line, old and new
await say({ session, text: "can you hear me?", via: "voice" });
await nav({ session, from: "/a/", to: "/b/" });
```

## Watch out

- It needs Servex (`Servex/agents/Sessions.js`, routes `/api/session/new|say|nav`). A Servex that has not been restarted since this landed answers 404.
- Each Start spawns two real agents, so the demo costs a few cents a press.
- Replies are the agents' own final text for a turn, written into the file by Servex; there is no reply tool.

## More

- Page: [/framework/ext/Session/](/framework/ext/Session/) · the file format and the agents: [doc/sessions.md](./doc/sessions.md)
- The design: [ai/2026-09-29/voice-sessions/design.md](/framework/ai/2026-09-29/voice-sessions/design.md)
