import { Page, div, p, span, icon } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";
import Tree from "/framework/ux/Tree/Tree.js";
import { press } from "../paging.js";

/* ── REAL PAGES ────────────────────────────────────────────────────────────────

   A **made** page is a `page.json` Make wrote and Make owns. A **real** page is an
   ordinary directory in this repo with a `page.js` in it — the shape every page on this
   site has. Open Make with `?real=<url>` and that subtree appears as a second group in
   the left pane:

       /imagine/paging/make/?real=/framework/ux/

   Drag one of those rows onto another and, once you say Move, **the directory moves on
   disk**: `rpc:move` renames it, and the two `page.js` files that name it — the parent it
   left and the parent it joined — have their `children:` lines rewritten. Nothing else in
   either file is touched.

   ⚠ NOTHING HAPPENS UNTIL YOU CONFIRM. A drag puts a row in the right pane saying exactly
     which directory is about to move and where, and the move runs on that button.

   ⚠ ONE MINUTE OF UNDO, AND NO HISTORY. `rpc:move` answers with the reverse move already
     worked out, so the sidebar offers it straight back for a minute and then forgets. Why
     that and not a stack: doc/decisions.md.

   ⚠ A STRING `children:` OR NOTHING AT ALL. This rewrites ONE shape of declaration and
     refuses every other one, out loud, having moved nothing. doc/decisions.md.

   ⚠ EVERY LINK AND IMPORT THAT POINTS AT THE MOVED PAGE IS REWRITTEN TOO, on the dev
     server, inside `rpc:move` itself — `core/Page/tools/links.mjs` keeps a census
     (`public/links.json`) of every `href`, markdown link, `url:` field and absolute
     `import … from` in the site, and the same call that renames the directory rewrites all
     of them from the old url to the new one. The confirm row previews the count before you
     click Move; doc/decisions.md has the design and the measured cost.                  */


// ════ THE TREE GROUP ══════════════════════════════════════════════════════════
/* Every page can hold pages, so every row is a drop target — `Tree.holds()` asks the
   node, and a node built by `Tree.node_of()` only carries `children` when the page
   already has some. A page tree's answer is always yes. */
class PagingMakeRealTree extends Tree {
	holds(){ return true; }

	/* ⚠ A ROW IS NOT A LINK HERE. `Tree.node_of()` gives every row the child's url as an
	     `href`, which is exactly right for a navigation tree and exactly wrong for an
	     editor: one click on a row you meant to select would leave the screen you are
	     arranging pages on. The url still rides along on `node.page`, and the right pane
	     offers Open as a button. Make's own page tree says the same thing about its rows,
	     in its own words (`tree.js`). */
	static node_of(page, name){
		const { href, ...node } = super.node_of(page, name);
		return node;
	}

	/* ⚠ `draw()`, NOT `render()`. `Tree.from()` builds the tree EMPTY and calls `draw()`
	     again when the page's children resolve, so a selection made in `render()` is
	     thrown away a microtask later. */
	draw(nodes){
		super.draw(nodes);
		return this.show_picked();
	}

	// The row for the page the right pane is about, re-selected after every redraw.
	show_picked(){
		const found = [...this.rows.keys()].find(node => node.page?.url === this.picked);
		if (found) this.select(found, false);
		return this;
	}
}

/* THE SECOND GROUP IN THE LEFT PANE. Drawn only when `?real=` named one — Make without
   it is exactly the screen it was. */
export function real_group(page){
	if (!page.real_url) return null;

	head("Real pages", page.real_url);

	return div.c("paging-make-real", $box => {
		if (page.real) return void rows(page, $box);

		$box.append(() => { p.c("muted", "Reading " + page.real_url + " …"); });

		// ⚠ No DOM after the await — `$box` was captured above and `empty(callback)`
		//   re-establishes the captor inside it.
		root_of(page).then(() => $box.empty(() => { rows(page, $box); }));
	});
}

