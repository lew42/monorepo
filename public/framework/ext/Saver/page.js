import { Doc, md, code, div, span, h2, icon } from "/app.js";
import Saver from "./Saver.js";
import MemorySaver from "./MemorySaver.js";

const pause = ms => new Promise(res => setTimeout(res, ms));

// A write that takes 30ms, so "a save during a write" is a real thing to test.
const queued = () => {
	const saver = new MemorySaver();
	const write = saver.write.bind(saver);
	saver.write = item => pause(30).then(() => write(item));
	return saver;
};

async function run(){
	const rows = [];
	const check = (ok, label, detail) => rows.push({ ok, label, detail });

	const saver = new MemorySaver();
	check(await saver.load() === null, "An empty store loads null — a missing document is not an error.");

	const doc = { type: "Doc", id: "a1", data: { title: "Hello" }, items: [{ type: "Text", id: "b2", data: { text: "world" } }] };
	await saver.save(doc);
	check(JSON.stringify(await saver.load()) === JSON.stringify(doc), "save() then load() round-trips the document, nesting included.");
	check(saver.save_count === 1, "One save, one write.", `save_count ${saver.save_count}`);

	const rapid = queued();
	let last;
	for (let n = 1; n <= 50; n++) last = rapid.save({ n });
	await last;
	check(rapid.save_count === 2, "50 rapid saves collapse into two writes — one in flight, one pending.", `save_count ${rapid.save_count}`);
	check((await rapid.load()).n === 50, "The last state wins.");

	const mid = queued();
	mid.save({ n: "first" });
	await pause(10);
	await mid.save({ n: "mid-flight" });
	check(mid.save_count === 2 && (await mid.load()).n === "mid-flight", "A save issued DURING a write lands in the write that follows it.");

	await saver.delete();
	check(await saver.load() === null, "delete() empties the store.");

	return rows;
}

const line = ({ ok, label, detail }) =>
	div.c("flex v-center gap", () => {
		icon(ok ? "check_circle" : "cancel");
		span(label);
		if (detail) span.c("muted", detail);
	}).style({ "--gap": "0.4em", color: ok ? "var(--ok)" : "var(--error)" });

export default new Doc({
	meta: import.meta,
	title: "Saver",
	description: "Where a document goes. Three methods, one write queue, four backends.",
	icon: "save",

	subject: Saver,
	properties: "writing pending",
	methods:    "save load delete drain saving write assign",
	notes:      "backends",
	files:      "Saver.js FileSaver.js LocalStorageSaver.js MemorySaver.js page.js",

	content(){

		code.js(`import MemorySaver from "/framework/ext/Saver/MemorySaver.js";

const saver = new MemorySaver();
await saver.save(doc);              // queued — returns when your state is written
const json = await saver.load();    // the stored JSON, or null`);

		md("Three methods and no state of your own. `save(item)` queues a write, `load()` returns the stored JSON or `null`, `delete()` removes it. An `item` is anything `JSON.stringify` can read — the saver never asks what it is, which is why [core/Item](/framework/core/Item/) can hand one over without either side importing the other.");

		h2("The queue is the whole base class");

		md("[`Saver`](/framework/ext/Saver/api/save/) itself writes nothing. It holds **one write in flight and one pending** ([`writing`](/framework/ext/Saver/api/writing/) / [`pending`](/framework/ext/Saver/api/pending/)), and every save that arrives between them collapses into that pending slot. So a keystroke-per-save UI writes twice, not fifty times — and the save you made *during* a write is never the one that gets dropped. [`drain`](/framework/ext/Saver/api/drain/) is the whole mechanism, in one re-checked `while`.");

		md("These run in your browser right now:");

		// ⚠ The `.then` must return nothing: a returned View gets appended, and
		// `empty()` returns the box itself.
		div.c("flex v gap", $checks => {
			span.c("muted", "running…");
			return run().then(rows => { $checks.empty(() => rows.forEach(row => line(row))); });
		}).style("--gap", "0.3em");

		h2("The four backends");

		md("Each one implements the same three hooks — `load()`, `write(item)`, `delete()` — and inherits the queue above.");

		md("- **`MemorySaver`** — a plain object. Counts writes in `save_count`, which is what the checks above read.\n- **`LocalStorageSaver`** — one key, one document. Guarded on `typeof localStorage`, so importing it headless is safe.\n- **`FileSaver`** — a real `.json` file on disk, over the dev socket.\n- **`Saver`** — the base, whose hooks resolve and do nothing.");

		md("**`FileSaver` only works on localhost** — off localhost, `write()` warns once and resolves `false`; `load()` keeps working everywhere, because a `.json` file is a static asset. The full comparison, the read-only badge every real caller should show, and the one-line idiom `ext/editor`, `ext/Panel` and `dev/DevBar` each repeat to pick a backend: [backends](/framework/ext/Saver/docs/backends/).");

		md("Next: [Item](/framework/core/Item/) — the document this queue is meant to sit under.");

		md.details(import.meta, "readme.md", "Design record — why the queue is the base class");
	}
});
