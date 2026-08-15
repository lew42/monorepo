import { View, div, a, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "Timeline.css");

const HOUR = 3600000, PAD = 15 * 60000;

// Accepts an ISO string or an epoch-ms number — real manifests hold the
// former, a quick synthetic demo the latter.
const stamp = v => typeof v === "number" ? v : Date.parse(v);

/**
 * Timeline — a general-purpose h/v timeline. Positioning is CSS: every item
 * carries `--t` (hours since the domain start) and `--d` (duration, hours);
 * `--em-per-hour` on the root is the one zoom knob, orientation a class swap.
 *
 *   new Timeline({ orientation: "v", reverse: true, zoom: 6, items: [
 *       { from, to, label, kind: "task", url },   // a bar
 *       { at, label, kind: "log" },                // a dot
 *   ]});
 *
 * Item: `{ at }` an instant, or `{ from, to? }` a span (`to` omitted = open,
 * runs to "now"). Plus `label`, `kind` (a CSS class — task/agent/log/action/
 * window/day ship an accent), `url` (renders an `<a>`, so catalog routing and
 * `mark_links()` just work), `lane` (a named shared track), `children`
 * (nested items, positioned relative to THIS item's own `from`).
 *
 * Lanes: greedy interval packing — sequential items share a lane, parallel
 * ones stack. `kind: "window"` spans the whole cross axis behind the lanes.
 *
 * Design record: readme.md.
 */
export class Timeline extends View {

	render(){
		const items = this.items ?? [];
		const [from, to] = this.span(items);

		this.ac(this.orientation === "v" ? "v" : "h").ac(this.reverse && "reverse");
		this.style({
			"--em-per-hour": (this.zoom ?? 4) + "em",
			"--em-per-lane": (this.lane ?? 2.2) + "em",
			"--dur": Math.max((to - from) / HOUR, 0.25),
		});

		this.ruler(from, to);

		div.c("timeline-track", () => {
			const lanes = this.lay(items.filter(it => it.kind !== "window"), from);
			items.filter(it => it.kind === "window").forEach(w => this.item(w, from, 0));
			this.style("--lanes", Math.max(lanes, 1));
			this.live(from);
		});
	}

	// Domain: an explicit from/to, else the items' own extent, padded ~15 min.
	span(items){
		const stamps = items.flatMap(it => [it.at, it.from, it.to].filter(v => v != null).map(stamp));
		return [
			this.from != null ? stamp(this.from) : Math.min(...stamps, Date.now()) - PAD,
			this.to != null ? stamp(this.to) : Math.max(...stamps, Date.now()) + PAD,
		];
	}

	// Greedy interval packing: a named `lane` shares one track; the rest fill
	// the first lane whose last item has already ended.
	lay(items, base){
		const names = new Map();
		items.forEach(it => it.lane != null && !names.has(it.lane) && names.set(it.lane, names.size));

		const ends = [];
		[...items].sort((a, b) => stamp(a.from ?? a.at) - stamp(b.from ?? b.at)).forEach(it => {
			const start = stamp(it.from ?? it.at);
			let lane = it.lane != null ? names.get(it.lane) : -1;

			if (lane === -1){
				const free = ends.findIndex(end => end <= start);
				lane = names.size + (free === -1 ? ends.length : free);
				ends[lane - names.size] = it.to !== undefined ? stamp(it.to) : start;
			}

			this.item(it, base, lane);
		});

		return names.size + ends.length;
	}

	item(it, base, lane){
		const start = stamp(it.from ?? it.at);
		const instant = it.from === undefined;
		const end = instant ? start : it.to !== undefined ? stamp(it.to) : Date.now();
		const labeled = !instant || it.kind === "window" || it.kind === "day";

		const $item = (it.url ? a : div).c(["timeline-item", instant ? "dot" : "bar", it.kind].filter(Boolean).join(" "), () => {
			if (labeled && it.label) span.c("timeline-item-label", it.label);
			if (it.children?.length) div.c("timeline-item-children", () => it.children.forEach(c => this.item(c, start, 0)));
		}).style({ "--t": (start - base) / HOUR, "--d": (end - start) / HOUR, "--lane": lane });

		if (it.label) $item.attr("title", it.label);
		if (it.url) $item.href(it.url);
		return $item;
	}

	// Hour ticks; labels spaced so they never crowd closer than ~4em.
	ruler(base, to){
		const step = Math.max(1, Math.ceil(4 / (this.zoom ?? 4)));
		const first = Math.ceil(base / HOUR) * HOUR;

		div.c("timeline-ruler", () => {
			for (let ms = first; ms <= to; ms += step * HOUR)
				span.c("timeline-tick", new Date(ms).toLocaleTimeString([], { hour: "numeric" })).style("--t", (ms - base) / HOUR);
		});
	}

	// Nudged rather than re-rendered — a 60s timer while the tab is visible.
	live(base){
		const $now = div.c("timeline-now").style("--t", (Date.now() - base) / HOUR);
		setInterval(() => document.visibilityState === "visible" && $now.style("--t", (Date.now() - base) / HOUR), 60000);
	}
}

export default Timeline;
