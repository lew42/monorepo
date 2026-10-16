# Ask 4 proof: the Dictate page dictates and sends (2026-10-16)

Fake microphone (`jfk.wav`), headless, `/framework/ux/Dictate/` at 400 wide, one utterance:

- words stream into the box while the mic listens, then the box empties when the sentence is sent;
- one `/api/session/say` POST, one user bubble, one assistant reply, no page errors (the only failed requests are `weight.jsonl` 404s that also show on every other page);
- screenshot: [shots/dictate-page-400-fake-mic.png](shots/dictate-page-400-fake-mic.png).

Fresh session on `monorepo.localhost` (main), one utterance: 1 say, 1 user bubble. See `task.jsonl` for the duplicate-bubble experiment.
