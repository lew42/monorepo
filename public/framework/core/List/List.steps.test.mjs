// List's core test, the same steps its class page draws (List.steps.js). Run: node public/framework/core/List/List.steps.test.mjs
import Test from "../Test/Test.js";
import "./List.js";
import steps from "./List.steps.js";
import { run_steps } from "../Item/Item.steps.js";

const t = new Test("List steps");
for (const r of await run_steps(steps)) t.ok(r.ok, `${r.step.title}: ${r.step.code}${r.error ? " threw " + r.error.message : ""}`);
t.done();
