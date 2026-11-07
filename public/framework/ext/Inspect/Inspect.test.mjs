// node public/framework/ext/Inspect/Inspect.test.mjs
// Replays the first N lines of a small fixture page.jsonl and checks the card count grows with N,
// exactly the slider in DeltaHistory.js (no DOM here — Page.replay alone, in memory, nothing written).
import assert from "node:assert/strict";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
register(pathToFileURL(path.join(ROOT, "Servex", "agents", "site-hooks.mjs")).href);   // site-absolute imports ("/framework/…") map to public/

const { default: Item } = await import("/framework/core/Item/Item.js");
const { default: Page } = await import("/framework/core/Page/Page.class.js");
await import("/framework/core/Page/parts/kinds.js");   // registers part-text etc. with Item

const lines = [
	{ id: "fixture", title: "Fixture page" },
	{ content: { add: { id: "c1", type: "part-text", text: "one" } } },
	{ content: { add: { id: "c2", type: "part-text", text: "two" } } },
	{ content: { add: { id: "c3", type: "part-text", text: "three" } } },
];

// class_for finds nothing registered on this fixture (no "type"/"assign"/"session" on line 1), so it falls to
// plain Item — DeltaHistory defaults to Page in that case, which is what we assert here too.
assert.equal(Item.class_for(lines), Item);

for (const [n, want] of [[1, 0], [2, 1], [3, 2], [4, 3]]){
	const host = Page.replay(lines.slice(0, n));
	assert.equal(host.title, "Fixture page", `line ${n}: title survives from line 1`);
	assert.equal(host.content.length, want, `line ${n}: ${want} card(s)`);
}

console.log("Inspect.test: all assertions pass (replay grows the card count 0→1→2→3 as the slider moves 1→4)");
