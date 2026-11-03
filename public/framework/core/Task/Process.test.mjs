// Process: a Task of named steps that only node moves; next() is its one decision. One instance, each step of its life checked. Run: node public/framework/core/Task/Process.test.mjs
import assert from "node:assert/strict";
import Process from "./Process.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

const lines = Process.lines({ process: "steps", title: "P", steps: [{ id: "a", title: "A", do: "do a" }, { id: "b", title: "B", do: "do b", session: { run: "wait" } }] });
t(lines.length === 3 && lines[0].class === "Process" && lines[0].mode === "series", "lines(): line 1 plus one add per step");
t(Process.lines({ process: "no-such-process" }) === null, "lines(): no definition and no steps is refused");
t(Process.names().includes("steps") === false, "names(): ad-hoc steps are not a template");

const p = Process.replay(lines);
t(p instanceof Process && p.mode === "series" && p.process === "steps", "replay builds a series Process");
t(p.steps.map(s => s.id).join() === "a,b" && p.step.id === "a", "steps in order; step is the first not complete");
t(p.run_of(p.steps[0]) === "owner" && p.run_of(p.steps[1]) === "wait", "run_of: ad-hoc default is the owner; a step's own session wins");
t(new Process({ id: "z" }).next().start === true, "idle: next is start");
t(p.state === "running" && p.next().start === "a", "running: next starts the first step");
p.steps[0].start();
t(p.next() === null || p.next().launch === "a", "a step running with no session spawned: launch it (or nothing for the owner)");
p.steps[0].complete({ outcome: "done a", evidence: ["t"] });
t(p.step.id === "b" && p.next().wait === "b", "after a: step b, a wait step");
t(p.prompt("b", "/x/").includes("done a") && p.prompt("b", "/x/").includes("do b"), "prompt: carries the earlier outcome and the job");
t(p.prompt("zzz", "/x/") === null, "prompt: unknown step is null");
t(Process.reserved("start") && !Process.reserved("alpha"), "reserved: verbs are, plain words are not");
t(Process.from_steps([{ title: "Do this" }, { title: "Do this" }]) === null, "from_steps: duplicate ids are refused");
t(Process.from_steps(["improve"])[0].id === "improve-step", "from_steps: a verb-named id gets -step");
p.steps[1].start(); p.steps[1].complete({ outcome: "done b", evidence: ["t"] });
t(p.step === null && p.next().complete === true, "all steps complete: next is complete");

console.log(`Process: ${n} checks passed`);
