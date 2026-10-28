// Task's core test, the same steps the test view draws (Task.steps.js). Run: node public/framework/core/Task/Task.steps.test.mjs
import Test from "../Test/Test.js";
import Steps from "../Test/Steps.js";
import steps from "./Task.steps.js";

const t = new Test("Task steps");
for (const r of await new Steps(steps).all()) t.ok(r.ok, `${r.step.title}: ${r.step.code}${r.error ? " threw " + r.error.message : ""}`);
t.done();
