import { View, div, span, small, h3, details, summary } from "/app.js";
import { servex_base } from "./inbox.js";

View.stylesheet(import.meta, "processes.css");

// Graph design: RAM stacked area + CPU line with shared hover; see doc/Processes-notes.md

const VB_W = 200;   // one shared horizontal resolution for both charts
const RAM_H = 60, CPU_H = 22;

const TOP_GROUPS = 5;

export class Processes {
	// Processes section: `/framework/ai2/live/`'s "Processes" block; polls `/api/processes` snapshot, draws it. See doc/Processes-notes.md for data shape.

	// Poller: skip while tab hidden, catch up on visibility; same pattern as poll_pool
	static create(changed){
		let data = null;
		async function poll(){
			if (document.hidden) return;
			try {
				const res = await fetch(servex_base() + "/api/processes");
				data = res.ok ? await res.json() : null;
			} catch { data = null; }
			changed();
		}
		poll();
		const timer = setInterval(poll, 10000);
		const onvis = () => { if (!document.hidden) poll(); };
		document.addEventListener("visibilitychange", onvis);
		return {
			data: () => data,
			stop(){ clearInterval(timer); document.removeEventListener("visibilitychange", onvis); },
		};
	}

	// One place knows agent state (running/lost/dormant) — shared with live.js "Running now"

	/** `running[]` as a lookup by agent id. */
	static running_index = list => new Map((list ?? []).map(r => [r.id, r]));

	// Process state badge: "pid N · MB", "no process", "dormant, no process", or "" if unknown
	static badge(agent_id, state, by_id){
		if (state === "dormant") return "dormant, no process";
		const r = by_id.get(agent_id);
		if (!r) return "";
		if (r.lost) return "no process";
		return `pid ${r.pid} · ${Math.round(r.mb)} MB`;
	}

	// Formatting utilities

	static gb = mb => (Math.round((mb ?? 0) / 102.4) / 10).toFixed(1) + " GB";

	static gb0 = mb => Math.round((mb ?? 0) / 1024);   // whole GB, for "commit 41 / 48 GB" — one decimal reads as noise there

	static pct = cpu => Math.round((cpu ?? 0) * 10) / 10 + "%";

	static clock = at => { const d = new Date(at); return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };

	// Stacked-area: ours from floor up, other stacked above, empty space above = free RAM
	static ram_svg(history){
		const n = history.length;
		if (n < 2) return "";
		const total = Math.max(1, ...history.map(h => (h.ours_mb ?? 0) + (h.other_mb ?? 0) + (h.free_mb ?? 0)));
		const x = i => (i / (n - 1)) * VB_W;
		const y = mb => RAM_H - Math.min(1, mb / total) * RAM_H;

		const ours_top = history.map((h, i) => `${x(i)},${y(h.ours_mb ?? 0)}`);
		const other_top = history.map((h, i) => `${x(i)},${y((h.ours_mb ?? 0) + (h.other_mb ?? 0))}`);

		const ours_area = `M${x(0)},${RAM_H} L${ours_top.join(" L")} L${VB_W},${RAM_H} Z`;
		const other_area = `M${other_top.join(" L")} L${[...ours_top].reverse().join(" L")} Z`;

		return `<svg class="ai2-proc-ram-svg" viewBox="0 0 ${VB_W} ${RAM_H}" preserveAspectRatio="none" aria-hidden="true">
			<path d="${other_area}" fill="var(--subtle)" fill-opacity="0.35" />
			<path d="${ours_area}" fill="var(--prime)" fill-opacity="0.75" />
		</svg>`;
	}

	// Two lines: total CPU (muted), ours (accent); 0–100 scale; same legend as RAM chart
	static cpu_svg(history){
		const n = history.length;
		if (n < 2) return "";
		const x = i => (i / (n - 1)) * VB_W;
		const y = c => CPU_H - Math.min(1, Math.max(0, (c ?? 0) / 100)) * CPU_H;
		const line = get => history.map((h, i) => `${x(i)},${y(get(h))}`).join(" L");

		return `<svg class="ai2-proc-cpu-svg" viewBox="0 0 ${VB_W} ${CPU_H}" preserveAspectRatio="none" aria-hidden="true">
			<path d="M${line(h => h.cpu)}" fill="none" stroke="var(--subtle)" stroke-width="2" vector-effect="non-scaling-stroke" />
			<path d="M${line(h => h.ours_cpu)}" fill="none" stroke="var(--prime)" stroke-width="2" vector-effect="non-scaling-stroke" />
		</svg>`;
	}

