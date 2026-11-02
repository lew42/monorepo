# Chat V1.2: short walkthrough

Demo: [/framework/ext/Chat/v1-2/](/framework/ext/Chat/v1-2/). Docs: [readme](/framework/ext/Chat/v1-2/readme.md). Shots live in `shots/` beside this page (gitignored by the repo's rule, so they exist on the machine that ran the test; regenerate with `FENCE_SERVEX=1 node ChatV1Dot2.test.mjs <base> <shots-dir>`).

1. **Phone, 360×740, the test's final state** — [v1-2-360.png](shots/v1-2-360.png). One owner bubble with three sentences, the green ✓ after the last one (the assistant has all three), and the Reply as its own bubble below.
2. **Phone, 360 wide, the demo page** — [demo-360.png](shots/demo-360.png). The fixture mid-flight: the ✓ is dim after sentence 3, and the fourth sentence ("Try a hard refresh.") is dimmed in its own bubble below the Reply, because the assistant has not got it yet. No horizontal scroll.
3. **Desktop, 1920** — [demo-1920.png](shots/demo-1920.png). Same state; V1's bubble widths, no restyle.

Proof it is V1 underneath: `node Server/ChatV1Compare.mjs` shows 0 differing bubbles across the five real sessions (170, 278, 765, 1314, 215 bubbles).
