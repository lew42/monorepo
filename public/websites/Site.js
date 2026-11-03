import { Page, View, md, ui, div, a, span, p, img, figure, figcaption, iframe, input, button, details, summary, pre, code, small } from "/app.js";
import Layout from "/layouts/Layout.js";

View.stylesheet(import.meta, "Site.css");

/* ── the vocabulary, said once ──────────────────────────────────────────────
 * A layout id is `N-name`: N is how many columns the widest screen shows, the
 * name says how the room is divided. `/layouts/` is the encyclopedia that
 * defines each one; every id on these pages links there.
 * A TAG is free text — `2 column grid`, `hamburger`, `max-width`. Tags are
 * how you walk sideways through the corpus, so each one gets a page here, and a tag
 * carrying a NUMBER can only ever match one site: `doc/tags.md` has the rule. */
export const is_layout_id = t => /^\d+-[a-z][a-z0-9-]*$/.test(t);

// A tag becomes a url segment: lower case, spaces to dashes, nothing else kept.
// `3 column grid` -> `3-column-grid`; a layout id is already in this shape.
export const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const tag_url = t => "/websites/tag/" + slug(t) + "/";

/* A page's raw <title> usually carries the SITE'S OWN brand after a separator —
 * "Stripe | Financial Infrastructure to Grow Your Revenue", "CSS - Wikipedia". The
 * heading and the browser tab want just the first clause; this page's own slug
 * already says which site it is, so the brand half is noise here. Splits on the
 * FIRST " | " or " - " only — a title with more than one is left alone past that. */
export const short_title = t => (t ?? "").split(/ \| | - /)[0].trim();

/* THE STANDARD'S OWN ALIAS TABLE. `/layouts/layouts.json` lists every entry with the
 * other names for it — `3-cards` is an alias of `3-equal`, `bento` of `4-1`,
 * `n-cards` of `n-wall`. A record may write whichever word reads best, and the link
 * still lands on the entry that defines it. The encyclopedia is allowed to rename and
 * alias; this is how the corpus follows it without every record being rewritten.
 *
 * ⚠ Resolves to the literal id when the table has not arrived (or `/layouts/` is not
 *   there at all), so a missing standard costs a 404 on one link, never a broken page. */
let layouts_pending, aliases;
export function layouts(){
	return layouts_pending ??= fetch("/layouts/layouts.json")
		.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
		.then(j => {
			const map = new Map();
			for (const l of j?.layouts ?? []){
				map.set(l.id, l.id);
				for (const a of l.aliases ?? []) map.set(a, l.id);
			}
			return aliases = map;
		})
		.catch(() => aliases = new Map());
}

export const layout_url = id => "/layouts/" + (aliases?.get(id) ?? id) + "/";

// The id a tag or a `sections` key resolves to once the standard renames or aliases
// it — `4-equal` reads back as `n-wall`. Same table `layout_url` reads; exported on
// its own because a page that groups by id (not just links to it) needs the id
// itself, not the href built from it.
export const canonical_layout = id => aliases?.get(id) ?? id;

/* The manifest, fetched ONCE per page load and shared by every page here.
 * The pages read this file and never the directory: production is static, so
 * there is no server to ask what is in `site/`, and nothing on this site crawls
 * the filesystem. `tools/index.mjs` writes it. */
let pending, loaded;
export function manifest(){
	return pending ??= fetch("/websites/site/index.json")
		.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
		.then(m => loaded = m)
		.catch(() => null);
}

/* The manifest IF it has already arrived, synchronously — `route()` is called with
 * no chance to await, and a page that knows the site's real title can put it in the
 * heading and the crumb instead of the url slug. Null on a cold deep link, which is
 * why every reader of it falls back. */
export const known = () => loaded;

/**
 * ONE RECORD, RENDERED. A `Site` page is `site/<name>.json` on screen: the four
 * viewport shots side by side so the responsive story reads at a glance, the tags
 * you can walk sideways through, what the scan measured, and — when the site
 * allows a frame — the live site in a resizable, zoomed-out viewer.
 *
 * It is routed, not declared: `websites/page.js` builds one per name in the
 * manifest, the same way `framework/ai/<date>/page.js` builds an `AITask` from a
 * task dir. `root` is the dir the record's relative image paths resolve against.
 *
 * Every part is its own method, so a record that needs something different
 * overrides one and inherits the rest.
 */