	// Hover: time + RAM/CPU numbers in positioned box (not SVG text for legibility at any zoom)
	static wire_hover($wrap, $cross, $tip, history){
		if (history.length < 2) return;
		const move = e => {
			const rect = $wrap.el.getBoundingClientRect();
			if (!rect.width) return;
			const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
			const i = Math.round(frac * (history.length - 1));
			const h = history[i];
			if (!h) return;
			const left = frac * 100;
			$cross.style("left", left + "%").rc("ai2-proc-hide");
			$tip.style("left", left + "%").rc("ai2-proc-hide")
				.html_unsafe(`${Processes.clock(h.at)} — ours ${Processes.gb(h.ours_mb)}, other ${Processes.gb(h.other_mb)} · cpu ours ${Processes.pct(h.ours_cpu)}, total ${Processes.pct(h.cpu)}`);
		};
		const leave = () => { $cross.ac("ai2-proc-hide"); $tip.ac("ai2-proc-hide"); };
		$wrap.el.addEventListener("pointermove", move);
		$wrap.el.addEventListener("pointerleave", leave);
	}

	// Headline: "how much of the machine is ours"; commit charge shows pagefile pressure
	static headline(proc){
		const { ours, other, free_mb, total_mb, commit_mb, commit_limit_mb } = proc;
		const commit = commit_mb != null && commit_limit_mb != null ? ` · commit ${Processes.gb0(commit_mb)} / ${Processes.gb0(commit_limit_mb)} GB` : "";
		return `${Processes.gb(ours?.mb)} ours of ${Processes.gb(total_mb)} total · ${Processes.gb(other?.mb)} other · ${Processes.gb(free_mb)} free${commit}`;
	}

	// Stale VS Code conversation line; owner closes them in VS Code, not here
	static stale_line(sessions){
		if (!sessions?.stale) return "";
		const n = sessions.stale;
		return `${n} VS Code conversation${n === 1 ? "" : "s"} idle over ${sessions.stale_h} h (${Processes.gb(sessions.stale_mb)}): close them in VS Code`;
	}

	// By task: one row per group, biggest first

	// Group sparkline: only RAM (mb), no legend; mirrors the row's own mb figure over time
	static group_spark(history, key){
		const pts = history.map(h => h.groups?.[key]?.[0]).filter(v => v != null);
		if (pts.length < 2) return "";
		const max = Math.max(1, ...pts);
		const x = i => (i / (pts.length - 1)) * 80;
		const y = v => 18 - Math.min(1, v / max) * 18;
		const d = pts.map((v, i) => `${x(i)},${y(v)}`).join(" L");
		return `<svg class="ai2-proc-spark" viewBox="0 0 80 18" preserveAspectRatio="none" aria-hidden="true">
			<path d="M${d}" fill="none" stroke="var(--subtle)" stroke-width="2" vector-effect="non-scaling-stroke" />
		</svg>`;
	}

	// Group detail: agents with badges, or bare PIDs; one branch for all group kinds
	static group_detail(g, by_id){
		if (g.agents?.length){
			g.agents.forEach(a => div.c("ai2-live-item", () => {
				span.c("ai2-live-name").text(a.id ?? a.role ?? "agent");
				small.c("ai2-live-line muted").text(Processes.badge(a.id, a.state, by_id));
			}));
			return;
		}
		div.c("ai2-proc-pids", () => (g.pids ?? []).forEach(pid => span.c("ai2-proc-pid").text("pid " + pid)));
	}

	// Stale badge: "stale · idle N h" on the row so seen without opening details
	static stale_badge(g){
		if (!g.stale) return;
		small.c("ai2-proc-badge ai2-proc-stale").text(`stale · idle ${g.idle_h} h`);
	}

