import { div, p, a, ul, li, img, span, code, select, option, form, textarea, button, details, summary, md } from "/app.js";
import { ask, available } from "../../Ask/Ask.js";
import twin from "../audit/twin.js";

// The runner's own shots/ dir is gitignored but sits IN the task dir and is
// served like any other static file — `path` is already a site-absolute url
// (`run.mjs`, 2026-08-17). A fixture built by hand may point at a relative
// path instead (e.g. a png from a neighbouring task dir); resolve that against
// the run's own directory the same way `prompts.json` is found.
const run_dir = run => run.endsWith(".jsonl") ? run.slice(0, run.lastIndexOf("/") + 1) : run.replace(/\/?$/, "/");

const image_src = (path, dir) => path.startsWith("/") ? path : new URL(path, location.origin + dir).pathname;

// The build-time fixture — written until vision-pilot/vision.jsonl lands.
// Named "fixture", not "vision.jsonl", so known_runs() never lists it.
const FIXTURE = "/framework/ai/2026-08-17/vision-browse-page/fixture.jsonl";

/** Every `ai/*\/*\/vision.jsonl` the directory manifest knows about — same source
 * `ext/AITask/dashboard.js` reads, one level of walking. */
async function known_runs(){
	const dir = await fetch("/framework/directory.json").then(r => r.json()).catch(() => null);
	const ai = dir?.files?.find(f => f.name === "ai");
	const found = [];

	(ai?.children ?? []).filter(d => d.type === "dir").forEach(day => (day.children ?? []).forEach(task => {
		if (task.type === "dir" && (task.children ?? []).some(f => f.name === "vision.jsonl"))
			found.push({ name: `${day.name}/${task.name}`, run: `/framework/ai/${day.name}/${task.name}/` });
	}));

	return found;
}

