// zod_of: the schema an in-process tool (mcp__local__*) checks a call against. Run: node Servex/agents/zod_of.test.mjs
import { zod_of } from "./zod_of.js";
let n = 0;
const ok = (cond, what) => { if (!cond) { console.error("FAIL: " + what); process.exit(1); } n++; };

const args = zod_of({ type: ["object", "array", "string", "number", "boolean"] });   // the item tool's `args`
for (const v of [{ title: "x" }, "c1", ["h1", "c2"], 2, true]) ok(args.safeParse(v).success, `args accepts ${JSON.stringify(v)}`);
const untyped = zod_of({ description: "page_call's args" });
ok(untyped.safeParse({ title: "x" }).success, "an untyped field accepts an object (it used to become a string)");
const task = zod_of({ type: ["object", "boolean"] });
ok(task.safeParse(false).success && task.safeParse({ dir: "x" }).success && !task.safeParse("x").success, "`task` is still an object or a boolean, never a string");
ok(zod_of({ type: "string" }).safeParse("a").success && !zod_of({ type: "string" }).safeParse(1).success, "a string field is still a string");
ok(zod_of({ enum: ["a", "b"] }).safeParse("a").success && !zod_of({ enum: ["a", "b"] }).safeParse("c").success, "an enum is still an enum");
console.log(`zod_of: ${n} checks passed`);
