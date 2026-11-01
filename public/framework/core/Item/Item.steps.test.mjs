// Item's core test, the same steps its class page draws (Item.steps.js). Run: node public/framework/core/Item/Item.steps.test.mjs
import Test from "../Test/Test.js";
import "../List/List.js";
import steps, { run_steps } from "./Item.steps.js";

const t = new Test("Item steps");
for (const r of await run_steps(steps)) t.ok(r.ok, `${r.step.title}: ${r.step.code}${r.error ? " threw " + r.error.message : ""}`);
t.done();
