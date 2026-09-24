/* Runs every Cards method against a scratch root and a fake agent host.
 * `node Servex/cards/test.mjs` — prints one line per check, exits 1 on any failure. */
import fs from "fs";
import os from "os";
import path from "path";
import express from "express";
import Cards from "./Cards.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "cards-test-"));
const sends = [];
const agents = {
	live: new Map([
		["assistant-desk", { id: "assistant-desk", role: "assistant", state: "idle" }],
		["minion-builder", { id: "minion-builder", role: "minion", state: "working" }],
		["mastermind-gone", { id: "mastermind-gone", role: "mastermind", state: "stopped" }]
	]),
	send(id, text, note){ sends.push({ id, text, note }); }
};
const cards = new Cards({ root, agents });

let failed = 0;
const check = (name, ok, detail) => {
	console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok || detail === undefined ? "" : "  — " + JSON.stringify(detail)}`);
	if (!ok) failed++;
};
const lines = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

// create in today's folder, and the year/month/day index pages
const day = cards.day_id();
const a = await cards.create({ title: "Fix the Sidebar, please!", type: "question", by: "owner", tags: ["site"] });
check("create → today's folder", a.ok && a.id === `${day}/fix-the-sidebar-please`, a);
check("create → url and path", a.url === `/framework/ai/${a.id}/` && a.path === path.join(root, ...a.id.split("/"), "page.jsonl"), a);
const [y, m] = day.split("/");
check("year page", lines(path.join(root, y, "page.jsonl"))[0].title === y);
check("month page", /^[A-Z][a-z]+ \d{4}$/.test(lines(path.join(root, y, m, "page.jsonl"))[0].title));
check("day page", /^[A-Z][a-z]+day \d{1,2} [A-Z][a-z]+$/.test(lines(cards.file(day))[0].title), lines(cards.file(day))[0]);
check("year lists month, month lists day", lines(path.join(root, y, "page.jsonl"))[1]?.file === `${m}/page.jsonl`
	&& lines(path.join(root, y, m, "page.jsonl"))[1]?.file === `${day.split("/")[2]}/page.jsonl`);
check("day lists the card", lines(cards.file(day)).some(l => l.file === "fix-the-sidebar-please/page.jsonl"));
const head = lines(a.path)[0];
check("line 1 is the constructor", head.class === "/framework/ai2/Card.js" && head.title === "Fix the Sidebar, please!"
	&& head.type === "question" && head.id === a.id && head.by === "owner" && head.tags[0] === "site" && /^\d{4}-\d\d-\d\dT/.test(head.created), head);

// refusals never throw
check("no title refused", (await cards.create({ title: "  " })).ok === false);
check("unknown parent refused", (await cards.create({ parent: "2026/01/01/nope", title: "x" })).ok === false);
check("traversal parent refused", (await cards.create({ parent: "../../etc", title: "x" })).ok === false);
check("append to unknown card refused", (await cards.append("2026/01/01/nope", { status: "done" })).ok === false);

// a sub-card three deep, and "today" as an explicit parent
const b = await cards.create({ parent: a.id, title: "Sub one" });
const c = await cards.create({ parent: b.id, title: "Sub two" });
const d = await cards.create({ parent: c.id, title: "Sub three" });
check("sub-card three deep", d.ok && d.id === `${a.id}/sub-one/sub-two/sub-three`, d);
check("parent lists its child", (await cards.fold(c.id)).children[0] === d.id);
check("parent 'today'", (await cards.create({ parent: "today", title: "Another" })).id === `${day}/another`);

// slug collision, including two at once, and a long title
const s1 = await cards.create({ title: "Same name" });
const [s2, s3] = await Promise.all([cards.create({ title: "Same name" }), cards.create({ title: "Same name" })]);
check("slug collision → -2, -3", [s1, s2, s3].map(x => x.id.split("/").pop()).sort().join() === "same-name,same-name-2,same-name-3", [s1.id, s2.id, s3.id]);
const long = await cards.create({ title: "A very long title that keeps on going well past the forty character limit" });
check("slug ≤ 40 chars", long.id.split("/").pop().length <= 40, long.id);

// type change, tags, status — the latest line wins
await cards.append(a.id, { type: "request" });
await cards.append(a.id, { tags: ["site", "sidebar"] });
await cards.append(a.id, { status: "done" });
const fa = await cards.fold(a.id);
check("type change: latest wins", fa.type === "request", fa.type);
check("tags: latest wins", fa.tags.join() === "site,sidebar");
check("status", fa.status === "done");

// messages get `at`
const msg = await cards.append(b.id, { message: { by: "assistant-desk", text: "On it.", kind: "reply" } });
check("message stamped with at", /^\d{4}-/.test(msg.line.message.at), msg.line);

// two appends fired at once never interleave
const burst = Array.from({ length: 50 }, (_, i) => cards.append(c.id, { message: { by: "x", text: "line " + i + " " + "z".repeat(2000), kind: "update" } }));
await Promise.all(burst);
const cl = lines(cards.file(c.id));
check("50 concurrent appends: every line whole, in order", cl.filter(l => l.message).map(l => l.message.text.split(" ")[1]).join() === Array.from({ length: 50 }, (_, i) => i).join());

// read and fold
const rb = await cards.read(b.id);
check("read → the lines", rb.length === 3 && rb[0].class && rb[2].message.text === "On it.", rb.length);

// legacy ids
await cards.append(b.id, { legacy: "topic-old-sidebar" });
check("resolve legacy id", cards.resolve("topic-old-sidebar") === cards.folder(b.id));
check("append by legacy id", (await cards.append("topic-old-sidebar", { status: "open" })).id === b.id);
check("create under a legacy parent", (await cards.create({ parent: "topic-old-sidebar", title: "Via legacy" })).id === `${b.id}/via-legacy`);
const fresh = new Cards({ root, agents });
check("legacy map rebuilt by walking", fresh.resolve("topic-old-sidebar") === cards.folder(b.id));
check("resolve unknown → null", cards.resolve("nothing-here") === null);

// list views
const all = await cards.list({ view: "all" });
check("list all walks every depth", all.some(x => x.id === d.id) && all.length === 10, all.length);
check("list skips index pages", !all.some(x => x.id === day || x.id === y));
check("list open skips done", !(await cards.list({ view: "open" })).some(x => x.id === a.id));
check("list today", (await cards.list({ view: "today" })).length === 10);
check("list by tag", (await cards.list({ tag: "sidebar" })).map(x => x.id).join() === a.id);
check("list by a tag as the view", (await cards.list({ view: "sidebar" })).length === 1);
check("summary shape", Object.keys(all[0]).join() === "id,title,type,status,tags,created,last", Object.keys(all[0]));

// attach, and prompts forwarded — never to a minion, a stopped agent or a detached one
await cards.attach(b.id, "assistant-desk");
await cards.attach(b.id, "minion-builder");
await cards.attach(b.id, "mastermind-gone");
await cards.attach(b.id, "assistant-gone-away");
check("attached()", (await cards.attached(b.id)).length === 4);
const p = await cards.append(b.id, { prompt: { raw: "um make the sidebar wider", via: "whisper", url: "/framework/ai2/" } });
check("prompt: id, at, by, on, text filled", /^p-[a-z0-9]+$/.test(p.line.prompt.id) && p.line.prompt.at && p.line.prompt.by === "owner"
	&& p.line.prompt.on === b.id && p.line.prompt.text === "um make the sidebar wider" && p.fresh, p.line.prompt);
check("prompt ref", p.ref === `${b.id}#${p.line.prompt.id}`);
const sent = await cards.forward(b.id, p.line.prompt);
check("forward skips minion, stopped and missing agents", sent.join() === "assistant-desk" && sends.length === 1 && sends[0].note.from === "owner", sent);
const merge = await cards.append(b.id, { prompt: { id: p.line.prompt.id, text: "Make the sidebar wider." } });
check("same prompt id = a merge, not a new prompt", merge.ok && !merge.fresh && !merge.line.prompt.at);
const fb = await cards.fold(b.id);
check("fold merges prompts by id", fb.prompts.length === 1 && fb.prompts[0].text === "Make the sidebar wider." && fb.prompts[0].raw === "um make the sidebar wider" && fb.prompts[0].via === "whisper", fb.prompts);
await cards.append(d.id, { cites: [p.ref] });
await cards.append(d.id, { cites: p.ref });
check("cites collect, no duplicates", (await cards.fold(d.id)).cites.join() === p.ref);
await cards.append(b.id, { detach: "assistant-desk" });
check("detach", !(await cards.attached(b.id)).includes("assistant-desk"));
check("forward after detach reaches no one", (await cards.forward(b.id, { id: "p-x", text: "hi" })).length === 0);

