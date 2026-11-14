import assert from "node:assert/strict";
import { acquire, beat, release, can_write, live, TTL } from "./lock.js";

const a = { id: 1, name: "A" }, b = { id: 2, name: "B" };
let lock = null;

lock = acquire(lock, a, 1000);
assert.equal(lock.holder, 1);
assert.equal(acquire(lock, b, 1000 + TTL - 1), null, "a live lock cannot be taken");
assert.equal(acquire(lock, a, 2000).holder, 1, "the holder can re-acquire");
assert.ok(can_write(lock, a, 1000) && !can_write(lock, b, 1000));

assert.equal(beat(lock, b, 2000), null, "only the holder beats");
const beaten = beat(lock, a, 1000 + TTL - 1);
assert.equal(beaten.expires, 1000 + TTL - 1 + TTL);
assert.equal(live(lock, 1000 + TTL), null, "a silent holder loses it");
assert.equal(acquire(lock, b, 1000 + TTL).holder, 2, "then somebody else can take it");
assert.equal(beat(lock, a, 1000 + TTL), null, "an expired holder cannot beat back in");
assert.equal(release(lock, b), lock, "a stranger cannot release");
assert.equal(release(lock, a), null);
console.log("lock.test ok");