export class Site extends Page {

	// The record itself, fetched once. ⚠ The SPA fallback answers a miss with
	// index.html at 200, so the content-type is the only real 404.
	record(){
		return this.record_promise ??= fetch(this.src)
			.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
			.catch(() => null);
	}

	/* ONE `wide` box holds everything. `.page > .wide` is a grid track (Page.css),
	 * so the band has to be a DIRECT child of the page — which is why the whole
	 * record is built inside one box rather than as several sibling bands. Prose
	 * inside it re-caps itself with `.measure.start` (`.wide` has no measure). */
	content(){
		div.c("site-record wide flow", async $s => {
			// Both, before the first chip is drawn: the record IS the page, and the
			// alias table is what makes every layout id on it point at the right entry.
			const [r] = await Promise.all([this.record(), layouts()]);
			$s.append(() => { if (r) this.report(r); else md("No record at `" + this.src + "` yet — run `tools/shoot.mjs`."); });
			if (r) this.retitle(r);
		});
	}

	/* THE TITLE SETTLES. `route()` (websites/page.js) answers synchronously, before
	 * any network reply exists, so on a genuine cold deep link — the manifest not
	 * yet fetched — core's own `h1.page-title` renders with the url SLUG (`this.name`)
	 * standing in. `this.record()` above always resolves though, warm or cold, so once
	 * it does this corrects the tab and the heading to the record's own `title` — the
	 * brand suffix trimmed by `short_title()` — with the slug kept beside it in small
	 * type, so a reader can always see both the human name and the exact url.
	 * ⚠ Raw DOM, on purpose: core built `h1.page-title` before `content()` ran, with no
	 *   View handle kept for it; `this.view` is only set once render() returns, which —
	 *   because this runs after an `await` — has already happened by the time we get here. */
	retitle(r){
		const title = short_title(r.title) || this.name;
		document.title = title;
		this.title = title;

		const $h1 = this.view?.el?.querySelector(".page-title");
		if (!$h1) return;
		$h1.textContent = "";
		$h1.append(title + " ");
		const $slug = document.createElement("small");
		// ⚠ `small` inside an `h1` is still h1-sized: `small` only steps one notch down
		//   from its PARENT, so the slug rendered at 0.83 of a display heading and read as
		//   a second title — three lines of it before any picture at 400. The class sizes
		//   it against the heading (Site.css).
		$slug.className = "site-title-slug muted";
		$slug.textContent = this.name;
		$h1.append($slug);
	}

	// THE OUTLINE. Shots first, because the picture is the point; the words that
	// need reading are underneath it, and the raw material is one click down.
	report(r){
		this.head(r);
		this.strip(r);
		this.wires(r);
		this.tags(r);
		this.notes(r);
		this.viewer(r);
		this.table(r);
		this.raw(r);
	}

	// Who this is and when we looked at it.
	head(r){
		div.c("site-head", () => {
			a.c("site-head-url", r.url).href(r.url).attr("target", "_blank").attr("rel", "noreferrer");
			small.c("site-head-meta muted", [r.category, "shot " + (r.captured_at ?? "").slice(0, 10), "frame " + r.embed].join(" · "));
		});
	}

	/* THE STRIP — the four widths side by side at ONE height, so the eye compares
	 * shapes rather than sizes. A 400 shot is portrait and a 3440 shot is a wide
	 * band; at a common height that difference IS the responsive story.
	 * The row scrolls sideways rather than wrapping (css skill: a flex row squeezed
	 * under its content shrinks its items to min-content instead of overflowing —
	 * `flex: none` on the items and `overflow-x: auto` on the row is the fix shape). */
	strip(r){
		// The one sentence a stranger needs before the pictures mean anything. Without it
		// the page opened on four unlabelled thumbnails and a row of jargon chips, and
		// nothing anywhere said they were the SAME page at four window widths.
		p.c("site-strip-note muted", "The same page photographed at four window widths. Under each one is the layout you can see at that width — click it for the entry that defines the word.");

		div.c("site-strip", () => {
			for (const w of ["400", "1280", "1920", "3440"]){
				figure.c("site-shot", $fig => {
					this.shot(r, w, $fig);
					figcaption.c("site-shot-cap", () => {
						span.c("site-shot-w", w);
						this.layout_chip(r.layout?.[w]);
					});
				});
			}
		});

		if (r.shots?.long) details.c("site-fold", () => {
			summary("The whole page, top to bottom");
			img.c("site-long").attr("src", this.root + r.shots.long)
				.attr("alt", "The whole of " + r.title + " at 1280 pixels wide").attr("loading", "lazy");
		});
	}