// the MCP tools
const tools = Object.fromEntries(cards.tools().map(t => [t.name, t]));
check("four tools", Object.keys(tools).join() === "create_card,read_card,attach_card,list_cards");
check("create_card says it is the only way", /ONLY way/.test(tools.create_card.description));
const made = JSON.parse(await tools.create_card.handler({ parent: d.id, title: "From a tool", type: "note" }));
check("create_card makes a sub-card", made.ok && made.id === `${d.id}/from-a-tool`, made);
check("read_card returns the whole log", (await tools.read_card.handler({ card: b.id })).split("\n").length === 1 + (await cards.read(b.id)).length);
sends.length = 0;
const att = JSON.parse(await tools.attach_card.handler({ card: made.id, agent: "assistant-desk" }));
check("attach_card appends and sends the whole log", att.sent && sends[0]?.id === "assistant-desk" && sends[0].text.includes('"From a tool"'), att);
check("list_cards", JSON.parse(await tools.list_cards.handler({ view: "all" })).length === 11);

// the HTTP routes, on a real port
const app = express();
app.use(cards.routes(express.Router()));
const server = await new Promise(r => { const s = app.listen(0, "127.0.0.1", () => r(s)); });
const at = `http://127.0.0.1:${server.address().port}`;
const post = (u, body) => fetch(at + u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json().then(j => ({ status: r.status, j })));
const h1 = await post("/card/create", { parent: a.id, title: "Over HTTP" });
check("POST /card/create", h1.status === 200 && h1.j.id === `${a.id}/over-http`, h1);
await cards.attach(h1.j.id, "assistant-desk");
sends.length = 0;
const h2 = await post("/card/append?id=" + encodeURIComponent(h1.j.id), { prompt: { raw: "hello from the owner", via: "typed" } });
check("POST /card/append a prompt stamps and forwards", h2.status === 200 && h2.j.line.prompt.id && h2.j.forwarded?.join() === "assistant-desk" && sends.length === 1, h2.j);
const h3 = await post("/card/append?id=" + encodeURIComponent(h1.j.id), { message: { by: "owner", text: "not a prompt" } });
check("a plain message is not forwarded", h3.status === 200 && !h3.j.forwarded && sends.length === 1);
check("POST /card/create refuses with 400", (await post("/card/create", {})).status === 400);
const g1 = await fetch(`${at}/card?id=${encodeURIComponent(h1.j.id)}`).then(r => r.json());
check("GET /card folds", g1.title === "Over HTTP" && g1.prompts.length === 1);
check("GET /card unknown → 404", (await fetch(`${at}/card?id=nope`)).status === 404);
check("GET /cards?view=all", (await fetch(`${at}/cards?view=all`).then(r => r.json())).length === 12);
await new Promise(r => server.close(r));

fs.rmSync(root, { recursive: true, force: true });
console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exitCode = failed ? 1 : 0;
