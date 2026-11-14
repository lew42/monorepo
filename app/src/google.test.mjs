// node app/src/google.test.mjs — one fake Google key pair, one token, every check once.
import assert from "node:assert/strict";
import { verify_google_token } from "./google.js";
import { new_cookie_value, token_from } from "./session.js";

const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const b64 = o => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const now = Date.now(), sec = Math.floor(now / 1000);
const make = async (claims, header = { alg: "RS256", kid: "k1" }) => {
	const body = b64(header) + "." + b64({ iss: "https://accounts.google.com", aud: "cid", sub: "123", email: "a@b.c", email_verified: true, iat: sec, exp: sec + 3600, ...claims });
	const sig = Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(body))).toString("base64url");
	return body + "." + sig;
};
const opts = { client_id: "cid", fetch_keys: async () => [jwk], now };
const fails = async (token, re) => assert.rejects(verify_google_token(token, opts), re);

assert.equal((await verify_google_token(await make({}), opts)).sub, "123");
await fails(await make({ aud: "other" }), /another client/);
await fails(await make({ exp: sec - 1 }), /expired/);
await fails(await make({ iss: "https://evil.example" }), /issuer/);
await fails(await make({ email_verified: false }), /not verified/);
await fails(await make({}, { alg: "RS256", kid: "nope" }), /no Google key/);
await fails(await make({}, { alg: "none", kid: "k1" }), /alg/);
const good = await make({});
await fails(good.slice(0, -4) + "AAAA", /signature/);

const { token, value } = await new_cookie_value("s3cret");
const req = (v, secret) => token_from(new Request("https://x", { headers: { cookie: "sid=" + v } }), secret);
assert.equal(await req(value, "s3cret"), token);
assert.equal(await req(value, "other"), null);
assert.equal(await req(token + ".deadbeef", "s3cret"), null);
console.log("google.test ok");
