import { div, p, span, a, img, h2 } from "/app.js";

/* The two surfaces Mike judges from: the duel, and the order it has produced.
   Both hand back one verdict — a pair, better first — so the page has one
   `pick()` and the record has one shape. */

export const src = row => "/screenshot?path=" + encodeURIComponent(row.image);

/**
 * Two shots, as big as the screen allows: at 3440 each renders at its native
 * 1280 and the pair is 1:1. Sides alternate with the comparison count so a
 * leftward habit cannot become a bias. Returns [left, right] for the keyboard.
 */
export function duel(page, pair){
	const [left, right] = pair.flip ? [pair.incumbent, pair.contender] : [pair.contender, pair.incumbent];

	h2("Which of these two looks better?");
	div.c("rank-duel", () => { side(page, left, right, "←"); side(page, right, left, "→"); })
		.style("--shot", page.shot);

	return [left, right];
}

function side(page, hash, other, key){
	const row = page.row(hash);

	div.c("rank-side", () => {
		div.c("rank-shot surface", () => {
			img.c("rank-img").attr("src", src(row)).attr("alt", row.url)
				.on("error", () => page.route_gone());
		}).on("click", () => page.pick(hash, other));

		// Clicking the frame picks; the url opens the PNG at its true 1280 in a new
		// tab, which is the answer whenever the region is too narrow to judge in.
		div.c("rank-foot flex split gap v-baseline", () => {
			a.c("muted", row.url).href(src(row)).attr("target", "_blank");
			span.c("rank-key", key);
		});
	});
}

/** The order so far. Clicking a row re-opens that one pair as a duel. */
export function standings(page, order){
	div.c("rank-say flow", () => {
		h2("The order so far");
		p.c("muted", "Best at the top. Click a row to see it beside the row above and re-judge that one pair — the middle is where a fast sort is least sure. `Esc` backs out without changing anything.");
	});

	div.c("rank-standings", () => order.forEach((hash, i) => {
		div.c("rank-row surface flex gap v-center").ac(i ? "nudgeable" : null)
			.append(() => {
				span.c("rank-place", "#" + (i + 1));
				span.c("rank-url", page.row(hash).url);
				if (i) span.c("rank-nudge muted", "compare with #" + i);
			})
			.on("click", () => i && page.revise(hash, order[i - 1]));
	}));
}
