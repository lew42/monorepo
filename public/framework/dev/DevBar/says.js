import { div, span, a, button } from "../../core/View/View.js";
import { Timeline, LOG_URL, clock, text_lines, author_of, author_label, author_kind, status_word } from "../../ai/v/3/timeline.js";
import { section } from "./parts.js";

/* THE MASTERMIND LOG — you, the assistant, the mastermind and every minion,
 * live, one joint timeline (`../../ai/v/3/timeline.js`), read two ways: this
 * is the dev bar's own reading of it; `ai/v/3/page.js` is the roomy one, same
 * file, same model.
 *
 * The owner's direction, across five passes on 2026-09-19 — read in order,
 * each one still true, the later ones correcting or extending the earlier:
 *
 *   1. "a chat log style... a card that I can scroll through, and if I click
 *      on one it expands and takes over the whole dev bar."
 *   2. Cards EVOLVE: a later `card` line with the same `id` updates that card
 *      WHERE IT SITS (title, status, text — a brief highlight, an "updated
 *      H:MM" stamp) instead of a duplicate lower down; a new id still appends
 *      at the bottom. Renamed from "the mastermind says".
 *   3. Three (then more) AUTHORS in one stream: the owner's own words
 *      (`author: "owner"`), the assistant's, the mastermind's, and — as of
 *      pass 5 — a MINION's own task slug. A small label on every card.
 *   4. ONE JOINT TIMELINE: this view and the V3 page read the same model
 *      (`timeline.js`) so they can never disagree, oldest to newest, with
 *      `needs-you` cards pinned in a strip above the stream AND accented
 *      where they sit in it — "anything that needs the owner's yes... make
 *      those unmistakable."
 *   5. "the chat log... seems to have a max height or truncates long text" —
 *      FIXED: the log is now the section that FILLS the page tab (every
 *      other page-tab section sits below it, reachable by scrolling `.dev-
 *      body` — `doc/decisions.md` has the alternatives this was weighed
 *      against), and a card shows its real text INLINE in the stream, up to
 *      ~6 lines, clamping beyond that; the owner's own prompts are NEVER
 *      clamped. Also: `board.jsonl` grew a SECOND line kind, `chunk` — text
 *      streamed onto a card that is still being typed out, appended as bare
 *      text nodes (never a re-render) so nothing being read moves; a caret
 *      marks the live edge, and the card settles back to its normal size
 *      once the real `card` line lands or ~3s pass with no new chunk.
 *
 * The two guarantees every pass has kept: nothing the owner is READING
 * changes under them (an update to the OPEN card offers "updated — show"
 * rather than swapping silently; a streaming card grows by appending text
 * nodes, never by rebuilding itself), and the list never jumps while scrolled
 * up (true structurally for an in-place update, and for streaming; true for a
 * new card by only auto-scrolling when the list was already at the bottom).
 */

// How long a card can grow a new text node without a fresh chunk before it
// is treated as finished and settles back to its normal (possibly clamped)
// size — the owner's own words: "collapsing back... once no chunk has
// arrived for ~3s or a same-id card line with a status lands".
const STREAM_IDLE_MS = 3000;

