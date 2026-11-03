import { Page, div, h2, p, a, img, figure, figcaption, span, md } from "/app.js";
import { verdicts } from "/layouts/browse/verdicts.js";

const here = new URL(".", import.meta.url).pathname;
const shots = here + "../shots/";

/* ── The closed set ──────────────────────────────────────────────────────
   The owner's question (2026-09-01): "how do we lock in on a small set of
   approved layouts, that never break?" The [layout study](../) already found
   the answer's shape: the site only ever IS three shells plus a wall and one
   escape hatch. This page makes that a CONTRACT: five names, each with the
   floors-and-ceilings that make it unbreakable, and nothing else without the
   owner's sign-off. */
const APPROVED = [
	{ file: "tax-rail-content.jpg", name: "1 · Rail + content",
		pick: "any reading page — docs, notes, an article without a ToC.",
		holds: "the page grid: gutters clamp(2em, 4%, 5em), text capped at the measure, `wide` takes the leftover, `bleed` is paint. Nothing is a bare 1fr." },
	{ file: "tax-reading-column.jpg", name: "2 · Docs three-region",
		pick: "an article long enough to want its own ToC — every blog post has it free.",
		holds: "same grid plus a pinned third region; the rail is clamp(14em, 26%, 22em), so no width starves the article." },
	{ file: "tax-columns-row.jpg", name: "3 · Columns row (Finder)",
		pick: "a world of peers you walk sideways — /imagine/, a workbench, a browser.",
		holds: "every width word is floored AND capped, and since today scales with the row (small 14→24em, default 40→46em, pads 0.9→3em); under 32em the row pages one column at a time." },
	{ file: "tax-tile-wall.jpg", name: "4 · Tile wall",
		pick: "a region of same-shaped children — an index, a dashboard, a gallery.",
		holds: "auto-fill against a real --column (14–22em): 4+ tracks at 3440, one at 390, never a squeezed pair. Lives INSIDE a shell, never beside one." },
	{ file: "tax-solo.jpg", name: "5 · Solo",
		pick: "the one page that opts all the way out (/resume/). Budget: about one per site.",
		holds: "its own render(), its own risk — solo is APPROVED but never DEFAULT, and each new one is the owner's call by name." },
];

const card = s => figure.c("flex v gap").style({ margin: 0, gap: "calc(var(--gap) * 0.5)" }).append(() => {
	img().attr("src", shots + s.file).attr("alt", s.name)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });
	figcaption(() => span(s.name).style({ fontWeight: "700" }));
	p(() => { span("Reach for it: ").style({ fontWeight: "600" }); span.c("muted", s.pick); });
	p(() => { span("Why it holds: ").style({ fontWeight: "600" }); span.c("muted", s.holds); });
});

/* ── THE LIBRARY — real pages, not the taxonomy above ────────────────────────
   The owner's words (2026-09-18): "each layout component can be a page … and I
   can respond to a specific page and ask for improvements or approve it, and
   it goes into an approved layout library." `ext/Ask`'s floating `?` now
   carries Approve/Improve on any page it is mounted on (`verdict.js`), and
   every press lands in the SAME file `/layouts/browse/` already writes,
   `/layouts/verdicts.jsonl` — one url per line, decisions.md says why a url
   never collides with one of browse's own catalogue ids.

   ⚠ ONLY a url-keyed verdict counts here — `row.item.startsWith("/")`. Browse
     casts its own verdicts keyed by a short id (`shell-left`), never a url, so
     an approval made by clicking through the wall shows on /layouts/browse/
     itself; an approval made on the page's OWN `?` control shows here. Two
     keys, one file, on purpose (ext/Ask/doc/decisions.md). */
/* ⚠ The FIRST draw below has no `isConnected` guard, on purpose — found by
   testing, not by inspection. `library()` runs synchronously inside
   `content()`, before core has inserted this page's view into the document,
   so `library_data()`'s fetches can resolve before `$box` is attached; a
   guard on this first call silently skipped the render every time, and a
   Playwright run proved it: a real Approve sat in `verdicts.jsonl`,
   `library_data()` correctly returned it, and nothing appeared on screen.
   Only a FUTURE redraw — after `verdicts.watch(draw)` fires again, by which
   time the owner may have navigated elsewhere — needs the guard, so it moved
   there. `/layouts/browse/`'s own `live()` (`browse/page.js`) makes the same
   split; this mirrors it. */
function library($box){
	const draw = () => library_data().then(list => { $box.empty(() => library_render(list)); });
	draw();
	verdicts.watch(() => { if ($box.el.isConnected) draw(); });
}

