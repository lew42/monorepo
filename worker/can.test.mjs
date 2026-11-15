// node worker/can.test.mjs: the six rows of identity.md ruling 4.
import assert from "node:assert/strict";
import { can } from "./can.js";

const as = role => ({ id: 1, role });
assert.equal(can(null, "read"), true);
assert.equal(can(null, "write"), false);
assert.equal(can(null, "admin"), false);
for (const role of ["owner", "admin"]) for (const a of ["read", "write", "admin"]) assert.equal(can(as(role), a), true);
for (const role of ["founder", "moderator"]) { assert.equal(can(as(role), "write"), true); assert.equal(can(as(role), "admin"), false); }
assert.equal(can(as("member"), "write"), true);
assert.equal(can(as("member"), "admin"), false);
assert.equal(can(as("nonsense"), "read"), false);
console.log("can.test ok");
