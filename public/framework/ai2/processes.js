import { div, span, small, h3, details, summary } from "/app.js";
import { servex_base } from "./inbox.js";

/**
 * THE PROCESSES SECTION — `/framework/ai2/live/`'s "Processes" block (the owner,
 * 2026-09-30: "we definitely want a summary of all of our spawned memory... a
 * task manager process snapshot... maybe log it in a way where it's a graph").
 *
 * One fetch, `GET <servex_base()>/api/processes` — the shape is documented at
 * `Servex/doc/processes.md`. It is new, so a Servex that has not restarted onto
 * it yet answers 404: this whole section then draws nothing, same as `poll_pool`
 * shows nothing when `/api/worktrees` is missing.
 *
 * What one snapshot holds (the fields this file reads):
 *   ours / other   — `{n, mb, cpu}`, plus `free_mb` and `total_mb` alongside them
 *   commit_mb / commit_limit_mb — the machine's commit charge (RAM + pagefile);
 *                    shows pressure free RAM alone hides (ask 5)
 *   groups[]       — one row per task, agent kind or system bucket: `{key, kind,
 *                    label, n, mb, cpu, pids, agents?}`; a `kind: "session"` group
 *                    (a VS Code conversation) also carries `stale`, `idle_h` (ask 3)
 *   sessions       — `{n, stale, stale_mb, stale_h}`: how many VS Code conversations
 *                    there are, how many are stale, and the threshold itself (ask 3)
 *   orphans[]      — flagged leftovers; `reaped[]` — ones already cleaned up
 *   games_closed[] — every game Games.js closed (or would have), newest last (ask 4)
 *   running[]      — `{id, state, pid, mb, lost}`, one per live agent — the real
 *                    process behind it, or why there isn't one
 *   worktrees      — `{total, pool, in_use, open, uncommitted, finished, removed_today}`
 *   history[]      — up to 360 points, `{at, cpu, ours_mb, other_mb, free_mb, groups: {key: [mb, cpu]}}`
 *
 * This file has two jobs: poll the snapshot (`create_processes`), and draw it
 * (`processes_section`). `live.js` owns the Live card itself and only wires the
 * two together — see its own comments for where.
 */

/** Same shape as `live.js`'s other pollers (`poll_pool`): fetch, skip while the
 *  tab is hidden, catch up the moment it is looked at again. `changed` is the
 *  Live card's own repaint signal. */
