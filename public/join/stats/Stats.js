const el = (tag, cls = "", ...kids) => {
	const e = document.createElement(tag);
	if (cls) e.className = cls;
	for (const k of kids) if (k != null && k !== false) e.append(k);
	return e;
};

/**
 * Stats: /join/stats/ — the admin-only numbers for the /join/ ad funnel (worker/join.js's GET /api/join/stats).
 * Plain tables, no charts: the funnel in step order (today, 7 days, all time), then one table per split
 * (utm_source, in-app vs not), then the two totals. Not an admin: one line, with a link to sign in. Any other
 * failure: the real error, in words.
 *
 *   new Stats(document.getElementById("stats")).load();
 */
export class Stats {

	constructor(root){
		this.root = root;
	}

	async load(){
		this.root.replaceChildren(el("p", "note", "Loading…"));
		try {
			const res = await fetch("/api/join/stats");
			if (res.status === 401 || res.status === 403) return this.denied();
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
			this.draw(data);
		} catch (err){
			this.root.replaceChildren(el("p", "note bad", "That didn't work: " + err.message));
		}
	}

	denied(){
		this.root.replaceChildren(el("p", "note",
			"Admins only. Sign in at ", Object.assign(el("a"), { href: "/join/", textContent: "/join/" }), " with the admin account."));
	}

	draw(data){
		const { events, funnel, by_source, by_inapp, signed_up_users, active_push_subs } = data;
		this.root.replaceChildren(
			el("h1", "", "Funnel: /join/"),
			this.funnel_table(events, funnel),
			el("h2", "", "By ad (utm_source)"),
			this.split_table(events, by_source, "source"),
			el("h2", "", "In-app browser vs not"),
			this.split_table(events, by_inapp, "in_app", v => v ? "in-app" : "not in-app"),
			el("h2", "", "Totals"),
			this.totals_table(signed_up_users, active_push_subs));
	}

	// Each table sits in a .scroll box, so a narrow phone scrolls the table, never the page.
	table(...parts){ return el("div", "scroll", el("table", "wrap", ...parts)); }

	// first = null leaves out the group column (the funnel table has none).
	head(first){
		const nums = ["Today (UTC)", "7 days", "All time"].map(t => el("th", "num", t));
		return el("thead", "", el("tr", "", ...(first === null ? [] : [el("th", "", first)]), el("th", "", "Step"), ...nums));
	}

	counts(g, e){ return ["today", "week", "all"].map(w => el("td", "num", String(g[w][e] || 0))); }

	funnel_table(events, funnel){
		return this.table(
			this.head(null),
			el("tbody", "", ...events.map(e => el("tr", "", el("td", "", e), ...this.counts(funnel, e)))));
	}

	// Groups every window's rows by the split key (utm_source, or in_app), then one row per event that split saw.
	split_table(events, windows, key, label = v => v){
		const groups = new Map();
		for (const win of ["today", "week", "all"])
			for (const row of windows[win] || [])
				(groups.get(row[key]) ?? groups.set(row[key], { today: {}, week: {}, all: {} }).get(row[key]))[win][row.event] = row.n;

		const rows = [...groups.entries()].flatMap(([name, g]) =>
			events.filter(e => g.today[e] || g.week[e] || g.all[e]).map((e, i) => el("tr", "",
				el("td", "group", i === 0 ? label(name) : ""), el("td", "", e), ...this.counts(g, e))));
		return this.table(this.head(key === "source" ? "Source" : ""), el("tbody", "", ...(rows.length ? rows : [el("tr", "", el("td", "", "—"), el("td", ""), el("td", ""), el("td", ""), el("td", ""))])));
	}

	totals_table(signed_up_users, active_push_subs){
		return this.table(el("tbody", "",
			el("tr", "", el("td", "", "Signed-up users (Google)"), el("td", "num", String(signed_up_users.google))),
			el("tr", "", el("td", "", "Signed-up users (Google + test)"), el("td", "num", String(signed_up_users.with_test))),
			el("tr", "", el("td", "", "Active push subscriptions"), el("td", "num", String(active_push_subs)))));
	}
}

export default Stats;