async function load(run){
	const dir = run_dir(run);
	const manifest = run.endsWith(".jsonl") ? run : dir + "vision.jsonl";

	const [text, prompts] = await Promise.all([
		fetch(manifest).then(r => r.text()),
		fetch(dir + "prompts.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
	]);

	const shots = text.trim().split("\n").filter(Boolean).map(line => JSON.parse(line).shot);
	shots.forEach(s => s._src = image_src(s.path, dir));
	return { shots, prompts };
}

const run_param = () => new URLSearchParams(location.search).get("run");

/** The whole page body. Owns its own url state — Router.js:go() (~line 44)
 * pushes history AFTER activate() runs content(), and activate() (~line 130)
 * is a no-op when the target page is already active (a same-page link click
 * never re-diffs), so this never trusts Router to notice a query-only change.
 * Every run/filter/compare change here is our OWN pushState + a direct
 * redraw — Router is never asked to route them. */
export function browse(){
	const $out = div.c("dt-vb flow");
	let current;   // the run string this container currently shows

	const open = run => {
		if (run === current) return;
		current = run;
		if (!run){ $out.empty(() => runs_panel(navigate)); return; }

		$out.empty(() => p.c("muted", "Loading " + run + "…"));

		load(run).then(({ shots, prompts }) => {
			if (current === run) $out.empty(() => view(shots, prompts, navigate));
		}).catch(error => {
			if (current === run) $out.empty(() => p.c("dt-bad", `Could not load ${run} — ${error.message}`));
		});
	};

	const navigate = run => {
		const url = location.pathname + (run ? "?run=" + encodeURIComponent(run) : "");
		history.pushState({}, "", url);
		open(run);
	};

	open(run_param());

	// One macrotask after mount: a fresh cross-page click (e.g. a task-board
	// pill) can land here before Router's pushState has caught location up —
	// by the time a setTimeout(0) fires, that microtask has always settled.
	setTimeout(() => open(run_param()), 0);

	window.addEventListener("popstate", () => open(run_param()));

	return $out;
}

function runs_panel(navigate){
	return div.c("dt-vb-runs flow", async $panel => {
		const found = await known_runs();

		$panel.empty(() => {
			p("Point ?run= at a run's directory, or open one below:");

			found.length
				? ul.c("dt-vb-runlist", () => found.forEach(r =>
					li(() => nav_link(r.name, r.run, navigate))))
				: p.c("muted", "No run has logged a vision.jsonl yet.");

			p.c("muted", () => {
				span("Building the page? ");
				nav_link("open the dev fixture", FIXTURE, navigate);
			});
		});
	});
}

// A real <a href> (hover preview, open-in-new-tab, copy link all still work),
// but a plain click drives it ourselves — see browse()'s own comment for why.
function nav_link(text, run, navigate){
	return a(text).href(location.pathname + "?run=" + encodeURIComponent(run)).on("click", e => {
		if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		navigate(run);
	});
}

/* ---- filters + rows, all client-side over one already-loaded run ---- */

const uniq = xs => [...new Set(xs)];

function filtered(shots, f){
	return shots.filter(s => (!f.page || s.url === f.page) && (!f.width || String(s.width) === f.width)
		&& (!f.model || s.model === f.model) && (!f.prompt || s.prompt_id === f.prompt));
}

function view(shots, prompts){
	const params = new URLSearchParams(location.search);
	let compare = params.get("compare") === "1";

	const $filters = div.c("dt-vb-filters flex gap wrap v-center");
	const $rows = div.c("dt-vb-rows flow");

	const push = () => history.replaceState({}, "", location.pathname + (params.toString() ? "?" + params : ""));

	const redraw = () => {
		const f = { page: params.get("page") || "", width: params.get("width") || "",
			model: params.get("model") || "", prompt: params.get("prompt") || "" };

		$filters.empty(() => filters_bar(shots, params, compare, (key, value) => {
			value ? params.set(key, value) : params.delete(key);
			push(); redraw();
		}, () => {
			compare = !compare;
			compare ? params.set("compare", "1") : params.delete("compare");
			push(); redraw();
		}));

		$rows.empty(() => rows_list(filtered(shots, f), prompts, compare));
	};

	redraw();
}

function filters_bar(all, params, compare, onchange, oncompare){
	axis_select("page", uniq(all.map(s => s.url)), params.get("page"), onchange);
	axis_select("width", uniq(all.map(s => s.width)).sort((a, b) => a - b), params.get("width"), onchange);
	axis_select("model", uniq(all.map(s => s.model)), params.get("model"), onchange);
	axis_select("prompt", uniq(all.map(s => s.prompt_id)), params.get("prompt"), onchange);

	button(compare ? "Comparing models ✓" : "Compare models").ac("dt-vb-compare-btn").on("click", oncompare);
}

function axis_select(key, values, current, onchange){
	const $sel = select.c("dt-vb-select", () => {
		option("All " + key).attr("value", "");
		values.forEach(v => option(String(v)).attr("value", String(v)));
	});

	$sel.el.value = current || "";
	$sel.on("change", e => onchange(key, e.target.value));
	return $sel;
}

const identity = s => `${s.url}|${s.width}|${s.region?.sel ?? ""}`;

function group(shots){
	const map = new Map();
	shots.forEach(s => (map.get(identity(s)) ?? map.set(identity(s), []).get(identity(s))).push(s));
	return [...map.values()];
}

function rows_list(shots, prompts, compare){
	const pages = group(shots.filter(s => !s.region));
	const regions = group(shots.filter(s => s.region));

	if (!pages.length && !regions.length){ p.c("muted", "No shots match these filters."); return; }

	pages.forEach(pg => {
		row_group(pg, prompts, compare, false);
		regions.filter(rg => rg[0].page_shot === pg[0].path).forEach(rg => row_group(rg, prompts, compare, true));
	});
}

// One JSONL line is one model's turn on one shot. Compare OFF: each is its own
// row. Compare ON: same shot (same url/width/region), 2+ models, share one
// thumb and lay their prose side by side.
function row_group(shots, prompts, compare, nested){
	if (compare && shots.length > 1){
		div.c("dt-vb-row dt-card flex v gap" + (nested ? " dt-vb-nested" : "")).append(() => {
			row_meta(shots[0]);
			div.c("dt-vb-body flex gap wrap", () => {
				thumb(shots[0]);
				div.c("dt-vb-compare grid auto gap", () => shots.forEach(s => panel(s, prompts))).style("--column", "22em");
			});
		});
		return;
	}

	shots.forEach(s => div.c("dt-vb-row dt-card flex gap wrap" + (nested ? " dt-vb-nested" : "")).append(() => {
		thumb(s);
		div.c("dt-vb-body flow", () => { row_meta(s); panel(s, prompts); });
	}));
}

function row_meta(s){
	div.c("dt-vb-meta flex gap wrap v-baseline muted", () => {
		a.c("dt-vb-url", s.url).href(s.url).attr("target", "_blank");
		span(s.width + "px");
		if (s.region) span(s.region.sel).attr("title",
			s.region.box ? `${s.region.box.x},${s.region.box.y} ${s.region.box.w}×${s.region.box.h}` : "");
	});
}

// ⚠ Shots live gitignored (public/framework/ai/**/shots/) — real on the dev
// server, absent on a static deploy. A 404 here is a missing file, not a fence.
function thumb(s){
	return a.c("dt-vb-thumb").href(s._src).attr("target", "_blank").append(() =>
		img.c("dt-vb-img").attr("src", s._src).attr("loading", "lazy").attr("alt", s.url));
}

// One model's turn: its badge, tokens/cost, prose, findings, the prompt it was
// given, and a box to ask it something more.
function panel(s, prompts){
	div.c("dt-vb-panel flow", () => {
		div.c("dt-vb-stats flex gap wrap v-baseline", () => {
			span.c("dt-badge", s.model);
			span.c("muted", tokens_text(s));
		});

		p(s.prose);
		findings(s.findings);
		preview_button(s);
		prompt_toggle(s.prompt_id, prompts[s.prompt_id]);
		ask_box(s);
	});
}

function preview_button(s){
	const actionable = (s.findings ?? []).filter(f => f.sel && f.decl && !f.retracted);
	if (!actionable.length) return;

	const report = {
		url: s.url,
		issues: actionable.map(f => ({ fix: { sel: f.sel, decl: f.decl }, rule: f.what, detail: f.why })),
	};
	const run = run_param();
	const verdicts = run ? run_dir(run) + "verdicts.jsonl" : null;

	button("Preview fix").ac("dt-vb-preview-btn").on("click", () =>
		twin(report, s.width, { queue: "/framework/ext/DesignTool/vision/accepted.css", verdicts }));
}

function tokens_text(s){
	const t = s.tokens ?? {};
	const cache = t.cache_write ? ` · ${t.cache_write} cache-write` : (t.cache_read ? ` · ${t.cache_read} cache-read` : "");
	const turn2 = s.turn2 ? ` · +$${(s.turn2.cost_usd ?? 0).toFixed(3)} turn2` : "";
	return `${t.input ?? 0} in · ${t.output ?? 0} out${cache} · $${(s.cost_usd ?? 0).toFixed(3)}${turn2} · ${Math.round((s.duration_ms ?? 0) / 1000)}s`;
}

// fix/sel/decl/why/ladder_rung/retracted are all turn-2 additions — an old run's
// findings carry only class/what/where and render exactly as before them.
function findings(list){
	if (!list?.length) return;

	div.c("dt-vb-findings flex gap wrap", () => list.forEach(f => finding(f)));
}

function finding(f){
	const cls = "dt-badge dt-vb-finding" + (f.class === "broken" ? " dt-bad" : "") + (f.retracted ? " dt-vb-retracted" : "");

	div.c(cls, () => {
		span(f.what);
		f.where && span.c("muted", " — " + f.where);
		f.fix && p.c("muted dt-vb-fix", f.fix);
		f.decl && decl_chip(f);
	});
}

function decl_chip(f){
	div.c("dt-vb-decl flex gap wrap v-center", () => {
		code.c("dt-vb-decl-chip", f.sel ? `${f.sel} { ${f.decl} }` : f.decl);
		f.ladder_rung && span.c("dt-vb-rung muted", f.ladder_rung);
	});
}

function prompt_toggle(id, text){
	if (!id) return;

	details.c("dt-vb-prompt", () => {
		summary(id);
		text ? md(text) : p.c("muted", "(prompts.json has no entry for this id)");
	});
}

/** `ask(q, {resume: session_id})` from ext/Ask — nothing here writes to the jsonl. */
function ask_box(s){
	if (!available()) return;

	form.c("dt-vb-ask flex gap", $form => {
		const $input = textarea.c("dt-vb-ask-input").attr("placeholder", "Ask about this image…").attr("rows", "1");
		const $send = button("Ask").attr("type", "submit");
		const $reply = div.c("dt-reply");   // reuses vision.js's own reply box, same module

		$form.on("submit", async e => {
			e.preventDefault();
			const q = $input.el.value.trim();
			if (!q || $send.el.disabled) return;

			$input.el.value = "";
			$send.el.disabled = true;
			let streamed = "";
			$reply.empty(() => span.c("muted", "thinking…"));

			try {
				const r = await ask(q, { resume: s.session_id, on: e => {
					streamed += e.text ?? "";
					$reply.empty(() => p(streamed));
				} });
				$reply.empty(() => { p(r.text ?? ""); span.c("muted", `$${(r.cost_usd ?? 0).toFixed(3)}`); });
			} catch (error){
				$reply.empty(() => p.c("dt-bad", error.message));
			}

			$send.el.disabled = false;
		});
	});
}