function rows(page, $box){
	if (!page.real) return p.c("muted", "No page answered at " + page.real_url
		+ ". A real page is a directory with a `page.js` in it.");

	/* `Tree.from()` is core of the component: it returns the tree SYNCHRONOUSLY, so it
	   lands in the box capturing right now, and fills it when the page's children
	   resolve. A static is inherited, so `this` inside it is the subclass. */
	PagingMakeRealTree.from(page.real, {
		picked: page.real_picked,
		drag: true,

		onSelect: node => page.pick_real(node.page?.url),

		/* A DROP IS A PROPOSAL, never a write. `ux/Tree` reports where the row landed —
		   inside `into`, at `index` counted WITHOUT the dragged row — and this turns that
		   into the sentence the right pane is about to ask you to confirm. */
		onMove: ({ node, into, index }) => page.propose_real(plan_for(page, node, into, index)),
	});

	p.c("muted paging-make-line-note", "Drag a row by its grip and the directory itself moves — you are asked first.");
}

/* The real root, loaded once. `Page.load()` is core's own dynamic import of
   `<url>page.js`, so this is the very page the url serves, children and all. */
function root_of(page){
	return page.real_loading ??= Page.load(page.real_url, 1)
		.then(root => page.real = root)
		.catch(() => null);
}

/* THE LINKS CENSUS, loaded once and cached on the page — same "load once, redraw when it
   lands" shape as `root_of()` above. `public/links.json` is a static file
   (`core/Page/tools/links.mjs` writes it), so a plain `fetch`; nothing here ever WRITES it —
   that only happens on the dev server, inside `rpc:move` itself. `no-store` because a stale
   copy would undercount right after a move the same session already made. */
function links_of(page){
	return page.real_links_loading ??= fetch("/links.json", { cache: "no-store" })
		.then(r => r.ok ? r.json() : {})
		.then(data => page.real_links = data)
		.catch(() => page.real_links = {});
}

/* How many links/imports point INTO the subtree being moved — `plan.from` and anything
   nested under it, same prefix rule `rewrite_links()` in `links.mjs` uses server-side. A
   PREVIEW only: the real, certain count comes back on the move's own answer (`done.links`),
   because this copy of `links.json` can be a little older than the site. `null` while it is
   still loading, and for a same-parent reorder — nothing moves, so nothing is rewritten. */
function links_preview(page, plan){
	const data = page.real_links;
	if (!data || !plan || plan.from === plan.to) return null;

	let count = 0;
	const files = new Set();

	for (const key of Object.keys(data)){
		if (!key.startsWith(plan.from)) continue;
		for (const loc of [...data[key].links, ...data[key].imports]){ count++; files.add(loc.split(":")[0]); }
	}

	return { count, files: files.size };
}

const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");

const head = (title, said) => div.c("paging-make-pane-head", () => {
	span.c("paging-make-group-title", title);
	span.c("muted paging-make-line-note", said);
});


// ════ WHAT A DROP MEANS ═══════════════════════════════════════════════════════
/* One object, built the moment the row is let go and read by everything after it: the
   sentence in the sidebar, the two writes, the undo. Nothing recomputes it. */
function plan_for(page, node, into, index){
	const moving = node.page;
	const parent = moving?.parent ?? page.real;
	const host = into?.page ?? page.real;

	// `index` already counts a closed branch's real children — `Tree.Drag.commit()`
	// fixed this at the source (ux/Tree/doc/decisions.md, 2026-09-18); this file no
	// longer needs its own guess at "last".
	return {
		name: moving.name,
		title: moving.title ?? moving.name,
		page: moving,
		out: parent,                 // the parent it is leaving
		into: host,                  // the parent it is joining
		from: moving.url,
		to: host.url + moving.name + "/",
		index,
	};
}

