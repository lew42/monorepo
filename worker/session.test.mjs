// node worker/session.test.mjs: sign, verify, tamper, expiry, wrong secret, cookie helpers.
import assert from "node:assert/strict";
import { sign, verify, readCookie, setCookie, clearCookie, MAX_AGE } from "./session.js";

const exp = Math.floor(Date.now() / 1000) + 60;
const token = await sign({ uid: 7, te: 0, exp }, "s3cret");
assert.deepEqual(await verify(token, "s3cret"), { uid: 7, te: 0, exp });
assert.equal(await verify(token, "other"), null);
assert.equal(await verify(token, ""), null);
assert.equal(await verify(token.slice(0, -3) + "AAA", "s3cret"), null);
assert.equal(await verify("junk", "s3cret"), null);
assert.equal(await verify(await sign({ uid: 7, te: 0, exp: 1 }, "s3cret"), "s3cret"), null);

assert.equal(readCookie(new Request("https://x", { headers: { cookie: `a=1; s=${token}` } })), token);
assert.equal(readCookie(new Request("https://x")), null);
assert.match(setCookie(token), new RegExp(`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`));
assert.match(clearCookie(), /Max-Age=0/);
console.log("session.test ok");
