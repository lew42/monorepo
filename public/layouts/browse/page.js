import { Page, View, div, a, b, span, p, h2, img, input, button, details, summary, md, icon } from "/app.js";
import Layout, { load as load_layouts, find } from "/layouts/Layout.js";
import { verdicts } from "./verdicts.js";

View.stylesheet(import.meta, "browse.css");

/* ── /layouts/browse/ — every layout on the site, and a verdict on each one ─────

   WHAT THIS PAGE IS FOR. The owner said it plainly: "part of that might require me
   going through layout by layout and either approving it or recommending what needs
   to change. So I think to do that, we need a layout browser." This is that browser:
   every layout the site owns, as a picture you can judge in a glance, each with an
   Approve and an Improve button one click down. (The tier strip counts them live, so
   never type the number into a sentence here.)

   THE THREE TIERS, because the owner also said the global layouts need to be
   separate from the smaller templates:

     Global      the shape of a whole page — the approved layouts, the ids of the
                 layout standard next door, the arrangements in the numbered lab,
                 the app shells.
     Sections    a band INSIDE a page — the sections realm, the paging templates,
                 the full-screen experiences in /layouts/labs/screens/.
     Components  the pieces a band is made of — framework/ui and framework/ux. This
                 is the "mobile card UI" tier.

   THE WALL IS `this.browse()` — core's own filterable-wall method (ext/catalog),
   the same one `/framework/core/Layout/` and `/framework/ui/` already stand on —
   not a hand-rolled grid (2026-09-18, `ai/2026-09-18/browse-on-browse/`, merge 5 of
   the overlap study: this page used to keep an independent 644-line copy of exactly
   what `browse()` already does). It draws real bands out of real children, so every
   catalogued layout below is a REAL declared child of this page — see `BrowseItem`.
   `browse()`'s own sticky rail is turned off (`rail: false`, the seam this task
   added to `ext/catalog/browse.js`): this page keeps its OWN sticky tier strip
   instead, because a rail has no notion of an approved-count and a page cannot
   show a reader two competing filter bars for the same three tiers.

   THE INVENTORY IS DATA. `items.json` was built ONCE, by a script, from each
   realm's own manifest — layouts.json, the APPROVED array, `system.js`'s entry
   list, and the `children:` line of every realm's page.js. No realm was edited to
   make this page exist, and nothing here crawls: adding an item means adding an
   object to that file. `readme.md` says how it was built and how to rebuild it.
   ⚠ `items.json` ALSO stays a plain fetchable file on purpose — never folded into a
     JS module — because `/layouts/doc/studies/approved/page.js` fetches it directly
     by url and is outside this task's fence.

   ⚠ A TOP-LEVEL AWAIT, right below, on the very fetch `items.json` has always been.
     `browse()` needs its band members to be children `this.children` already holds —
     declared before the router ever walks, the same requirement `core/Layout/page.js`
     meets with a plain `import` of its own hand-authored `layouts.js`. This inventory
     is BUILT data, not hand-authored, so a top-level `await fetch(...)` plays the same
     role: this module's own evaluation (and so the `import()` that loads it, which the
     router already awaits) simply waits for the one request before `new Page({...})`
     below ever runs — no new waiting machinery, and no more "the id was claimed before
     the file confirmed it" race this page used to carry.

   ⚠ A PREVIEW IS A PICTURE, NEVER A LIVE INSTANCE. A card shows a jpeg of the real
     page or a wireframe drawn from layouts.json. A wall of live pages would be one
     module load per card, and the wall would take a minute to settle.

   ⚠ No DOM after an `await`: every box below is captured synchronously and filled
     inside `.append(callback)` / `.empty(callback)`, which re-establish the captor. */

// ── THE DATA ──────────────────────────────────────────────────────────────────
// ⚠ Resolved against `import.meta`, never the document — the SPA fallback makes the
//   document url the current route, so "./items.json" read off the page would ask
//   the wrong directory from a deep link.
const DATA = await fetch(new URL("./items.json", import.meta.url)).then(res => res.json());