/* Can it happen at all? Two answers a person can act on, checked before anything is
   read or written. (Dropping a page inside its own subtree is refused earlier still, by
   `Tree.Drag.drop_check()`.) */
export function refusal(plan){
	if (!plan?.page) return "That row is not a loaded page, so there is nothing to move.";

	if (plan.out !== plan.into && plan.into.children?.get(plan.name) !== undefined)
		return plan.into.url + " already has a page called “" + plan.name + "”.";

	if (!edit())
		return "There is no dev server here (or edit mode is off), so nothing on disk can be moved.";

	return null;
}


// ════ THE RIGHT PANE ══════════════════════════════════════════════════════════
/* Three things can be true, and at most one of them is on screen: a move is waiting to be
   confirmed, a move just happened and can be undone, or a real page is simply selected.
   Returns null when none of them is — and then the pane is Make's own, unchanged. */
export function real_pane(page){
	if (page.real_busy) return busy_row(page.real_busy);
	if (page.real_fail) return fail_row(page);
	if (page.real_move) return confirm_row(page, page.real_move);
	if (page.real_undo) return undo_row(page, page.real_undo);
	if (page.real_picked) return picked_row(page);

	return null;
}

/* A move is three round trips to the dev server, so it has a moment. Saying nothing for
   that moment reads as a button that did not work. */
const busy_row = plan => div.c("paging-make-confirm", () => {
	p.c("paging-make-ask-title", "Moving `" + plan.name + "` …");
	p.c("muted", "Renaming the directory and rewriting the two `children:` lines.");
});

/* ⚠ THE REASON, NOT A SHRUG. Every refusal in `commit()` arrives here as a sentence
     naming the file and what was found in it, because the reader's next move is to open
     that file — and "could not move" tells them nothing about which one. */
const fail_row = page => div.c("paging-make-ask", () => {
	p.c("paging-make-ask-title", "Nothing was moved");
	p(page.real_fail);

	press(span.c("paging-act").append(() => span("Close")), () => page.forget_real_undo());
});

/* THE ONE SENTENCE THAT SAYS WHAT IS ABOUT TO HAPPEN, and it says it in full: the
   directory that moves, where it lands, and that this is the disk and not a picture of
   it. A reorder inside one parent is a different, smaller, true sentence — no directory
   moves at all, one `children:` line changes — and saying the big one there would be a
   lie the reader could check. */
function confirm_row(page, plan){
	const no = refusal(plan);

	// The preview needs `links.json` fetched once; kick that off here and redraw when it
	// lands — the same lazy-load-then-redraw shape `real_group()` uses for the tree itself.
	if (!no && page.real_links === undefined) links_of(page).then(() => page.redraw?.({ tree: false, centre: false }));
	const preview = links_preview(page, plan);

	return div.c("paging-make-confirm", () => {
		if (no){
			p.c("paging-make-ask-title", "That move cannot happen");
			p(no);
			press(span.c("paging-act").append(() => span("Close")), () => page.propose_real(null));
			return;
		}

		p.c("paging-make-ask-title", plan.from === plan.to
			? "Reorder `" + plan.name + "` inside `" + plan.into.url + "`"
			: "Move `" + plan.from + "` into `" + plan.into.url + "`");

		p(plan.from === plan.to
			? "Nothing moves on disk. One line changes: `children:` in `" + plan.into.url + "page.js`."
			: "The folder moves on disk. `" + plan.from + "` becomes `" + plan.to
				+ "`, and the `children:` line changes in both `" + plan.out.url + "page.js` and `" + plan.into.url + "page.js`"
				+ (preview?.count ? ", and " + plural(preview.count, "link") + " in " + plural(preview.files, "file")
					+ " " + (preview.count === 1 ? "is" : "are") + " rewritten" : "")
				+ ".");

		press(span.c("paging-act").append(() => { icon("drive_file_move"); span("Move"); }),
			() => page.run_real_move(plan));

		press(span.c("paging-act").append(() => span("Cancel")), () => page.propose_real(null));
	});
}

