import fs from "fs";
import path from "path";
import watch from "../watch.js";
import { REFS_PATH, ENTRY, CONCEPT_ONLY, entry_name, resolve_icon } from "../../public/framework/ext/Mention/sync-icon.mjs";

/* MentionSync — keeps `ext/Mention/maps/refs.js`'s `icon` fresh WITHOUT a human ever running
 * `sync.mjs` by hand (the owner, 2026-10-03: "a hand-run cache goes stale"). Same shared
 * watcher, same trailing-debounce shape as `Directory.js` — one more listener on the one
 * `fs.watch` handle `watch.js` already runs, not a second watch system (Law 6).
 *
 * WHY ONLY `icon`, NEVER `class_card` HERE. `class_card` needs a real headless page load
 * (`sync.mjs`'s own pass 2) to read `nav().class_card` — too expensive to redo on every
 * keystroke a page.js gets saved with. It is left to a human running `sync.mjs`, and in
 * practice rarely needs to: `Mention.js`'s own `live()` already reads a page's current
 * `class_card` straight off any instance built this session, which covers most of the site
 * (doc/syntax.md). This watcher only closes the gap `live()` can't: a page NOBODY has
 * visited yet (the cold case) still showing last run's icon forever.
 *
 * DECISION (the owner asked for this written down): a computed-on-change index — this file,
 * piggybacked on the one shared watcher — beats a per-folder `meta.json` snapshot (the
 * owner's own alternative) because a snapshot-per-page is a SECOND index shape next to
 * `refs.js` (every reader, including the sibling "reference content row" feature, would need
 * to know which of two places to check), where one computed file, one shape, already is what
 * "one index, computed, never typed" asks for. */
export default class MentionSync {

	static setup(server) {
		new MentionSync(server);
	}

	constructor(server) {
		this.server = server;
		this.initialize();
	}

	initialize() {
		// Only `page.js` and `page.jsonl` can ever change an icon this computes (sync-icon.mjs)
		// — anything else changing under public/ is not worth even scheduling a rebuild for.
		watch((file) => {
			const base = path.basename(file);
			if (base === "page.js" || base === "page.jsonl") this.schedule();
		});
	}

	/* Trailing debounce, identical shape to Directory.js's `update()`: one tool writing one
	 * file is several fs events a few ms apart (temp file in, rename over target); this
	 * collapses a burst into a single rebuild AFTER it settles, with a 1s ceiling so a long
	 * stream of saves still rebuilds at least once a second rather than starving forever. */
	schedule() {
		if (process.env.BOOT_TEST) return;   // a candidate boot test must never write refs.js
		this.since ??= Date.now();
		clearTimeout(this.rebuilding);

		if (Date.now() - this.since > 1000) return this.rebuild();
		this.rebuilding = setTimeout(() => this.rebuild(), 100);
	}

	rebuild() {
		clearTimeout(this.rebuilding);
		this.rebuilding = this.since = null;

		const source = fs.readFileSync(REFS_PATH, "utf8");
		const report = [];
		let changed = 0;

		const next = source.replace(ENTRY, (line, ...args) => {
			const { head, url, icon: current_icon, tail } = args.at(-1);
			if (CONCEPT_ONLY.has(entry_name(head))) return line;   // borrows another page's url on purpose

			const { icon, status } = resolve_icon(url, current_icon);
			if (status !== "changed") return line;

			changed++;
			report.push(`${url} — "${current_icon}" -> "${icon}"`);
			// class_card (if this line carries one) is left exactly as it was — that half
			// only a human running sync.mjs recomputes, see this file's own header comment.
			const class_card_part = /,\s*class_card:\s*(?:true|false)/.exec(line)?.[0] ?? "";
			return `${head} url: "${url}", icon: "${icon}"${class_card_part} }${tail}`;
		});

		if (!changed) return;

		fs.writeFileSync(REFS_PATH, next, "utf8");
		console.log(`[MentionSync] refs.js icon auto-synced (${changed} changed):`);
		report.forEach(line => console.log(`  ~ ${line}`));

		// refs.js is a `.json`-adjacent generated file but it's real `.js` — watch.js's own
		// `ignored()` only skips `.json`, so this write re-enters the watcher once (a plain
		// `change`, no page.js/page.jsonl basename, `schedule()` above ignores it) rather
		// than looping. LiveReload is on the same watcher and already has this path; no extra
		// nudge needed, same reasoning Directory.js gives for directory.json.
	}
}
