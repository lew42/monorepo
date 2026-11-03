import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* Web Push for the notifications lab (public/framework/lab/notifications/, stretch goal).
 * Written with node:crypto only (no new dependency): VAPID (RFC 8292) + aes128gcm (RFC 8291).
 *
 * Three routes, all small:
 *   GET  /push/key        -> { key }  the public VAPID key the page subscribes with.
 *   POST /push/subscribe  -> remembers a subscription (in memory only; lost on restart).
 *   POST /push/send       -> { endpoint, delay } sends ONE fixed test push, `delay` seconds later.
 *
 * Why these are open to the LAN: the phone itself is the caller, and a loopback guard would
 * lock it out. What keeps them safe: (1) /send only reaches endpoints that were first
 * subscribed here, (2) endpoints must be https on a known push service host (no server-side
 * request to an arbitrary URL), (3) the payload is fixed text, the delay is capped, and at most
 * MAX_PENDING pushes wait at once. The private key never leaves the file `Server/.push-vapid.json`
 * (git-ignored). */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const KEY_FILE = path.join(HERE, "..", ".push-vapid.json");
const HOSTS = /(^|\.)(googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com|push\.apple\.com)$/;
const MAX_DELAY = 120, MAX_PENDING = 5;
const b64 = buf => Buffer.from(buf).toString("base64url");

export default class Push {
	static setup(server){ new Push(server); }

	constructor(server){
		this.server = server;
		this.subs = new Map();     // endpoint -> subscription
		this.pending = 0;
		this.keys = Push.load_keys();
		server.on("express", () => this.route());
	}

	static load_keys(){
		let jwk;
		try { jwk = JSON.parse(fs.readFileSync(KEY_FILE, "utf8")); } catch {
			jwk = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" }).privateKey.export({ format: "jwk" });
			fs.writeFileSync(KEY_FILE, JSON.stringify(jwk));
		}
		const priv = crypto.createPrivateKey({ key: jwk, format: "jwk" });
		const pub = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, "base64url"), Buffer.from(jwk.y, "base64url")]);
		return { priv, pub: b64(pub) };
	}

	route(){
		const { router, express } = this.server;
		router.get("/push/key", (req, res) => res.json({ key: this.keys.pub }));
		router.post("/push/subscribe", express.json({ limit: "10kb" }), (req, res) => {
			const s = req.body;
			if (!Push.valid(s)) return res.status(400).json({ error: "not a push subscription on a known push service" });
			this.subs.set(s.endpoint, s);
			res.json({ ok: true, count: this.subs.size });
		});
		router.post("/push/send", express.json({ limit: "2kb" }), (req, res) => {
			const s = this.subs.get(req.body?.endpoint);
			if (!s) return res.status(404).json({ error: "subscribe first (this server forgets subscriptions on restart)" });
			if (this.pending >= MAX_PENDING) return res.status(429).json({ error: "too many pending" });
			const delay = Math.min(Math.max(Number(req.body.delay) || 0, 0), MAX_DELAY);
			this.pending++;
			setTimeout(() => this.send(s, { title: "Push from the dev server", body: `sent ${delay}s after you asked`, tag: "push", icon: undefined }).catch(e => console.warn("Push:", e.message)).finally(() => this.pending--), delay * 1000);
			res.json({ ok: true, delay });
		});
	}

	static valid(s){
		try {
			const u = new URL(s.endpoint);
			return u.protocol === "https:" && HOSTS.test(u.hostname) && Buffer.from(s.keys.p256dh, "base64url").length === 65 && Buffer.from(s.keys.auth, "base64url").length === 16;
		} catch { return false; }
	}

	// RFC 8291 aes128gcm, one record.
	static encrypt(sub, payload){
		const ua = Buffer.from(sub.keys.p256dh, "base64url"), auth = Buffer.from(sub.keys.auth, "base64url");
		const ecdh = crypto.createECDH("prime256v1"); ecdh.generateKeys();
		const as_pub = ecdh.getPublicKey();
		const shared = ecdh.computeSecret(ua);
		const ikm = Buffer.from(crypto.hkdfSync("sha256", shared, auth, Buffer.concat([Buffer.from("WebPush: info\0"), ua, as_pub]), 32));
		const salt = crypto.randomBytes(16);
		const cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
		const nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
		const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
		const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
		const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
		return Buffer.concat([salt, rs, Buffer.from([as_pub.length]), as_pub, body]);
	}

	vapid(endpoint){
		const part = o => b64(JSON.stringify(o));
		const data = part({ typ: "JWT", alg: "ES256" }) + "." + part({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "https://lew42.com" });
		const sig = crypto.sign("sha256", Buffer.from(data), { key: this.keys.priv, dsaEncoding: "ieee-p1363" });
		return `vapid t=${data}.${b64(sig)}, k=${this.keys.pub}`;
	}

	async send(sub, message){
		const res = await fetch(sub.endpoint, {
			method: "POST",
			headers: { Authorization: this.vapid(sub.endpoint), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "60", Urgency: "high" },
			body: Push.encrypt(sub, JSON.stringify(message)),
		});
		console.log(`Push: ${res.status} from ${new URL(sub.endpoint).hostname}`);
		if (!res.ok) throw new Error(`push service said ${res.status}: ${await res.text()}`);
	}
}
