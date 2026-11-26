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
const declared = Object.fromEntries([...source.matchAll(/^\s*"((?:GET|POST|PUT|DELETE) \/api\/[^"]+)": \["(\w+)"/gm)].map(m => [m[1], m[2]]));

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
    if (key === "POST /api/auth/logout-all" || key === "DELETE /api/me") continue;   // exercised below: they revoke or delete carol
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
// Behind the Servex proxy (a *.localhost base) the proxy routes by Host, so a forged Host is turned away there with a 404 before the Worker sees it.
if (/\.localhost$/.test(new URL(base).hostname)) assert.notEqual(hostStatus, 200, "an unlisted host is not served");
else assert.equal(hostStatus, 503, "an unlisted host is refused");

// ── a forged and a tampered cookie are anonymous
const forged = await (await call("GET", "/api/me", { cookie: "s=" + carol.cookie.slice(2, -3) + "AAA" })).json();
assert.equal(forged.anonymous, true, "a tampered cookie is no cookie");

// ── logout-all revokes every cookie of that user (token_epoch)
const dave = await login("dave"), dave2 = await login("dave");
await check("POST /api/auth/logout-all", dave, 200);
assert.equal((await (await call("GET", "/api/me", { cookie: dave2.cookie })).json()).anonymous, true, "the other device's cookie is revoked");

// ── sessions: /api/me names the session, logout ends only that one, and the ended cookie reads as signed out
const sess = await login("dave"), sess2 = await login("dave");
const me1 = await (await call("GET", "/api/me", { cookie: sess.cookie })).json();
assert.match(me1.session_id, /^[0-9a-f]{32}$/, "/api/me carries the session id");
assert.equal(me1.push, false, "no push subscription yet");
assert.notEqual(me1.session_id, (await (await call("GET", "/api/me", { cookie: sess2.cookie })).json()).session_id, "two logins, two sessions");
await check("POST /api/auth/logout", sess, 200);
assert.equal((await (await call("GET", "/api/me", { cookie: sess.cookie })).json()).anonymous, true, "a logged-out cookie is signed out");
assert.equal((await (await call("GET", "/api/me", { cookie: sess2.cookie })).json()).handle, "dave", "the other session lives");

// ── the test sign-in does not exist here (no TEST_LOGIN_KEY on the local stage)
await check("POST /api/auth/test", null, 404, null, { body: { key: "anything" } });
await check("POST /api/auth/test", null, 404, null, { body: {} });

// ── the ad funnel (worker/join.js): a bad event is refused, a good one recorded, stats is admin-only
await check("POST /api/join/event", null, 400, null, { body: { v: "x".repeat(16), e: "view" } });               // not 16 hex chars
await check("POST /api/join/event", null, 400, null, { body: { v: "0123456789abcdef", e: "not-a-real-event" } });
await check("POST /api/join/event", null, 204, null, { body: { v: "0123456789abcdef", e: "view", os: "desktop", src: "api-test" } });
await check("GET /api/join/stats", null, 401);
await check("GET /api/join/stats", carol, 403);
const funnel_stats = await (await check("GET /api/join/stats", alice, 200)).json();
assert.ok(funnel_stats.funnel.all.view >= 1, "the recorded view shows up in the all-time funnel");
assert.ok(funnel_stats.by_source.all.some(r => r.source === "api-test" && r.event === "view"), "the recorded view shows up split by utm_source");

// ── push: subscribe validates, /api/me shows it, test sends (or says it is not configured), unsubscribe removes
const keys = { p256dh: Buffer.from([4, ...crypto.getRandomValues(new Uint8Array(64))]).toString("base64url"), auth: Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64url") };
const endpoint = "https://fcm.googleapis.com/fcm/send/api-test-" + Date.now();
await check("POST /api/push/subscribe", null, 401, null, { body: { endpoint, keys } });
await check("POST /api/push/subscribe", sess2, 400, null, { body: { endpoint: "http://fcm.googleapis.com/x", keys } });
await check("POST /api/push/subscribe", sess2, 400, null, { body: { endpoint: "https://internal.example/x", keys } });
await check("POST /api/push/subscribe", sess2, 400, null, { body: { endpoint, keys: { ...keys, auth: "short" } } });
await check("POST /api/push/subscribe", sess2, 200, null, { body: { endpoint, keys } });
await check("POST /api/push/subscribe", sess2, 200, null, { body: { endpoint, keys } });   // the same endpoint again is an update, not a second row
assert.equal((await (await call("GET", "/api/me", { cookie: sess2.cookie })).json()).push, true, "/api/me shows the subscription");
const configured = Boolean((await (await call("GET", "/api/config")).json()).vapid_public);
const pushed = await check("POST /api/push/test", sess2, configured ? 200 : 503);
if (configured) assert.equal((await pushed.json()).results.length, 1, "one subscription, one push attempted");
const gone = await (await check("DELETE /api/push/subscribe", sess2, 200, null, { body: { endpoint } })).json();
assert.equal(gone.removed, 1); assert.equal(gone.push, false);

// ── DELETE /api/me wipes the account and its sessions; the cookie is signed out afterwards
await check("DELETE /api/me", null, 401);
// zed is seeded to be deleted once; a second run finds him gone until the dev script re-seeds
if ((await call("POST", "/api/dev/login", { body: { handle: "zed" } })).status === 404) { console.log("zed was deleted by an earlier run; restart node dev.mjs to re-seed him"); covered.add("DELETE /api/me"); }
else {
    const zed = await login("zed"), zed2 = await login("zed");
    await call("POST", "/api/push/subscribe", { cookie: zed.cookie, body: { endpoint: endpoint + "-zed", keys } });
    const wiped = await (await check("DELETE /api/me", zed, 200)).json();
    assert.equal(wiped.deleted, true); assert.equal(wiped.handle, "zed");
    for (const who of [zed, zed2]) assert.equal((await (await call("GET", "/api/me", { cookie: who.cookie })).json()).anonymous, true, "a deleted account's cookies are signed out");
    await check("POST /api/push/subscribe", zed2, 401, null, { body: { endpoint, keys } });
}

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