	/* ONE PICTURE, OR A BOX THAT SAYS THERE ISN'T ONE. A record must never show a
	 * broken image, and a shot can be missing two different ways: the record names no
	 * path for that width (a crawl cut short), or it names one whose file was never
	 * written. Only the img's own `error` event can catch the second — the dev server's
	 * SPA fallback answers a missing `.jpg` with index.html at 200, so the request
	 * itself succeeds and the DECODE is what fails.
	 * Both cases mark the figure `.is-missing`, and Site.css swaps the picture for a
	 * plain dashed box. The width still gets its slot and its layout chip, because
	 * "we did not photograph this" is itself evidence — a silently absent column read
	 * as a site with only three widths. */
	shot(r, w, $fig){
		const src = r.shots?.[w];
		if (src) img().attr("src", this.root + src)
			.attr("alt", r.title + " at " + w + " pixels wide")
			.attr("loading", "lazy")
			.on("error", () => { $fig.el.classList.add("is-missing"); });
		else $fig.el.classList.add("is-missing");

		div.c("site-shot-missing", "not captured at " + w + " px");
	}

	/* THE WIRE — the same page, redrawn with the content taken out. Optional: a
	 * record only carries `wire` once a person has looked at its 1920 and 400 shots
	 * and written the boxes that decide the layout (public/layouts/doc/wire.md). No
	 * key, nothing drawn, nothing said — this is evidence added when it exists, not
	 * a promise every record makes. Reuses `/layouts/Layout.js`'s own drawer and its
	 * `.std-shots` three-widths row, the same class the encyclopedia's own layout
	 * pages use, so a wire here looks exactly like a wire there. */
	wires(r){
		if (!r.wire) return;
		div.c("flow", () => {
			p.c("muted", "The same page with the content taken out: only the boxes that decide the layout.");
			div.c("std-shots", () => { Layout.WIDTHS.forEach(size => Layout.shot({ wire: r.wire, id: this.name }, size)); });
		});
	}

	// A layout id links to the encyclopedia entry that defines the word.
	// ⚠ `/layouts/` is being written beside this one; a link to an entry that is not
	//   there yet renders as a 404 page, never as a broken card.
	layout_chip(id){
		if (!id) return;
		const head = id.split(" ")[0];
		if (is_layout_id(head)) a.c("site-id").href(layout_url(head)).text(id);
		else span.c("site-id").text(id);
	}

	// The chips. Each one is a page of its own: every other site carrying the tag.
	tags(r){
		if (!r.tags?.length) return;
		div.c("site-tags", () => r.tags.forEach(t => a.c("site-tag").href(tag_url(t)).text(t)));
	}

	/* The paragraph a newcomer reads, then the responsive sentence and its numbers.
	 * ⚠ `md()`, not `p()` — `p()` reads BACKTICKS AND NOTHING ELSE (View.backticks),
	 *   so `**bold**` in a `p()` renders as four literal asterisks. */
	notes(r){
		const bp = r.responsive?.breakpoints ?? [];
		const lines = [];
		if (r.notes) lines.push(r.notes);
		if (r.responsive?.strategy) lines.push("**When the window shrinks.** " + r.responsive.strategy);
		if (bp.length) lines.push("**Breakpoints:** " + bp.map(n => "`" + n + "px`").join(" · ")
			+ (r.scan?.media?.length
				? " — the three or four that matter, out of " + r.scan.media.length + " media queries found in " + (r.scan.css?.sheets ?? 0) + " stylesheets."
				: "."));
		if (lines.length) md.c("site-prose measure start", lines.join("\n\n"));
	}

