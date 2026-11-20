// node Servex/FalUsage.test.mjs — key file handling, the billing-events call (paging, totals, window), error messages, and that the key never leaks
import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import FalKey from "./FalKey.js";
import FalUsage from "./FalUsage.js";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fal-test-"));
FalKey.FILE = path.join(dir, "fal.key");
const SECRET = "00000000-1111-2222-3333-444444444444:" + "ab".repeat(16);
const tools = Object.fromEntries(FalUsage.tools().map(t => [t.name, t])), tool = tools.fal_usage;
const run = async (t, a) => { const r = await t.handler(a); const o = JSON.parse(r.content[0].text); assert.equal(!!r.isError, !o.ok, "isError mirrors ok"); return o; };
const call = a => run(tool, a);

// key file: missing, empty, BOM + newline, two lines
assert.throws(() => FalKey.read(), e => e.message.includes(FalKey.FILE) && /does not exist/.test(e.message));
fs.writeFileSync(FalKey.FILE, "");
assert.throws(() => FalKey.read(), /is empty/);
fs.writeFileSync(FalKey.FILE, "﻿" + SECRET + "\r\n");
assert.equal(FalKey.read(), SECRET);
fs.writeFileSync(FalKey.FILE, "a\nb");
assert.throws(() => FalKey.read(), /one key/);
fs.writeFileSync(FalKey.FILE, SECRET);

// window: hours, request_id lookup, bad dates
const now = Date.parse("2026-11-20T06:00:00Z");
assert.equal(FalUsage.window({}, now).start, "2026-11-20T00:00:00.000Z");
assert.equal(FalUsage.window({ hours: 2 }, now).start, "2026-11-20T04:00:00.000Z");
assert.equal(FalUsage.window({ request_id: "x" }, now).start, "2026-10-21T06:00:00.000Z");
assert.throws(() => FalUsage.window({ start: "nonsense" }), /not a date/);
assert.throws(() => FalUsage.list(Array(51).fill("a"), "request_id"), /at most 50/);

// fake Fal
const seen = [];
let mode = "ok";
const ev = (id, ep, ts, cost) => ({ request_id: id, endpoint_id: ep, timestamp: ts, quantity: 5, unit: "second", unit_price: cost / 5, cost_subtotal: cost, cost_discount: 0, cost_total: cost, cost_estimate_nano_usd: cost * 1e9 });
const server = http.createServer((q, r) => {
	seen.push({ url: q.url, auth: q.headers.authorization });
	const u = new URL(q.url, "http://x");
	r.setHeader("content-type", "application/json");
	if (mode === "401") return r.writeHead(401).end(JSON.stringify({ error: { type: "authorization_error", message: "bad key" } }));
	if (mode === "403") return r.writeHead(403).end(JSON.stringify({ error: { type: "authorization_error", message: "missing scope" } }));
	if (u.pathname.endsWith("/pricing")) return r.end(JSON.stringify({ has_more: false, prices: u.searchParams.getAll("endpoint_id").filter(id => id !== "no/such").map(id => ({ endpoint_id: id, unit_price: 0.05, unit: "seconds", currency: "USD" })) }));
	if (u.pathname.endsWith("/pricing/estimate")){
		let raw = ""; q.on("data", c => raw += c); q.on("end", () => { const b = JSON.parse(raw), [[, q1]] = Object.entries(b.endpoints); seen.at(-1).post = b;
			r.end(JSON.stringify({ estimate_type: b.estimate_type, currency: "USD", total_cost: b.estimate_type === "unit_price" ? q1.unit_quantity * 0.05 : q1.call_quantity * 2.688 })); });
		return;
	}
	if (u.pathname.endsWith("/usage")) return r.end(JSON.stringify({ has_more: false, summary: [{ endpoint_id: "a/b", unit: "second", quantity: 10, unit_price: 0.14, cost_total: 1.4, currency: "USD" }] }));
	if (!u.searchParams.get("cursor")) return r.end(JSON.stringify({ has_more: true, next_cursor: "p2", billing_events: [ev("r2", "a/b", "2026-11-20T03:41:00Z", 0.7), ev("r1", "c/d", "2026-11-20T03:40:00Z", 0.225)] }));
	r.end(JSON.stringify({ has_more: false, next_cursor: null, billing_events: [ev("r3", "a/b", "2026-11-20T03:42:00Z", 0.7)] }));
}).listen(0, "127.0.0.1");
await new Promise(r => server.once("listening", r));
FalUsage.BASE = `http://127.0.0.1:${server.address().port}/v1/models`;

