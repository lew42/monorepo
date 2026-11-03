import { div, span, button, input, icon } from "/framework/core/View/View.js";
import { available } from "./Ask.js";
import { reply } from "./reply.js";
import { verdicts } from "/layouts/browse/verdicts.js";

/**
 * Approve / Improve for the WHOLE PAGE `mount()` is standing on — the owner's
 * words: *"click and give you feedback on a specific item — for layouts and
 * pages … approve it, and it goes into an approved layout library."*
 * `/layouts/browse/` already gives every one of its 102 catalogued items this
 * exact verdict; this is the same button, the same file, the same live
 * updates — on ANY page, not only a catalogued one, keyed by the page's own
 * url instead of a browser id. See `doc/decisions.md` for why a url and a
 * browser id can never collide in the one shared file.
 *
 *     verdict_mark(this.url);              // the check/pen — build immediately
 *     verdict_acts({ url: this.url });      // Approve / Improve — build once opened
 *
 * `url` must be the page's OWN url, `this.url` on the `Page` that is calling
 * this — never `location.pathname` and never `app.router.active.url`. Both
 * still name the PREVIOUS page while a page's own `content()` / `render()` /
 * `column()` is running: `Router.go()` loads (which runs this) and only
 * pushes the new url to `history` — and `router.active` — afterwards
 * (`Router.js`, "load first, push second"). Reading either one here would
 * silently file every verdict under the page you just LEFT.
 *
 * Off the dev server, OR with edit mode off in the dev rail, neither renders
 * anything — `available()` (`Ask.js`) is now `edit()` itself
 * (`ext/Ask/edit.js`, landed 2026-09-18 alongside this), so these two
 * functions never needed a second line changed: they gated on `available()`
 * from the start, and the shared switch arrived underneath that same name.
 */
export function verdict_mark(url){
	if (!available() || !url) return null;
	return new Verdict({ url }).mark();
}

/**
 * The two buttons, and the note field Improve opens. `m` is optional — pass a
 * task's own manifest (`ext/JSONL`'s `TaskJSONL`) to also open `reply()`'s
 * box under the saved note, so the note reaches Claude the same way a reply
 * to an ask card or a decision row does. Most pages have no task log to file
 * a reply into (a layout demo is not a task), so without `m` the note is
 * simply the verdict's own `note` field — exactly what `/layouts/browse/`'s
 * Improve already writes, read back the same way everywhere verdicts are
 * shown. See `doc/decisions.md`.
 */
export function verdict_acts({ url, m, about } = {}){
	if (!available() || !url) return null;
	return new Verdict({ url, m, about }).acts();
}

/* Every mark and every acts row on the page redraws when a verdict arrives —
   cast here, in another tab, or on /layouts/browse/ if this page's url is
   ever also a browse item. One shared Set, the same shape browse/page.js's
   own `live()` uses, kept local to this file rather than imported: two
   controls sharing one Set would mean one file's box leaking into the
   other's redraw loop for no reason either needs. */
const boxes = new Set();

verdicts.watch(() => boxes.forEach(box => {
	if (!box.$box.el.isConnected) return void boxes.delete(box);
	box.$box.empty(() => box.draw());
}));

/* ⚠ NO `isConnected` GUARD ON THIS FIRST DRAW. `mount()` calls `verdict_mark()`
   synchronously inside a page's own `content()`, BEFORE core inserts that
   page's view into the document — so at the instant `verdicts.load()`
   resolves (often a single fast microtask on an already-warm socket) `$box`
   can still be unattached, and skipping the draw then left the mark
   permanently blank on a page whose OWN earlier verdict should have shown
   immediately (caught by testing, not by inspection — a Playwright run
   printed `{connected: false, list: [...]}` on a page holding a real
   approve). The `boxes` Set's own `verdicts.watch()` callback above is where
   `isConnected` belongs: only a FUTURE redraw, after the owner may have
   already navigated away, needs the guard. `browse/page.js`'s own `live()`
   makes exactly this split — this one now matches it. */
function live($box, draw){
	boxes.add({ $box, draw });
	verdicts.load().then(() => $box.empty(() => draw()));
	return $box;
}

