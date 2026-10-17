// Prints every module list task replayed with Task.replay_new (+ Task.rank): each goal, its child count, how many are complete.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
let ROOT = path.dirname(fileURLToPath(import.meta.url));
while (!fs.existsSync(path.join(ROOT, "Servex", "agents", "page_tools.js"))) ROOT = path.dirname(ROOT);
const { link_refs } = await import(pathToFileURL(path.join(ROOT, "Servex", "agents", "page_tools.js")).href);
const { Task } = await import(pathToFileURL(path.join(ROOT, "public/framework/core/Task/Task.js")).href);
link_refs(Task);
const seed = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "seed.json"), "utf8"));
const lines = f => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
for (const module of Object.keys(seed.goals)){
	const f = path.join(ROOT, "public/framework", module, "tasks/task.jsonl");
	const list = Task.replay(lines(f));
	const goals = Task.rank([...list._tasks]);
	console.log(`${module}/tasks  (${goals.length} goal${goals.length === 1 ? "" : "s"}, ranked)`);
	for (const g of goals){
		const p = g.progress();
		console.log(`  - ${g.get_one("title")}: ${p.total} children, ${p.done} complete, state ${g.state}, completion ${g.completion.toFixed(2)}`);
	}
}