/* THE MINUTE AFTER. `rpc:move` answered with the reverse move already worked out, so
   undoing is running the same commit backwards — not a stack, not a journal, one offer
   that expires. */
function undo_row(page, back){
	return div.c("paging-make-confirm", () => {
		p.c("paging-make-ask-title", "Moved `" + back.name + "`");
		p("It is at `" + back.was_to + "` now. You can put it back for one minute."
			+ (back.links?.count ? " " + plural(back.links.count, "link") + " in " + plural(back.links.files, "file")
				+ " " + (back.links.count === 1 ? "was" : "were") + " rewritten too." : ""));

		press(span.c("paging-act").append(() => { icon("undo"); span("Undo the move"); }),
			() => page.run_real_move(back, { undoing: true }));

		press(span.c("paging-act").append(() => span("Keep it")), () => page.forget_real_undo());
	});
}

/* A REAL PAGE, SELECTED. Make cannot edit one — a real page is a `page.js` somebody
   wrote — so this pane says what it CAN do with it, and links to the page itself. */
function picked_row(page){
	const url = page.real_picked;

	return div.c("paging-make-real", () => {
		div.c("paging-make-sel-head", () => {
			span.c("paging-make-sel-kind", "real page");
			span.c("paging-make-sel-what", url);
		});

		p.c("muted", "A real page is a directory with a `page.js` in it. Make does not edit one — it moves it. Drag its row by the grip onto another page and you will be asked to confirm.");

		press(span.c("paging-act").append(() => { icon("open_in_new"); span("Open the page"); }),
			() => page.app?.router?.go(url));
	});
}


// ════ THE MOVE ITSELF ═════════════════════════════════════════════════════════
/* Four steps, in this order, and the order is the whole safety of it:

     1. READ both parents' `page.js` and check each `children:` line is one this can
        rewrite. Nothing has happened yet, so a refusal here costs nothing.
     2. `rpc:move` the directory — atomic, and it answers with the reverse move. The SAME
        call also rewrites every link and import that pointed at the old url (server-side,
        `links.mjs`'s `rewrite_links()`, run before the `fs.rename` so every file it touches
        is still where its census entry says) — the answer carries `{ count, files }`.
     3. WRITE the two sources. The directory is already where the files will say it is.
     4. Move the live pages in memory the same way, so the tree redraws correct without
        a reload.

   ⚠ STEP 4 IS NOT COSMETIC. A browser never re-imports a `page.js` module it has already
     imported, so rebuilding the tree from a fresh `Page.load()` would read the OLD
     `children:` out of the module cache and show the move as not having happened. The
     files and the live graph are changed side by side, here, so they cannot drift.

   ⚠ STEP 3 RE-READS THE TWO SOURCES RATHER THAN REUSING STEP 1's COPY, and this one is
     not optional. A parent very often links to its own child in its content (the
     link-tracking proof's scratch tree does exactly this — `alpha` links to `beta`), so
     step 2's link rewrite can land INSIDE one of these same two files. Step 1's copy was
     read before that happened; writing it back in step 3 would silently erase the fix step
     2 just made, one line later, with no error anywhere (measured 2026-09-18: the proof's
     first run showed "2 links … rewritten" and then `rg` found one of the two links still
     pointing at the OLD url — this is the fix). `with_children()` finds the `children:`
     line fresh in whatever text it is given, so re-reading costs one more `fetch` and nothing
     else. Step 1's copy still does its own job untouched: deciding, before anything on disk
     has changed, whether this move can happen at all. */
