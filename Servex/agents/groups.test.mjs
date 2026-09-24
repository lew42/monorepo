// The lobby files words into groups. Plain node: `node Servex/agents/groups.test.mjs`
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Assistant from "./Assistant.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(HERE, "groups.fixture.json");
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

const make = (extra = {}) => {
	const appended = [], created = [], logged = [], tools = {};
	const servex = {
		cards: {
			append: async (card, obj) => { appended.push({ card, obj }); return { ok: true }; },
			create: async o => { created.push(o); return { ok: true, id: `2026/09/24/${o.title.toLowerCase().replace(/\W+/g, "-")}` }; }
		},
		log: { append: async (name, entry) => { logged.push({ name, entry }); return { ok: true, entry }; } },
		mcp: { tool: t => { tools[t.name] = t; } },
		say(){}
	};
	const a = new Assistant({ servex, groups_file: fixture, ...extra });
	a.tool();
	return { a, appended, created, logged, tools };
};
const call = async (t, args) => JSON.parse(await t.handler(args));

// filing to a known group
{
	const { a, appended, tools } = make();
	ok(tools.file_to_group, "file_to_group is registered");
	a.prompt = { text: "the layers feel wrong", raw: "the layers feel wrong um" };
	const out = await call(tools.file_to_group, { group: "servex" });
	ok(out.ok && out.card === "2026/09/24/servex", "known group returns its card");
	assert.deepStrictEqual(appended, [{ card: "2026/09/24/servex", obj: { prompt: { text: "the layers feel wrong", raw: "the layers feel wrong um", via: "lobby" } } }]);
	checks++;
}

// unknown group with name and about
{
	const { a, appended, created, logged, tools } = make();
	a.prompt = { text: "hello", raw: "hello" };
	const out = await call(tools.file_to_group, { group: "kitchen", name: "Kitchen", about: "Recipes." });
	ok(out.ok && out.card === "2026/09/24/kitchen", "new group card is made");
	ok(created.length === 1 && created[0].type === "group" && created[0].title === "Kitchen", "created as a group");
	ok(appended.length === 1 && appended[0].card === out.card, "prompt filed on the new card");
	ok(logged.some(l => l.name === "servex" && l.entry.type === "new-group" && l.entry.id === "kitchen" && l.entry.card === out.card), "new-group logged");
}

// unknown group without name/about is refused
{
	const { a, appended, tools } = make();
	a.prompt = { text: "x", raw: "x" };
	const out = await call(tools.file_to_group, { group: "nope" });
	ok(!out.ok && appended.length === 0, "unknown group with no name is refused");
}

// no current prompt
{
	const { appended, tools } = make();
	const out = await call(tools.file_to_group, { group: "servex" });
	ok(!out.ok && appended.length === 0, "no current prompt is refused");
}

// brief lists every group; a bad file is an empty list
{
	const { a } = make();
	const text = a.brief();
	for (const id of ["system-design", "servex", "ai-dashboard", "pages-markdown", "cards-content", "layout-columns", "audits"])
		ok(text.includes(`- ${id}: `), `brief lists ${id}`);
	const bad = make({ groups_file: path.join(HERE, "no-such.json") }).a;
	ok(bad.groups().length === 0, "unreadable groups.json is []");
}

console.log(`groups: ${checks} checks passed`);