let out = await call({ hours: 3, endpoint_id: ["a/b", "c/d"] });
assert.equal(out.ok, true); assert.equal(out.count, 3); assert.equal(out.total_usd, 1.625);
assert.deepEqual(out.lines.map(l => l.request_id), ["r1", "r2", "r3"], "sorted by time, both pages followed");
assert.deepEqual(out.by_endpoint, [{ endpoint: "a/b", requests: 2, cost_usd: 1.4 }, { endpoint: "c/d", requests: 1, cost_usd: 0.225 }]);
assert.deepEqual(Object.keys(out.lines[0]), ["time", "request_id", "endpoint", "unit", "quantity", "unit_price", "cost_usd"]);
assert.equal(seen[0].auth, "Key " + SECRET, "the key goes to Fal as a Key header");
const first = new URL(seen[0].url, "http://x");
assert.deepEqual(first.searchParams.getAll("endpoint_id"), ["a/b", "c/d"]);
assert.equal(seen.length, 2, "two pages, two GETs");

out = await call({ max_events: 2 });
assert.equal(out.count, 2); assert.ok(out.truncated, "capped rows say so");

out = await call({ view: "summary", hours: 1 });
assert.equal(out.view, "summary"); assert.equal(out.total_usd, 1.4); assert.equal(out.lines[0].unit_price, 0.14);

// fal_estimate: base price, historical estimate, unit estimate; bad input and unknown endpoint are readable
const est = a => run(tools.fal_estimate, a);
seen.length = 0;
out = await est({ endpoint_id: "m/x", unit_quantity: 16, call_quantity: 2 });
assert.equal(out.ok, true); assert.equal(out.lines.length, 1);
assert.deepEqual(out.lines[0], { endpoint: "m/x", unit: "seconds", unit_price: 0.05, model_page: "https://fal.ai/models/m/x", call_quantity: 2, typical_cost_usd: 5.376, unit_quantity: 16, unit_cost_usd: 0.8 });
assert.deepEqual(seen.filter(s => s.post).map(s => [s.post.estimate_type, s.auth]), [["historical_api_price", "Key " + SECRET], ["unit_price", "Key " + SECRET]], "estimates are POSTs with the key header");
assert.match(out.note, /BASE rate/);
out = await est({ endpoint_id: "m/x" }); assert.equal(out.lines[0].unit_cost_usd, undefined, "no unit_quantity, no unit estimate");
assert.equal((await est({})).ok, false);
assert.match((await est({ endpoint_id: "no/such" })).error, /no price for no\/such/);
assert.match((await est({ endpoint_id: "m/x", unit_quantity: 0 })).error, /unit_quantity/);
assert.match((await est({ endpoint_id: "m/x", call_quantity: 1.5 })).error, /whole number/);

// errors are readable and never carry the key
mode = "401"; out = await call({});
assert.equal(out.ok, false); assert.match(out.error, /rejected the key/);
mode = "403"; out = await call({});
assert.match(out.error, /lacks billing scope.*billing:usage:read/);
fs.rmSync(FalKey.FILE);
out = await call({});
assert.match(out.error, /does not exist/); assert.ok(out.error.includes(FalKey.FILE));
fs.writeFileSync(FalKey.FILE, SECRET);
for (const s of [JSON.stringify(out), tool.description, JSON.stringify(tool.inputSchema)]) assert.ok(!s.includes(SECRET), "the key never appears in a result");

server.close(); fs.rmSync(dir, { recursive: true, force: true });
console.log("FalUsage.test.mjs ok");