class Verdict {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* THE MARK — a check when the newest verdict on this url approves, a pen
	   when it asks for a change, nothing when nobody has judged this page yet.
	   Nothing is the honest picture of "not judged" (the same rule
	   browse/page.js's own `mark()` follows) — a grey dot on every page that
	   has never been looked at would read as a state the owner put there. */
	mark(){
		this.$mark = span.c("ask-verdict-mark");
		return live(this.$mark, () => this.draw_mark());
	}

	/* `.rc()` before `.ac()`, every redraw — `.empty()` clears the CHILDREN, not
	   the classes the previous draw left on this same box, and a page whose
	   verdict changed from improve to approve would otherwise wear both. */
	draw_mark(){
		this.$mark.rc("is-approve is-improve");

		const v = verdicts.latest(this.url);
		if (!v) return;

		this.$mark.ac("is-" + v.say).attr("title", v.say === "approve" ? "Approved" : "To improve: " + (v.note || "no note"));
		icon(v.say === "approve" ? "check_circle" : "edit");
	}

	/* THE TWO BUTTONS — Approve, and Improve's one-line note. Off the dev
	   socket (writable() false — happens when the page loaded fine but the
	   server since dropped) they are replaced by one sentence, the same
	   guard `/layouts/browse/`'s own `acts()` uses. */
	acts(){
		this.$acts = div.c("ask-verdict-acts");
		return live(this.$acts, () => this.draw_acts());
	}

	draw_acts(){
		const v = verdicts.latest(this.url);

		if (v) span.c("ask-verdict-said muted", (v.say === "approve" ? "Approved" : "To improve: " + (v.note || "no note")));

		if (!verdicts.writable())
			return void span.c("ask-verdict-said muted", "Approve/Improve need the dev server.");

		button.c("ask-verdict-btn", () => { icon("check"); span("Approve"); }).attr("type", "button")
			.on("click", () => this.press("approve", ""));

		button.c("ask-verdict-btn", () => { icon("edit"); span("Improve"); }).attr("type", "button")
			.on("click", () => this.note());
	}

	/* IMPROVE, pressed: the row becomes a one-line field in place — the same
	   move browse's `note()` makes, so a reader who has used one control
	   already knows the other. */
	note(){
		let $field;

		this.$acts.empty(() => {
			$field = input.c("ask-verdict-note").attr("type", "text")
				.attr("placeholder", "What has to change? One line.")
				.on("keydown", e => { if (e.key === "Enter") this.press("improve", $field.el.value.trim()); });

			button.c("ask-verdict-btn", "Save").attr("type", "button")
				.on("click", () => this.press("improve", $field.el.value.trim()));

			button.c("ask-verdict-btn ghost", "cancel").attr("type", "button")
				.on("click", () => this.$acts.empty(() => this.draw_acts()));
		});

		$field.el.focus();
	}

	/* A press. `$acts` is captured on first build (`acts()` -> `div.c(...)`
	   hands the box to `live()`, which stores it as `box.$box` — but `note()`
	   and `press()` also need it by name, so `draw_acts()`'s own captor is not
	   enough; `this.$acts` is set once, in `acts()`, before `live()` ever
	   calls `draw_acts()`. */
	press(say, text){
		this.$acts.empty(() => { span.c("ask-verdict-said muted", "saving…"); });

		verdicts.say(this.url, say, text).then(() => {
			// `m` is only ever passed for a page that owns a task log — see
			// `verdict_acts()`'s doc comment above.
			if (say === "improve" && text && this.m) this.thread(text);
		}).catch(error => {
			this.$acts.empty(() => {
				span.c("ask-verdict-said", "That did not save: " + error.message);
				button.c("ask-verdict-btn", "Try again").on("click", () => this.press(say, text));
			});
		});
	}

	/* "MAY open the reply box with the page as the item, so the note reaches
	   Claude the same way a reply does." Only reachable when the caller
	   handed `verdict_acts()` a task manifest — `reply()` files a `chat` line
	   into `m.url`, and a page with no task has nowhere for that line to go. */
	thread(text){
		this.$acts.el.after(reply({ m: this.m,
			about: this.about ?? { kind: "page", id: this.url, summary: "the page's own verdict" } }).el);
	}
}

export default verdict_mark;