export function create_processes(changed){
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

/* ── one place that knows "is this agent really running" ──────────────────
 * Shared by this file's own group-agent rows and by `live.js`'s "Running now"
 * list, so the three words — running, lost, dormant — never drift apart. */

/** `running[]` as a lookup by agent id. */
export const running_index = list => new Map((list ?? []).map(r => [r.id, r]));

/** The small process line for one agent: real ("pid 47356 · 248 MB"), working
 *  with no process behind it ("no process" — `running[].lost`), or dormant on
 *  purpose ("dormant, no process" — a dormant agent never has a process at
 *  all, `Servex/doc/dormant.md`). Empty string when `running[]` says nothing
 *  about this agent yet (an older Servex, or the id is not in the snapshot). */
export function process_badge(agent_id, state, by_id){
	if (state === "dormant") return "dormant, no process";
	const r = by_id.get(agent_id);
	if (!r) return "";
	if (r.lost) return "no process";
	return `pid ${r.pid} · ${Math.round(r.mb)} MB`;
}

/* ── plain words ────────────────────────────────────────────────────────── */

const gb = mb => (Math.round((mb ?? 0) / 102.4) / 10).toFixed(1) + " GB";
const gb0 = mb => Math.round((mb ?? 0) / 1024);   // whole GB, for "commit 41 / 48 GB" — one decimal reads as noise there
const pct = cpu => Math.round((cpu ?? 0) * 10) / 10 + "%";
const clock = at => { const d = new Date(at); return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };

/* ── the graph: RAM stacked area, CPU line below, one shared hover ─────────
 * Both charts share one time axis (the same `history[]`, left to right, oldest
 * to newest), so one crosshair driven by pointer position serves both — the
 * owner glancing at a CPU spike can read the RAM underneath it at the same
 * instant. Inline SVG, `viewBox` only (no build step): `preserveAspectRatio=
 * "none"` lets CSS give each chart its own fixed height while the width fills
 * the column, exactly like every other fluid chart on this site. */

const VB_W = 200;   // one shared horizontal resolution for both charts
const RAM_H = 60, CPU_H = 22;

/** The two stacked-area fills: ours from the baseline up, everything else
 *  stacked above it — so "ours" is always the band touching the floor, the
 *  one glance the owner asked for. The space above both, up to the top of the
 *  chart, IS total RAM: nothing is drawn there, so it reads as free. */
function ram_svg(history){
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
		<path d="${ours_area}" fill="var(--prim)" fill-opacity="0.75" />
	</svg>`;
}

/** Two thin lines on the same 0–100 scale: everything on the machine (muted —
 *  the context), ours alone (the accent — the one the fan noise is asking
 *  about). Same accent-vs-muted pairing as the RAM chart, so one legend
 *  explains both. */
function cpu_svg(history){
	const n = history.length;
	if (n < 2) return "";
	const x = i => (i / (n - 1)) * VB_W;
	const y = c => CPU_H - Math.min(1, Math.max(0, (c ?? 0) / 100)) * CPU_H;
	const line = get => history.map((h, i) => `${x(i)},${y(get(h))}`).join(" L");

	return `<svg class="ai2-proc-cpu-svg" viewBox="0 0 ${VB_W} ${CPU_H}" preserveAspectRatio="none" aria-hidden="true">
		<path d="M${line(h => h.cpu)}" fill="none" stroke="var(--subtle)" stroke-width="2" vector-effect="non-scaling-stroke" />
		<path d="M${line(h => h.ours_cpu)}" fill="none" stroke="var(--prim)" stroke-width="2" vector-effect="non-scaling-stroke" />
	</svg>`;
}

/** One small line under the cursor: the point's own time, then both charts'
 *  numbers — the hover layer the dataviz method asks every line/area chart to
 *  ship. A plain positioned box, not more SVG text, because the numbers need
 *  to stay legible at any zoom and wrap freely at 400px. */
function wire_hover($wrap, $cross, $tip, history){
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
			.html_unsafe(`${clock(h.at)} — ours ${gb(h.ours_mb)}, other ${gb(h.other_mb)} · cpu ours ${pct(h.ours_cpu)}, total ${pct(h.cpu)}`);
	};
	const leave = () => { $cross.ac("ai2-proc-hide"); $tip.ac("ai2-proc-hide"); };
	$wrap.el.addEventListener("pointermove", move);
	$wrap.el.addEventListener("pointerleave", leave);
}

/** The headline line above the charts — the one sentence that, on its own,
 *  answers "how much of the machine is ours right now". Commit charge (ask 5)
 *  rides along: free RAM alone can look fine while the pagefile is nearly
 *  full, and commit is the number that actually explains that. */
function headline(proc){
	const { ours, other, free_mb, total_mb, commit_mb, commit_limit_mb } = proc;
	const commit = commit_mb != null && commit_limit_mb != null ? ` · commit ${gb0(commit_mb)} / ${gb0(commit_limit_mb)} GB` : "";
	return `${gb(ours?.mb)} ours of ${gb(total_mb)} total · ${gb(other?.mb)} other · ${gb(free_mb)} free${commit}`;
}

/** The line under the totals naming stale VS Code conversations (ask 3) — the
 *  owner's own words: "close them in VS Code" (never closed here; a VS Code
 *  conversation is the owner's to close). Empty when none are stale. */
function stale_line(sessions){
	if (!sessions?.stale) return "";
	const n = sessions.stale;
	return `${n} VS Code conversation${n === 1 ? "" : "s"} idle over ${sessions.stale_h} h (${gb(sessions.stale_mb)}): close them in VS Code`;
}

/* ── by task: one row per group, biggest first ─────────────────────────── */

/** One group's RAM sparkline — a single quiet line, no legend (one series
 *  needs none): `history[].groups[key]` is `[mb, cpu]`, and only mb draws
 *  here, the same story the row's own "mb" figure already tells over time. */
function group_spark(history, key){
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

/** A group's own detail: its agents (with a real process badge each) when it
 *  has any, else the bare PIDs it rolled up — "render every kind the same
 *  way" (the brief), so this is the one branch every group kind shares. */
function group_detail(g, by_id){
	if (g.agents?.length){
		g.agents.forEach(a => div.c("ai2-live-item", () => {
			span.c("ai2-live-name").text(a.id ?? a.role ?? "agent");
			small.c("ai2-live-line muted").text(process_badge(a.id, a.state, by_id));
		}));
		return;
	}
	div.c("ai2-proc-pids", () => (g.pids ?? []).forEach(pid => span.c("ai2-proc-pid").text("pid " + pid)));
}

const TOP_GROUPS = 5;

/** A stale VS Code session's own badge — "stale · idle 5 h" — right on its row,
 *  so it is seen without opening anything (ask 3; `g.stale`/`g.idle_h` come
 *  straight off `/api/processes`, Servex/doc/processes.md). */
function stale_badge(g){
	if (!g.stale) return;
	small.c("ai2-proc-badge ai2-proc-stale").text(`stale · idle ${g.idle_h} h`);
}

function group_row(g, proc, by_id){
	details.c("ai2-live-item ai2-proc-row", () => {
		summary.c("ai2-proc-row-head flex v-center gap-25", () => {
			// name + stale badge stay ONE flex group — `.ai2-proc-row-head` is
			// `justify-content: space-between` across its direct children, so a
			// fourth top-level child would spread badge/count/spark apart with a
			// huge gap between them instead of sitting next to the name.
			div.c("flex v-center gap-25", () => {
				span.c("ai2-live-name").text(g.label ?? g.key);
				stale_badge(g);
			});
			small.c("muted").text(`${g.n} · ${gb(g.mb)} · ${pct(g.cpu)}`);
			div.c("ai2-proc-spark-box").html_unsafe(group_spark(proc.history ?? [], g.key));
		});
		group_detail(g, by_id);
	});
}

/** Biggest first, and only the top few OPEN on the page by default — a
 *  machine with two dozen "Claude Code session" groups used to draw two
 *  dozen closed rows before this, correct once the details-collapse bug
 *  above was fixed, but still a long scroll for what is mostly noise. The
 *  rest fold behind one more "N more" row, same shape as the others. */
function task_rows(proc){
	const groups = [...(proc.groups ?? [])].sort((a, b) => (b.mb ?? 0) - (a.mb ?? 0));
	if (!groups.length) return small.c("muted").text("nothing measured yet");
	const by_id = running_index(proc.running);
	groups.slice(0, TOP_GROUPS).forEach(g => group_row(g, proc, by_id));
	const rest = groups.slice(TOP_GROUPS);
	if (!rest.length) return;
	details.c("ai2-live-item ai2-proc-row", () => {
		summary.c("ai2-proc-row-head").text(`${rest.length} more`);
		rest.forEach(g => group_row(g, proc, by_id));
	});
}

/* ── orphans, reaped, worktrees ─────────────────────────────────────────── */

function proc_list(items, line){
	(items ?? []).forEach(it => div.c("ai2-live-item", () => small.c("ai2-live-line").text(line(it))));
}

function orphans_row(proc){
	const n = (proc.orphans ?? []).length, m = (proc.reaped ?? []).length;
	details.c("ai2-live-item ai2-proc-row", () => {
		summary.c("ai2-proc-row-head").text(`${n} orphaned, ${m} reaped`);
		if (!n && !m) return small.c("muted").text("nothing left behind right now");
		proc_list(proc.orphans, o => `pid ${o.pid ?? "?"}${o.cmd ? " · " + o.cmd : ""}${o.mb != null ? " · " + gb(o.mb) : ""} — flagged`);
		proc_list(proc.reaped, o => `pid ${o.pid ?? "?"}${o.cmd ? " · " + o.cmd : ""} — reaped`);
	});
}

function worktrees_row(w){
	if (!w) return;
	// A plain box, not `.ai2-live-item` — that class's 4-column grid put
	// `.ai2-live-line` (column 3) ~100px in from the left edge, when this is
	// two whole lines of text, not a name + a line beside a badge (fix round,
	// 2026-09-30). `.ai2-proc-row`'s siblings (Orphans) start flush left; this
	// does too.
	div.c("ai2-proc-worktrees", () => {
		small.c("ai2-proc-worktrees-line").text(`${w.total} worktrees: ${w.pool} pool, ${w.in_use} in use, ${w.open} open, ${w.uncommitted} uncommitted`);
		small.c("ai2-proc-worktrees-line muted").text(`${w.removed_today} removed today`);
	});
}

/* ── the whole section ──────────────────────────────────────────────────── */

/** Drawn straight into whatever is capturing when this runs — `live.js` calls
 *  it exactly where the other `ai2-live-section`s sit. `proc` is one snapshot
 *  from `create_processes().data()`, or `null` until Servex answers. */
export function processes_section(proc){
	if (!proc) return;
	div.c("ai2-live-section ai2-proc-section", () => {
		h3("Processes");
		small.c("ai2-proc-headline").text(headline(proc));
		const stale_text = stale_line(proc.sessions);
		if (stale_text) small.c("ai2-proc-headline ai2-proc-stale-line").text(stale_text);
		div.c("ai2-proc-legend flex gap-25", () => {
			span.c("ai2-proc-dot ai2-proc-dot-ours");
			small.c("muted").text("ours");
			span.c("ai2-proc-dot ai2-proc-dot-other");
			small.c("muted").text("everything else");
		});
		// `$cross`/`$tip` are built INSIDE `$wrap`'s own capture — a `div.c()`
		// called after that block closes would land as $wrap's SIBLING instead
		// of its child, and `position: absolute` would then track the page,
		// not the graph (caught by the headless proof's own hover shot).
		let $cross, $tip;
		const $wrap = div.c("ai2-proc-graph", () => {
			div.c("ai2-proc-ram").html_unsafe(ram_svg(proc.history ?? []));
			div.c("ai2-proc-cpu").html_unsafe(cpu_svg(proc.history ?? []));
			$cross = div.c("ai2-proc-cross ai2-proc-hide");
			$tip = div.c("ai2-proc-tip ai2-proc-hide");
		});
		wire_hover($wrap, $cross, $tip, proc.history ?? []);

		h3("By task");
		task_rows(proc);

		h3("Orphans");
		orphans_row(proc);

		h3("Worktrees");
		worktrees_row(proc.worktrees);
	});
}
