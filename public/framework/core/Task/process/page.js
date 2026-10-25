import { Doc, md, h2, code, div, span, p } from "/app.js";
import Process from "../Process.js";
import "../processes/index.js";

const RUN = "/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/";

export default new Doc({
	meta: import.meta,
	title: "Process",
	description: "A Task whose children are named steps. Node runs them in order and hands each step's instructions to the next session.",
	icon: "account_tree",

	subject: Process,
	properties: "process creator steps step",
	methods: "next run_of prompt moves_home",
	files: "page.js",

	async content(){
		let lines;   // only the step log: a {task} line would swap a step for its own folder's file
		try { lines = (await (await fetch(RUN + "task.jsonl")).text()).split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l)).filter(l => typeof l.task !== "string"); } catch {}
		div.c("flex v gap", () => this.body(lines)).style({ "max-width": "60em", width: "100%" });
	},

	body(lines){
		md("A **process** is a standard way of doing a kind of work, written down as steps. Node starts step 1, launches the session each step names, and when a step is done it starts the next. No agent has to remember the order.");

		h2("A real run: the readmes page, through build");
		if (!lines) return p("The run log could not be loaded.");
		const run = Process.replay(lines);
		const total = lines.filter(l => l.measure).reduce((n, l) => n + (l.measure.usd || 0), 0);
		md(`**${run.get_one("title") ?? run.id}**, process \`${run.process}\`, state **${run.state}**, ${run.steps.length} steps, measured cost **$${total.toFixed(2)}**. Read live from [its log](${RUN}task.jsonl), not copied.`);
		div.c("flex v gap", () => {
			run.steps.forEach((s, i) => {
				const sp = s.get_one("spawned"), m = s.get_one("measure"), w = s.get_one("wait");
				div.c("flex wrap gap v-center", () => {
					span.c("h4", `${i + 1}. ${s.get_one("title") ?? s.id}`).style("flex", "1 1 10em");
					span.c("", s.state);
					span.c("muted", sp ? `${sp.run}: ${sp.agent}` : (s.get_one("session")?.run ?? "") + (w ? ` · waits on ${w.on}` : ""));
					span.c("muted", m ? `$${Number(m.usd).toFixed(2)}` : "");
				});
			});
		});

		h2("Does finishing step N hand step N+1 its instructions?");
		md("**Yes, node does it, in a chain.** The agent's `complete` line wakes `ProcessRunner.step()` (the item tool hook). `run()` reads the file and asks `Process.next()`: step N is complete, so the first open step, N+1, is idle and the answer is `{start: N+1}`. `run()` writes that line, asks again, gets `{launch: N+1}`, and `launch()` sends `Process.prompt(N+1)` to the step's session: a new agent (`fresh`), the previous agent (`same`) or the creator (`owner`). That prompt carries N+1's job, the brief, **and the outcome text of every finished step**. See `ProcessRunner.js` `run` and `launch`, `Process.js` `next` and `prompt`.");
		code.js(`// the prompt step 2 gets, built from the real run above
${run.prompt("plan", "/run/").split("\n").slice(0, 8).join("\n")}`);

		h2("The templates");
		md(Process.names().map(n => `- \`${n}\`: ${Process.template(n).steps.map(s => s.id).join(" → ")}`).join("\n"));
		md("Each template is a small subclass in `processes/` with `static steps = [...]`; a step names its `session` (`fresh`, `same`, `owner`, `wait`) and what to `do`.");

		md.details(import.meta, "../doc/process.md", "Design doc");
	}
});
