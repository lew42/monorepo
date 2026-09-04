import { Page, div, span, a, p, img, iframe, button, icon, md } from "/app.js";

/* Container: feeds/'s row (the columns host is /imagine/, found however deep —
   doc/columns.md). Size: this column is `small`, a picker rail; each talk opens
   `large` beside it. Own layout: `column()` overridden to draw one row per talk
   instead of core's default child-menu — the inbox pattern (uses/inbox/page.js).
   Regions: one per column, core's. Preview: default card.

   THE LAZY EMBED: `stage()` builds a poster + play button SYNCHRONOUSLY and swaps
   in the iframe only inside the click handler — no fetch, no await, so the DOM-
   after-await trap does not even apply here, but the shape is the same one: build
   now, fill later. `youtube-nocookie.com` so a talk you never press does not touch
   Google at all — only the poster, a plain `<img>` to i.ytimg.com. */

const TALKS = [
	{ name: "jobs", title: "Steve Jobs' 2005 Stanford Commencement Address", by: "Steve Jobs · Stanford", id: "UF8uR6Z6KLc" },
	{ name: "robinson", title: "Do Schools Kill Creativity?", by: "Sir Ken Robinson · TED", id: "iG9CE55wbtY" },
	{ name: "cuddy", title: "Your Body Language May Shape Who You Are", by: "Amy Cuddy · TED", id: "Ks-_Mh1QhMc" },
	{ name: "sinek", title: "How Great Leaders Inspire Action", by: "Simon Sinek · TED", id: "qp0HIF3SfI4" },
	{ name: "brown", title: "The Power of Vulnerability", by: "Brené Brown · TED", id: "iCvmsMzlF7o" },
];

// Poster now, iframe only once asked — the whole embed, in one function.
function stage(id, title){
	return div.c("feeds-stage", $stage => {
		img.c("feeds-poster").attr("src", `https://i.ytimg.com/vi/${id}/hqdefault.jpg`).attr("alt", title);

		button.c("feeds-play").on("click", () => $stage.empty(() => {
			iframe()
				.attr("src", `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`)
				.attr("title", title)
				.attr("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
				.attr("allowfullscreen", "")
				.attr("loading", "lazy");
		})).append(() => icon("play_arrow"));
	});
}

export default new Page({
	meta: import.meta,
	title: "Video",
	description: "Five classic talks — a picker rail, and a poster that only becomes an iframe once you click it.",
	icon: "smart_display",

	content(){
		md("Pick a talk. Nothing to its right loads a Google iframe until you press play — the poster is one `<img>` from `i.ytimg.com`.");
	},

	// THE OVERRIDE: core's default column() lists children as a bare menu; a
	// picker wants the speaker under the title, so this is that list by hand.
	column(host){
		return div.c("page-column-body page-column-small", () => {
			div.c("page-column-head", () => span.c("page-column-title", this.title));

			if (this.content) div.c("page-column-prose flow", () => this.content());

			div.c("feeds-picks", () => this.children.forEach((talk, name) => {
				a.c("feeds-pick").href(this.nav_for(name).url).append(() => {
					span.c("feeds-pick-title", talk.title);
					span.c("feeds-pick-by", talk.by);
				});
			}));
		});
	},

	children: Object.fromEntries(TALKS.map(talk => [talk.name, {
		title: talk.title,
		by: talk.by,
		width: "large",

		content(){
			div.c("feeds-video", () => {
				stage(talk.id, talk.title);
				p.c("feeds-video-meta", talk.by);
			});
		},
	}])),
});
