import { elapsed } from "/framework/ai/AITask/stats.js";
import AISession from "./AISession.js";
import AISessionBuckets from "./AISessionBuckets.js";

// The data side of the Sessions tab: turns the raw feeds (sessions.json, Servex's agent list, the Session class
// index, the session tree, the spend tree) into the rows the page shows. It draws nothing. Everything is a static,
// and the two feeds the whole page shares live here as `AISessionRows.ix` (index) and `AISessionRows.tree`.
// Sorting, nesting and the filter helpers are here too. See doc/decisions.md for why each feed looks the way it does.
export default class AISessionRows {

	static ix = null;     // session-index.json, set once it loads
	static tree = null;   // session-tree.json (who spawned whom, each agent's own name)
	static flag_rows = {};   // session-flags.json rows (set by AISessionFlags.load): each session's role, read from its first prompt

	static SOURCE = {
		servex: { label: "Servex", icon: "hub" },
		vscode: { label: "VS Code", icon: "laptop_windows" },
		cli: { label: "CLI", icon: "terminal" },
		sdk: { label: "SDK", icon: "memory" },
		page: { label: "Page", icon: "description" },   // a row made from a date-path folder name alone
	};

	static WORKING_STATES = new Set(["working", "active"]);
	static NOT_IN_FLIGHT = new Set(["dormant", "stopped", "gone", "done", "failed", "error", "ended"]);
	static WORKING_WINDOW_MS = 5 * 60 * 1000;

	/** One column per entry, in order; `min` mirrors the `minmax()` floor in sessions.css. */
	static COLUMNS = [
		{ key: "state",    label: "State",    min: 56, hint: "Working now (blinking ▶) or not (•). Click to put the working ones first." },
		{ key: "name",     label: "Name",     min: 160 },
		{ key: "cost",     label: "Cost",     min: 120, hint: "Click to sort. Without a sort, rows run newest activity first." },
		{ key: "updated",  label: "Updated",  min: 88, hint: "Click to sort by the last activity, newest first." },
		{ key: "duration", label: "Duration", min: 84 },
		{ key: "role",     label: "Role",     min: 110 },
		{ key: "source",   label: "Source",   min: 88 },
		{ key: "model",    label: "Model",    min: 88 },
	];

	static ROLE_LABELS = {
		"(unknown)": { label: "(unknown)", title: "A VS Code or CLI session this page can't name a role for — nothing in the data it reads (sessions.json, GET /api/agents) says who was driving it." },
		"cli": { label: "Terminal sessions", title: "A standalone `claude` run from a terminal — not a VS Code tab, not a Servex-spawned agent." },
		"sdk run": { label: "SDK runs", title: "A session the Agent SDK ran (the file's entrypoint is sdk-ts) that Servex has no record of. Not a terminal, not a VS Code tab." },
		"vscode mastermind": { label: "VS Code tabs", title: "An interactive VS Code tab — a human typing, not a spawned agent." },
		"vscode tab": { label: "VS Code tabs", title: "An interactive VS Code tab: a person typing, not a spawned agent." },
		"terminal": { label: "Terminal sessions", title: "A standalone claude run from a terminal." },
		"sdk job": { label: "SDK jobs", title: "A one-off job run through the Agent SDK whose first prompt names no agent (a cleanup, an outline, a script)." },
		"dictation cleanup": { label: "Dictation cleanup", title: "Cleans up one chunk of dictated text. Cheap and plentiful." },
		"outliner": { label: "Outliner", title: "Turns a cleaned transcript into an outline." },
		"echo/refiner": { label: "Echo / refiner", title: "A session whose id starts \"echo-\" — the one naming convention this page can see." },
	};

	// ---- fetching -----------------------------------------------------------------------------------

