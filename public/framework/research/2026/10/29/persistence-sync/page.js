import { Page, md } from "/app.js";

// One research project: links first (the owner's rule for index pages, core/Page/doc/navigation.md),
// then the one-paragraph answer. The full text lives in this folder's markdown files and the research app.
export default new Page({
	meta: import.meta,
	title: "Persistence & sync research",
	description: "Build or buy the save, sync and streaming layer? Keep the Item / List / Page core and fix it.",
	icon: "science",

	content(){
		md(`
**Read it**
- [The research app](persistence-sync/app/index.html): every doc, the 147-tool dataset, categories, the design decisions D1–D18. The best way in.
- [Readme](md/readme): what is in this folder.
- [Status](md/STATUS): the answer, and what was built from it.
- [What was built, how to merge, what is left](md/build): the handoff for branch \`claude/oop-streaming-research\`.
- [Open decisions](md/OWNER): what was waiting on the owner.

**See it work**
- [Replay Lab on the real classes](/framework/core/Item/replay/): save the changes vs save the method calls, then reload.
- [Click-through tests](/framework/core/Test/view/?file=core/Item/replay.test.mjs): each test a block, every object expandable.
- [Core API overview](/framework/core/md/doc/overview): the classes as pseudo-code.

**Artifacts** (outside the repo; their source is in this folder)
- Research app, hosted: https://claude.ai/artifact/JwAL71fvKRDUTHYyz1LJLx (source: \`persistence-sync/app/\`, rebuilt by \`persistence-sync/scripts/build.mjs\`)
- Replay Lab mock: https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5 (source: [design/replay-lab.html](design/replay-lab.html); the real one runs on the framework's classes, above)

**The answer.** Keep the Item / List / Page core and fix it. Figma, Linear and tldraw run the same design: one ordered log per document, last-writer-wins per property, ids not indexes. Borrow their protocols; adopt libraries only at the edges (Yjs for shared rich text, SQLite FTS5 or MiniSearch for search, Cloudflare Realtime SFU for voice).
`);
	},
});
