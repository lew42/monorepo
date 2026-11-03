import { div, span, small, p, a } from "/app.js";

// The "what was it doing" half of a session's detail page, drawn from trace.json (written by hand:
// `node public/framework/ai/AISession/AISessionAudit.mjs --trace-file <id> <out>`; see doc/decisions.md): a cost-over-time chart,
// a per-tool table, and four waste checks. The numbers are computed from `trace.calls`, never guessed.
export default class AISessionTrace {

	static WRITE_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
	static READ_TOOLS = new Set(["Read", "Grep", "Glob", "ToolSearch"]);

	/** One row per tool, biggest $ first. A turn's $ exists once however many tool calls it made, so `turn_at` de-dupes. */
	static table_rows(trace){
		if (!trace?.calls?.length) return [];
		const turn_usd = new Map((trace.turns || []).map(t => [t.at, t.usd]));
		const total = [...turn_usd.values()].reduce((n, usd) => n + usd, 0);
		const by_tool = new Map();
		for (const c of trace.calls){
			const row = by_tool.get(c.tool) || { tool: c.tool, count: 0, turn_ats: new Set() };
			row.count++;
			row.turn_ats.add(c.turn_at);
			by_tool.set(c.tool, row);
		}
		const rows = [...by_tool.values()].map(r => {
			const usd = [...r.turn_ats].reduce((n, at) => n + (turn_usd.get(at) || 0), 0);
			return { tool: r.tool, count: r.count, usd, share: total > 0 ? usd / total : 0 };
		});
		rows.sort((a, b) => b.usd - a.usd);
		return rows;
	}

	/** A Bash command only MIGHT write: this is a pattern match on the text, not a certainty. */
	static bash_looks_like_a_write(cmd){
		return /(>|>>|\brm \b|\bmv \b|\bcp \b|mkdir|touch |git (add|commit|checkout|reset)|npm i|writeFileSync|Set-Content|Out-File)/i.test(cmd || "");
	}

	static call_writes(c){
		return AISessionTrace.WRITE_TOOLS.has(c.tool) || (c.tool === "Bash" && AISessionTrace.bash_looks_like_a_write(c.input?.command));
	}

	/** A path shows its last ~57 characters: the part that tells two files apart. */
	static short(s){ s = String(s ?? ""); return s.length > 60 ? "…" + s.slice(-57) : s; }

	/** Four waste checks, one plain sentence each. The thresholds are a first guess (doc/decisions.md names each as tunable). */
	static waste_flags(trace){
		const { short, call_writes, READ_TOOLS } = AISessionTrace;
		const calls = trace?.calls || [];
		const flags = [];
		if (!calls.length) return flags;

		// 1. The same file read 3+ times.
		const read_counts = new Map();
		for (const c of calls) if (c.tool === "Read") read_counts.set(c.target, (read_counts.get(c.target) || 0) + 1);
		for (const [file, n] of read_counts) if (n >= 3) flags.push(`${short(file)} was read ${n} times — maybe one read with a wider range would have done.`);

		// 2. Chunked reads: 2+ reads of one file with a different offset/limit each time.
		const by_file_reads = new Map();
		for (const c of calls) if (c.tool === "Read"){
			if (!by_file_reads.has(c.target)) by_file_reads.set(c.target, []);
			by_file_reads.get(c.target).push(c);
		}
		for (const [file, reads] of by_file_reads){
			if (reads.length < 2) continue;
			const any_offset = reads.some(r => r.input?.offset != null || r.input?.limit != null);
			const shapes = new Set(reads.map(r => `${r.input?.offset ?? ""}:${r.input?.limit ?? ""}`));
			if (any_offset && shapes.size >= 2) flags.push(`${short(file)} was read in ${reads.length} separate chunks of the same file (a different offset/limit each time).`);
		}

		// 3. Polling: the same file or the exact same Bash command 2+ times, under 15 seconds apart, nothing written between.
		for (const tool of ["Read", "Bash"]){
			const key_of = c => tool === "Bash" ? (c.input?.command || c.target) : c.target;
			const by_key = new Map();
			calls.forEach((c, i) => { if (c.tool !== tool) return; const k = key_of(c); if (!by_key.has(k)) by_key.set(k, []); by_key.get(k).push(i); });
			for (const [key, idxs] of by_key){
				let cluster = [idxs[0]];
				const flush = () => {
					if (cluster.length >= 2) flags.push(`${short(key)} was ${tool === "Bash" ? "run" : "read"} ${cluster.length} times within 15 seconds of each other, nothing written in between — looks like polling/waiting, not a real change.`);
					cluster = [];
				};
				for (let k = 1; k < idxs.length; k++){
					const gap = (Date.parse(calls[idxs[k]].at) - Date.parse(calls[idxs[k - 1]].at)) / 1000;
					const wrote = Array.from({ length: idxs[k] - idxs[k - 1] - 1 }, (_, j) => calls[idxs[k - 1] + 1 + j]).some(call_writes);
					if (gap >= 0 && gap <= 15 && !wrote) cluster.push(idxs[k]);
					else { flush(); cluster = [idxs[k]]; }
				}
				flush();
			}
		}

		// 4. Long read-no-write runs: 5+ read-shaped calls in a row.
		const RUN_THRESHOLD = 5;
		let run = 0, run_start = null;
		const runs = [];
		for (let i = 0; i < calls.length; i++){
			const c = calls[i];
			if (READ_TOOLS.has(c.tool) && !call_writes(c)){
				if (run === 0) run_start = i;
				run++;
			} else {
				if (run >= RUN_THRESHOLD) runs.push({ start: run_start, len: run });
				run = 0;
			}
		}
		if (run >= RUN_THRESHOLD) runs.push({ start: run_start, len: run });
		for (const r of runs) flags.push(`${r.len} read-only tool calls in a row with no write in between, starting at call #${r.start + 1}.`);

		return flags;
	}

