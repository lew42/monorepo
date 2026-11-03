import Panel from "./Panel.js";
import { TONES } from "./glyphs.js";

/* What `random` MEANS. It is the one `T` name that is a verb rather than a template, and
   it COMMITS what it rolls, so a reload comes back to the same arrangement rather than a
   fresh one. The vocabulary to draw from is handed in — this file reads nothing of
   workspace.js, so the two never circle. Record: readme.md. */

const any = list => list[Math.floor(Math.random() * list.length)];

// Bounded: two levels deep, three ways wide.
export function scatter(item, entries, depth = 0){
	[...item.items].forEach(kid => item.remove(kid));

	if (depth < 2 && Math.random() < 0.6 - depth * 0.25){
		item.set("dir", any(["row", "col"]));
		for (let n = 2 + Math.floor(Math.random() * 2); n--; ) item.add(new Panel());
		item.items.each(kid => scatter(kid, entries, depth + 1));
		return item;
	}

	item.set("template", any(Object.keys(entries)));
	item.set("tone", any(TONES));
	return item;
}

// Every leaf still SAYING "random" — a hand-authored document — rolled before anything draws.
export const resolve = (root, entries) => root.walk(item => {
	if (!item.draw && item.leaf() && item.get("template") === "random") scatter(item, entries);
});