export async function commit(plan){
	const socket = Socket.singleton();
	const same_parent = plan.out === plan.into;

	const out_src = same_parent ? null : await source(plan.out.url);
	const into_src = await source(plan.into.url);

	if (into_src === null) return fail("`" + plan.into.url + "page.js` could not be read.");
	if (!same_parent && out_src === null) return fail("`" + plan.out.url + "page.js` could not be read.");

	// ⚠ BOTH LISTS ARE WORKED OUT BEFORE ANYTHING MOVES, so a refusal leaves the disk
	//   exactly as it was. Only the FORMAT is checked against this early copy — the
	//   `children:` line never holds a link or an import, so a rewrite to some OTHER line
	//   cannot change whether this move is legal.
	const out_read = same_parent ? null : children_of(out_src);
	const into_read = children_of(into_src);

	if (out_read?.bad) return fail(bad_line(plan.out.url, out_read.bad));
	if (into_read.bad) return fail(bad_line(plan.into.url, into_read.bad));

	const was_index = (same_parent ? into_read.names : out_read.names).indexOf(plan.name);

	const out_names = same_parent ? null : out_read.names.filter(name => name !== plan.name);
	const into_names = into_read.names.filter(name => name !== plan.name);
	into_names.splice(plan.index, 0, plan.name);

	// 2 — the directory. A reorder inside one parent never touches the disk, and never
	// touches a link or an import either: nothing about the url changed.
	let back = { from: plan.to, to: plan.from };
	let links;   // stays undefined for a same-parent reorder — there is nothing to report

	if (!same_parent){
		const reply = await socket.async_rpc("move", plan.from, plan.to);
		const answer = reply?.response;

		if (!answer?.ok) return fail(answer?.reason ?? "The dev server did not answer the move.");
		back = answer.undo;
		links = answer.links;   // { count, files } — rpc:move already rewrote them, server-side
	}

	// 3 — the two sources, RE-READ (see the ⚠ above `commit()`) so this write cannot
	// clobber a link rewrite step 2 just made inside one of these same two files.
	let out_text = null, into_text = null;

	if (same_parent){
		into_text = with_children(into_src, into_names);
	} else {
		const [out_fresh, into_fresh] = await Promise.all([source(plan.out.url), source(plan.into.url)]);
		out_text = with_children(out_fresh ?? out_src, out_names);
		into_text = with_children(into_fresh ?? into_src, into_names);
	}

	if (into_text === null) return fail(no_anchor(plan.into.url));
	if (out_text === null && !same_parent) return fail(no_anchor(plan.out.url));

	await Promise.all([
		out_text !== null ? socket.async_rpc("write", plan.out.url + "page.js", out_text) : null,
		socket.async_rpc("write", plan.into.url + "page.js", into_text),
	]);

	// 4 — the same move, in memory.
	relocate(plan);

	return {
		ok: true,
		name: plan.name,
		title: plan.title,
		was_to: plan.to,
		// The reverse plan, ready to run: the same shape `plan_for()` builds.
		page: plan.page, out: plan.into, into: plan.out,
		from: back.from, to: back.to,
		index: was_index < 0 ? 0 : was_index,
		links,   // the ACTUAL count the server just rewrote — undo_row() reports it
	};
}

const fail = why => ({ ok: false, why });

const bad_line = (url, saw) => "`" + url + "page.js` declares its children as `" + saw
	+ "` — this can only rewrite a plain string, so nothing was moved.";

const no_anchor = url => "`" + url + "page.js` has no `children:` and no `title:` to put one after, so nothing was moved.";

/* ⚠ `no-store`. The source is being read in order to be rewritten, and a cached copy
     from before the last move would be rewritten back over the new one. */
async function source(url){
	const res = await fetch(url + "page.js", { cache: "no-store" }).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return res.text();
}

/* The live `Page` graph, moved exactly the way the files just were. `page.move()` is
   core's own re-address — the whole subtree comes with it — and a Map keeps insertion
   order, so the index is real. */