	static group_row(g, proc, by_id){
		details.c("ai2-live-item ai2-proc-row", () => {
			summary.c("ai2-proc-row-head flex v-center gap-25", () => {
				// name + stale badge stay ONE flex group — `.ai2-proc-row-head` is
				// `justify-content: space-between` across its direct children, so a
				// fourth top-level child would spread badge/count/spark apart with a
				// huge gap between them instead of sitting next to the name.
				div.c("flex v-center gap-25", () => {
					span.c("ai2-live-name").text(g.label ?? g.key);
					Processes.stale_badge(g);
				});
				small.c("muted").text(`${g.n} · ${Processes.gb(g.mb)} · ${Processes.pct(g.cpu)}`);
				div.c("ai2-proc-spark-box").html_unsafe(Processes.group_spark(proc.history ?? [], g.key));
			});
			Processes.group_detail(g, by_id);
		});
	}

	// Biggest first; only top groups open by default; rest fold behind "N more" row
	static task_rows(proc){
		const groups = [...(proc.groups ?? [])].sort((a, b) => (b.mb ?? 0) - (a.mb ?? 0));
		if (!groups.length) return small.c("muted").text("nothing measured yet");
		const by_id = Processes.running_index(proc.running);
		groups.slice(0, TOP_GROUPS).forEach(g => Processes.group_row(g, proc, by_id));
		const rest = groups.slice(TOP_GROUPS);
		if (!rest.length) return;
		details.c("ai2-live-item ai2-proc-row", () => {
			summary.c("ai2-proc-row-head").text(`${rest.length} more`);
			rest.forEach(g => Processes.group_row(g, proc, by_id));
		});
	}

	// Orphans, reaped, worktrees

	static proc_list(items, line){
		(items ?? []).forEach(it => div.c("ai2-live-item", () => small.c("ai2-live-line").text(line(it))));
	}

	static orphans_row(proc){
		const n = (proc.orphans ?? []).length, m = (proc.reaped ?? []).length;
		details.c("ai2-live-item ai2-proc-row", () => {
			summary.c("ai2-proc-row-head").text(`${n} orphaned, ${m} reaped`);
			if (!n && !m) return small.c("muted").text("nothing left behind right now");
			Processes.proc_list(proc.orphans, o => `pid ${o.pid ?? "?"}${o.cmd ? " · " + o.cmd : ""}${o.mb != null ? " · " + Processes.gb(o.mb) : ""} — flagged`);
			Processes.proc_list(proc.reaped, o => `pid ${o.pid ?? "?"}${o.cmd ? " · " + o.cmd : ""} — reaped`);
		});
	}

	static worktrees_row(w){
		if (!w) return;
		// Plain box (not .ai2-live-item): two text lines, not name + line; flush left like Orphans
		div.c("ai2-proc-worktrees", () => {
			small.c("ai2-proc-worktrees-line").text(`${w.total} worktrees: ${w.pool} pool, ${w.in_use} in use, ${w.open} open, ${w.uncommitted} uncommitted`);
			small.c("ai2-proc-worktrees-line muted").text(`${w.removed_today} removed today`);
		});
	}

	// Render the whole section

	// Render snapshot (or null until Servex answers); live.js calls where other ai2-live-sections sit
	static section(proc){
		if (!proc) return;
		div.c("ai2-live-section ai2-proc-section", () => {
			h3("Processes");
			small.c("ai2-proc-headline").text(Processes.headline(proc));
			const stale_text = Processes.stale_line(proc.sessions);
			if (stale_text) small.c("ai2-proc-headline ai2-proc-stale-line").text(stale_text);
			div.c("ai2-proc-legend flex gap-25", () => {
				span.c("ai2-proc-dot ai2-proc-dot-ours");
				small.c("muted").text("ours");
				span.c("ai2-proc-dot ai2-proc-dot-other");
				small.c("muted").text("everything else");
			});
			// TRAP: $cross/$tip must build inside $wrap's capture, not after (or absolute positioning breaks)
			let $cross, $tip;
			const $wrap = div.c("ai2-proc-graph", () => {
				div.c("ai2-proc-ram").html_unsafe(Processes.ram_svg(proc.history ?? []));
				div.c("ai2-proc-cpu").html_unsafe(Processes.cpu_svg(proc.history ?? []));
				$cross = div.c("ai2-proc-cross ai2-proc-hide");
				$tip = div.c("ai2-proc-tip ai2-proc-hide");
			});
			Processes.wire_hover($wrap, $cross, $tip, proc.history ?? []);

			h3("By task");
			Processes.task_rows(proc);

			h3("Orphans");
			Processes.orphans_row(proc);

			h3("Worktrees");
			Processes.worktrees_row(proc.worktrees);
		});
	}
}

export default Processes;