const shot_url = (id, label) => new URL("./shots/" + id + "-" + label + ".jpg", import.meta.url).pathname;

// The three widths an item is pictured at. Same viewports the layout standard draws
// at, so a screenshot here and a wireframe there can sit in one row and be compared.
const SHOTS = [
	{ label: "400",  w: 400,  h: 844,  means: "a phone" },
	{ label: "1920", w: 1920, h: 1080, means: "a laptop or a desktop" },
	{ label: "3440", w: 3440, h: 1440, means: "an ultrawide" },
];

/* THE PHONE LINE, and the one place it is written in JS. browse.css says the same
   `39.99rem` for the `order` half of this; the two have to agree, so if one moves the
   other moves with it. Below it an item page is re-arranged: the decision first, then
   the picture of the reader's own width, then the other two widths one tap down. */
const PHONE = matchMedia("(max-width: 39.99rem)");

/* ── THE VERDICT KEY — mastermind decision `verdict-keyspace`, 2026-09-18 ─────────
   A page's own corner control (`ext/Ask`, landed the same day this seam did) casts a
   verdict keyed by that page's own url — so a catalogued item that IS a real page
   reads and writes under that SAME key, and an Approve pressed on the page itself
   shows up on its card here with no extra wiring. The twelve wire items have no real
   page of their own — a wireframe is a picture of the abstract layout standard, not
   a screenshot of anything a reader can open — so they keep their short catalogue id,
   exactly as they always did. `real_url` is this file's own name for it (`BrowseItem`
   below), because `Page` already reserves `.url` for the item's OWN address; a raw
   `items.json` entry (the tier strip reads those directly) still calls it `url`. */
const vkey = item => item.wire ? item.id : (item.real_url ?? item.url);

/* ── LIVE BOXES ────────────────────────────────────────────────────────────────
   A verdict cast in this window — or in another one, on this page's OWN corner
   control, or by the owner on the command line — arrives off the dev socket as one
   line, and every box registered here redraws itself: a card's mark, the strip's own
   counts, and (one click down) an item's decision and its history. Boxes whose
   element has left the document are dropped on the way past, so a reader who walks
   twenty item pages does not leave twenty dead redraws behind. Off localhost there is
   no socket, nothing ever fires, and the marks are simply whatever the file said when
   the page loaded. */
const boxes = new Set();

verdicts.watch(() => boxes.forEach(box => {
	if (!box.$box.el.isConnected) return void boxes.delete(box);
	box.$box.empty(() => { box.draw(); });
}));

function live($box, draw){
	boxes.add({ $box, draw });
	$box.empty(() => { draw(); });
	return $box;
}

// Fired at module eval, same reason it always was: a socket that is already warm by
// the time anything asks for it costs nothing more to start early.
verdicts.load();

/* ── ONE CATALOGUED LAYOUT, AS A REAL PAGE ────────────────────────────────────────
   `Page` reserves `.name` (the url segment a parent addresses it by) and `.url` (its
   own address, set once it is adopted) — an `items.json` entry's OWN `name` and `url`
   fields mean something else (the card's label, and the real page this card is
   ABOUT), so they are renamed on the way in and Page's own meanings stay untouched.
   `leaf: true` because an item has no children of its own — the level-2 page below
   is this page's `content()`, not a subtree to walk. */
class BrowseItem extends Page {

	constructor({ name, url, ...rest }){
		super({ ...rest, name: rest.id, title: name, real_url: url, description: rest.say, leaf: true });
	}

	/* LEVEL 1 — the wall's own card: a picture, a name, a verdict mark, where it comes
	   from. `this.browse()` (below) calls this once per item, the same way core's own
	   `previews()` calls `preview()` on any page — one card shape site-wide (RULE#7),
	   this module's own version of it. */
	preview(nav){
		return a.c("std-browse-card").href(nav.url).append(() => {
			picture(this);
			div.c("std-browse-name", () => { span(this.title); mark(this); });
			span.c("std-browse-from", from(this));
		});
	}

