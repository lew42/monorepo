// `static fields` is a code-only convenience (owner, 2026-10-03, second pass on
// the data decision): a name that collides with any real method, accessor or
// property already on the prototype chain must THROW at register() time, not
// be silently skipped. Run: node public/framework/core/Item/Item.test.mjs
import assert from "node:assert";
import Item from "./Item.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

// A fresh field name gets a working accessor.
class Foo extends Item { bar(){ return 1; } }
Foo.fields = ["title"];
Item.register(Foo, "Foo-test");
const f = new Foo({});
f.title = "x";
t(f.title === "x", "a declared field reads/writes through the accessor");
t(f.get("title") === "x", "get() sees the same value");

// A field name that collides with a real method throws, naming the class and
// the kind of thing it collided with.
class Bad extends Item { move(){ return 1; } }
Bad.fields = ["move"];
assert.throws(
	() => Item.register(Bad, "Bad-test"),
	/field "move" on Bad collides with method Bad\.move/,
	"a field colliding with a method throws, not silently skips",
);
n++;

// Re-registering the SAME class (its own prior accessor) is still safe —
// idempotent, not a collision.
assert.doesNotThrow(() => Item.register(Foo, "Foo-test"), "re-registering the same class does not throw");
n++;

// A subclass whose field collides with an INHERITED method (not just its own)
// also throws — the whole chain is checked, not just the class's own prototype.
class Base extends Item { shared(){ return 1; } }
class Sub extends Base {}
Sub.fields = ["shared"];
assert.throws(
	() => Item.register(Sub, "Sub-test"),
	/field "shared" on Sub collides with method Base\.shared/,
	"a field colliding with an inherited method throws too",
);
n++;

console.log(`ok — ${n} assertions passed`);
