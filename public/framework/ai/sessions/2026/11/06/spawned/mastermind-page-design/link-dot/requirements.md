# Link: the "Servex is down" banner becomes a quiet dot

**The ask** (the owner, relayed by voice-app at 21:56 on 2026-11-06, through mastermind-resources): "Turn the big 'Servex is down' banner into a subtle status dot in the dev/status toolbar. Make it prominent only while a voice session depends on Servex."

**Where it lives:** `public/framework/dev/Socket/Link.js` draws the one connection state for the dev socket and the Servex wire. `ux/Dictate/chat.js` reports the Servex wire.

**Deliverables**
1. While a wire is down (past the 8 s grace), show a small amber dot, not the full-width banner. Hovering it says why, and pressing it retries.
2. The dot sits on the rail's AI button when that button can be seen. Otherwise it goes in the page's top corner (on a phone, the open sheet covers the rail).
3. Show the full banner with Reconnect only while a voice session depends on Servex: a mic is live (`Socket.busy()`, which `ext/Chat/Mic.js` feeds) or a sentence is still sending.
4. The proof is `node public/framework/ux/Dictate/test/reconnect.mjs <base-url>`, and it passes: dot with the mic off, a dot press retries, banner with the mic live, both hide when Servex is back.
5. Docs: `dev/Socket/readme.md` and `ext/drawer/doc/sheet.md` say the same.

**Decision:** the dot goes on the rail's AI button, or in the corner. Alternative: put it inside the dev bar (`dev/DevBar`). That bar only exists while it is open, so a dot there would usually not be seen.