	// LEVEL 2 — this item's own page: the pictures at three widths, then the verdict,
	// then everything one click down.
	content(){
		item_page(this);
	}
}

// browse()'s three bands, one per tier — DECLARED here from items.json's own `tier`
// field, never derived from a child's `group:` (browse()'s own rule: two of the four
// bands on a sibling page cannot be expressed that way either). The band label is
// also the string this page's own sticky strip looks a heading up by, via `data-band`.
const BANDS = Object.fromEntries(DATA.tiers.map(tier =>
	[tier.name, DATA.items.filter(item => item.tier === tier.id).map(item => item.id).join(" ")]));

export default new Page({
	meta: import.meta,
	title: "Browse",
	icon: "view_module",
	description: "Every layout on the site in one wall of pictures — global, sections, components — each one waiting to be approved or improved.",
	related: "/layouts/practice/ /layouts/shell/ /layouts/tag/",

	// ⚠ Every catalogued layout is a REAL child now, not a name `route()` claims once a
	//   fetch resolves — the top-level await above is what makes that safe. A deep link
	//   to a bad id 404s the ordinary way core already gives every page, so there is no
	//   `route()` override here any more.
	children: [...DATA.items.map(entry => new BrowseItem(entry)), "doc"],

	/* ONE SHORT LINE, THEN THE PICTURES. This page is a wall of pictures, so the
	   pictures are what a reader should see first — "don't tell the reader what you
	   are about to show them; show it" (the owner, 2026-09-05). */
	content(){
		md("**Every layout on this site, waiting for your verdict.** Open one to approve it, or to say in one line what has to change.");

		// $strip is captured empty and appended FIRST, so it reads first, then filled
		// once $browse exists — it needs $browse's own element to scroll a chip's click
		// into. The same "capture, then fill" split this page has always needed for its
		// own headings (⚠ no DOM after an await).
		const $strip = div.c("std-browse-strip wide");
		const $browse = this.browse(BANDS, { "--column": "20em" }, { rail: false }).ac("std-browse");

		$strip.append(() => { strip(DATA, $browse); });
	},
});

/* ── THE TIER STRIP — the way between the walls, and the score so far.

   It is a `<span role="button">`, which is neither of the two things it looks like it
   should be. Not a `<button>`: the theme gives every button the CTA grammar —
   uppercase, bold, CTA padding — at a specificity a component class cannot answer.
   Not an `<a>` either: an href here would mean copying the link or middle-clicking it
   lands you at the top of the page rather than on the tier the chip names. A span
   says what it is, and `tabindex` + the keydown below keep it reachable from the
   keyboard. The tier's own one-line description rides along as the chip's `title` —
   one hover away, never repeated three times down the page. */
function strip(data, $browse){
	data.tiers.forEach(tier => {
		const ids = data.items.filter(item => item.tier === tier.id).map(vkey);

		const go = () => $browse.el.querySelector('[data-band="' + CSS.escape(tier.name) + '"]')
			?.scrollIntoView({ behavior: "smooth", block: "start" });

		span.c("std-tag std-browse-tier")
			.attr("role", "button")
			.attr("tabindex", "0")
			.attr("title", tier.say)
			.on("click", go)
			.on("keydown", event => { if (event.key === "Enter" || event.key === " "){ event.preventDefault(); go(); } })
			.append(() => {
				b(tier.name);
				live(span(() => {}), () => score(ids));
			});
	});
}

// "0/45" is the score in the smallest number of characters there is, which is what
// lets three chips share one line on a phone. The word and the "to improve" tail live
// in their own span, hidden at phone width by browse.css.
function score(ids){
	const judged = verdicts.judged(ids);
	const ok = verdicts.approved(ids);

	span.c("std-browse-count", ok + "/" + ids.length);
	span.c("std-browse-score", " approved" + (judged > ok ? ", " + (judged - ok) + " to improve" : ""));
}

/* THE PICTURE. Three sources, one shape: a wireframe drawn live from layouts.json
   (the twelve ids of the layout standard already have one, so nothing was
   screenshotted twice), a jpeg that already existed in the module it belongs to, or
   a jpeg this task took at 1920. `loading="lazy"` because a wall is a hundred of
   these and only the first row is on screen. */
