# Chat V1.2: short walkthrough

Demo: [/framework/ext/Chat/v1-2/](/framework/ext/Chat/v1-2/). Docs: [readme](/framework/ext/Chat/v1-2/readme.md). The pictures are committed under [`ext/Chat/v1-2/doc/`](/framework/ext/Chat/v1-2/doc/); regenerate with `FENCE_SERVEX=1 node ChatV1Dot2.test.mjs <base> <shots-dir>`).

1. **Phone, 360×740, the test's final state** — [v1-2-360.png](/framework/ext/Chat/v1-2/doc/v1-2-360.png). With the shared Claude-style layout merged in: one owner bubble hugging its three sentences with the green ✓ after the last (the assistant has all three), the Reply as plain text on the left, and the words still being spoken ("Maybe we could", the last part faint) in a live draft pill after the ✓.
2. **Phone, 360 wide, the demo page** — [demo-360.png](/framework/ext/Chat/v1-2/doc/demo-360.png). The fixture mid-flight: the ✓ is dim after sentence 3, and the fourth sentence ("Try a hard refresh.") is dimmed in its own bubble below the Reply, because the assistant has not got it yet. No horizontal scroll.
3. **Desktop, 1920** — [demo-1920.png](/framework/ext/Chat/v1-2/doc/demo-1920.png). Same state; V1's bubble widths, no restyle.

Proof it is V1 underneath: `node Server/ChatV1Compare.mjs` shows 0 differing bubbles across the five real sessions (170, 278, 765, 1314, 215 bubbles).
