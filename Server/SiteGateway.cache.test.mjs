// Proof that a stale HTTP cache heals on the next page load through the gateway (the phone's old Sheet.js, 2026-11-01).
// A fake site serves a page that imports a.js, which imports b.js (nested, no query strings). Step 1 caches both
// for a day (as Chrome did by heuristic), then the site changes them. Step 2 shows the stale copies are still served
// with no request. Step 3 is a browser whose clear-cookie is old (the phone), in a new tab: it gets Clear-Site-Data and the new files.
// Step 4: the next load sends no second clear, and the site cookie survived.
// Steps 6-7: the self-heal. A page served with max-age sits in the cache; a deploy changes the version and the files; opening the
// cached page runs the old inline script, which asks /__version, refetches its own files and reloads once (6: the clear-cookie is
// already current, so only the refetch can heal; 7: the cookie is old, so /__version may clear too). The healed line reaches the Whisper log.
//     node Server/SiteGateway.cache.test.mjs
import http from "node:http";
import assert from "node:assert/strict";
import SiteGateway from "./SiteGateway.mjs";
import Browser from "./Browser.mjs";

let ver = 1, cache = "max-age=86400", hits = [], statuses = [], dep = "v1";
const site = http.createServer((req, res) => {
	hits.push(req.url);
	if (req.url === "/") res.on("finish", () => statuses.push(res.statusCode));
	if (/^\/c\d$/.test(req.url)) return res.writeHead(200, { "content-type": "text/html", "cache-control": "max-age=86400" }).end(`<!doctype html><html><head><title>c</title></head><script type="module" src="/a.js"></script>`);
	if (req.url === "/framework/audio/Whisper/WhisperLog.js") return res.writeHead(200, { "content-type": "text/javascript", "cache-control": "no-cache" }).end(`export default { event: (...a) => (globalThis.logged ??= []).push(a) };`);
	if (req.url === "/"){   // like the real site (express.static, compress.js): an ETag, and a 304 when the browser already has it
		if (req.headers["if-none-match"] === `"page"`) return res.writeHead(304, { etag: `"page"`, "cache-control": "no-cache" }).end();
		return res.writeHead(200, { "content-type": "text/html", etag: `"page"`, "cache-control": "no-cache" }).end(`<!doctype html><script type="module" src="/a.js"></script>`);
	}
	if (req.url === "/a.js") return res.writeHead(200, { "content-type": "text/javascript", "cache-control": cache }).end(`import b from "/b.js"; globalThis.done = { a: ${ver}, b };`);
	if (req.url === "/b.js") return res.writeHead(200, { "content-type": "text/javascript", "cache-control": cache }).end(`export default ${ver};`);
	res.writeHead(404).end();
});
await new Promise(r => site.listen(0, "127.0.0.1", r));
const up = site.address().port;
const gw = new SiteGateway({ port: 0, key: "test-key", version: () => dep, target: { host: "127.0.0.1", port: up, name: `127.0.0.1:${up}` } });
const server = gw.server();
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const b = await Browser.browser();
const ctx = await b.newContext();
const cookie = value => ctx.addCookies([{ name: SiteGateway.CACHE_COOKIE, value, url: base }]);
await ctx.addCookies([{ name: SiteGateway.COOKIE, value: gw.cookie, url: base }]);
let page = await ctx.newPage();
const load = async () => {
	const seen = { clear: null, net: [] };
	hits = [];
	const on = async r => { if (r.url() === base + "/") { seen.clear = (await r.allHeaders())["clear-site-data"] ?? null; seen.status = statuses.at(-1); } };
	page.on("response", on);
	await page.goto(base + "/", { waitUntil: "load" });
	await page.waitForFunction(() => globalThis.done);
	page.off("response", on);
	return { ...seen, net: hits.filter(u => u !== "/"), done: await page.evaluate(() => globalThis.done) };
};
let fails = 0;
const check = (name, fn) => { try { fn(); console.log("PASS", name); } catch (e) { fails++; console.log("FAIL", name, e.message); } };

await cookie("v1");   // already cleared at this version: no clear, so the files get cached
const s1 = await load();
check("1 seed: the page loads a.js and b.js v1, no clear", () => { assert.deepEqual(s1.done, { a: 1, b: 1 }); assert.equal(s1.clear, null); });
ver = 2; cache = "no-cache";
const s2 = await load();
check("2 stale: the page is sent whole (no 304), v1 still runs, a.js and b.js never asked for", () => { assert.deepEqual(s2.done, { a: 1, b: 1 }); assert.deepEqual(s2.net, []); });
await cookie("0");   // the phone: its cookie is older than CACHE_V (or absent)
// A new tab, as the phone opens one: the old tab keeps its renderer's in-memory copies for one more load (measured), and nothing can clear those.
await page.close(); page = await ctx.newPage();
const s3 = await load();   // the browser asks with If-None-Match; the gateway must drop it so the clear rides a 200
check("3 heal: Clear-Site-Data on the page, then a.js and b.js fetched again, v2", () => { assert.deepEqual(s3.done, { a: 2, b: 2 }); assert.deepEqual(s3.net.sort(), ["/a.js", "/b.js"]); assert.equal(s3.clear, '"cache"'); });
const s4 = await load();
const jar = Object.fromEntries((await ctx.cookies()).map(c => [c.name, c.value]));
check("4 once: the next load is v2 with no second clear; the clear-cookie is CACHE_V; the site cookie survived", () => {
	assert.deepEqual(s4.done, { a: 2, b: 2 }); assert.equal(s4.clear, null); assert.equal(jar[SiteGateway.CACHE_COOKIE], "v1"); assert.equal(jar[SiteGateway.COOKIE], gw.cookie); });