function picture(item){
	if (item.wire) return wire(item);

	return div.c("std-browse-pic", () => {
		img().attr("src", item.shot ?? shot_url(item.id, "1920"))
			.attr("alt", item.title + ", pictured at 1920 pixels wide")
			.attr("loading", "lazy");
	});
}

function wire(item){
	return div.c("std-browse-pic", $pic => {
		load_layouts().then(data => {
			const entry = find(data, item.wire);
			$pic.append(() => { if (entry) new Layout({ wire: entry.wire, id: entry.id }).frame(Layout.WIDTHS[1]); });
		});
	});
}

/* THE MARK — a check when the newest verdict approves, a pen when it asks for a
   change, and NOTHING when the owner has not looked yet. Nothing is the honest
   picture of "not judged": a grey dot on every other card would read as a state
   the owner had put there. Its own small `live()` box, not a rebuild of the whole
   wall — `this.browse()` builds each card once, so the mark has to update itself. */
function mark(item){
	const $mark = span.c("std-browse-mark");
	return live($mark, () => draw_mark($mark, item));
}

function draw_mark($mark, item){
	$mark.rc("is-approve is-improve");

	const verdict = verdicts.latest(vkey(item));
	if (!verdict) return;

	$mark.ac("is-" + verdict.say).attr("title", verdict.say === "approve" ? "Approved" : "To improve: " + (verdict.note || "no note"));
	icon(verdict.say === "approve" ? "check_circle" : "edit");
}

// WHERE A CARD SAYS IT COMES FROM — the module, and the word "drawing" when the
// picture is a wireframe rather than a photograph.
function from(item){
	return item.source + (item.wire ? " · drawing" : "");
}

/* ── LEVEL 2 ── one item, as FOUR boxes, each a direct child of the page grid.

   Four rather than two because of the phone. An item page is for the verdict (the
   owner, 2026-09-17), and at 400 the three pictures stack, which put Approve and
   Improve 1,043px down the page — past a screen and a third of scrolling, on the page
   whose whole job is those two buttons. Below 40rem browse.css gives the decision
   `order: -1` and it lands directly under the heading; the DOM keeps the desktop order,
   which is also the order that reads correctly aloud. At 40rem and up nothing moves.

   ⚠ The last three are the reading track, NOT `wide`. Only the pictures want the whole
     screen, and `wide` gave a one-line `<summary>` a 1,766px grey bar at 1920 and a
     3,260px paragraph at 3440 (measured 2026-09-17). */
function item_page(item){
	// 1 · THE PICTURES. `redraw`, not a plain append, because the arrangement below
	//     40rem is a different one and no CSS can open a `<details>` — see `pictures()`.
	//     The item's own data is already in hand (a real page, not a route() guess),
	//     so only the layout standard's own drawings need a fetch.
	div.c("std-shots std-browse-shots wide", $shots => {
		load_layouts().then(layouts => { redraw($shots, () => { pictures(item, layouts); }); });
	});

	div.c("std-browse-lede", () => { lede(item); });           // 2 · the way back, and the one line
	live(div.c("std-browse-seat"), () => { decide(item); });   // 3 · the decision — the box a phone hoists
	live(div.c("flow std-browse-rest"), () => { rest(item); }); // 4 · everything one click down
}

/* A BOX THAT REBUILDS WHEN THE WIDTH CROSSES THE PHONE LINE. One arrangement of the
   pictures cannot serve both sides of it — no CSS can open a `<details>` — so the
   choice is made in JS, and made again when someone turns their phone sideways. The
   listener drops itself once the box has left the document, the same discipline
   `live()` follows for verdicts. */
function redraw($box, draw){
	const again = () => {
		if (!$box.el.isConnected) return void PHONE.removeEventListener("change", again);
		$box.empty(() => { draw(); });
	};

	PHONE.addEventListener("change", again);
	$box.empty(() => { draw(); });
	return $box;
}

