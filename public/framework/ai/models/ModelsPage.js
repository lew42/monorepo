import { Page, div, p, h2, h3, small, strong, code, table, thead, tbody, tr, th, td } from "/app.js";

/* Which agent runs on which model: the tables are drawn from now.json, which
 * `node Server/models-now.mjs --write` computes from roles.js, the live registry and the spend logs. */
export default class ModelsPage extends Page {
	static DATA = new URL("./now.json", import.meta.url);

	static grid(head, rows){
		table(() => { thead(() => tr(() => head.forEach(h => th(h)))); tbody(() => rows.forEach(r => tr(() => r.forEach(c => td(String(c)))))); });
	}

	// The box is captured before the fetch and filled in its callback: drawing after an `await` lands outside the page (CLAUDE.md traps).
	content(){
		const $intro = div.c("block"), $box = div.c("block wide");   // the sentences keep the reading width; the tables (`wide`) are not squeezed to 640 px
		fetch(ModelsPage.DATA).then(r => r.json()).catch(() => null).then(d => $box.append(() => {
		if (!d) return p("No now.json yet: run `node Server/models-now.mjs --write`.");
		const c = d.cost_24h, k = c.claude, G = ModelsPage.grid;
		$intro.append(() => p(`Backend now: ${d.backend}. When this was computed (${new Date(d.generated_at).toLocaleString()}), Claude was at ${k.five_hour_pct}% of its 5-hour window and ${k.seven_day_pct}% of the week, and OpenRouter had cost $${c.openrouter_usd} in 24 hours; the live meters are on the AI Inbox. Flip with \`node Server/models-now.mjs --backend openrouter|anthropic\` (takes effect at the next Servex restart).`));
		h2("What a new agent gets, by role");
		G(["role", "model", "provider", "where it comes from"], d.roles.map(r => [r.role, r.model, r.provider, r.origin]));
		h2("Agents in the registry, by role and model");
		p(`${d.agents_counted} agents counted, ${d.registry_rows} registry rows: ${d.counts_agree ? "they agree" : "THEY DISAGREE"}. Running now by provider: ${Object.entries(d.live_by_provider ?? {}).map(([k, n]) => `${k} ${n}`).join(", ") || "none"}. Parked (dormant) rows keep the model they last ran on, so old OpenRouter rows are history, not spend.`);
		G(["role", "model", "provider", "total", "running", "parked"], d.agents.slice(0, 40).map(g => [g.role, g.model, g.provider, g.count, g.live, g.dormant]));
		small(`Computed ${d.generated_at} from ${d.agents_source}.`);
		}));
	}
}