const r5 = await fetch(base + "/", { headers: { cookie: `${SiteGateway.COOKIE}=${gw.cookie}` } });
check("5 no-cache: a reply with no Cache-Control gets no-cache", () => assert.equal(r5.headers.get("cache-control"), "no-cache"));


// the heal: seed a cached page and files at version v1, deploy v2, open the cached page in a fresh tab
const heal = async (name, from_cookie, expect_v) => { const pg = "/c" + expect_v;
	dep = "v" + (expect_v - 1); ver = expect_v + 10; cache = "max-age=86400";
	await cookie(dep);
	let t = await ctx.newPage();
	await t.goto(base + pg, { waitUntil: "load" }); await t.waitForFunction(() => globalThis.done);
	const seeded = await t.evaluate(() => globalThis.done); await t.close();
	dep = "v" + expect_v; ver = expect_v + 20;   // the deploy: new version, new files; the browser still holds the old ones under max-age
	await cookie(from_cookie ?? dep);
	t = await ctx.newPage(); hits = [];
	await t.goto(base + pg, { waitUntil: "load" });
	const first = await t.evaluate(() => globalThis.done);   // from the cache, no request: the old files
	let healed = null; try { await t.waitForFunction(v => globalThis.done?.a === v, ver, { timeout: 8000 }); healed = await t.evaluate(() => ({ done: globalThis.done, logged: globalThis.logged })); } catch {}
	const pageHits = hits.filter(u => u === pg).length;
	await new Promise(r => setTimeout(r, 1500));   // a loop would show as more page loads
	const loads = hits.filter(u => u === pg).length;
	await t.close();
	return { name, seeded, first, healed, pageHits, loads };
};
const h6 = await heal("6", "v2", 2);   // cookie already current: only the refetch can heal
check("6 heal by refetch: seeded v12, cached page ran the old files, then the new ones (v22), one reload, one log line", () => {
	assert.deepEqual(h6.seeded, { a: 12, b: 12 }); assert.deepEqual(h6.first, { a: 12, b: 12 });
	assert.ok(h6.healed, "never healed"); assert.deepEqual(h6.healed.done, { a: 22, b: 22 });
	assert.equal(h6.loads, 1, "the page loaded " + h6.loads + " times after the first (one reload expected)");
	assert.deepEqual(h6.healed.logged, [["recite", "stale code healed", { from: "v1", to: "v2" }]]); });
const h7 = await heal("7", "v2-old", 3);   // cookie old: /__version may clear as well
check("7 heal with an old cookie: new files, one reload, the cookie is current after", () => {
	assert.ok(h7.healed, "never healed"); assert.deepEqual(h7.healed.done, { a: 23, b: 23 }); assert.equal(h7.loads, 1); });
const jar7 = Object.fromEntries((await ctx.cookies()).map(c => [c.name, c.value]));
check("7b the clear-cookie is the new version; the site cookie survived", () => { assert.equal(jar7[SiteGateway.CACHE_COOKIE], "v3"); assert.equal(jar7[SiteGateway.COOKIE], gw.cookie); });
const r8 = await fetch(base + "/c3", { headers: { cookie: `${SiteGateway.COOKIE}=${gw.cookie}`, accept: "text/html" } });
const t8 = await r8.text();
check("8 the page carries the heal script once, at the top of head, with the right length and no ETag", () => {
	assert.equal(t8.split("lew42_heal_tried").length, 2); assert.ok(t8.startsWith("<!doctype html><html><head><script>")); assert.equal(Buffer.byteLength(t8), Number(r8.headers.get("content-length"))); assert.equal(r8.headers.get("etag"), null); });
const real = new SiteGateway({ port: 0, key: "k", target: { host: "127.0.0.1", port: up, name: "x" } });
check("9 the deploy version comes from git, is cached for 30 s, and keeps the manual salt", () => {
	const v = real.version(); assert.match(v, /^[0-9a-f]{7,}$/); assert.equal(real.version(), v);
	SiteGateway.CACHE_V = "2"; real.v_last = null; assert.equal(real.version(), v + ".2"); SiteGateway.CACHE_V = ""; });

await ctx.close(); server.close(); site.close(); await Browser.close?.();
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exit(fails ? 1 : 0);