async function library_data(){
	const [browse] = await Promise.all([
		fetch("/layouts/browse/items.json").then(res => res.json()),
		verdicts.load(),
	]);

	// `rows()` is oldest-first (append-only file), so one overwrite walk lands
	// on the LATEST verdict per url with no separate sort — the same walk
	// `Verdicts.latest()` does for one item at a time (verdicts.js).
	const latest = new Map();
	verdicts.rows().forEach(row => { if (row.item?.startsWith("/")) latest.set(row.item, row); });

	return [...latest.entries()]
		.filter(([, row]) => row.say === "approve")
		.map(([url]) => ({ url, entry: browse.items.find(item => item.url === url) }));
}

function library_render(list){
	if (!list.length){
		p.c("muted", "Nothing carries an Approve yet. Press the check on any page's own `?` control, or on /layouts/browse/, and it lands here.");
		return;
	}

	div.c("grid auto gap", () => list.forEach(library_card)).style("--column", "16em");
}

/* A picture where /layouts/browse/ already has one for this exact url, a
   plain title link otherwise. A wireframe (`entry.wire`) is drawn LIVE by
   browse's own `Layout` class, which this page has no reason to duplicate for
   one link — the title still gets you there. */
function library_card({ url, entry }){
	// The same "flex v gap" utility combination `card()` above already uses for
	// its own picture-then-caption box — no new class needed for one more.
	// framework.css only resets a bare `<a>`'s colour and underline INSIDE
	// prose (p, li, td…), never on its own, so a card link states both itself.
	return a.c("flex v gap").href(url)
		.style({ gap: "calc(var(--gap) * 0.4)", textDecoration: "none", color: "inherit" })
		.append(() => {
			if (entry && !entry.wire){
				// Same fallback /layouts/browse/page.js's own `shot_url` uses: an item
				// can carry its own picture (`entry.shot` — the five `approved-*` items
				// do, since their jpeg already lives in this module's own shots/ dir,
				// not browse's) or fall back to browse's `<id>-1920.jpg` convention.
				img().attr("src", entry.shot ?? "/layouts/browse/shots/" + entry.id + "-1920.jpg").attr("alt", entry.name ?? url)
					.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });
			}
			span(entry?.name ?? url).style({ fontWeight: "600" });
		});
}

export default new Page({
	meta: import.meta,
	title: "Approved",
	description: "The five approved layouts — a closed set with floors and ceilings at every level — and the contract that keeps a new page from inventing a sixth.",
	icon: "verified",
	width: "full",

	content(){
		md("**Five layouts. A new page picks one by name; a sixth needs the owner.** Locking the set is what \"never breaks\" actually means — every failure the [layout study](/layouts/doc/studies/) catalogued came from a page improvising its own shape, and every survivor came from one of these.");

		h2("The set");
		div.c("grid auto gap", () => APPROVED.forEach(card)).style("--column", "20em");

		h2("The library");
		md("**Real pages, judged one at a time** — every url whose newest verdict is Approve, pressed from that page's own `?` control or from [`/layouts/browse/`](/layouts/browse/). The five above are the shapes; this is the growing set of real pages built from them — \"we refine that library and get nice, clean, robust layouts that the AI knows to lean on\" (the owner, 2026-09-18).");
		div.c("flow", $box => { library($box); });

		h2("Why these can't break");
		md("Each one is the same three promises, kept at every level:\n\n" +
			"1. **Every track has a floor AND a ceiling** — no bare `1fr`, no uncapped basis, no fixed px that one width regrets.\n" +
			"2. **Spacing is the two clamped tokens** (`--pad`, `--gap`, and the columns pads) — never a constant, so 390 and 3440 are the same declaration.\n" +
			"3. **`bleed` is for paint.** A background may butt its container; cards and text never do — a framed box on the edge rides a padded track instead.");

		h2("The gate");
		md("What locks it in, in order of force:\n\n" +
			"- **The words already are the set.** `page`/`rail`/`wall`/`stage`/`solo` and the column width words compile to these five — a page that stays in the vocabulary CANNOT leave the set.\n" +
			"- **The probe is the contract.** Before landing: 400 / 1280 / 1920 / 3440, and the three invariants — no text at x:0, no prose past the measure, no framed box against an edge. `ext/DesignTool`'s `analyze()` says which; the layout skill now says so.\n" +
			"- **The sixth layout is a proposal, not a commit.** It gets a page here, beside the five, with the same shots — and ships when the owner says so.");
	},
});