export default function says() {
	if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

	section("the mastermind log", () => {
		// ⚠ No DOM after an await: every box is captured now and filled by callbacks.
		const $pinned = div.c("dev-says-pinned flex v");
		$pinned.el.hidden = true;
		const $list = div.c("dev-says flex v");
		const $new = a.c("dev-says-new", "new message ↓").click(() => bottom());
		const $reader = reader_shell();
		$new.el.hidden = true;
		$reader.$box.el.hidden = true;

		// `ai/2026-09-19/assistant-stream/`'s own composer — talk to the
		// assistant right here, and the reply types itself out above, in this
		// same log (and in the V3 Now view, which mounts the identical box).
		// ⚠ LAZY, deliberately: `says.js` loads on EVERY page through the dev
		// bar, so a static top-level import of V3-only code here would make
		// one bad path in `compose.js` blank the WHOLE SITE, not just V3
		// (measured, 2026-09-19: it did, for about 80 seconds). A dynamic
		// `import()` behind a `try` means a fault in the composer loses only
		// the composer, never the rest of the rail. The host box is captured
		// NOW, synchronously, and filled once the import resolves — the
		// "no DOM after an await" rule above, obeyed for real this time.
		const $compose_host = div.c("dev-says-compose-host");
		import("/framework/ai/v/3/compose.js")
			.then(m => $compose_host.append(() => m.default()))
			.catch(e => console.warn("says(): the composer failed to load —", e));

		const $sect = $list.el.closest(".dev-sect");
		// The log FILLS the page tab (pass 5) — this section grows to take all the
		// height `.dev-body` has; every other page-tab section moves below the fold.
		$sect?.classList.add("dev-says-section");

		const log = new Timeline({ url: LOG_URL });   // ai/board.jsonl — outside every version dir; timeline.js resolves the real path once

		// One entry per card id, so an update PATCHES the same DOM node — never a
		// rebuild, which is the mechanism the "nothing disappears" guarantee rests
		// on. A card that needs the owner's yes gets a SECOND entry, in the pinned
		// strip — same id, same underlying card, two rendered rows kept in step.
		const entries = new Map();
		const pins = new Map();
		let open_id = null;    // the id currently filling the reader, or null
		let chunks_seen = 0;

		const at_bottom = () => $list.el.scrollHeight - $list.el.scrollTop - $list.el.clientHeight < 24;
		const bottom = () => { $list.el.scrollTop = $list.el.scrollHeight; $new.el.hidden = true; };

		function open(c) {
			open_id = c.id ?? null;
			$reader.fill(c);
			$reader.$box.el.hidden = false;
			$sect?.parentElement?.classList.add("dev-says-reading");
			$sect?.classList.add("dev-says-host");
		}
		function close() {
			$reader.$box.el.hidden = true;
			open_id = null;
			$sect?.parentElement?.classList.remove("dev-says-reading");
		}
		$reader.on_back(close);
		// The owner's own "show me the new version" — only THIS ever replaces what
		// an open reader is showing; an update arriving in the background never does.
		$reader.on_show_latest(() => { const c = open_id != null && entries.get(open_id)?.c; if (c) open(c); });

		/* A card's own text, straight in the stream — up to ~6 lines (CSS
		   `line-clamp`), the owner's own words never clamped (`fill_body`'s
		   caller decides the class). `title` (if any) is its own line above. */
		const body_text = c => String(c.text ?? (c.title || c.say ? "" : "")).trim();

		/* One row — the pinned strip's rows and the main stream's rows are built
		   by the SAME function, so "needs you" never reads as a different kind of
		   thing in one place than the other. `pinned` drops the time and the
		   inline body (the strip is a glance, not a read); the owner's own cards
		   never get a status dot or a title line — the text IS the message. */
		/* ⚠ The META ROW (time · dot · author) is its OWN line, ABOVE the text —
		   not beside it. Beside it, the text's own left edge started wherever
		   the time/dot happened to end, which differs per card (an owner card
		   has no dot; a pinned row has no time) — measured, five cards, five
		   different x positions for the first letter of the text. On its own
		   line, the text always starts at the card's own left padding edge,
		   every card, identical x. */
		function compact(c, pinned) {
			let $title, $dot, $time, $body;
			const author = author_of(c);
			const mine = author === "owner";
			const $card = button.c(`dev-says-card dev-says-card-${author_kind(author)}`
				+ (c.status === "needs-you" ? " dev-says-needs-you" : ""))
				.click(() => open((pinned ? pins : entries).get(c.id ?? c)?.c ?? c))
				.append(() => {
					div.c("dev-says-card-meta flex v-center", () => {
						if (!mine) $dot = span.c("dev-says-dot");
						span.c("dev-says-card-author muted", author_label(author));
						if (!pinned) $time = span.c("dev-val", clock(c.at));
					});
					if (!mine && (c.title || c.say)) $title = div.c("dev-says-card-title", c.title ?? c.say ?? "");
					// ⚠ NEVER clamped — the owner's rule, stronger than the ~6-line one
					// it replaced: "chat messages in the dev bar log must never be
					// truncated; show full text... no clamp, no 'more', no title-only
					// cards." One class, no modifier, full text, every author alike.
					if (!pinned) $body = div.c("dev-says-card-body", body_text(c));
				});
			if ($dot) paint_dot($dot, c.status);
			return { $card, $title, $dot, $time, $body, c, author, stream_timer: null, $caret: null };
		}

		function paint_dot($dot, status) {
			$dot.el.className = "dev-says-dot" + (status ? " dev-says-dot-" + status : "");
			$dot.attr("title", status ? status_word(status) : "");
		}

		function flash($el) {
			$el.ac("dev-says-flash");
			setTimeout(() => $el.rc("dev-says-flash"), 1000);
		}

		function add(c) {
			const entry = compact(c, false);
			entries.set(c.id ?? c, entry);
			$list.append(entry.$card);
			sync_pin(c);
			return entry;
		}

		/* A card CHANGED — a real `card` line, not a chunk. Almost always a patch
		   in place; the one exception is a card that started as a bare, title-less
		   placeholder from a chunk with nobody home yet (`chunk_in` below) and is
		   only now getting its first real title — that one row is rebuilt once,
		   which is a settling event, not something the owner was mid-read on. */
		function update(entry, c) {
			const author = author_of(c);
			if (!entry.$title && (c.title || c.say) && author !== "owner") {
				const fresh = compact(c, false);
				entry.$card.el.replaceWith(fresh.$card.el);
				Object.assign(entry, fresh);
				entries.set(c.id ?? c, entry);
			} else {
				entry.c = c;
				entry.$title?.text(c.title ?? c.say ?? "");
				entry.$body?.text(body_text(c));
				entry.$time?.text(clock(c.at) + (c.updated_at ? " · upd " + clock(c.updated_at) : ""));
				if (entry.$dot) paint_dot(entry.$dot, c.status);
			}
			entry.$card.el.classList.toggle("dev-says-needs-you", c.status === "needs-you");
			flash(entry.$card);
			stop_stream(entry);     // a real card line finalises it — streaming, if any, is over
			sync_pin(c);

			// The card the owner has open right now, changed underneath them — say
			// so, but do NOT touch what is on screen; `on_show_latest` is the only
			// path that does.
			if (c.id != null && c.id === open_id) $reader.mark_stale();
		}

		/* The pinned strip mirrors whichever cards currently need the owner's yes
		   — added when a card BECOMES needs-you, removed the moment it stops
		   being one (the mastermind marks it `done`), so the strip is only ever
		   what is actually waiting on the owner right now. */
		function sync_pin(c) {
			const key = c.id ?? c;
			const still = c.status === "needs-you";
			const had = pins.get(key);
			if (still && !had) { const entry = compact(c, true); pins.set(key, entry); $pinned.append(entry.$card); }
			else if (still && had) { had.c = c; had.$title?.text(c.title ?? c.say ?? ""); flash(had.$card); }
			else if (!still && had) { had.$card.el.remove(); pins.delete(key); }
			$pinned.el.hidden = !pins.size;
		}

		/* ── streaming: a chunk grows a card's body IN PLACE, text nodes only ─── */

		function start_stream(entry) {
			entry.$card.el.classList.add("dev-says-streaming");
			entry.$body?.el.classList.add("dev-says-card-body-full");   // no clamp while live
			if (!entry.$caret) { entry.$caret = span.c("dev-says-caret", "▍"); entry.$body?.append(entry.$caret); }
		}

		function stop_stream(entry) {
			if (entry.stream_timer) clearTimeout(entry.stream_timer);
			entry.stream_timer = null;
			entry.$card.el.classList.remove("dev-says-streaming");
			entry.$caret?.el.remove();
			entry.$caret = null;
			if (entry.author !== "owner") entry.$body?.el.classList.remove("dev-says-card-body-full");
		}

		/* One chunk in: an id already on screen grows a text node before its
		   caret; an id nobody has posted a `card` for yet gets a BARE row first
		   (title-less — `update()` above upgrades it once the real card line
		   lands) so a chunk for an unknown id never loses text. */
		function chunk_in(chunk) {
			let entry = entries.get(chunk.id);
			if (!entry) entry = add({ id: chunk.id, at: chunk.at });
			if (!entry.$body) return;

			const was_bottom = at_bottom();
			start_stream(entry);
			entry.$body.el.insertBefore(document.createTextNode(chunk.text), entry.$caret.el);
			entry.stream_timer && clearTimeout(entry.stream_timer);
			entry.stream_timer = setTimeout(() => stop_stream(entry), STREAM_IDLE_MS);
			if (was_bottom) bottom();
		}

		const draw = () => {
			if (log.cards.length < entries.size) {
				$list.empty(() => { }); entries.clear();
				$pinned.empty(() => { }); pins.clear(); $pinned.el.hidden = true;
				chunks_seen = 0;
				close();
			}   // the file was reset

			const follow = !entries.size || at_bottom();
			let appended = false;

			log.cards.forEach(c => {
				const key = c.id ?? c;
				const known = entries.get(key);
				if (known) { if (known.c !== c) update(known, c); }
				else { add(c); appended = true; }
			});

			if (log.chunks.length > chunks_seen) {
				log.chunks.slice(chunks_seen).forEach(chunk_in);
				chunks_seen = log.chunks.length;
			}

			if (appended) { if (follow) bottom(); else $new.el.hidden = false; }
		};

		$list.el.addEventListener("scroll", () => { if (at_bottom()) $new.el.hidden = true; });
		log.live(draw).then(draw);
	});
}

