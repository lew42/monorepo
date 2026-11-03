// Cloudflare access for Servex's node scripts. Doc: public/framework/ai/doc/cloudflare.md
// The credentials file is read when a client is made, never at import, and never copied into process.env.
import { createHash, createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const sha256 = (d) => createHash("sha256").update(d).digest("hex");
const hmac = (k, d) => createHmac("sha256", k).update(d).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

export class R2 {
	// cap: most writes this client will make; keys: {R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT}
	constructor(keys, { cap = 10000 } = {}) {
		this.keys = keys; this.cap = cap; this.writes = 0; this.reads = 0;
		this.endpoint = new URL(keys.R2_ENDPOINT);
	}

	// SigV4 over the headers given, path-style URL /bucket/key
	sign(method, pathname, query, headers, body) {
		const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
		const day = now.slice(0, 8), scope = `${day}/auto/s3/aws4_request`;
		const h = { host: this.endpoint.host, "x-amz-date": now, "x-amz-content-sha256": sha256(body), ...headers };
		const names = Object.keys(h).map((k) => k.toLowerCase()).sort();
		const lower = Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), String(v).trim()]));
		const canonQuery = Object.entries(query).map(([k, v]) => [enc(k), enc(v)]).sort(([a], [b]) => (a < b ? -1 : 1)).map((p) => p.join("=")).join("&");
		const canon = [method, pathname.split("/").map(enc).join("/"), canonQuery, names.map((n) => `${n}:${lower[n]}\n`).join(""), names.join(";"), lower["x-amz-content-sha256"]].join("\n");
		const toSign = ["AWS4-HMAC-SHA256", now, scope, sha256(canon)].join("\n");
		const k = hmac(hmac(hmac(hmac("AWS4" + this.keys.R2_SECRET_ACCESS_KEY, day), "auto"), "s3"), "aws4_request");
		h.authorization = `AWS4-HMAC-SHA256 Credential=${this.keys.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(";")}, Signature=${hmac(k, toSign).toString("hex")}`;
		return { headers: h, query: canonQuery };
	}

	async call(method, pathname, query = {}, headers = {}, body = "") {
		const s = this.sign(method, pathname, query, headers, body);
		const url = `${this.endpoint.origin}${pathname.split("/").map(enc).join("/")}${s.query ? "?" + s.query : ""}`;
		const { host, ...send } = s.headers;
		const r = await fetch(url, { method, headers: send, body: body === "" ? undefined : body });
		if (!r.ok && !(method === "HEAD" && r.status === 404)) throw new Error(`R2 ${method} ${pathname} -> ${r.status} ${(await r.text()).slice(0, 200)}`);
		return r;
	}

	// [{key, size}] under prefix (follows continuation tokens)
	async list(bucket, prefix = "") {
		const out = []; let token;
		do {
			this.reads++;
			const q = { "list-type": "2", prefix }; if (token) q["continuation-token"] = token;
			const x = await (await this.call("GET", `/${bucket}`, q)).text();
			for (const m of x.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) out.push({ key: /<Key>(.*?)<\/Key>/.exec(m[1])[1].replace(/&amp;/g, "&"), size: +/<Size>(\d+)<\/Size>/.exec(m[1])[1] });
			token = /<NextContinuationToken>(.*?)<\/NextContinuationToken>/.exec(x)?.[1];
		} while (token);
		return out;
	}

	// {size, meta} or null
	async head(bucket, key) {
		this.reads++;
		const r = await this.call("HEAD", `/${bucket}/${key}`);
		if (r.status === 404) return null;
		const meta = {}; for (const [k, v] of r.headers) if (k.startsWith("x-amz-meta-")) meta[k.slice(11)] = v;
		return { size: +r.headers.get("content-length"), meta };
	}

	async put(bucket, key, buffer, contentType = "application/octet-stream", meta = {}) {
		if (this.writes >= this.cap) throw new Error(`R2 write cap of ${this.cap} reached; raise it with --cap`);
		this.writes++;
		const mh = Object.fromEntries(Object.entries(meta).map(([k, v]) => [`x-amz-meta-${k}`, v]));
		await this.call("PUT", `/${bucket}/${key}`, {}, { "content-type": contentType, ...mh }, buffer);
	}
}

export default class Cloudflare {
	static ENV = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "cloudflare.env");

	// KEY=value lines; read now, returned, not stored globally
	static keys(file = Cloudflare.ENV) {
		const out = {};
		for (const l of fs.readFileSync(file, "utf8").split(/\r?\n/)) { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l); if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
		return out;
	}

	static r2({ cap, keys } = {}) { return new R2(keys || Cloudflare.keys(), { cap }); }
}
