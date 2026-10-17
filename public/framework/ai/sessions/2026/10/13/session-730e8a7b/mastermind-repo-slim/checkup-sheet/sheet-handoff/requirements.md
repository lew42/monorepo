# Sheet step 8: page hand-off from the global chat

Budget: $4. Sonnet. After [sheet-feed](../sheet-feed/requirements.md).

**What.** Step 8 of [the sheet proposal](../../../../../../../2026/10/16/voice-20261016/sheet/proposal.md): one global conversation that knows the page; "file a task about this page" and "ask this page's expert" go to that page's `Layers.js` pair as a tool call, and the answer lands in the feed. The proposal's "Global agent or page agent" section has the why; the alternative (two conversations) was not taken.

**Done when.** From the sheet on a page, asking it to file a task produces a task line in that page's folder and an event in its feed; one commit through a worktree and `merge.mjs`. A Servex-side change needs a restart: log `{"log":{"needs_restart":"…"}}`, never restart Servex yourself.