function relocate(plan){
	plan.out.children.delete(plan.name);

	const entries = [...plan.into.children].filter(([name]) => name !== plan.name);
	entries.splice(plan.index, 0, [plan.name, plan.page]);
	plan.into.children = new Map(entries);

	plan.page.parent = plan.into;
	plan.page.move(plan.into.url + plan.name + "/");
}


// ════ ONE `children:` LINE, READ AND REWRITTEN ════════════════════════════════
/* A page names its children the way every page in this repo does — a string of directory
   names, in nav order:

       export default new Page({ meta: import.meta, title: "A", children: "b c" });

   That is the ONLY shape these two functions touch. `children: [...]`, `children: {…}`
   and `children(){…}` are all legal declarations that mean things a text edit cannot
   safely express, so a move onto one of them refuses and names the file.

   ⚠ A LIST THAT GOES EMPTY LOSES THE WHOLE LINE, rather than becoming `children: ""` —
     core's `declare("")` splits an empty string into `[""]` and declares a child with no
     name, which shows up as a blank row in every nav the page has. The one-line fix lives
     in core (`.filter(Boolean)` on that split) and core is not this task's to edit;
     doc/decisions.md records it. */

const AT = /\bchildren\s*[:(]/;
const STRING = /^children\s*:\s*(["'])([^"'\n]*)\1/;

export function children_of(source){
	const found = source.match(AT);
	if (!found) return { names: [], at: null };

	const rest = source.slice(found.index);
	const string = rest.match(STRING);

	if (!string) return { bad: rest.slice(0, 32).split("\n")[0].trim() };

	return { names: string[2].trim().split(/\s+/).filter(Boolean), at: found.index, was: string[0] };
}

export function with_children(source, names){
	const read = children_of(source);
	if (read.bad) return null;

	const line = 'children: "' + names.join(" ") + '"';

	if (read.at === null) return names.length ? inserted(source, line) : source;
	if (!names.length) return removed(source, read);

	return source.slice(0, read.at) + line + source.slice(read.at + read.was.length);
}

/* Out with the declaration, and out with the line too if that is all the line was. The
   three comma repairs are for the inline form, where the declaration sits between two
   others on one line.

   ⚠ A LINE THAT HELD ONLY THE CHILDREN DECLARATION leaves behind its own leading indent
     and a bare comma — `inserted()` writes exactly that shape ("\n" + indent + "children:
     …" + ","), so undoing an insert on a page whose `title:` sits mid-line (no line of its
     own) left a stray " ,\n" behind: `rest.trim()` alone reads that lone comma as real
     content and keeps the line (found 2026-09-18, the link-tracking proof's `alpha/page.js`
     — `rest` came back " ,\n", which is truthy). A line whose only non-whitespace
     character is one or more commas held nothing else, so it goes too. */
function removed(source, read){
	const start = source.lastIndexOf("\n", read.at) + 1;
	const nl = source.indexOf("\n", read.at);
	const end = nl < 0 ? source.length : nl + 1;

	const rest = source.slice(start, end).replace(read.was, "")
		.replace(/,(\s*),/g, ",$1")
		.replace(/([{(])(\s*),/g, "$1$2")
		.replace(/,(\s*)([})])/g, "$1$2");

	const bare = rest.trim().replace(/^,+$/, "");

	return source.slice(0, start) + (bare ? rest : "") + source.slice(end);
}

/* A page that has never had children has no line to rewrite, so one is written — right
   after the title, in whichever form the title is in, because that is where a reader
   looking for it will look. No title, no anchor, and the move refuses. */
function inserted(source, line){
	const title = source.match(/([ \t]*)title\s*:\s*(["'])[^"'\n]*\2[ \t]*,?/);
	if (!title) return null;

	const end = title.index + title[0].length;
	const comma = title[0].trimEnd().endsWith(",") ? "" : ",";
	const gap = source.slice(end).startsWith("\n") ? "\n" + title[1] : " ";

	return source.slice(0, end) + comma + gap + line + "," + source.slice(end);
}

export default real_group;