	static async get_json(url){
		// The folder's listing (dev server only) says whether the file is there: a month roll-up names days whose own
		// index.json was never written (2026/10/10 to /15), and asking for them was a 404 on every sessions page.
		const u = String(url).startsWith("/") && !String(url).includes("?") ? new URL(url, "http://x").pathname : "", at = u.lastIndexOf("/");   // callers pass "<root>../x.json": the listing API refuses a ".." path (403)
		if (u){
			const listed = (await import("/framework/core/Router/listing.js")).names(u.slice(0, at + 1));
			if (listed && !listed.includes(u.slice(at + 1))) return null;
		}
		try {
			const r = await fetch(url, { cache: "no-store" });
			return r.ok ? await r.json() : null;
		} catch { return null; }
	}

	/** A `.jsonl` file as an array of parsed lines (get_json expects one JSON value per file). */
	static async get_jsonl(url){
		try {
			const r = await fetch(url, { cache: "no-store" });
			if (!r.ok) return null;
			const text = await r.text();
			return text.split(/\r?\n/).filter(l => l.trim())
				.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
		} catch { return null; }
	}

	static async load_index(root_url){
		try { const r = await fetch(root_url + "session-index.json", { cache: "no-store" }); const ix = r.ok ? await r.json() : null; if (ix) (await import("./AISession.js")).default.use_index(ix); return ix; } catch { return null; }
	}

