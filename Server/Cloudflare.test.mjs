// node Server/Cloudflare.test.mjs: R2 client against a local fake (no network)
import assert from "node:assert";
import http from "node:http";
import { R2 } from "./Cloudflare.mjs";

const store = new Map(), seen = [];
const srv = http.createServer((req, res) => {
	const chunks = []; req.on("data", (c) => chunks.push(c)); req.on("end", () => {
		const a = req.headers.authorization || "";
		seen.push(a);
		if (!/^AWS4-HMAC-SHA256 Credential=AK\/\d{8}\/auto\/s3\/aws4_request, SignedHeaders=.*host.*x-amz-date.*, Signature=[0-9a-f]{64}$/.test(a)) { res.writeHead(403).end("bad sig"); return; }
		const u = new URL(req.url, "http://x"), key = decodeURIComponent(u.pathname.slice(1));
		if (req.method === "PUT") { store.set(key, { body: Buffer.concat(chunks), meta: Object.fromEntries(Object.entries(req.headers).filter(([k]) => k.startsWith("x-amz-meta-"))) }); res.writeHead(200).end(); }
		else if (req.method === "HEAD") { const o = store.get(key); if (!o) res.writeHead(404).end(); else res.writeHead(200, { "content-length": o.body.length, ...o.meta }).end(); }
		else { const p = u.searchParams.get("prefix"); const ks = [...store].filter(([k]) => k.startsWith("b/" + p)); res.writeHead(200).end(`<R><IsTruncated>false</IsTruncated>${ks.map(([k, o]) => `<Contents><Key>${k.slice(2)}</Key><Size>${o.body.length}</Size></Contents>`).join("")}</R>`); }
	});
}).listen(0);
await new Promise((r) => srv.on("listening", r));
const r2 = new R2({ R2_ACCESS_KEY_ID: "AK", R2_SECRET_ACCESS_KEY: "SK", R2_ENDPOINT: `http://127.0.0.1:${srv.address().port}` }, { cap: 2 });
await r2.put("b", "a/x y.png", Buffer.from("hello"), "image/png", { sha1: "abc" });
assert.deepEqual(await r2.head("b", "a/x y.png"), { size: 5, meta: { sha1: "abc" } });
assert.equal(await r2.head("b", "nope"), null);
assert.deepEqual(await r2.list("b", "a/"), [{ key: "a/x y.png", size: 5 }]);
await r2.put("b", "a/2", Buffer.from("z"));
await assert.rejects(r2.put("b", "a/3", Buffer.from("z")), /cap of 2/);
assert.equal(r2.writes, 2);
srv.close();
console.log("Cloudflare.test: ok");
