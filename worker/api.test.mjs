// node worker/api.test.mjs [base-url]: walks EVERY route in worker/index.js against a running local stage (wrangler dev, the dev login on).
// Asserts who may call what: an anonymous caller is refused every non-public route, a member is refused the admin route, a banned
// user cannot write, a cross-origin mutation and an unlisted host are refused, logout-all revokes a cookie, and a doc's Room carries
// the lock between two sockets. The route list is read from index.js, so a route added without a row here fails this test.
// Start the stage with `node dev.mjs` (or `wrangler dev -c worker/wrangler.jsonc --port N`), then pass its url (default :8787).
import assert from "node:assert/strict";
import http from "node:http";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "http://localhost:8787";
const origin = new URL(base).origin;

// every ROUTES key and its declared action, parsed from the source: the test cannot drift from the table.
const source = readFileSync(new URL("./index.js", import.meta.url), "utf8");
const declared = Object.fromEntries([...source.matchAll(/^\s*"((?:GET|POST|PUT) \/api\/[^"]+)": \["(\w+)"/gm)].map(m => [m[1], m[2]]));

const call = (method, path, { cookie, body, headers = {} } = {}) => fetch(base + path, {
    method, redirect: "manual",
    headers: { ...(cookie ? { cookie } : {}), ...(body ? { "content-type": "application/json" } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
});
async function login(handle) {
    const res = await call("POST", "/api/dev/login", { body: { handle } });
    assert.equal(res.status, 200, `dev login as ${handle}`);
    return { cookie: res.headers.get("set-cookie").split(";")[0], user: (await res.json()).user };
}

const covered = new Set();
const check = async (key, who, want, path, opts = {}) => {
    const [method, route] = key.split(" ");
    const res = await call(method, path || route, { cookie: who?.cookie, ...opts });
    assert.equal(res.status, want, `${key} as ${who?.user?.handle ?? "anonymous"}: wanted ${want}, got ${res.status}`);
    covered.add(key);
    return res;
};

const alice = await login("alice"), carol = await login("carol"), eve = await login("eve");
assert.equal(alice.user.role, "owner");
assert.equal(carol.user.role, "member");

// ── public routes
const listing = (await (await check("GET /api/", null, 200)).json()).endpoints;
for (const [key, action] of Object.entries(declared)) {
    const [method, path] = key.split(" ");
    const row = listing.find(e => e.method === method && e.path === path);
    assert.ok(row, "GET /api/ lists " + key);
    assert.equal(row.action, action, "GET /api/ names who may call " + key);
    assert.ok(row.who, "GET /api/ says who may call " + key);
}
assert.ok(listing.some(e => e.path === "/api/room?url=") && listing.some(e => e.path === "/api/doc/<id>/ws"), "GET /api/ lists the two sockets");
const config = await (await check("GET /api/config", null, 200)).json();
assert.equal(config.dev_login, true);
await check("POST /api/auth/google", null, 400, null, { body: {} });
await check("POST /api/auth/logout", null, 200);
await check("GET /api/pages", null, 400);
await check("GET /api/pages", null, 200, "/api/pages?under=/imagine/cms/d1/");

// ── read routes: anonymous may call them
const anon = await (await check("GET /api/me", null, 200)).json();
assert.equal(anon.anonymous, true);
assert.equal((await (await check("GET /api/me", carol, 200)).json()).handle, carol.user.handle);
await check("GET /api/likes", null, 400);
await check("GET /api/likes", null, 200, "/api/likes?url=/x/");

// ── write routes: anonymous 401, a member passes
const WRITE_BODIES = { "POST /api/docs": { title: "api test" }, "PUT /api/settings": { theme: "dark" }, "PUT /api/pages": { path: "/api-test/", json: {} } };
for (const [key, action] of Object.entries(declared)) {
    if (action !== "write") continue;
    if (key === "POST /api/auth/logout-all") continue;   // exercised below, it revokes carol
    const body = WRITE_BODIES[key];
    const path = key.endsWith("/likes") ? "/api/likes?url=/x/" : null;
    await check(key, null, 401, path, { body });
    const res = await call(key.split(" ")[0], path || key.split(" ")[1], { cookie: carol.cookie, body });
    assert.ok(res.status < 400 || res.status === 400, `${key} as a member reached its handler (${res.status})`);
    assert.notEqual(res.status, 401); assert.notEqual(res.status, 403);
}

// ── admin
await check("GET /api/admin/users", null, 401);
await check("GET /api/admin/users", carol, 403);
const users = (await (await check("GET /api/admin/users", alice, 200)).json()).users;
assert.ok(users.some(u => u.handle === "alice"));

// ── a banned user reads but cannot write
await check("GET /api/me", eve, 200);
await check("POST /api/likes", eve, 403, "/api/likes?url=/x/");

// ── a browser mutation from another origin is refused, even with a good cookie
await check("POST /api/likes", carol, 403, "/api/likes?url=/x/", { headers: { "Sec-Fetch-Site": "cross-site" } });
await check("POST /api/likes", carol, 403, "/api/likes?url=/x/", { headers: { Origin: "https://evil.example" } });

// ── an unlisted Host gets nothing (fail closed): fetch() cannot set Host, so use http.request
const hostStatus = await new Promise(resolve => {
    const u = new URL(base);
    http.get({ host: u.hostname, port: u.port, path: "/api/config", headers: { Host: "preview.example.workers.dev" } }, res => { res.resume(); resolve(res.statusCode); });
});
assert.equal(hostStatus, 503, "an unlisted host is refused");

// ── a forged and a tampered cookie are anonymous
const forged = await (await call("GET", "/api/me", { cookie: "s=" + carol.cookie.slice(2, -3) + "AAA" })).json();
assert.equal(forged.anonymous, true, "a tampered cookie is no cookie");

// ── logout-all revokes every cookie of that user (token_epoch)
const dave = await login("dave"), dave2 = await login("dave");
await check("POST /api/auth/logout-all", dave, 200);
assert.equal((await (await call("GET", "/api/me", { cookie: dave2.cookie })).json()).anonymous, true, "the other device's cookie is revoked");

// ── a document's Room: two sockets, one lock
const doc = (await (await call("POST", "/api/docs", { cookie: alice.cookie, body: { title: "lock test" } })).json()).doc;
const ws_url = base.replace(/^http/, "ws") + `/api/doc/${doc.id}/ws`;
const open = (who, headers = {}) => new Promise((resolve, reject) => {
    const ws = new WebSocket(ws_url, { headers: { cookie: who.cookie, origin, ...headers } });
    ws.frames = [];
    ws.onmessage = e => ws.frames.push(JSON.parse(e.data));
    ws.onopen = () => resolve(ws);
    ws.onerror = () => reject(new Error("socket refused"));
});
const frame = async (ws, pred) => { for (let i = 0; i < 100; i++) { const f = ws.frames.find(pred); if (f) return f; await new Promise(r => setTimeout(r, 50)); } throw new Error("no frame arrived"); };
const a = await open(alice), c = await open(carol);
await assert.rejects(new Promise((resolve, reject) => { const ws = new WebSocket(ws_url); ws.onopen = resolve; ws.onerror = () => reject(new Error("refused")); }), "an anonymous socket is refused");
await assert.rejects(open(carol, { origin: "https://evil.example" }), "a cross-origin socket is refused");
a.send(JSON.stringify({ t: "hello", since: 0 })); c.send(JSON.stringify({ t: "hello", since: 0 }));
assert.equal((await frame(a, f => f.t === "hello")).lock, null);
a.send(JSON.stringify({ t: "lock" }));
assert.equal((await frame(c, f => f.t === "lock")).lock.holder, alice.user.id);
c.send(JSON.stringify({ t: "lines", lines: [{ x: 1 }], sent: 1 }));
assert.equal((await frame(c, f => f.t === "refused")).why, "you do not hold the editing lock");
a.send(JSON.stringify({ t: "lines", lines: [{ x: 2 }], sent: 2 }));
assert.equal((await frame(a, f => f.t === "ack")).seq, 1);
assert.deepEqual((await frame(c, f => f.t === "lines")).lines, [{ x: 2 }]);
a.close();
assert.equal((await frame(c, f => f.t === "lock" && f.lock === null)).lock, null, "the lock drops when the editor leaves");
c.close();
assert.equal((await call("GET", "/api/doc/ffffffff/ws", { cookie: alice.cookie })).status, 404, "a document that does not exist is not opened");
covered.add("room");

// ── every route in the table was walked
const missing = Object.keys(declared).filter(k => !covered.has(k));
assert.deepEqual(missing, [], "routes with no assertion: " + missing.join(", "));
console.log("api.test ok:", Object.keys(declared).length, "routes");
