// Renames "phase" to "step" in the process system only (core/Task/doc/process-names.md). `node Server/rename-phase-to-step.mjs --dry-run` prints and changes nothing.
// Each file lists the lines it may touch (a regex, or all). Every change is written to rename-manifest.md in the task folder: file:line, old, new.
// "phase" elsewhere (review phases, SDK, requirements "Phase 2") is never in the list. process-names.md is edited by hand: it names the old word on purpose.
// Old logs are never rewritten: readers accept the old `phase` field (Process.replay_line).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry-run");
const TASK_DIR = "public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/process-names";

const FILES = [
	{ file: "public/framework/core/Task/Process.js" },
	{ file: "Servex/ProcessRunner.js" },
	{ file: "Servex/ProcessRunner.test.mjs" },
	{ file: "public/framework/core/Task/doc/process.md" },
	{ file: "public/framework/core/Task/readme.md", only: /Process\.js/ },
	{ file: "Servex/agents/page_tools.js", only: /Process|per phase|phase: task\.phase/ },
	{ file: "Servex/agents/Agents.js", only: /process phase/ },
	{ file: "Servex/Servex.js", only: /THE PROCESS RUNNER/ },
];
// Specific renames first (the `phases:` override option would collide with the `steps` argument), then the plain words.
const RULES = [
	[/phases: over = \{\}/g, "steps_over: over = {}"],
	[/`phases` overrides/g, "`steps_over` overrides"],
	[/\bphases\b/g, "steps"], [/\bPhases\b/g, "Steps"],
	[/\bphase\b/g, "step"], [/\bPhase\b/g, "Step"],
	[/\bPHASE_LINES\b/g, "STEP_LINES"],
];

// Once run, the alias `body.step ?? body.phase` must survive: a second run would erase it, so refuse.
if (fs.readFileSync(path.join(root, FILES[0].file), "utf8").includes("STEP_LINES")){ console.error("already renamed (STEP_LINES is in Process.js); nothing done"); process.exit(1); }

const manifest = [`# rename-manifest: phase to step${dry ? " (dry run)" : ""}`, ""];
for (const { file, only } of FILES){
	const abs = path.join(root, file);
	if (!fs.existsSync(abs)){ manifest.push(`- ${file}: missing, skipped`); continue; }
	const src = fs.readFileSync(abs, "utf8").split("\n");
	const out = src.map((line, i) => {
		if (only && !only.test(line)) return line;
		let n = line;
		for (const [re, to] of RULES) n = n.replace(re, to);
		if (n !== line) manifest.push(`- ${file}:${i + 1}: \`${line.trim().slice(0, 110)}\` -> \`${n.trim().slice(0, 110)}\``);
		return n;
	});
	if (!dry) fs.writeFileSync(abs, out.join("\n"));
}
console.log(manifest.join("\n"));
if (!dry){
	fs.mkdirSync(path.join(root, TASK_DIR), { recursive: true });
	fs.writeFileSync(path.join(root, TASK_DIR, "rename-manifest.md"), manifest.join("\n") + "\n");
}
