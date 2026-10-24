// Server/TaskQueue.mjs — the thin adapter: gathers the open tasks' records, hands them to core/Task/TaskQueue.js (the one ranking), and registers
// the read-only "taskqueue" query source for /framework/ai/queue/. Check: node Server/TaskQueue.mjs --check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SessionIndex from "./SessionIndex.mjs";
import QueryServer from "../public/framework/ext/Query/QueryServer.mjs";
import TaskQueue from "../public/framework/core/Task/TaskQueue.js";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASKS = path.join(REPO, "public/framework/ext/Refine/queue/asks.jsonl");

const read = file => { try { return fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l ? [JSON.parse(l)] : []; } catch { return []; } }); } catch { return []; } };

/** The records the class ranks: open tasks (idle, waiting, running) with their lines, landed tasks' real costs, and the refined asks. */
export function gather(ix = SessionIndex.shared){
	const open = [], landed = [];
	for (const r of ix.tasks()){
		const module = SessionIndex.module_of(r.dir) ?? "ai";
		if (r.landed){ if (r.usd > 0) landed.push({ module, usd: r.usd }); continue; }
		if (!["idle", "waiting", "running"].includes(r.state)) continue;
		const file = path.join(REPO, r.dir, "task.jsonl");
		if (fs.existsSync(file)) open.push({ slug: r.slug, url: r.url, module, state: r.state, usd: r.usd, agent: r.agent, lines: read(file) });
	}
	return { open, ctx: { landed, asks: read(ASKS) } };
}

export const build = ix => { const g = gather(ix); return TaskQueue.build(g.open, g.ctx); };

QueryServer.source("taskqueue", {
	load: () => SessionIndex.shared.load(),
	items: () => build(SessionIndex.shared),
	on: fn => SessionIndex.shared.on(fn),
	shape: r => r,
	unload_after: 24 * 3600e3,
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === "--check"){
	const ix = SessionIndex.shared; await ix.load();
	const q = build(ix);
	console.log(q.length, "queued");
	for (const x of q.slice(0, 20)) console.log(x.rank, x.score, `big${x.big}`, x.state, `$${x.est_usd}`, `re${x.re_asks}`, x.module, "|", x.title.slice(0, 60));
	process.exit(0);
}
