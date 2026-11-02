// Proof that a stale HTTP cache heals on the next page load through the gateway (the phone's old Sheet.js, 2026-11-01).
// A fake site serves a page that imports a.js, which imports b.js (nested, no query strings). Step 1 caches both
// for a day (as Chrome did by heuristic), then the site changes them. Step 2 shows the stale copies are still served
// with no request. Step 3 is a browser whose clear-cookie is old (the phone), in a new tab: it gets Clear-Site-Data and the new files.
// Step 4: the next load sends no second clear, and the site cookie survived.
//     node Server/SiteGateway.cache.test.mjs
import http from "node:http";
import assert from "node:assert/strict";
import SiteGateway from "./SiteGateway.mjs";
import Browser from "./Browser.mjs";

let ver = 1, cache = "max-age=86400", hits = [];
const site = http.createServer((req, res) => {
	hits.push(req.url);
	if (req.url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(`<!doctype html><script type="module" src="/a.js"></script>`);
	if (req.url === "/a.js") return res.writeHead(200, { "content-type": "text/javascript", "cache-control": cache }).end(`import b from "/b.js"; globalThis.done = { a: ${ver}, b };`);
	if (req.url === "/b.js") return res.writeHead(200, { "content-type": "text/javascript", "cache-control": cache }).end(`export default ${ver};`);
	res.writeHead(404).end();
});
await new Promise(r => site.listen(0, "127.0.0.1", r));
const up = site.address().port;
const gw = new SiteGateway({ port: 0, key: "test-key", target: { host: "127.0.0.1", port: up, name: `127.0.0.1:${up}` } });
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
	const on = async r => { if (r.url() === base + "/") seen.clear = (await r.allHeaders())["clear-site-data"] ?? null; };
	page.on("response", on);
	await page.goto(base + "/", { waitUntil: "load" });
	await page.waitForFunction(() => globalThis.done);
	page.off("response", on);
	return { ...seen, net: hits.filter(u => u !== "/"), done: await page.evaluate(() => globalThis.done) };
};
let fails = 0;
const check = (name, fn) => { try { fn(); console.log("PASS", name); } catch (e) { fails++; console.log("FAIL", name, e.message); } };

await cookie(SiteGateway.CACHE_V);   // already cleared at this version: no clear, so the files get cached
const s1 = await load();
check("1 seed: the page loads a.js and b.js v1, no clear", () => { assert.deepEqual(s1.done, { a: 1, b: 1 }); assert.equal(s1.clear, null); });
ver = 2; cache = "no-cache";
const s2 = await load();
check("2 stale: v1 still runs after the site changed, a.js and b.js never asked for", () => { assert.deepEqual(s2.done, { a: 1, b: 1 }); assert.deepEqual(s2.net, []); });
await cookie("0");   // the phone: its cookie is older than CACHE_V (or absent)
// A new tab, as the phone opens one: the old tab keeps its renderer's in-memory copies for one more load (measured), and nothing can clear those.
await page.close(); page = await ctx.newPage();
const s3 = await load();
check("3 heal: Clear-Site-Data on the page, then a.js and b.js fetched again, v2", () => { assert.deepEqual(s3.done, { a: 2, b: 2 }); assert.deepEqual(s3.net.sort(), ["/a.js", "/b.js"]); assert.equal(s3.clear, '"cache"'); });
const s4 = await load();
const jar = Object.fromEntries((await ctx.cookies()).map(c => [c.name, c.value]));
check("4 once: the next load is v2 with no second clear; the clear-cookie is CACHE_V; the site cookie survived", () => {
	assert.deepEqual(s4.done, { a: 2, b: 2 }); assert.equal(s4.clear, null); assert.equal(jar[SiteGateway.CACHE_COOKIE], SiteGateway.CACHE_V); assert.equal(jar[SiteGateway.COOKIE], gw.cookie); });
const r5 = await fetch(base + "/", { headers: { cookie: `${SiteGateway.COOKIE}=${gw.cookie}` } });
check("5 no-cache: a reply with no Cache-Control gets no-cache", () => assert.equal(r5.headers.get("cache-control"), "no-cache"));

await ctx.close(); server.close(); site.close(); await Browser.close?.();
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exit(fails ? 1 : 0);
