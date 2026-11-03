// scratch test: copies of two real proposals only; never touches a real record.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const ROOT = "C:/Code/lew42/worktrees/qf-1", PUB = ROOT + "/public", S = "/framework/ai/asks/scratch-triage/";
const PT = (await import(pathToFileURL(ROOT + "/Server/ProposalTriage.mjs").href)).default;
const { default: AIIndex } = await import(pathToFileURL(ROOT + "/Server/AIIndex.mjs").href);
const { run_item } = await import(pathToFileURL(ROOT + "/Servex/agents/page_tools.js").href);
const t = new PT({ root: ROOT });
const real = t.proposals().slice(0, 4);
const state = id => { const f = AIIndex.fold(AIIndex.read_lines(PUB + S + "tasks/" + id + "/task.jsonl"), true); return f; };
const mk = (id, src) => { fs.mkdirSync(PUB + S + "tasks/" + id, { recursive: true }); fs.copyFileSync(PUB + src + "task.jsonl", PUB + S + "tasks/" + id + "/task.jsonl"); return S + "tasks/" + id + "/"; };
const tail = id => fs.readFileSync(PUB + S + "tasks/" + id + "/task.jsonl", "utf8").trim().split("\n").slice(-2);
const mode = process.argv[2];
if (mode === "write"){
	const c = mk("c", real[0].task), d = mk("d", real[1].task);
	console.log("write approve:", await t.write({ task: c, action: "approve", priority: 2, name: "Every ask becomes a task that finishes" }, run_item));
	console.log("write backlog:", await t.write({ task: d, action: "backlog" }, run_item));
	for (const id of ["c", "d"]) console.log(id, "last lines:\n  " + tail(id).map(l => l.slice(0, 230)).join("\n  "));
}
if (mode === "seed"){
	const rows = [];
	for (const [id, i] of [["e", 2], ["f", 3]]){
		const u = mk(id, real[i].task);
		await t.write({ task: u, action: "backlog" }, run_item);
		rows.push({ task: u, module: real[i].module, priority: null, action: "backlog", at: new Date().toISOString() });
	}
	fs.writeFileSync(PUB + S + "triage.jsonl", rows.map(r => JSON.stringify(r)).join("\n") + "\n");
	for (const id of ["e", "f"]) console.log(id, "seeded last:", tail(id).slice(-1)[0]);
}
if (mode === "after") for (const id of ["e", "f"]) console.log(id, "after Approve all, last 2 lines:\n  " + tail(id).map(l => l.slice(0, 230)).join("\n  "));
