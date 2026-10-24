// The real Page in node. Plain node: `node public/framework/core/Page/Page.test.mjs`
//   1. a page.jsonl replays through the real Page: typed parts become their classes
//   2. an unknown part type is reported (and kept as a plain Item)
//   3. the item tool on a page refuses a bad line BEFORE it is written
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
register(pathToFileURL(path.join(ROOT, "Servex", "agents", "site-hooks.mjs")).href);   // site-absolute imports ("/framework/…") map to public/

const { default: Page } = await import("./Page.class.js");
const { default: Item } = await import("../Item/Item.js");
const { PART_TYPES } = await import("./parts/kinds.js");
const { page_tools } = await import(pathToFileURL(path.join(ROOT, "Servex", "agents", "page_tools.js")).href);

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const parse = text => text.split("\n").filter(Boolean).map(l => JSON.parse(l));
const names = list => [...list].map(x => `${x.constructor.name}:${x.id}`);

// ---- 1. replay: the parts page, its own page.jsonl ----
{
	const page = Page.replay(parse(fs.readFileSync(path.join(HERE, "parts", "page.jsonl"), "utf8")));
	ok(page instanceof Page && page.get_one("title") === "Parts", "Page.replay builds a Page from line 1");
	const kinds = [...page.content].map(x => x.constructor.name);
	ok(kinds.includes("PageHeading") && kinds.includes("PageText") && kinds.includes("PageCard"), "typed parts become their classes: " + kinds.join(","));
	ok(PART_TYPES.every(t => Item.types.has(t)), "every name in PART_TYPES is registered with Item");
	ok(Page.types === Item.types, "the node Page and the tool share one type registry");
}

// ---- 2. replay: an unknown type is reported, never thrown ----
{
	const warned = [], was = console.warn;
	console.warn = (...a) => warned.push(a.join(" "));
	let page;
	try {
		page = Page.replay([{ title: "T" }, { content: { add: { id: "x", type: "part-nope", text: "?" } } }, { content: { add: { id: "y", type: "part-text", text: "ok" } } }]);
	} finally { console.warn = was; }
	ok(warned.some(w => /unknown type "part-nope"/.test(w)), "an unknown part type is reported: " + warned.join(" | "));
	ok(names(page.content).join() === "Item:x,PageText:y", "the unknown part is kept as a plain Item, the known one is its class");
}

// ---- 2b. a `file` line in a replay records itself and imports nothing ----
{
	const page = Page.replay([{ title: "T" }, { file: "kid/page.jsonl" }, { file: "Thing.js" }]);
	ok(page.listed?.has("kid"), "a child file line is listed in node");
}

// ---- 3. the item tool refuses a bad page line before it is written ----
{
	const REL = "framework/core/Page/.page-test-" + process.pid;
	const DIR = path.join(ROOT, "public", REL), FILE = path.join(DIR, "page.jsonl"), URL = "/" + REL + "/";
	const tools = Object.fromEntries(page_tools().map(t => [t.name, t]));
	const call = async (name, args) => JSON.parse(await tools[name].handler(args, { caller: "page-test" }));
	const size = () => fs.statSync(FILE).size;
	fs.mkdirSync(DIR, { recursive: true });
	fs.writeFileSync(FILE, JSON.stringify({ title: "Scratch" }) + "\n");
	try {
		const before = size();
		let r = await call("item", { path: URL, delta: { content: { add: { type: "part-nope", text: "x" } } } });
		ok(r.ok === false && /unknown part type "part-nope"/.test(r.why) && /part-heading/.test(r.why) && /Nothing was written/.test(r.why) && size() === before, "item: an unknown part type is refused, nothing written");
		r = await call("page_add", { path: URL, item: { type: "part-nope" } });
		ok(r.ok === false && size() === before, "page_add: an unknown part type is refused, nothing written");
		r = await call("page_call", { path: URL, target: ["content"], method: "add", args: { type: "part-nope" } });
		ok(r.ok === false && size() === before, "page_call: an unknown part type is refused, nothing written");
		r = await call("item", { path: URL, delta: { _secret: 1 } });
		ok(r.ok === false && /private/.test(r.why) && size() === before, "item: a private key is refused, nothing written");
		r = await call("item", { path: URL, delta: { content: { add: { id: "n", _hidden: true, type: "part-text" } } } });
		ok(r.ok === false && /_hidden/.test(r.why) && size() === before, "item: a private key nested in an added part is refused");

		r = await call("item", { path: URL, delta: { content: { add: { id: "h", type: "part-heading", text: "Hello" } } } });
		ok(r.ok && size() > before, "item: a known part type is written");
		r = await call("page_add", { path: URL, item: { type: "card", title: "plain data typed card" } });
		ok(r.ok, "a plain (non part-) type is still written: pages hold card/note/request/task data");
		const page = Page.replay(parse(fs.readFileSync(FILE, "utf8")));
		ok(names(page.content)[0] === "PageHeading:h", "what the tool wrote replays as the real class");
	} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
}

console.log(`Page: ${checks} checks passed`);
