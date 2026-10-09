import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "./Session.js";
import SessionRows from "./SessionRows.js";

// The browser end of the live index (doc/realtime.md). The index is partitioned by day in the dated tree:
//   <sessions>/YYYY/MM/DD/index.jsonl   delta lines { id, at, ...changed fields }; a session's first line each day is a full keyframe
//   <sessions>/YYYY/MM/index.json       which days exist + { count, usd, flagged } per day
//   <sessions>/YYYY/index.json          which months exist + a roll-up per month
// `SessionLive.days()` reads the roll-ups to find the day files a date range needs (a year or month with no index costs one
// small request, not one per day), `load_days()` folds them oldest-first, and an instance on TODAY's file tails it with JSONL.live().
// Every line goes through Session.apply_delta into the light Session for its id, which tells whoever subscribed (a SessionView row).
// `structural(moved, later)` tells the page when rows may need to MOVE: `moved` = sessions that appeared or went active/idle (redraw now),
// `later` = sessions whose last activity advanced (the sort order is stale, redraw in a moment). A plain cost change moves nothing.
export default class SessionLive extends JSONL {

	constructor(url, structural){
		super({ url });
		this.structural = structural;
		this.lines = 0;
	}

	/** The UTC day of a Date as "YYYY/MM/DD". */
	static ymd(date){ return date.toISOString().slice(0, 10).replace(/-/g, "/"); }

	/** The day-index URLs that exist between two "YYYY-MM-DD" dates (inclusive), oldest first, found through the year and month roll-ups. */
	static async days(root, from, to){
		const out = [], y0 = +from.slice(0, 4), y1 = +to.slice(0, 4);
		for (let y = y0; y <= y1; y++){
			const year = await SessionRows.get_json(`${root}${y}/index.json`);
			for (const m of Object.keys(year?.months ?? {}).sort()){
				const first = `${y}-${m}-01`, last = `${y}-${m}-31`;
				if (last < from || first > to) continue;
				const month = await SessionRows.get_json(`${root}${y}/${m}/index.json`);
				for (const d of Object.keys(month?.days ?? {}).sort()){
					const day = `${y}-${m}-${d}`;
					if (day >= from && day <= to) out.push(`${root}${y}/${m}/${d}/index.jsonl`);
				}
			}
		}
		return out;
	}

	/** Fetch every day file at once, then fold them in date order so a later day's fields win. Returns the number of lines applied. */
	static async load_days(urls, structural){
		const texts = await Promise.all(urls.map(u => fetch(u, { cache: "no-store" }).then(r => r.ok ? r.text() : "").catch(() => "")));
		const folder = new SessionLive(null, structural);
		texts.forEach(text => folder.read(JSONL.parse(text)));
		return folder.lines;
	}

	/** JSONL.live() hands every streamed batch to read(); each line is a delta. */
	read(entries){
		const moved = [], later = [];
		for (const line of entries){
			if (!line?.id) continue;
			this.lines++;
			const { ses, fields, is_new } = Session.apply_delta(line);
			if (is_new || fields.includes("state")) moved.push(ses.id);
			else if (fields.includes("last_activity")) later.push(ses.id);
		}
		if (moved.length || later.length) this.structural?.(moved, later);
		return this;
	}
}
