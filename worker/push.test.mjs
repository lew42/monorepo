// node worker/push.test.mjs: encrypts a push the way push.js does, then decrypts it the way a browser does (RFC 8291 section 3.4),
// checks the VAPID JWT with the public key, and runs the weekly cron against a fake database and a fake push service.
import assert from "node:assert/strict";
import { encrypt, vapid_header, send_all, weekly } from "./push.js";
import { b64u, unb64u } from "./session.js";

const enc = new TextEncoder();
const hkdf = async (ikm, salt, info, bytes) => new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info }, await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), bytes * 8));
const cat = (...p) => Uint8Array.from(p.flatMap(a => [...a]));

// the subscriber: a browser makes a P-256 key pair and a 16-byte auth secret, and hands the public halves to the server
const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
const ua_public = new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey));
const auth = crypto.getRandomValues(new Uint8Array(16));
const sub = { p256dh: b64u(ua_public), auth: b64u(auth) };

async function decrypt(body) {
    const salt = body.slice(0, 16), rs = new DataView(body.buffer, body.byteOffset).getUint32(16), idlen = body[20];
    const as_public = body.slice(21, 21 + idlen), cipher = body.slice(21 + idlen);
    assert.equal(rs, 4096); assert.equal(idlen, 65);
    const as_key = await crypto.subtle.importKey("raw", as_public, { name: "ECDH", namedCurve: "P-256" }, false, []);
    const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: as_key }, ua.privateKey, 256));
    const ikm = await hkdf(secret, auth, cat(enc.encode("WebPush: info\0"), ua_public, as_public), 32);
    const cek = await hkdf(ikm, salt, enc.encode("Content-Encoding: aes128gcm\0"), 16);
    const nonce = await hkdf(ikm, salt, enc.encode("Content-Encoding: nonce\0"), 12);
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]), cipher));
    assert.equal(plain.at(-1), 2, "the last record ends with 0x02");
    return new TextDecoder().decode(plain.slice(0, -1));
}

const text = JSON.stringify({ title: "lew42", body: "New this week: watch part 2 — é✓", url: "/join/" });
assert.equal(await decrypt(await encrypt(text, sub)), text);
assert.notDeepEqual(await encrypt(text, sub), await encrypt(text, sub), "a fresh key and salt every time");
await assert.rejects(decrypt(await encrypt(text, { ...sub, auth: b64u(crypto.getRandomValues(new Uint8Array(16))) })), "the wrong auth secret cannot read it");

// VAPID: the JWT verifies with the public key, names the endpoint's origin, and expires within 24 hours
const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const env = { VAPID_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey)), VAPID_PUBLIC: b64u(await crypto.subtle.exportKey("raw", pair.publicKey)), PUSH_WEEKLY_URL: "/join/" };
const header = await vapid_header("https://fcm.googleapis.com/fcm/send/abc", env);
const [, jwt, k] = /^vapid t=(\S+), k=(\S+)$/.exec(header);
assert.equal(k, env.VAPID_PUBLIC);
const [h, c, s] = jwt.split(".");
assert.ok(await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pair.publicKey, unb64u(s), enc.encode(h + "." + c)), "the JWT signature verifies");
const claims = JSON.parse(new TextDecoder().decode(unb64u(c)));
assert.equal(claims.aud, "https://fcm.googleapis.com");
assert.ok(claims.exp - Date.now() / 1000 < 86400 && claims.sub.startsWith("https://"));

// send_all and the cron: 201 sent, 410 removed, 500 failed; the 410 subscription's row is deleted
const subs = ["a", "b", "c"].map(n => ({ endpoint: "https://fcm.googleapis.com/fcm/send/" + n, ...sub }));
const deleted = [], seen = [];
const db = { prepare: sql => ({ bind: (...args) => ({ run: async () => { deleted.push(args[0]); }, all: async () => ({ results: subs }) }), all: async () => ({ results: subs }) }) };
const fake_push = async (endpoint, init) => {
    seen.push(init.headers);
    return new Response(null, { status: endpoint.endsWith("/a") ? 201 : endpoint.endsWith("/b") ? 410 : 500 });
};
const log = console.log; let logged = ""; console.log = line => { logged += line; };
const counts = await weekly({ ...env, DB: db }, fake_push);
console.log = log;
assert.deepEqual(counts, { sent: 1, failed: 1, removed: 1 });
assert.deepEqual(deleted, ["https://fcm.googleapis.com/fcm/send/b"]);
assert.match(logged, /sent 1, failed 1, removed 1/);
assert.ok(seen.every(h => h.ttl && h.urgency === "normal" && h["content-encoding"] === "aes128gcm" && h.authorization.startsWith("vapid t=")), "TTL, Urgency and VAPID on every push");
assert.deepEqual(await weekly({ DB: db }, fake_push), { sent: 0, failed: 0, removed: 0 }, "no keys, nothing sent");
console.log("push.test ok");
