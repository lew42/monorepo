import Socket from "/framework/dev/Socket/Socket.js";
import AISession from "./AISession.js";
import Day from "../../core/Session/Day.js";
import AISessionRows from "./AISessionRows.js";

// The browser end of the live index (doc/realtime.md). Every day has ONE real file, so a static host serves it unchanged:
//   <sessions>/YYYY/MM/DD/index.json   { day, closed, snapshots: [one small snapshot per session] }   rewritten every few seconds while the day is live
//   <sessions>/YYYY/MM/index.json      { days: { DD: { count, usd, flagged } } }                        closed days only
//   <sessions>/YYYY/index.json         { months: { MM: { days, count, usd, flagged } } }
// `days()` finds the day files a date range needs from the roll-ups (plus today, which has no roll-up yet), `load()` fetches them
// all at once and folds them oldest-first, and `follow()` asks the dev socket for TODAY's changes: the server sends every snapshot
// of today once, then only the snapshot that changed. The socket is an accelerator: with no socket (production) the page simply
// re-reads today's file. Each snapshot goes through AISession.apply_delta into the light Session for its id, which tells whoever
// subscribed (a AISessionView row). `structural(moved, later)` tells the page when rows may need to MOVE: `moved` = sessions that
// appeared or went active/idle (redraw now), `later` = sessions whose last activity advanced (the order is stale, redraw soon).
export default class AISessionLive {

	constructor(structural){
		this.structural = structural;
		this.count = 0;
	}

	/** The owner's local day of a Date as "YYYY/MM/DD" (Day.js). */
	static ymd(date){ return Day.path(date); }

	/** The day-file URLs between two "YYYY-MM-DD" dates (inclusive), oldest first: closed days from the roll-ups, and today's live file. */
	static async days(root, from, to){
		const out = [], today = AISessionLive.ymd(new Date()).replace(/\//g, "-"), y0 = +from.slice(0, 4), y1 = +to.slice(0, 4);
		for (let y = y0; y <= y1; y++){
			const year = await AISessionRows.get_json(`${root}${y}/index.json`);
			for (const m of Object.keys(year?.months ?? {}).sort()){
				if (`${y}-${m}-31` < from || `${y}-${m}-01` > to) continue;
				const month = await AISessionRows.get_json(`${root}${y}/${m}/index.json`);
				for (const d of Object.keys(month?.days ?? {}).sort()){
					const day = `${y}-${m}-${d}`;
					if (day >= from && day <= to && day !== today) out.push(`${root}${y}/${m}/${d}/index.json`);
				}
			}
		}
		if (today >= from && today <= to) out.push(`${root}${today.replace(/-/g, "/")}/index.json`);
		return out;
	}

	/** Fetch every day file at once, then fold them in date order so a later day's snapshot wins (a revived session moves to its newer day). */
	async load(urls){
		const today = AISessionLive.ymd(new Date());
		this.loaded ??= new Set();
		urls = urls.filter(u => u.includes(today) || !this.loaded.has(u));   // closed days are read once; today's live file is always re-read
		urls.forEach(u => this.loaded.add(u));
		const files = await Promise.all(urls.map(u => fetch(u, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null)));
		files.forEach(f => this.read(f?.snapshots ?? []));
		return this.count;
	}

	/** Snapshots in, one Session each. */
	read(snapshots){
		const moved = [], later = [];
		for (const snap of snapshots){
			if (!snap?.id) continue;
			const old = AISession.all.get(snap.id)?.ix.last_activity;
			if (old && snap.last_activity && old > snap.last_activity) continue;   // a stale snapshot never overwrites a newer one
			this.count++;
			const { ses, fields, is_new } = AISession.apply_delta(snap);
			if (is_new || fields.includes("state")) moved.push(ses.id);
			else if (fields.includes("last_activity")) later.push(ses.id);
		}
		if (moved.length || later.length) this.structural?.(moved, later);
		return this;
	}

	/** Ask the dev server to push today's changes. Safe to call again (a reconnect, a new day); returns false when there is no dev socket (a static host). */
	follow(day){
		const socket = AISessionLive.socket();
		if (!socket) return false;
		AISessionLive.current = this;
		socket.ready.then(() => socket.rpc("session_sub", day));
		return true;
	}

	static socket(){
		if (typeof location === "undefined" || !/^(localhost|127\.0\.0\.1|.*\.localhost)$/.test(location.hostname)) return null;
		try { return Socket.singleton(); } catch { return null; }
	}
}

// Called BY the dev server through Socket.message()'s method lookup (a grep for callers finds none; same path as Socket.reload()).
Socket.prototype.session_index_bulk = function(day, snapshots){ AISessionLive.current?.read(snapshots); };
Socket.prototype.session_index = function(snap){ AISessionLive.current?.read([snap]); };
Socket.prototype.session_index_off = function(){};
