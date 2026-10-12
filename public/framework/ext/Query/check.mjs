// node check.mjs - assertions for Query
import assert from "node:assert/strict";
import Query from "./Query.js";

const items = [
	{ id: "a", title: "Fix Sessions", usd: 1.5, tokens: 10, day: "2026-10-01", state: "idle" },
	{ id: "b", title: "grid paging", usd: 3, tokens: 20, day: "2026-10-05", state: "active" },
	{ id: "c", title: null, usd: 0.5, tokens: 5, day: "2026-10-09", state: "idle", agent: "SESSIONS-bot" },
	{ id: "d", title: "other", usd: 2, tokens: null, day: "2026-10-12", state: "idle" },
];
const run = spec => new Query(spec).run(items);
const ids = r => r.rows.map(x => x.id).join("");

assert.equal(run({}).total, 4);
assert.equal(ids(run({ where: [{ field: "state", op: "eq", value: "active" }] })), "b");
assert.equal(ids(run({ where: [{ field: "id", op: "in", value: ["a", "d"] }] })), "ad");
assert.equal(ids(run({ where: [{ field: "day", op: "gte", value: "2026-10-05" }, { field: "day", op: "lte", value: "2026-10-09" }] })), "bc");
assert.equal(ids(run({ where: [{ field: "title", op: "contains", value: "SESSIONS" }] })), "a");
assert.equal(ids(run({ where: [{ fields: ["title", "agent"], op: "contains", value: "sessions" }] })), "ac");
assert.equal(ids(run({ sort: { by: "usd", dir: "desc" } })), "bdac");
assert.equal(ids(run({ sort: { by: "tokens", dir: "desc" } })), "bac" + "d");   // null last
assert.equal(ids(run({ sort: { by: "tokens", dir: "asc" } })), "cabd");         // null last
assert.deepEqual(run({ sum: ["usd", "tokens"] }).totals, { usd: 7, tokens: 35 });
const page = run({ sort: { by: "usd", dir: "desc" }, offset: 1, limit: 2, sum: ["usd"] });
assert.equal(ids(page), "da"); assert.equal(page.total, 4); assert.equal(page.totals.usd, 7); assert.equal(page.offset, 1);   // totals cover ALL matches, not the page
assert.equal(run({ where: [{ field: "day", op: "gte", value: "2027" }] }).total, 0);
assert.throws(() => new Query({ where: [{ field: "x", op: "nope" }] }));
console.log("Query: all assertions passed");