/* THE PICTURES A READER JUDGES BY, as a LIST of [size, draw] pairs rather than three
   calls — because the two arrangements below both need to know how many there are and
   what each one is called, and neither should know how a picture is made.

   A wire item draws its own three; a screenshot item shows the three jpegs; an item
   that borrowed a picture from the module it belongs to has one, and says so. */
function plan(item, layouts){
	if (item.wire){
		const entry = find(layouts, item.wire);
		if (entry) return Layout.WIDTHS.map(size => [size, () => { Layout.shot(entry, size); }]);
	}

	/* ⚠ A BORROWED PICTURE IS NOT 1920 WIDE. These reuse jpegs an earlier study already
	   took, which are not all 16/9 — labelling one "1920" would be a lie, and declaring
	   a ratio the jpeg does not have makes `object-fit: cover` throw part of it away.
	   `shot_at` in items.json is the picture's real size; the note says out loud that
	   this is the only one there is. */
	if (item.shot){
		const size = item.shot_at ?? SHOTS[1];
		return [[size, () => { shot(item, size, item.shot, "the one picture its own module took"); }]];
	}

	return SHOTS.map(base => {
		const size = { ...base, ...real(item, base.label) };
		return [size, () => { shot(item, size, shot_url(item.id, base.label)); }];
	});
}

/* ONE OF TWO ARRANGEMENTS.

   AT 40REM AND UP all of them share one row: `.std-shot` sizes each by its own aspect
   against a zero basis, so they land the same height with nothing measured.

   ⚠ BELOW IT THE ROW STACKS, and three stacked pictures put Approve and Improve
     1,043px down the page — past a screen and a third of scrolling at 400, on the page
     whose whole job is those two buttons (measured 2026-09-17). An item page is for the
     verdict (the owner, 2026-09-17), so a phone gets the picture of its OWN width and
     the other two one tap down. Nothing is deleted; it nests. */
function pictures(item, layouts){
	const shots = plan(item, layouts);

	if (!PHONE.matches || shots.length < 2) return void shots.forEach(([, make]) => make());

	shots[0][1]();

	const rest_of_them = shots.slice(1);
	return details.c("std-details std-browse-more", () => {
		summary("The other widths — " + rest_of_them.map(([size]) => size.label).join(" and ") + " pixels");
		div.c("std-shots", () => { rest_of_them.forEach(([, make]) => make()); });
	});
}

/* THE PICTURE'S REAL SIZE, read off the jpeg and written into items.json.

   `--a` used to be ASSUMED from the viewport a shot was taken at, and that held only
   while every jpeg was a whole screen. A picture's own numbers are the only ones that
   cannot drift; refresh them whenever shots/ is rebuilt (doc/inventory.md). */
function real(item, label){
	const [w, h] = item.sizes?.[label] ?? [];
	return w && h ? { w, h } : {};
}

/* ONE PICTURE AT ONE WIDTH, in layouts.css's own `.std-shot` — flex-grow is the
   picture's aspect ratio against a zero basis, so the three land the same height
   with nothing measured, and the height ceiling is a fold budget in `vh`. */
function shot(item, size, src, note){
	return div.c("std-shot", () => {
		div.c("std-shot-label", () => {
			b(size.label);
			span(" · " + size.means);
			if (note) span.c("std-browse-said", " · " + note);
		});
		img.c("std-browse-shot")
			.attr("src", src)
			.attr("alt", item.title + " at " + size.label + " pixels wide")
			.attr("loading", "lazy");
	}).style("--a", (size.w / size.h).toFixed(3));
}

// THE WAY BACK AND THE ONE LINE — box 2. Every item here is a real page now, so there
// is no "bad id" branch left to draw — a bad id 404s before content() ever runs.
function lede(item){
	trail(item);
	if (item.say) md(item.say);
}

// EVERYTHING ONE CLICK DOWN — box 4. The way to the real thing, then two folds.
function rest(item){
	where(item);
	history(item);
	why(item);
}

