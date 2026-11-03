// Proof that the gateway keeps a phone from holding stale code (the phone's old Sheet.js and Recite.js, 2026-11-01/02): code is sent no-store, and a browser with an old clear-cookie is cleared once.
// A fake site serves a page that imports a.js, which imports b.js, and says "cache it for a day" (as Chrome did by heuristic).
// `/stale.png` stands in for the phone's stuck Recite.js: a stuck .js cannot be seeded through the gateway any more, because it sends code no-store, but a non-code reply may still carry a long max-age.
// Steps 1-2: the gateway sends them no-store, so after the site changes them the next load runs the new ones. Step 3 is a browser
// whose clear-cookie is old (the phone): the page gets Clear-Site-Data (it wipes copies already stuck there). Step 4: no second clear,
// and the site cookie survived. Steps 5-6: the Cache-Control a gateway sends by file type.
//     node Server/SiteGateway.cache.test.mjs
import http from "node:http";
import assert from "node:assert/strict";
import SiteGateway from "./SiteGateway.mjs";
import Browser from "./Browser.mjs";

let png = 0, ver = 1, cache = "max-age=86400", hits = [], statuses = [];
const site = http.createServer((req, res) => {
	hits.push(req.url);
	if (req.url === "/") res.on("finish", () => statuses.push(res.statusCode));
	if (req.url === "/"){   // like the real site (express.static, compress.js): an ETag, and a 304 when the browser already has it
		if (req.headers["if-none-match"] === `"page"`) return res.writeHead(304, { etag: `"page"`, "cache-control": "no-cache" }).end();
		return res.writeHead(200, { "content-type": "text/html", etag: `"page"`, "cache-control": "no-cache" }).end(`<!doctype html><script type="module" src="/a.js"></script>`);
	}
	if (req.url === "/stale.png") return res.writeHead(200, { "content-type": "image/png", "cache-control": "max-age=86400" }).end("png" + ++png);   // a stuck copy: the gateway lets a long max-age through on a non-code reply
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
	const on = async r => { if (r.url() === base + "/") { seen.clear = (await r.allHeaders())["clear-site-data"] ?? null; seen.status = statuses.at(-1); } };
	page.on("response", on);
	await page.goto(base + "/", { waitUntil: "load" });
	await page.waitForFunction(() => globalThis.done);
	page.off("response", on);
	return { ...seen, net: hits.filter(u => u !== "/"), done: await page.evaluate(() => globalThis.done) };
};
const stale = () => page.evaluate(() => fetch("/stale.png").then(r => r.text()));
let fails = 0;
const check = (name, fn) => { try { fn(); console.log("PASS", name); } catch (e) { fails++; console.log("FAIL", name, e.message); } };

await cookie(SiteGateway.CACHE_V);   // already cleared at this version: no clear, so the files get cached
const s1 = await load();
check("1 first load: the page loads a.js and b.js v1, no clear", () => { assert.deepEqual(s1.done, { a: 1, b: 1 }); assert.equal(s1.clear, null); });
const p1 = await stale();
ver = 2; cache = "no-cache";
const s2 = await load();
const p1b = await stale();   // no clear yet: the browser still holds its copy (proves a stuck copy really survives a page load)
check("2b a stuck copy stays stuck without the clear (the test can see staleness)", () => assert.deepEqual([p1, p1b], ["png1", "png1"]));
check("2 no-store: the site said max-age, but a.js and b.js are asked for again and v2 runs (nothing to go stale)", () => { assert.deepEqual(s2.done, { a: 2, b: 2 }); assert.deepEqual(s2.net.sort(), ["/a.js", "/b.js"]); assert.equal(s2.clear, null); });
await cookie("0");   // the phone: its cookie is older than CACHE_V (or absent)
// A new tab, as the phone opens one: the old tab keeps its renderer's in-memory copies for one more load (measured), and nothing can clear those.
await page.close(); page = await ctx.newPage();
const s3 = await load();
const p3 = await stale();   // the browser asks with If-None-Match; the gateway must drop it so the clear rides a 200
check("3 old cookie: Clear-Site-Data on the page (the phone's stuck copies go), v2 runs", () => { assert.deepEqual(s3.done, { a: 2, b: 2 }); assert.equal(s3.clear, '"cache"'); });
check("3b the clear really evicted the stuck copy: the image comes fresh from the site", () => assert.equal(p3, "png2"));
ver = 3;
const s4 = await load();
const p4 = await stale();
const jar = Object.fromEntries((await ctx.cookies()).map(c => [c.name, c.value]));
check("4 once: the next load is v3 (fresh again) with no second clear; the clear-cookie is CACHE_V; the site cookie survived", () => {
	assert.deepEqual(s4.done, { a: 3, b: 3 }); assert.equal(s4.clear, null); assert.equal(jar[SiteGateway.CACHE_COOKIE], SiteGateway.CACHE_V); assert.equal(jar[SiteGateway.COOKIE], gw.cookie); assert.equal(p4, "png2"); });
const r5 = await fetch(base + "/pic.png", { headers: { cookie: `${SiteGateway.COOKIE}=${gw.cookie}` } });
check("5 no-cache: a non-code reply with no Cache-Control gets no-cache", () => assert.equal(r5.headers.get("cache-control"), "no-cache"));


// no-store: HTML, JS, CSS and JSON by type or by name; an image keeps the plain no-cache; a stream is left alone
site.removeAllListeners("request");
const kinds = { "/x.js": ["text/javascript", "max-age=99"], "/x.css": ["text/css", "max-age=99"], "/x.json": ["application/json", "no-cache"], "/x.jsonl": ["text/plain", "no-cache"], "/p": ["text/html", "no-cache"], "/x.png": ["image/png", null], "/live": ["text/event-stream", "no-cache"] };
site.on("request", (req, res) => { const [t, c] = kinds[req.url] ?? ["text/plain", null]; res.writeHead(200, c ? { "content-type": t, "cache-control": c } : { "content-type": t }); req.url === "/live" ? res.end() : res.end("x"); });
const got = {}; for (const u of Object.keys(kinds)) got[u] = (await fetch(base + u, { headers: { cookie: `${SiteGateway.COOKIE}=${gw.cookie}` } })).headers.get("cache-control");
check("6 no-store on html, js, css, json, jsonl; no-cache on an image; the stream untouched", () => assert.deepEqual(got, { "/x.js": "no-store", "/x.css": "no-store", "/x.json": "no-store", "/x.jsonl": "no-store", "/p": "no-store", "/x.png": "no-cache", "/live": "no-cache" }));
await ctx.close(); server.close(); site.close(); await Browser.close?.();
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exit(fails ? 1 : 0);