/**
 * The reader's own shell, built ONCE — a stable back button and a stale-update
 * banner that `fill()` never rebuilds, so `mark_stale()` can show the banner
 * over whatever is already there without touching the reader's content at all.
 */
function reader_shell() {
	let $body, $stale;

	const $box = div.c("dev-says-reader flex v", () => {
		div.c("dev-says-reader-head flex v-center", () => {
			button.c("dev-says-back").append(() => { span("‹"); span("back"); });
		});
		$stale = div.c("dev-says-stale flex v-center gap");
		$stale.el.hidden = true;
		$body = div.c("dev-says-body flex v");
	});

	const $back = $box.el.querySelector(".dev-says-back");

	function fill(c) {
		$stale.el.hidden = true;
		const author = author_of(c);
		$body.empty(() => {
			div.c("dev-says-reader-author muted", author_label(author));
			if (author !== "owner") {
				if (c.status) span.c("dev-says-status dev-says-status-" + c.status, status_word(c.status));
				div.c("dev-says-title", c.title ?? c.say ?? "");
				if (c.say && c.title) div.c("dev-says-text", c.say);
			}
			text_lines(c).forEach(line => div.c("dev-says-text" + (author === "owner" ? " dev-says-text-mine" : ""), line));
			span.c("dev-val", clock(c.at) + (c.updated_at ? " · updated " + clock(c.updated_at) : ""));
			(c.links ?? []).forEach(l => a.c("dev-says-link", l.label ?? l.url).href(l.url));
		});
	}

	return {
		$box,
		fill,
		on_back(fn) { $back.addEventListener("click", fn); },
		mark_stale() { $stale.el.hidden = false; },
		on_show_latest(fn) {
			$stale.empty(() => {
				span("this card changed while you were reading it.");
				button.c("dev-says-show").text("updated — show").click(() => { $stale.el.hidden = true; fn(); });
			});
		},
	};
}
