import { div, span, a, button } from "../../core/View/View.js";
import { Timeline, LOG_URL, clock, text_lines, author_of, author_label, author_kind, status_word } from "../../ai/v/3/timeline.js";
import { section } from "./parts.js";

// The mastermind log design, timeline and evolution: doc/says-notes.md

// Time before a streaming card settles: doc/says-notes.md
const STREAM_IDLE_MS = 3000;

export default function says() {
	if (!/^(([a-z0-9-]+\.)*localhost|127\.0\.0\.1)$/.test(location.hostname)) return;   // `monorepo.localhost` too (2026-09-23)

	section("the mastermind log", () => {
		// ⚠ No DOM after an await: every box is captured now and filled by callbacks.
		const $pinned = div.c("dev-says-pinned flex v");
		$pinned.el.hidden = true;
		const $list = div.c("dev-says flex v");
		const $new = a.c("dev-says-new", "new message ↓").click(() => bottom());
		const $reader = reader_shell();
		$new.el.hidden = true;
		$reader.$box.el.hidden = true;

		// ⚠ Lazy-load composer to prevent SITE-wide outage on V3 error: doc/says-notes.md
		const $compose_host = div.c("dev-says-compose-host");
		import("/framework/ai/v/3/compose.js")
			.then(m => $compose_host.append(() => m.default()))
			.catch(e => console.warn("says(): the composer failed to load —", e));

		const $sect = $list.el.closest(".dev-sect");
		// The log FILLS the page tab (pass 5) — this section grows to take all the
		// height `.dev-body` has; every other page-tab section moves below the fold.
		$sect?.classList.add("dev-says-section");

		const log = new Timeline({ url: LOG_URL });

		// Entry map patches in place (never rebuilds): doc/says-notes.md
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
		// Only show_latest replaces what an open reader is showing: doc/says-notes.md
		$reader.on_show_latest(() => { const c = open_id != null && entries.get(open_id)?.c; if (c) open(c); });

		// Card text display: clamped ~6 lines, owner text never clamped: doc/says-notes.md
		const body_text = c => String(c.text ?? (c.title || c.say ? "" : "")).trim();

		// compact() builds pinned and stream rows identically; meta row alignment: doc/says-notes.md
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

		// Card update: patch in place or rebuild on title arrival: doc/says-notes.md
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
			stop_stream(entry);
			sync_pin(c);
			// Alert open reader if card changed; only show_latest replaces screen content
			if (c.id != null && c.id === open_id) $reader.mark_stale();
		}

		// Pinned strip mirrors needs-you cards: doc/says-notes.md
		function sync_pin(c) {
			const key = c.id ?? c;
			const still = c.status === "needs-you";
			const had = pins.get(key);
			if (still && !had) { const entry = compact(c, true); pins.set(key, entry); $pinned.append(entry.$card); }
			else if (still && had) { had.c = c; had.$title?.text(c.title ?? c.say ?? ""); flash(had.$card); }
			else if (!still && had) { had.$card.el.remove(); pins.delete(key); }
			$pinned.el.hidden = !pins.size;
		}

		// ── streaming: chunk grows card body IN PLACE, text nodes only ──
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

		// Chunk handling: bare rows for unknown ids: doc/says-notes.md
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

// Reader shell: stable rebuilding for stale banner: doc/says-notes.md
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
