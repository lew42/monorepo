/* node Servex/agents/path-mastermind.test.mjs — ONE mastermind role, spawned at a PATH (the owner, 2026-10-25; roles/mastermind.md
 * "Spawned at a path"): the path's readme chain and mastermind.md ride in the SYSTEM prompt, Servex checks and logs them, the old
 * `ai-system-mastermind` word is an alias with a default path (no singleton, no renewal), and the feedback inbox spawns a normal
 * mastermind at the AI folder. Temp dirs inside the repo for the lookup order; no process, no SDK call. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-pathmm-"));
const roles = await import("./roles.js");
const { role_system, path_check, path_note, alias_path, canonical, ROLES, ALIAS_PATHS } = roles;
const { Agents } = await import("./Agents.js");
const { default: ModuleInbox } = await import("./ModuleInbox.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ID = "ai-system-mastermind";

// roles.js: the singleton and renewal are gone; the old word is an alias with a default path
t(!("singleton" in ROLES.mastermind) && !("renew" in ROLES.mastermind) && !ROLES[ID], "no singleton or renew on the role table; no separate ai-system-mastermind row");
t(canonical(ID) === "mastermind" && canonical("servex-mastermind") === "mastermind", "both old words are aliases of mastermind");
t(alias_path(ID) === "public/framework/ai" && alias_path("servex-mastermind") === "public/framework/ai" && alias_path("mastermind") === null && alias_path("minion") === null, "the alias default path is the AI folder; the generic role has none");
t(ALIAS_PATHS[ID] === "public/framework/ai", "the alias-path map");
t(roles.singleton_id === undefined && roles.renew_of === undefined, "singleton_id and renew_of are deleted");

// role_system(role, {path}): lookup order, blocks, missing file
const tmp = path.join(REPO, `Servex/agents/.pathtest-${process.pid}`);
const rel = d => path.relative(REPO, d).split(path.sep).join("/");
try {
	const plain = path.join(tmp, "plain"), top = path.join(tmp, "top"), both = path.join(tmp, "both"), none = path.join(tmp, "none");
	for (const d of [path.join(top, "ai"), path.join(plain, "ai"), path.join(both, "ai"), none]) fs.mkdirSync(d, { recursive: true });
	fs.writeFileSync(path.join(top, "readme.md"), "# Top readme\nTOP-README-TEXT\n");
	fs.writeFileSync(path.join(top, "mastermind.md"), "TOP-MASTERMIND-TEXT\n");
	fs.writeFileSync(path.join(plain, "readme.md"), "# Plain readme\nPLAIN-README-TEXT\n");
	fs.writeFileSync(path.join(plain, "ai", "mastermind.md"), "AI-MASTERMIND-TEXT\n");
	fs.writeFileSync(path.join(both, "readme.md"), "# Both\nBOTH-README\n");
	fs.writeFileSync(path.join(both, "mastermind.md"), "FIRST-WINS\n");
	fs.writeFileSync(path.join(both, "ai", "mastermind.md"), "SECOND-LOSES\n");

	const withPath = role_system("mastermind", { path: rel(top) });
	const base = role_system("mastermind");
	t(withPath.startsWith(base) && withPath.length > base.length, "the path blocks come AFTER the role text");
	t(withPath.includes(`<path-readmes path="${rel(top)}">`) && withPath.includes("TOP-README-TEXT") && withPath.includes(`=== ${rel(top)}/readme.md ===`), "<path-readmes> holds the chain, each readme headed by its repo path");
	t(withPath.includes("=== readme.md ===") || withPath.includes("=== Servex/readme.md ==="), "the chain starts at the repo root, not just the leaf");
	t(withPath.includes(`<path-mastermind file="${rel(top)}/mastermind.md">`) && withPath.includes("TOP-MASTERMIND-TEXT"), "<path-mastermind> holds <path>/mastermind.md");
	const ai = role_system("mastermind", { path: rel(plain) });
	t(ai.includes(`<path-mastermind file="${rel(plain)}/ai/mastermind.md">`) && ai.includes("AI-MASTERMIND-TEXT"), "falls back to <path>/ai/mastermind.md");
	const first = role_system("mastermind", { path: rel(both) });
	t(first.includes("FIRST-WINS") && !first.includes("SECOND-LOSES"), "<path>/mastermind.md wins over <path>/ai/mastermind.md");
	t(!role_system("mastermind", { path: rel(none) }).includes("<path-mastermind"), "no mastermind.md: no <path-mastermind> block");
	t(!base.includes("<path-readmes"), "no path: the role text alone, no path blocks");

	// Servex's check: ok when every file's text is in the append; names the files that are not
	const ok = path_check(withPath, rel(top));
	t(ok.ok && ok.missing.length === 0 && ok.files.includes(`${rel(top)}/readme.md`) && ok.mastermind === `${rel(top)}/mastermind.md`, "check: every file is in the prompt, ok");
	t(/Servex put \d+ files? for your path/.test(path_note(ok)) && path_note(ok).includes("survive"), "the first-message line says the files are in the system prompt");
	const lacking = path_check(base, rel(top));
	t(!lacking.ok && lacking.missing.includes(`${rel(top)}/readme.md`) && lacking.missing.includes(`${rel(top)}/mastermind.md`), "check: a file that is not in the prompt is reported by name");
	t(!path_check(null, rel(top)).ok, "check: no system prompt at all is not ok");
	t(/WARNING/.test(path_note(lacking)) && path_note(lacking).includes(`${rel(top)}/mastermind.md`), "the first-message line names what is missing and says to read it");
	const outside = path_check(base, "../../../../nowhere");
	t(!outside.ok && outside.missing.some(m => /no readme/.test(m)), "a path with no readme chain is reported, not silently loaded");

	// Agents.spawn: the alias word spawns the mastermind at its default path; a caller's own path wins; ids come from the path leaf
	Agents.Agent.prototype.start = function(){ this.started = true; };
	const agents = new Agents();
	const a = agents.spawn({ role: ID, prompt: "how are tasks indexed?", parent: null, task: false });
	t(a.role === "mastermind" && a.path === "public/framework/ai" && a.id === "mastermind-ai", "ai-system-mastermind spawns as mastermind-ai at public/framework/ai");
	t(a.prompt.includes("Servex put") && a.prompt.includes("public/framework/ai") && a.prompt.includes("how are tasks indexed?"), "its first message says what Servex loaded, then the job");
	t(!a.prompt.includes("Where you are: readmes from the root down to"), "the chain is not ALSO prepended to the first message");
	t(a.recipe().path === "public/framework/ai", "path is in the recipe, so wake() and revive() keep it");
	const b = agents.spawn({ role: ID, prompt: "second", parent: null, task: false });
	t(b.id === "mastermind-ai-2" && b !== a, "a second one is -2; nothing sends to the first as a singleton");
	const c = agents.spawn({ role: ID, path: rel(top), prompt: "own path", parent: null, task: false });
	t(c.path === rel(top) && c.role === "mastermind" && c.id.startsWith("mastermind-"), "a caller's own path wins over the alias default");
	t(c.prompt.includes(`${rel(top)}/mastermind.md`), "the loaded file list names the path's mastermind.md");
	const d = agents.spawn({ role: "mastermind", path: "/framework/core/Page/", prompt: "site path", parent: null, task: false });
	t(d.path === "public/framework/core/Page", "a site path resolves to its repo folder");
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

// the feedback inbox: a repeat wakes the live one if it runs, else spawns a normal mastermind at the AI folder (no parent)
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "fb-"));
fs.mkdirSync(path.join(repo, "public/framework/ai"), { recursive: true });
const box = new ModuleInbox("ai", { repo });
const first = box.add("task marked complete on hand-off", "/x", { fix: "only the worker's landing line completes", from: "minion-a" });
t(box.repeats(first.id) === 1 && box.wake_for(first) === null, "first time: logged, no wake");
const second = box.add("same again", "/y", { fix: "same", repeat_of: first.id });
t(box.repeats(second.id) === 2 && box.wake_for(second) === null, "second time: counted, no wake");
const third = box.add("and again", "/z", { fix: "same", repeat_of: first.id });
t(box.repeats(first.id) === 3 && box.wake_for(third) === "logged 3 times", "third time: wakes");
t(box.wake_for(box.add("broken link in readme", "/w", { fix: "point it at x", obvious: true })) === "obvious", "obvious: wakes the first time");
t(box.wake_for(box.add("an owner ask", "/v")) === null, "an ask with no fix is not feedback");
assert.throws(() => box.add("x", "/u", { fix: "y", repeat_of: "i-nope" }));
n++;
const spawned = [], sent = [], live = new Map();
const servex = { agents: { live, spawn: spec => { spawned.push(spec); return { id: "mastermind-ai" }; }, send: (id, text) => sent.push([id, text]) } };
const [tool] = ModuleInbox.tools({ servex });
const real = ModuleInbox.resolve;
const call = args => { ModuleInbox.resolve = m => real(m, repo); try { return JSON.parse(tool.handler(args, { caller: "minion-b" })); } finally { ModuleInbox.resolve = real; } };
let out = call({ module: "ai", essence: "fourth", source: "/q", fix: "same", repeat_of: first.id });
t(out.repeats === 4 && out.woke === null && spawned.length === 0, "the fourth repeat does not wake it again");
box.outcome(first.id, { state: "decided", note: "fixed in x", by: "mastermind-ai" });
out = call({ module: "ai", essence: "fifth", source: "/q", fix: "same", repeat_of: first.id });
t(out.woke === "mastermind-ai" && spawned.length === 1 && spawned[0].role === "mastermind" && spawned[0].path === "public/framework/ai" && spawned[0].parent === null, "no live one: spawns a mastermind at public/framework/ai with no parent");
t(/back after it was marked decided/.test(spawned[0].prompt) && /Suggested fix: same/.test(spawned[0].prompt), "the spawn prompt carries the problem and the fix");
live.set(ID, { id: ID, state: "idle" });
out = call({ module: "ai", essence: "sixth", source: "/q", fix: "same", repeat_of: first.id });
t(out.woke === ID && sent.length === 1 && sent[0][0] === ID && spawned.length === 1, "the live ai-system-mastermind is told instead of spawning another");

console.log(`path-mastermind: ${n} checks passed`);