/* THE WAY BACK, and which of the three tiers this one is in. A reader who walks
   twenty items in a row needs the same way home on every one of them, in the same
   place — that is the whole of "stable navigation" at this size. */
function trail(item){
	return div.c("std-tags", () => {
		a.c("std-tag").href("/layouts/browse/").append(() => { icon("arrow_back"); span("Every layout"); });
		/* ⚠ `std-browse-flat` because `.std-tag` hovers: this span turned accent-orange
		   under the pointer exactly like the real link beside it, with nothing to click
		   (measured 2026-09-17). A control with no visible consequence reads as broken —
		   so this one stops pretending. */
		span.c("std-tag std-browse-flat", DATA.tiers.find(tier => tier.id === item.tier)?.name ?? item.tier);
	});
}

/* THE DECISION — the verdict as it stands, and the two buttons that change it, in the
   one box on the page. Everything else here is a plain line on the page's own ground:
   a box means a background different from its parent's, and the only thing that earns
   one is the thing the page exists for (the layout skill, 2026-09-17). */
function decide(item){
	return div.c("std-browse-decide", () => {
		verdict_line(item);
		acts(item);
	});
}

// THE VERDICT AS IT STANDS — one line.
function verdict_line(item){
	const verdict = verdicts.latest(vkey(item));

	return div.c("std-browse-verdict", () => {
		if (verdict){
			span.c("std-browse-mark is-" + verdict.say, () => { icon(verdict.say === "approve" ? "check_circle" : "edit"); });
			b(verdict.say === "approve" ? "Approved" : "To improve");
			if (verdict.note) span(verdict.note);
			span.c("std-browse-when", when(verdict.at));
			return;
		}

		/* ⚠ A BADGE IS NOT A VERDICT, and it used to read like one contradicting another.
		   Five items carry "approved by the owner, 2026-09-01" from the realm that judged
		   them before this page existed; one sentence now, and the tier count stays
		   honest — no verdict has been cast HERE. */
		span.c("std-browse-said", "No verdict cast here yet.");
		if (item.badge) span.c("std-browse-said muted", "It was " + item.badge + ", before this page existed.");
	});
}

/* THE TWO BUTTONS — the whole point of the page.

   ⚠ They need the dev server AND the dev rail's edit switch (`ext/Ask/edit.js`'s
     `edit()`, which `verdicts.writable()` already reads) — a verdict is a line
     appended to a file, and a static host has nothing to append with. Off localhost,
     or with edit turned off, the buttons are not there at all and the page says why:
     a control that cannot work is worse than no control. The verdicts themselves
     still render, because reading is a fetch. */
function acts(item){
	if (!verdicts.writable())
		return void p.c("std-browse-said muted", "Approve and Improve write a line to `verdicts.jsonl` through the dev server, so they only appear on localhost with the dev rail's edit switch on. Everything above is read from the same file and works anywhere.");

	return div.c("std-browse-acts", $acts => {
		button.c("btn", () => { icon("check"); span("Approve"); })
			.on("click", () => press($acts, item, "approve", ""));

		button.c("btn", () => { icon("edit"); span("Improve"); })
			.on("click", () => note($acts, item));
	});
}

// IMPROVE, pressed: the row becomes a one-line field, in place. A control that
// pushes the page down when you press it reads as a mistake.
function note($acts, item){
	let $field;

	$acts.empty(() => {
		$field = input.c("std-browse-note")
			.attr("type", "text")
			.attr("placeholder", "What has to change? One line.")
			.on("keydown", event => { if (event.key === "Enter") press($acts, item, "improve", $field.el.value.trim()); });

		button.c("btn", () => { icon("send"); span("Save"); })
			.on("click", () => press($acts, item, "improve", $field.el.value.trim()));

		a.c("std-browse-said muted").href(item.url)
			.on("click", event => { event.preventDefault(); $acts.empty(() => { acts_in($acts, item); }); })
			.append(() => { span("cancel"); });
	});

	$field.el.focus();
}

