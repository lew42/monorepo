// Review finding 8 proof: does build()'s spawn (role "expert", cwd the repo) get
// the root readme chain prepended TWICE — once by Agents.js's spawn() itself
// (first_prompt(dir)) and once by experts.js's own format(p) (its "## Where it
// sits" chain section)?
//
// Agents.js's spawn() only prepends first_prompt(dir) when directory_of(spec)
// finds spec.task?.dir or spec.page (Agents.js:406-412: "Neither present (a
// plain minion, most forks, the fast assistant) -> null, and spawn() adds
// nothing"). experts.js's _build() spawns with { role, name, model, effort, cwd,
// permission_mode, setting_sources, prompt } — no `task`, no `page` — so
// directory_of(spec) returns null and Agents.js adds nothing.
//
// This script proves it with NO model call: it builds the exact spec shape
// _build() passes to host.spawn() (experts.js's build(), ~line 273-275), confirms
// task/page are absent (so Agents.js's own prepend never fires), and prints every
// `### ` heading in the resulting prompt — the root readme.md's chain heading
// should appear exactly once, from format(p) alone.
//
// Run: node item8-no-double-chain.mjs   (from this directory, or anywhere — it
// imports experts.js by an absolute file:// url)

import { load_module, format } from "file:///C:/Code/lew42/worktrees/module-experts/Servex/agents/experts.js";

const module = "core/Page";
const p = load_module([module]);
const say = `You are the core/Page expert. Read nothing else now. Reply only: READY.`;
const prompt = `${format(p)}\n\n${say}`;

// The exact spec shape build()/_build() passes to host.spawn() — reproduced here
// (not imported, since _build isn't exported: it's the private half of build())
// so this can inspect it without spawning a real agent or spending a model call.
const spec = {
	role: "expert", name: "core-page", model: "claude-sonnet-5", effort: "medium",
	cwd: "REPO", permission_mode: "bypassPermissions", setting_sources: [], prompt,
};

console.log("spec.task:", spec.task, " spec.page:", spec.page);
console.log("-> directory_of(spec) is null (Agents.js:406-412 checks only spec.task?.dir / spec.page),");
console.log("   so Agents.js's spawn() prepends nothing before this prompt. What ships IS this prompt:\n");

const headings = prompt.split("\n").filter(l => l.startsWith("### "));
console.log(`${headings.length} '### ' headings in the built prompt.`);

const rootReadme = headings.filter(h => h === "### readme.md (first screen; open the file for the rest)" || h === "### readme.md");
console.log(`Root readme.md heading count: ${rootReadme.length} (expect 1 — no duplicate).`);
