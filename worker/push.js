// worker/push.js: Web Push with Web Crypto only (no package). Two standards:
//   VAPID (RFC 8292): an ES256 JWT proves the push comes from this Worker; the push service takes `Authorization: vapid t=<jwt>, k=<public key>`.
//   Message encryption (RFC 8291, aes128gcm): the body is encrypted to the browser's p256dh + auth, so the push service cannot read it.
// Keys come from worker/scripts/vapid.mjs: env.VAPID_PRIVATE_JWK (secret, a JSON private JWK) and env.VAPID_PUBLIC (the 65-byte point, base64url).
// worker/push.test.mjs encrypts here and decrypts the way a browser does.

import { b64u, unb64u } from "./session.js";

const enc = new TextEncoder();
const cat = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { out.set(p, at); at += p.length; } return out; };
const hkdf = async (ikm, salt, info, bytes) => new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info }, await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), bytes * 8));

export const SUBJECT = "https://staging.lew42.com";
export const TTL = 86400;          // seconds the push service may hold a message for an offline phone

// RFC 8291: the request body for one subscription. `sub` is {p256dh, auth}, both base64url as PushSubscription.toJSON() gives them.
export async function encrypt(text, sub) {
    const ua_public = unb64u(sub.p256dh), auth = unb64u(sub.auth);
    const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    const as_public = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
    const ua_key = await crypto.subtle.importKey("raw", ua_public, { name: "ECDH", namedCurve: "P-256" }, false, []);
    const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: ua_key }, pair.privateKey, 256));
    const ikm = await hkdf(secret, auth, cat(enc.encode("WebPush: info\0"), ua_public, as_public), 32);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const cek = await hkdf(ikm, salt, enc.encode("Content-Encoding: aes128gcm\0"), 16);
    const nonce = await hkdf(ikm, salt, enc.encode("Content-Encoding: nonce\0"), 12);
    const record = cat(enc.encode(text), new Uint8Array([2]));       // 0x02 = the last (only) record, no padding
    const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
    const body = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, record));
    return cat(salt, new Uint8Array([0, 0, 0x10, 0]), new Uint8Array([as_public.length]), as_public, body);   // header: salt, record size 4096, key id = our public key
}

// RFC 8292: `Authorization` for a push to this endpoint. The JWT's audience is the endpoint's origin, valid 12 hours.
export async function vapid_header(endpoint, env, now = Date.now()) {
    const part = o => b64u(enc.encode(JSON.stringify(o)));
    const head = part({ typ: "JWT", alg: "ES256" });
    const claims = part({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || SUBJECT });
    const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_PRIVATE_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + claims));   // WebCrypto gives r||s, which is what a JWT wants
    return `vapid t=${head}.${claims}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`;
}

// Sends one payload to one subscription. Returns {status} (the push service's answer) or {status: 0, error}.
export async function send_push(sub, payload, env, fetcher = fetch) {
    try {
        const res = await fetcher(sub.endpoint, {
            method: "POST",
            headers: { "content-encoding": "aes128gcm", "content-type": "application/octet-stream", ttl: String(TTL), urgency: "normal", authorization: await vapid_header(sub.endpoint, env) },
            body: await encrypt(JSON.stringify(payload), sub),
            signal: AbortSignal.timeout(10_000),
        });
        return { status: res.status };
    } catch (err) { return { status: 0, error: err.message }; }
}

// Sends to many, deletes the ones the push service says are gone (404, 410), and returns the counts plus each endpoint's status.
export async function send_all(subs, payload, env, fetcher = fetch) {
    const results = await Promise.all(subs.map(async sub => ({ endpoint: sub.endpoint, ...await send_push(sub, payload, env, fetcher) })));
    const gone = results.filter(r => r.status === 404 || r.status === 410).map(r => r.endpoint);
    for (const endpoint of gone) await env.DB.prepare("DELETE FROM push_subs WHERE endpoint = ?").bind(endpoint).run();
    const sent = results.filter(r => r.status >= 200 && r.status < 300).length;
    return { sent, removed: gone.length, failed: results.length - sent - gone.length, results };
}

// The Monday cron: the same text to every subscriber. Text and link are vars, with defaults.
export async function weekly(env, fetcher = fetch) {
    if (!env.VAPID_PRIVATE_JWK || !env.VAPID_PUBLIC) { console.log("push weekly: no VAPID keys, nothing sent"); return { sent: 0, failed: 0, removed: 0 }; }
    const { results: subs } = await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subs").all();
    const payload = { title: "lew42", body: env.PUSH_WEEKLY_TEXT || "New this week: watch part 2", url: env.PUSH_WEEKLY_URL || "/join/" };
    const { sent, failed, removed } = await send_all(subs, payload, env, fetcher);
    console.log(`push weekly: sent ${sent}, failed ${failed}, removed ${removed}`);
    return { sent, failed, removed };
}