	/** A round step (1, 2, 5 × 10ⁿ) for about `count` gridlines; the same helper ux/Content/Spend.js uses. */
	static nice_step(max, count){
		const raw = max / count, mag = 10 ** Math.floor(Math.log10(raw || 1)), r = raw / mag;
		return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * mag;
	}

	static esc_attr(s){ return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

	/** Cumulative cost over time as plain inline SVG (no charting library), with a tick per tool call. Both axes start at 0. */
	static chart_svg(trace, w){
		const { nice_step, esc_attr } = AISessionTrace;
		w = w || 720;
		const H = 220, L = 56, R = 16, T = 20, B = 34, iw = w - L - R, ih = H - T - B;
		const turns = trace.turns || [], calls = trace.calls || [];
		if (!turns.length) return "";

		const t0 = Date.parse(turns[0].at);
		const elapsed = at => (Date.parse(at) - t0) / 1000;   // seconds; the unit is a display choice below

		let cum = 0;
		const steps = [[0, 0]];
		for (const t of turns){
			const x = elapsed(t.at);
			steps.push([x, cum]);
			cum += t.usd;
			steps.push([x, cum]);
		}
		const calls_max_x = calls.length ? Math.max(...calls.map(c => elapsed(c.at))) : 0;
		const max_x = Math.max(steps.at(-1)[0], calls_max_x, 1);
		steps.push([max_x, cum]);

		const total_usd = cum;
		const y_step = nice_step(total_usd || 1, 4);
		const y_max = Math.ceil((total_usd || 1) / y_step) * y_step || 1;

		let unit = "s", unit_div = 1;
		if (max_x > 3 * 3600) { unit = "h"; unit_div = 3600; }
		else if (max_x > 180) { unit = "min"; unit_div = 60; }

		const X = secs => L + (secs / max_x) * iw;
		const Y = usd => T + ih - (usd / y_max) * ih;

		let s = `<svg viewBox="0 0 ${w} ${H}" width="${w}" height="${H}" role="img" aria-label="Cumulative cost over time — total $${total_usd.toFixed(2)}, ${calls.length} tool calls">`;

		for (let v = 0; v <= y_max + 1e-9; v += y_step){
			s += `<line class="g" x1="${L}" x2="${w - R}" y1="${Y(v)}" y2="${Y(v)}"/>`;
			s += `<text class="t" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">$${v.toFixed(2)}</text>`;
		}

		// a tick per tool call, on the x-axis baseline: many ticks on a flat stretch (cheap tool-calling) reads differently from a jump with none
		const baseline = T + ih;
		for (const c of calls){
			const x = X(elapsed(c.at)).toFixed(1);
			s += `<line class="tick" x1="${x}" x2="${x}" y1="${baseline - 6}" y2="${baseline}"><title>${esc_attr(c.tool)}: ${esc_attr(c.target)}</title></line>`;
		}

		const path = steps.map(([x, y], i) => `${i === 0 ? "M" : "L"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ");
		s += `<path class="line" d="${path}" fill="none"/>`;

		const nt = Math.max(2, Math.min(6, Math.floor(iw / 90)));
		for (let i = 0; i <= nt; i++){
			const secs = max_x * i / nt, x = X(secs);
			const label = (secs / unit_div).toFixed(secs / unit_div < 10 ? 1 : 0);
			s += `<text class="t" x="${x.toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === nt ? "end" : "middle"}">${label}${unit}</text>`;
		}

		s += `<text class="total" x="${L}" y="14">$${total_usd.toFixed(2)} total — Claude $ (no real per-turn OpenRouter split in this session's own data; doc/decisions.md)</text>`;
		s += `</svg>`;
		return s;
	}

	/** The chart, the per-tool table and the waste flags, drawn into the current capture. Call only with a real trace. */
	static render(trace){
		small.c("muted", "What it was doing (public/framework/ai/AISession/AISessionAudit.mjs --trace-file — a manual, on-demand file; doc/decisions.md)");
		div.c("sessions-trace-chart").html_unsafe(AISessionTrace.chart_svg(trace, 720));

		const rows = AISessionTrace.table_rows(trace);
		if (rows.length){
			div.c("sessions-trace-table", () => {
				div.c("sessions-trace-row sessions-trace-head", () => {
					small.c("muted", "Tool"); small.c("muted", "Calls"); small.c("muted", "$"); small.c("muted", "Share");
				});
				rows.forEach(r => div.c("sessions-trace-row", () => {
					span(r.tool);
					small.c("muted", String(r.count));
					small.c("muted", "$" + r.usd.toFixed(2));
					small.c("muted", Math.round(r.share * 100) + "%");
				}));
			});
		}

		const flags = AISessionTrace.waste_flags(trace);
		div.c("flow", () => {
			small.c("muted", "Waste check (computed — same file read 3+ times, chunked reads, polling, long read-no-write runs)");
			if (!flags.length) p.c("muted", "Nothing flagged.");
			else flags.forEach(f => p.c("sessions-trace-flag", f));
		});
	}

	/** Who spawned this agent, why, and what it spawned in turn. Each child links to the same page shape one level down. */
	static render_spawn(node, spend, root_url){
		small.c("muted", "Spawned (Server/spend-tree.mjs — see doc/spend-tree.md)");

		div.c("sessions-cost-row card flex gap-50 v-center wrap", () => {
			small.c("sessions-row-title", "Trigger: " + node.trigger);
			if (node.parent){
				a.c("sessions-tag sessions-tag-servex").href(root_url + node.parent + "/").text("↑ " + node.parent);
				if (node.parent_source !== "registry") small.c("muted").attr("title", "Servex didn't record this spawn's parent — this script worked it out from task.jsonl.").text("(" + node.parent_source.replace("reconstructed: ", "guessed from ") + ")");
			} else {
				small.c("muted", "no known spawner — " + (node.parent_source === "unknown" ? "none of task.jsonl, the registry or a name match found one" : node.parent_source));
			}
		});

		const own = (node.own_claude_usd ?? 0) + (node.own_or_usd ?? 0);
		const subtree = node.subtree_claude_usd + node.subtree_or_usd;
		div.c("sessions-cost-row card flex gap-50 v-center", () => {
			small(`Own: $${own.toFixed(2)}`);
			if (node.children_count) small.c("muted", `Whole subtree: $${subtree.toFixed(2)} across ${node.descendant_count} descendant${node.descendant_count === 1 ? "" : "s"}`);
		});

		const kids = [...spend.by_id.values()].filter(n => n.parent === node.id)
			.sort((a, b) => (b.subtree_claude_usd + b.subtree_or_usd) - (a.subtree_claude_usd + a.subtree_or_usd));
		if (!kids.length) return;
		small.c("muted", `Spawned ${kids.length} agent${kids.length === 1 ? "" : "s"} directly`);
		div.c("flow", () => kids.forEach(k => {
			const k_own = (k.own_claude_usd ?? 0) + (k.own_or_usd ?? 0);
			const k_subtree = k.subtree_claude_usd + k.subtree_or_usd;
			a.c("sessions-cost-row card flex gap-50 v-center").href(root_url + k.id + "/").append(() => {
				small.c("sessions-row-title", k.id);
				small.c("muted", k.trigger);
				small(`$${k_own.toFixed(2)}`);
				if (k.children_count) small.c("muted", `+ $${(k_subtree - k_own).toFixed(2)} under it (${k.descendant_count})`);
			});
		}));
	}
}