	static async load_tree(root_url){
		try { const r = await fetch(root_url + "session-tree.json", { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; }
	}

	/** The spend tree (Server/spend-tree.mjs): read, never recomputed. A row's own `id` is the tree's id for Servex agents. */
	static async load_spend_tree(root_url){
		const data = await AISessionRows.get_json(root_url + "spend-tree.json");
		if (!data?.agents) return null;
		const by_id = new Map(data.agents.map(a => [a.id, a]));
		const children = new Map();
		for (const a of data.agents){
			if (!a.parent || !by_id.has(a.parent)) continue;
			(children.get(a.parent) ?? children.set(a.parent, []).get(a.parent)).push(a.id);
		}
		return { by_id, children, totals: data.totals, generated_at: data.generated_at, by_role: data.by_role ?? [], by_trigger: data.by_trigger ?? [] };
	}

	/** The grid file keeps one short array per session (Server/session-summary.mjs); this reads it as an object. */
	static row_of(index, id){
		const ses = AISession.all.get(id);   // the live Session wins: deltas keep it newer than the index file
		if (ses?.ix.usd != null) return ses.index_row();
		const v = index?.rows?.[id];
		if (!v) return null;
		return { id, usd: v[0], tree_usd: v[1], children: v[2], wall_ms: v[3], model: v[4] || null, effort: v[5] || null, flags: v[6], day: v[7] || null, provider: v[8] || "claude" };
	}

	// ---- one row's facts ----------------------------------------------------------------------------

	/** "In flight" = a Servex agent that is alive (not dormant, stopped or gone), or a VS Code/CLI session whose transcript moved in the last five minutes. */
	static is_in_flight(r){
		const { NOT_IN_FLIGHT } = AISessionRows;
		return r.source === "servex" ? !!r.state && !NOT_IN_FLIGHT.has(r.state) && r.session_id != null : r.state === "active";
	}

	/** A Servex row carries its real role. A VS Code/CLI row has none, so this is a guess from the id and source tag. */
	static role_of(r){
		const computed = AISessionRows.flag_rows[r.session_id || r.id]?.role;   // read from the transcript by Server/session-flags.mjs
		const known = computed && computed !== "(unknown)" ? computed : null;
		if (r.source === "servex") return r.role || known;
		if (known) return known;
		if (/^echo-/.test(r.id || "")) return "echo/refiner";
		if (r.source === "vscode") return "vscode tab";
		if (r.source === "cli") return "terminal";
		if (r.source === "sdk") return "sdk run";
		return null;
	}

	static role_label(role){
		const key = role || "(unknown)";
		return AISessionRows.ROLE_LABELS[key] ?? { label: key, title: "The role from the Servex agent registry, or read from the session's first prompt (Server/session-flags.mjs)." };
	}

	/** "$X.YZ" split into a whole-dollar part and a cents part. */
	static money_parts(usd){
		const n = typeof usd === "number" && isFinite(usd) ? usd : 0;
		const s = n.toFixed(2);
		const dot = s.indexOf(".");
		return { whole: "$" + s.slice(0, dot), cents: s.slice(dot) };
	}

	/** A row's cost: the session index when it knows the session, else the older figures. `null` (never 0) when nothing is known, so "unknown" sorts last. */
	static cost_value(r){
		const ix = AISessionRows.row_of(AISessionRows.ix, r.session_id || r.id);
		if (ix) return ix.usd;
		const claude = typeof r.cost_claude_usd === "number" ? r.cost_claude_usd : null;
		const or = typeof r.cost_openrouter_usd === "number" ? r.cost_openrouter_usd : null;
		if (claude !== null || or !== null) return (claude ?? 0) + (or ?? 0);
		return typeof r.cost === "number" ? r.cost : null;
	}

	static claude_usd_of(r){
		const ix = AISessionRows.row_of(AISessionRows.ix, r.session_id || r.id);
		if (ix) return ix.provider === "openrouter" ? 0 : ix.usd;   // OpenRouter is not Claude spend
		return typeof r.cost_claude_usd === "number" ? r.cost_claude_usd : (typeof r.cost === "number" ? r.cost : 0);
	}

	static openrouter_usd_of(r){
		const ix = AISessionRows.row_of(AISessionRows.ix, r.session_id || r.id);
		if (ix?.provider === "openrouter") return ix.usd;
		return typeof r.cost_openrouter_usd === "number" ? r.cost_openrouter_usd : 0;
	}

	/** The snapshot's state word is stale the moment it is read, so work it out again from what can be checked now. */
	static true_state(r, live_ids, now = Date.now()){
		if (r.source === "servex") return live_ids?.size && !live_ids.has(r.session_id) ? "stopped" : r.state;
		const last = Date.parse(r.last_activity ?? 0);
		return last && now - last < AISessionRows.WORKING_WINDOW_MS ? "active" : "idle";
	}

	/** What to call a row: the tree's agent name, a Servex agent's id, the last prompt, else "session" plus the first 8 of the id. */
	static display_name(r, tree){
		const sid = r.session_id || r.id;
		const ix = AISession.all.get(sid)?.ix, named = tree?.[sid]?.agent ?? ix?.agent ?? null;
		if (ix?.title) return { text: ix.title, from: "title", agent: named };   // the tab title first, the registered name beside it
		if (named) return { text: named, from: "agent" };
		if (r.source === "servex" && r.tab_title) return { text: r.tab_title, from: "agent" };
		// a prompt that is only a routing tag or a skill preamble says nothing about the session
		if (r.last_prompt_first_line && !/^\[from:|^Base directory for this skill/.test(r.last_prompt_first_line)) return { text: r.last_prompt_first_line.replace(/\s+/g, " ").trim().slice(0, 70), from: "prompt" };
		return { text: (AISessionRows.SOURCE[r.source]?.label ?? "session") + " " + String(sid).slice(0, 8), from: "id" };
	}

	/** `end` if it is a real time at or after `start`, else null. */
	static after(start, end){ return end && (!start || Date.parse(end) >= Date.parse(start)) ? end : null; }

	/** How long a row ran, in ms: never negative (a stop before the start is dropped, a working row runs to now); null when unknown. */
	static span_ms(r, now = Date.now()){
		const end = AISessionRows.after(r.started_at, r.stopped_at) ?? (AISessionRows.WORKING_STATES.has(r.state) ? new Date(now).toISOString() : null);
		const ms = elapsed(r.started_at, end);
		return typeof ms === "number" && ms >= 0 ? ms : null;
	}

	static trigger_of(r, spend){ return spend?.by_id.get(r.id)?.trigger ?? null; }

	// ---- the row set --------------------------------------------------------------------------------

	/** A date-path session folder that is not already a row gets a row made from its folder name alone. A no-op until such folders exist. */
	static with_date_path_rows(rows, page_dirs){
		if (!page_dirs?.size) return rows;
		const known = new Set(rows.map(r => (r.session_id || r.id || "").slice(0, 8)));
		const extra = [];
		for (const [id8, dir] of page_dirs){
			if (known.has(id8)) continue;
			const folder = dir.split("/").filter(Boolean).pop() ?? id8;
			extra.push({
				id: id8, session_id: null, source: "page", tab_title: folder.replace(new RegExp("-" + id8 + "$"), ""),
				role: null, model: null, state: null, started_at: null, stopped_at: null, last_activity: null,
				cost: null, cost_claude_usd: null, cost_openrouter_usd: null, ram_mb: null, ram_sample_age_ms: null,
				last_prompt_first_line: null,
			});
		}
		return extra.length ? [...rows, ...extra] : rows;
	}

	/** Lay a live Session's state and last activity over a row. A Servex row keeps its own state (the agent list is the truth for that). */
	static apply_live(r, ses){
		if (r.source !== "servex" && ses.ix.state) r.state = ses.ix.state;
		if (ses.ix.last_activity) r.last_activity = ses.ix.last_activity;
		return r;
	}

	/** Rows with the live feed applied: every row a delta touched is updated, and a session the snapshot never heard of gets a row of its own. */
	static with_live_rows(rows){
		const known = new Set();
		for (const r of rows){
			const sid = r.session_id || r.id, ses = AISession.all.get(sid);
			known.add(sid);
			if (ses?.live) AISessionRows.apply_live(r, ses);
		}
		const extra = [];
		for (const [id, ses] of AISession.all){
			if (!ses.live || known.has(id) || !ses.ix.first_at) continue;
			const row = ses.grid_row();
			extra.push({ ...row, role: AISessionRows.role_of(row) });   // a session only the live index knows still gets its role
		}
		return extra.length ? [...rows, ...extra] : rows;
	}

	/** The snapshot's VS Code/CLI rows with Servex's live agent list laid on top; a Servex row always wins its own session_id. */
	static merge(snapshot_rows, agents){
		const by_id = new Map(snapshot_rows.map(r => [r.session_id, r]));
		agents.forEach(a => {
			if (!a.session_id) return;   // the dispatcher and a few internal roles have none
			const had = by_id.get(a.session_id);
			by_id.set(a.session_id, {
				id: a.id, source: "servex", session_id: a.session_id, tab_title: a.id,
				model: a.model, state: a.state, role: a.role ?? had?.role ?? null, context: a.context ?? null,
				cost: typeof a.cost === "number" ? a.cost : (typeof had?.cost === "number" ? had.cost : null),
				cost_claude_usd: typeof a.cost_claude_usd === "number" ? a.cost_claude_usd : (had?.cost_claude_usd ?? null),
				cost_openrouter_usd: typeof a.cost_openrouter_usd === "number" ? a.cost_openrouter_usd : (had?.cost_openrouter_usd ?? null),
				ram_mb: typeof a.ram_mb === "number" ? a.ram_mb : (had?.ram_mb ?? null),
				ram_sample_age_ms: typeof a.ram_sample_age_ms === "number" ? a.ram_sample_age_ms : (had?.ram_sample_age_ms ?? null),
				started_at: a.started_at ?? had?.started_at ?? null,
				// a resumed agent gets a fresh started_at but may keep the OLD run's stopped_at; an end before the start is that stale stamp (it made durations like -93102s)
				stopped_at: AISessionRows.after(a.started_at ?? had?.started_at, a.stopped_at ?? had?.stopped_at),
				last_activity: a.started_at ?? had?.last_activity ?? null,
				last_prompt_first_line: null,   // the live route carries no transcript
			});
		});
		return [...by_id.values()]
			.map(r => ({
				role: AISessionRows.role_of(r), cost_claude_usd: null, cost_openrouter_usd: null, ram_mb: null, ram_sample_age_ms: null,
				started_at: null, stopped_at: null,
				...r,   // a real value on the row wins these defaults
			}))
			.map(r => { const live = new Set(agents.map(a => a.session_id).filter(Boolean)); return { ...r, state: AISessionRows.true_state(r, live) }; })
			.sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
	}

	// ---- sorting ------------------------------------------------------------------------------------

	/** What each column sorts by: a number or a lowercase word. null = unknown, which sorts last in either direction. */
	static SORT_VALUE = {
		name:     r => AISessionRows.display_name(r, AISessionRows.tree).text.toLowerCase(),
		cost:     r => AISessionRows.cost_value(r),
		updated:  r => Date.parse(r.last_activity ?? 0) || null,
		duration: r => AISessionRows.span_ms(r),
		role:     r => r.role || null,
		source:   r => r.source || null,
		model:    r => r.model ? String(r.model).toLowerCase() : null,
		state:    r => r.state ? (AISessionRows.WORKING_STATES.has(r.state) ? 0 : 1) : null,
	};
	static TEXT_COLUMNS = new Set(["name", "role", "source", "model", "state"]);   // these start A to Z; the rest start biggest first

	static natural_dir(key){ return AISessionRows.TEXT_COLUMNS.has(key) ? "asc" : "desc"; }

	/** sort = null (the default: cost weighted by recency, halving every 3 days since last activity) or { key, dir }. */
	static sort_rows(rows, sort){
		if (!sort){   // one list, newest activity first, then most costly: a running session is the newest, so it sits at the top
			const now = Date.now(), t = r => AISessionRows.is_in_flight(r) || AISessionRows.WORKING_STATES.has(r.state) ? now : Date.parse(r.last_activity ?? 0) || 0;
			return rows.slice().sort((x, y) => t(y) - t(x) || AISessionRows.claude_usd_of(y) - AISessionRows.claude_usd_of(x));   // the costlier one first on a tie
		}
		const get = AISessionRows.SORT_VALUE[sort.key], sign = sort.dir === "asc" ? 1 : -1;
		const keyed = rows.map(r => [get(r), r]);
		const known = keyed.filter(x => x[0] !== null && x[0] !== undefined), unknown = keyed.filter(x => x[0] === null || x[0] === undefined);
		known.sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0) * sign);
		return [...known, ...unknown].map(x => x[1]);
	}

	static sort_by_cost(rows, direction){ return AISessionRows.sort_rows(rows, direction ? { key: "cost", dir: direction } : null); }

	// ---- filtering, nesting, totals -----------------------------------------------------------------

	static in_date_range(r, from, to){
		if (!r.last_activity) return true;   // nothing to filter on, so don't hide it
		const t = Date.parse(r.last_activity);
		return t >= from && t <= to;
	}

	/** Children nest under their parent (the session tree says who started whom). A row whose parent is not in view stays top-level. */
	static nest(rows){
		const id_of = r => r.session_id || r.id;
		return AISessionBuckets.nest(rows, r => AISessionRows.tree?.[id_of(r)]?.parent, id_of);
	}

	/** Claude $ and OpenRouter $ per group, biggest first. `key_of` names a row's group, `field` names the group key. */
	static totals_by(rows, field, key_of){
		const totals = new Map();
		for (const r of rows){
			const key = key_of(r);
			const prev = totals.get(key) ?? { [field]: key, claude_usd: 0, openrouter_usd: 0, count: 0 };
			prev.claude_usd += AISessionRows.claude_usd_of(r);
			prev.openrouter_usd += AISessionRows.openrouter_usd_of(r);
			prev.count += 1;
			totals.set(key, prev);
		}
		return [...totals.values()].sort((a, b) => (b.claude_usd + b.openrouter_usd) - (a.claude_usd + a.openrouter_usd));
	}

	static by_role_totals(rows){ return AISessionRows.totals_by(rows, "role", r => r.role || "(unknown)"); }

	static by_trigger_totals(rows, spend){
		if (!spend) return [];
		return AISessionRows.totals_by(rows, "trigger", r => AISessionRows.trigger_of(r, spend) || "(n/a)");
	}
}
