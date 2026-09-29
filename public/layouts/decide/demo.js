import { View, div, md, h3, p, ul, li, img, figure, figcaption } from "/app.js";

View.stylesheet(import.meta, "decide.css");

/* Shared by the four demo pages under /layouts/decide/.

   `pictures(meta, slug)` draws the two screenshots every demo leads with: the live demo below
   it, shot at 1920 and at 3440 by shoot.mjs (in this folder), saved as
   <page>/shots/<slug>-1920.jpg and -3440.jpg.

   `live(fn)` wraps the demo in `.std-decide-live`, a hook with no CSS of its own: shoot.mjs
   screenshots exactly that element. It claims `wide`, because three columns of content never
   live in the reading track (the layout skill, question 2).

   The content is real: Servex and its three parts, from /framework/servex/. */

export function pictures(meta, slug){
	const here = new URL("./shots/", meta.url).pathname;
	div.c("grid auto gap wide", () => {
		for (const w of [1920, 3440]){
			figure.c("flex v gap-35", () => {
				img().attr("src", `${here}${slug}-${w}.jpg`).attr("alt", `The demo below, at ${w}px wide`).attr("loading", "lazy")
					.style({ width: "100%", border: "1px solid var(--line)" });
				figcaption.c("muted", `At ${w}px wide`);
			});
		}
	}).style("--column", "24rem");
}

export function live(fn){
	md("**Live, at your own width:**");
	return div.c("std-decide-live wide", fn);
}

// The three parts of Servex, each about the same length on purpose (the equal-height demo).
export const PARTS = [
	{ title: "Servers", body: "Servex starts the dev server for every project on this machine, gives each one a fixed port, and restarts it when it crashes. A project is reached at its own name, like monorepo.localhost, and starts on the first request." },
	{ title: "Agents", body: "Every Claude session the owner starts from the dashboard runs inside Servex, with its own id, so it can be watched, paused, resumed or stopped from any tab. Agents talk to each other through Servex, never through the browser." },
	{ title: "Cards", body: "Each task gets a card on the dashboard: what was asked, what the agent is doing now, and what it delivered. A question for the owner waits on its card until it is answered, so nothing is lost overnight." },
];

export function column(part){
	div.c("card flex v gap-50", () => { h3(part.title); p(part.body); });
}

// The short title column: one heading and one line, next to two full columns.
export function title_column({ centred }){
	// `.flex.v` + `.h-center` is `justify-content: center` on a vertical flex box, which
	// centres the children VERTICALLY. No new CSS for the fix: one existing word.
	div.c(centred ? "card flex v gap-50 h-center" : "card flex v gap-50", () => {
		h3("Servex");
		p.c("muted", "The always-on process behind the dashboard.");
	});
}

export { ul, li };