	/* THE VIEWER — the live site in a frame you can resize, scaled down so a
	 * 3440-wide window fits on the page. Two cases, and the header decides which:
	 *
	 *   embed "allowed" — a button that says what it will do, and only once it is
	 *     pressed: an iframe, a width slider and four preset widths.
	 *   embed "blocked" — the site sends `x-frame-options` or a `frame-ancestors`
	 *     rule, so a frame would render an empty box with an error only in the
	 *     console. The strip above IS the test in that case, and we say so.
	 *
	 * Roughly half the web blocks framing, so the screenshots are the primary
	 * evidence and the viewer is the bonus — not the other way round.
	 *
	 * ⚠ NOTHING OFF THIS SERVER IS FETCHED UNTIL THE READER ASKS. An `<iframe src>`
	 *   written into the page is a request the instant it parses, so simply OPENING
	 *   one of these pages used to pull the whole of wikipedia.org (or stripe, or
	 *   apple) from that company's own server — a page view is not consent, and a
	 *   reader who wanted the four photographs paid a third party visit for them.
	 *   The button is the consent. `doc/decisions.md` has the reasoning; the proof
	 *   is a headless load whose only host is `localhost`. */
	viewer(r){
		if (r.embed !== "allowed") return div.c("site-blocked", () => {
			md("**This site cannot be shown in a frame.** It sends `" + (r.embed_note ?? "a framing header")
				+ "`, so a live viewer here would be an empty box with an error only in the console. The four shots above are the responsiveness test instead.");
		});

		/* ⚠ TWO boxes, not one. The ask is a flex ROW (a button beside a sentence), and
		 *   the frame that replaces it must be able to be 3260px wide — dropped into the
		 *   row it became a flex item and shrank to its content: 751px inside a 3260px
		 *   page, measured. So the outer box is a plain block that holds first the ask
		 *   and then, on the press, the viewer. */
		let $box;
		$box = div.c("site-viewer-box", () => {
			div.c("site-viewer-ask", () => {
				button("Load the live site").on("click", () => {
					// The ask has done its job; the frame takes its place, in the same
					// box, so nothing below it jumps.
					$box.el.replaceChildren();
					$box.append(() => { this.live(r); });
				});
				p.c("site-viewer-ask-note muted", "This one button is the only thing on the page that fetches anything from anywhere but this server: it loads "
					+ (this.host(r.url) ?? "the site") + " live, from their own machines, into a frame you can resize.");
			});
		});
	}

	// The host a url points at, for the sentence above. Null if the url is unparseable
	// — the sentence then says "the site", which is true and never throws.
	host(url){
		try { return new URL(url).host; } catch { return null; }
	}

	/* THE FRAME ITSELF, built only after the button is pressed (`viewer()`). */
	live(r){
		const height = 900;   // the frame's own viewport height, at every width
		let $frame, $stage, $label, $box;

		$box = div.c("site-viewer", () => {
			div.c("site-viewer-bar flex wrap gap v-center", () => {
				[400, 768, 1280, 1920, 3440].forEach(w =>
					button.c("site-viewer-preset").text(String(w)).on("click", () => set(w)));

				input.c("site-viewer-range").attr("type", "range")
					.attr("min", "320").attr("max", "3440").attr("step", "20").attr("value", "1280")
					.attr("aria-label", "frame width in pixels")
					.on("input", e => set(+e.target.value));

				$label = span.c("site-viewer-w").text("1280 px");
			});

			$stage = div.c("site-viewer-stage", () => {
				$frame = iframe.c("site-viewer-frame")
					.attr("src", r.url).attr("loading", "lazy")
					.attr("title", "A live, zoomed-out view of " + r.title);
			});
		});

		/* THE ZOOM. The frame is a real browser window `w` CSS pixels wide; scale the
		 * whole element by `available / w` so it fits, and size the stage to what the
		 * scaling actually paints. A `transform` does not change layout, so the stage's
		 * width and height have to be written by hand — the one thing here CSS cannot
		 * do for itself, because only JS knows how much room the page gave us.
		 *
		 * ⚠ Measure `$box`, NEVER `$stage`: we RESIZE the stage, so reading the room
		 *   off it would feed its own output back in and ratchet the frame to nothing.
		 * ⚠ The frame carries `max-width: none` (Site.css). framework.css's base layer
		 *   caps every iframe at `max-width: 100%`, which silently held a "3440" frame
		 *   to its container's 1766px and then scaled THAT down — the viewer showed the
		 *   site at 1766, labelled 3440, and nothing anywhere said so. Measured, not
		 *   guessed: the painted box read 907px where 1766 was expected. */
		const set = w => {
			const available = $box.el.clientWidth;
			if (!available) return;                      // not laid out yet — the observer will call back
			const k = Math.min(1, available / w);
			$frame.style({ width: w + "px", height: height + "px", transform: "scale(" + k + ")" });
			$stage.style({ width: Math.round(w * k) + "px", height: Math.round(height * k) + "px" });
			$label.text(w + " px");
			// ⚠ NOT `this.width` — `width` is one of the fields core reads off a page
			//   (Page.nav(), the columns sizing word), so a number written there is a
			//   layout instruction, not state of mine.
			this.viewer_width = w;
		};

		// Fires once on observe, which is also the first paint — so this is both the
		// initial layout and the response to every later window resize.
		new ResizeObserver(() => set(this.viewer_width ?? 1280)).observe($box.el);
	}