// The two buttons again, after a cancel — the same pair `acts()` builds, without
// rebuilding the row that holds them.
function acts_in($acts, item){
	button.c("btn", () => { icon("check"); span("Approve"); })
		.on("click", () => press($acts, item, "approve", ""));

	button.c("btn", () => { icon("edit"); span("Improve"); })
		.on("click", () => note($acts, item));
}

/* A PRESS. The row says "saving" and then does nothing more: the appended line comes
   back off the dev socket, every live box redraws, and this whole row is rebuilt
   from the file. One code path, and the server is the only orderer.
   A refusal is the one thing that has to be said out loud here — a press that
   silently did nothing is the worst failure this page could have. */
function press($acts, item, say, text){
	$acts.empty(() => { span.c("std-browse-said muted", "saving…"); });

	verdicts.say(vkey(item), say, text).catch(error => {
		$acts.empty(() => {
			span.c("std-browse-said", "That did not save: " + error.message);
			button.c("btn", "Try again").on("click", () => press($acts, item, say, text));
		});
	});
}

// WHERE IT LIVES — the way to the real thing, as a plain link.
function where(item){
	return p.c("std-browse-open", () => {
		a().href(item.real_url).append(() => { span("Open the real page"); icon("arrow_forward"); });
		span.c("std-browse-said muted", " in /" + item.source + "/");
	});
}

// THE HISTORY, one click down. Append-only means the record is the point: every
// verdict ever cast on this item, oldest first, is what the owner thought over time.
function history(item){
	const all = verdicts.all(vkey(item));
	if (all.length < 2) return;

	return details.c("std-details", () => {
		summary("Every verdict on this one — " + all.length + " so far");

		div.c("std-browse-history", () => {
			all.forEach(verdict => div(() => {
				span.c("std-browse-when", when(verdict.at));
				b(verdict.say === "approve" ? "Approved" : "To improve");
				if (verdict.note) span(verdict.note);
			}));
		});
	});
}

/* WHY IT IS THE WAY IT IS — the owner's "I can browse through the decisions that
   were made", for layouts. Nothing is written here: the module's OWN readme and its
   OWN doc/decisions.md are fetched and rendered, so the reasons on this page cannot
   drift from the reasons in the module. A file that is not there is simply omitted.

   ⚠ The SPA fallback answers a miss with index.html, so a 200 is not enough — the
     content-type is the real 404. */
function why(item){
	if (!item.why?.length) return;

	return details.c("std-details", () => {
		summary("Why it is the way it is — its module's own watch-outs and decisions");

		div.c("std-browse-why flow", $why => {
			Promise.all(item.why.map(url => text_of(url))).then(texts => {
				$why.append(() => {
					texts.forEach((body_text, index) => quote(item.why[index], body_text));
					if (!texts.some(Boolean)) md("Its module has not written any of this down yet.");
				});
			});
		});
	});
}

const text_of = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.text() : null)
	.catch(() => null);

/* One quoted file. A readme is quoted down to its "Watch out" list — that is the
   part that says what goes wrong and why the thing is shaped the way it is, and the
   rest of a readme is an index a reader can follow themselves. A decisions file is
   quoted whole, but one more click down, because some of them are very long. */
function quote(url, body_text){
	if (!body_text) return;

	if (url.endsWith("readme.md")){
		const watch = section(body_text, "Watch out");
		if (!watch) return;
		md("**What its own readme says goes wrong** — [" + url + "](" + url + ")");
		return md(watch);
	}

	return details.c("std-details", () => {
		summary("The decisions file it was built from — " + url);
		md(body_text);
	});
}

// One `##` or `###` section of a markdown file, by heading, up to the next heading.
function section(text, heading){
	const found = text.match(new RegExp("^#{2,3}\\s*" + heading + "\\s*$", "im"));
	if (!found) return null;

	const rest = text.slice(found.index + found[0].length);
	const next = rest.search(/^#{1,3}\s/m);
	return rest.slice(0, next === -1 ? undefined : next).trim();
}

// A verdict's timestamp, as a reader reads one: the date, and the time of day.
function when(at){
	const date = new Date(at);
	return isNaN(date) ? String(at) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