	/* WHAT THE SECTIONS ARE. Written by a person after looking at the shots — the
	 * scan can say a box is a grid of three tracks, but only a reader can say the
	 * three tracks are cards and that they stack at 940. */
	table(r){
		if (!r.sections?.length) return;
		div.c("site-sections", () => {
			// ⚠ A cell function's body is a STATEMENT — a captured callback's return
			//   value is appended TOO, so `() => this.layout_chip(x)` would draw the
			//   chip, then append it again (which MOVES it).
			ui.table(["section", "layout", "css", "what it does"], r.sections.map(s => [
				s.name,
				() => { this.layout_chip(s.layout); },
				s.css ?? "",
				s.note ?? "",
			]));
		});
	}

	// The evidence, one click down: what the scan measured, and the record itself.
	raw(r){
		details.c("site-fold", () => {
			summary("What the scan measured");
			div.c("flow", () => {
				p("Every landmark on the page at each of the four widths, with the computed `display`, the grid tracks, and `side_by_side` — the number of children whose tops line up, which is the column count a person would count.");
				ui.table(["width", "document", "boxes", "widest row"], ["400", "1280", "1920", "3440"].map(w => {
					const at = r.scan?.widths?.[w];
					return [w, at ? at.doc.join(" x ") : "—", at ? String(at.elements.length) : "—",
						at ? String(Math.max(0, ...at.elements.map(e => e.side_by_side))) : "—"];
				}));
			});
		});

		details.c("site-fold", () => {
			summary("The record — site/" + this.name + ".json");
			// `scan` is thousands of lines of measurements and is summarised above;
			// what a reader wants here is the half a person wrote.
			const { scan, ...hand } = r;
			pre(() => { code.js(JSON.stringify(hand, null, 2)); });
			a.c("site-raw-link", "the whole file, scan included")
				.href(this.root + "site/" + this.name + ".json")
				.attr("target", "_blank");
		});
	}

	/* ── THE WALL, shared by the index and every tag page ────────────────────
	 * Statics, so a page that has a list of manifest entries can draw the wall
	 * without constructing a Site. A card is a picture, a title, the layout ids at
	 * the two extreme widths, and three tags — one question at a glance.
	 * ⚠ The tags on a card are SPANS, not links: the card is already one `<a>`, and
	 *   a link inside a link is invalid and silently un-nested by the browser. */
	static card(entry){
		return a.c("site-card").href("/websites/" + entry.name + "/").append(() => {
			div.c("site-card-thumb", () => {
				if (entry.shot) img().attr("src", "/websites/" + entry.shot)
					.attr("alt", entry.title).attr("loading", "lazy");
			});
			div.c("site-card-body", () => {
				div.c("site-card-title", entry.title);
				div.c("site-card-ids", () => {
					span.c("site-id", (entry.layout?.["1920"] ?? "?") + " at 1920");
					span.c("site-id", (entry.layout?.["400"] ?? "?") + " at 400");
				});
				div.c("site-card-tags", () => entry.tags.slice(0, 3)
					.forEach(t => span.c("site-card-tag").text(t)));
			});
		});
	}

	static wall(entries){
		return div.c("site-wall", () => {
			if (!entries.length) p.c("muted", "Nothing here yet.");
			else entries.forEach(e => this.card(e));
		});
	}
}

/* The dir a record's relative image paths resolve against. ⚠ On the PROTOTYPE, not
 * a `root = …` class field: a class field is an own property assigned AFTER
 * `super()` returns, so it would overwrite whatever `assign()` just set from the
 * caller's config — the default would silently beat the argument. */
Site.prototype.root = "/websites/";

export default Site;
