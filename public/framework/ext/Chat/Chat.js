import { View, div, p, span, button } from "/app.js";
import { md_into } from "./md.js";
import { who_label, WHO } from "./roles.js";

View.stylesheet(import.meta, "Chat.css");

/**
 * A CHAT LOG: a scrolling column of message bubbles — yours on the right,
 * everyone else's on the left, updates as one quiet line.
 *
 *     const talk = chat({ source: () => entries, keep: e => true, answer: choice => send(choice) });
 *     talk.view;      // the scrolling box
 *     talk.sync();    // draw whatever is new since the last call
 *
 * APPEND, NEVER REWRITE. A line is drawn once and never moves: `seen` is every
 * entry already on screen, so `sync()` can be called as often as anything
 * changes. `source()` is the entries to show, asked fresh each time; `keep(e)`
 * says which of them belong here. `answer(choice)` is called when a button on a
 * question is clicked — how the answer is sent is the caller's business.
 *
 * SMART SCROLL: at the bottom, the box stays locked to the bottom as lines arrive;
 * scroll up and it freezes; scroll back to the bottom and it locks again.
 */
/* ONE BUBBLE PER RUN (the owner, 2026-09-25). A message from the SAME sender as the
   bubble at the end of the box, with nobody else in between and less than
   MERGE_GAP_MS since that bubble's last message, adds a paragraph to it instead of
   opening a new bubble. A longer gap opens a new one, even for the same sender.
   Drawing only: the card's log keeps every message separate, nothing is rewritten.
   The sender and the time of the last message are stamped on the bubble
   (`data-sender`, `data-at`), so a re-drawn log merges the same way; an update, a
   question or a headed reply carries no sender and so ends the run.
   `mergeable()` is the whole rule, in one place. */
export const MERGE_GAP_MS = 10000;

export function mergeable($box, sender, at){
	const last = $box.el.lastElementChild;
	if (!sender || last?.dataset.sender !== sender) return null;
	return at - Number(last.dataset.at) < MERGE_GAP_MS ? last : null;
}

/* REFINED (the owner, 2026-09-25): a merged bubble keeps its raw pieces
   (`{ id, text, at }`) in `bubbles`. A `{ type: "refined", of: [ids], sections:
   [{ text, from: [ids] }] }` line, drawn by `refine()`, replaces the raw
   paragraphs of the bubble holding those ids with its sections (markdown). A
   section with a `from` opens IN PLACE, on click, to the raw pieces it cites; a
   click on the bubble opens all of its raw pieces, in time order. With no refined
   line the raw paragraphs show, as before. `fill()` is the one place a bubble is
   drawn from its state. */
const bubbles = new WeakMap();

const el = (cls, tag = "div") => Object.assign(document.createElement(tag), { className: cls });
const para = (cls, text) => md_into(el(cls + " md"), text);

function raw_list(cls, pieces){
	const box = el(cls);
	pieces.forEach(pc => box.append(para("chatbox-text chatbox-raw", pc.text)));
	return box;
}

/* THE VIA MARK — a small " · 🎤" (said) or " · ⌨" (typed), for a universal chat
   line (below) that carries `via`. It goes on the SENDER LABEL, once per
   bubble ("You · 🎤"), not on every piece's own text: a piece-level mark sat on
   its own row above the words, adding a whole extra line per message inside a
   merged bubble (the task mastermind, 2026-09-29, judging this task's own
   proof shots). `label_via()` is called once, when a bubble's label is built;
   `piece_node()` (below) no longer touches `via` at all. */
function via_text(via){ return via === "voice" ? "🎤" : "⌨"; }
function label_via($label, via){
	if ($label && via) $label.append(" · " + via_text(via));
	return $label;
}

/* A PLACE CARD — `place: {module, id, ...}` swaps a piece's text for that
   `ux/Content` module's own card, the exact contract `page.jsonl`'s own
   "place" lines already use: `new Module({ id, ...rest })`. `capture: false`
   stops it self-attaching to whatever the page's OWN captor happens to be —
   the import resolves later, asynchronously, so that captor is long gone
   (`code` skill's own "no DOM after an await") — this appends it to the
   bubble EXPLICITLY once it is built instead. A module that fails to load (a
   bad url, a missing file) says so in the card's own place, not silently. */
function place_card(place){
	const { module, ...rest } = place ?? {};
	const box = el("chatbox-text chatbox-place");
	if (!module){ box.textContent = "(no module named)"; return box; }
	import(module).then(mod => {
		const view = new mod.default({ ...rest, capture: false });
		box.append(view.el);
	}).catch(err => {
		box.textContent = "(could not load " + module + ")";
		console.error("chat: place card failed to load", module, err);
	});
	return box;
}

/** One piece of a bubble's own text — a `place` card if it has one, else its
 *  markdown. The via mark (if the piece carries one) is on the bubble's own
 *  sender label instead — see `label_via()` above. */
function piece_node(pc){
	if (pc.place) return place_card(pc.place);
	return para("chatbox-text", pc.text);
}

function fill(b){
	const st = bubbles.get(b), r = st.refined;
	b.querySelectorAll(":scope > .chatbox-text, :scope > .chatbox-sec, :scope > .chatbox-pieces").forEach(n => n.remove());
	if (!r){ st.pieces.forEach(pc => b.append(piece_node(pc))); return; }
	const byid = new Map(st.pieces.map(pc => [pc.id, pc]));
	r.sections.forEach(sec => {
		const s = el("chatbox-sec"), cited = (sec.from ?? []).map(id => byid.get(id)).filter(Boolean);
		s.append(para("chatbox-text", sec.text));
		if (cited.length){
			const from = raw_list("chatbox-from", cited);
			from.hidden = true;
			s.classList.add("chatbox-sec-open-able");
			s.append(from);
			s.addEventListener("click", e => { if (e.target.closest("a")) return; e.stopPropagation(); from.hidden = !from.hidden; s.classList.toggle("open", !from.hidden); });
		}
		b.append(s);
	});
	const of = new Set(r.of ?? []);
	st.pieces.filter(pc => !of.has(pc.id)).forEach(pc => b.append(para("chatbox-text", pc.text)));
	const all = raw_list("chatbox-pieces", st.pieces);
	all.hidden = true;
	b.append(all);
	b.classList.add("chatbox-refined");
	if (!st.click){
		st.click = true;
		b.addEventListener("click", () => { const now = bubbles.get(b).open = !bubbles.get(b).open; b.querySelector(":scope > .chatbox-pieces").hidden = !now; b.classList.toggle("open", now); });
	}
}

/** Draw one message: a new bubble, or a paragraph on the bubble it merges into. */
export function speak($box, { cls, who, text, sender, at, id }){
	at = Date.parse(at ?? 0) || Date.now();
	const last = mergeable($box, sender, at), piece = { id, text, at };
	if (last){
		bubbles.get(last).pieces.push(piece);
		last.dataset.at = at;
		fill(last);
		return;
	}
	$box.append(() => {
		p.c("chatbox " + cls, $b => {
			if (sender){ $b.el.dataset.sender = sender; $b.el.dataset.at = at; }
			if (who && who !== "task") who_label(who);
			bubbles.set($b.el, { pieces: [piece], refined: null });
			fill($b.el);
		});
	});
}

/** A refined line: the latest one whose `of` ids are in a bubble replaces its raw paragraphs. */
export function refine($box, e){
	const of = e.of ?? [], at = Date.parse(e.at ?? 0) || 0;
	for (const b of $box.el.children){
		const st = bubbles.get(b);
		if (!st || !st.pieces.some(pc => of.includes(pc.id))) continue;
		if (st.refined && st.at > at) return;
		st.refined = e; st.at = at;
		fill(b);
		return;
	}
}

/* A universal chat line (below) has no `type`/`id` of its own to key on — every
   one would collide on the same key without this, and a `fix` line (which MUST
   still be drawn, to replace the original) would be silently dropped as a
   duplicate. `at` plus whether this line is a `fix` is enough: two ordinary
   lines never legitimately share an `at`, and a fix always differs from its
   original by that one flag. */
const key = e => e.chat
	// A fix line's key includes its TEXT: latest wins, so a later fix reading
	// different words for the same `at` is never dropped as a duplicate of an
	// earlier placeholder ("waiting for the page's assistant…" then the real
	// reply, both `fix: true` on the same `at` — audio-review, 2026-09-29).
	? "chat|" + e.chat.at + "|" + (e.chat.fix ? "fix|" + e.chat.text : "line") + "|" + (e.chat.session ?? "")
	: (e.type === "prompt" && e.id ? "prompt|" + e.id : [e.type, e.id, e.at, e.ref, e.text].join("|"));

export function chat({ source, keep = () => true, answer = () => {} } = {}){
	let $script;
	const seen = new Set();

	const view = div.c("chatbox-log", $s => {
		$script = $s;
	});

	/* SMART SCROLL: `locked` is true while the reader sits at the bottom. Scroll UP
	   and it goes false (new lines then leave the view alone); reach the bottom again
	   and it goes true.
	   ⚠ Only a move UP unlocks (layout-unify, 2026-09-24). Reading `at_bottom()` on
	     every scroll event lost the lock on a card's first load: the event for our own
	     jump to the bottom arrives a frame later, after the next batch of lines has
	     already made the box taller, so "not at the bottom" read as "the reader
	     scrolled away" and every card opened on its OLDEST lines. Our own jumps only
	     ever move down, so a smaller scrollTop than last time is the reader's.
	   ⚠ The ResizeObserver re-pins the bottom when the BOX changes size — its first
	     layout (0px tall until the page is on screen), or the composer under it
	     growing — which fires no scroll event at all. */
	let locked = true, last = 0;
	const at_bottom = () => { const el = $script.el; return el.scrollHeight - el.scrollTop - el.clientHeight < 4; };
	$script.el.addEventListener("scroll", () => {
		const top = $script.el.scrollTop;
		if (at_bottom()) locked = true;
		else if (top < last) locked = false;
		last = top;
	}, { passive: true });
	const down = () => { if (!locked) return; const el = $script.el; el.scrollTop = el.scrollHeight; last = el.scrollTop; };
	if (typeof ResizeObserver === "function") new ResizeObserver(down).observe($script.el);
	// The second try is for a box not on the page yet (its height is 0 until then).
	// ONE pin per batch, not one per line: `down` forces a layout, and the Live card (hundreds of
	// lines) paid that once per line - 5.7 s. The microtask runs after the synchronous batch.
	let pinning = false;
	const follow = fn => { fn(); if (pinning) return; pinning = true; queueMicrotask(() => { pinning = false; down(); }); requestAnimationFrame(down); };

	function add(cls, who, text, sender, at, id){
		if (!text) return;
		follow(() => speak($script, { cls, who, text, sender, at, id }));
	}

	/* A REPLY'S HEADING (the owner, 2026-09-24): a `heading` field, or a first line
	   written `# Heading`, shows as a short bold title above the body. */
	function reply(e){
		let head = e.heading, body = e.text ?? "";
		const nl = body.search(/[\r\n]/), first = (nl < 0 ? body : body.slice(0, nl)).trim();
		if (!head && first.startsWith("#")){ head = first.replace(/^#+\s*/, ""); body = nl < 0 ? "" : body.slice(nl + 1).trim(); }
		if (!head) return follow(() => speak($script, { cls: "chatbox-reply", who: e.by, text: body, sender: e.by, at: e.at, id: e.id }));
		follow(() => $script.append(() => {
			p.c("chatbox chatbox-reply", () => {
				who_label(e.by);
				span.c("chatbox-head", $t => { md_into($t.el, head, true); });
				if (body) div.c("chatbox-text md", $t => { md_into($t.el, body); });
			});
		}));
	}

	/* A QUESTION FOR YOU: `{type: "ask", text, choices: ["Yes", "No"]}` (or a `prompt`
	   line that carries `choices`). A click calls `answer(choice)`; the buttons then
	   show which was picked. Your later message matching a choice also settles it,
	   so a reload shows it answered. */
	const asks = [];
	function ask(e){
		const choices = e.choices?.length ? e.choices : ["Yes", "No"];
		follow(() => $script.append(() => {
			p.c("chatbox chatbox-reply chatbox-ask", $q => {
				who_label(e.by);
				span.c("chatbox-head", $t => { md_into($t.el, e.heading ?? "Question", true); });
				div.c("chatbox-text md", $t => { md_into($t.el, e.text ?? ""); });
				div.c("chatbox-choices", () => {
					choices.forEach(c => button.c("chatbox-choice").attr("type", "button").text(c).click(() => {
						if ($q.el.classList.contains("answered")) return;
						settle(entry, c);
						answer(c);
					}));
				});
				const entry = { $q, choices, at: Date.parse(e.at ?? 0) || 0 };
				asks.push(entry);
			});
		}));
	}
	function settle(entry, choice){
		entry.$q.el.classList.add("answered");
		entry.$q.el.querySelectorAll(".chatbox-choice").forEach(b => {
			b.disabled = true;
			if (b.textContent === choice) b.classList.add("picked");
		});
		asks.splice(asks.indexOf(entry), 1);
	}
	function answered(e){
		const t = Date.parse(e.at ?? 0) || 0;
		const hit = asks.find(a => a.at <= t && a.choices.includes(e.text));
		if (hit) settle(hit, e.text);
	}

	/* THE UNIVERSAL CHAT LINE (voice-sessions/design.md, 2026-09-29):
	   `{"chat": {at, session, path, from: {kind, id}, via, text, re}}`, the one
	   shape every surface — voice, typed, an agent's own reply — logs a turn
	   as. Mapped onto this file's own bubbles rather than the old `{type, by,
	   text}` dispatch below, so THAT shape (what AI 2 and the drawer still log)
	   is completely untouched: `from.kind === "owner"` is your bubble (right
	   side); anything else is a reply (left side), labelled by `from.id`
	   (`who_label()` already reads ids like `assistant-fast`) or, missing that,
	   by `from.kind`.
	   A FIX (`fix: true`) is a later line with the SAME `at` as an earlier one
	   — "here is what was actually meant" — and replaces that piece's words in
	   place instead of adding a second bubble; `fix_index` remembers which
	   bubble and piece each `at` landed in, per this `chat()` instance. */
	const fix_index = new Map();   // chat.at (string) -> { bubble, piece }

	function chat_line(c){
		const cls = (c.from?.kind ?? "") === "owner" ? "chatbox-you" : "chatbox-reply";
		const who = c.from?.id || c.from?.kind || "";
		const at = Date.parse(c.at ?? 0) || Date.now();

		if (c.fix){
			const hit = fix_index.get(c.at);
			if (hit){
				Object.assign(hit.piece, { text: c.text, via: c.via, place: c.place });
				return follow(() => fill(hit.bubble));
			}
			// No original found (a page opened mid-conversation, or logs out of
			// order) — the correction is still the newest truth, so show it as
			// its own line rather than dropping it.
		}

		follow(() => {
			const last = mergeable($script, who, at);
			const piece = { id: c.at, text: c.text, at, via: c.via, place: c.place };
			if (last){
				bubbles.get(last).pieces.push(piece);
				last.dataset.at = at;
				fill(last);
				fix_index.set(c.at, { bubble: last, piece });
				return;
			}
			$script.append(() => {
				p.c("chatbox " + cls, $b => {
					$b.el.dataset.sender = who; $b.el.dataset.at = at;
					if (who) label_via(who_label(who), c.via);
					bubbles.set($b.el, { pieces: [piece], refined: null });
					fill($b.el);
					fix_index.set(c.at, { bubble: $b.el, piece });
				});
			});
		});
	}

	function draw(e){
		if (e.chat) return chat_line(e.chat);
		if (e.type === "ask" || (e.type === "prompt" && e.choices?.length)) return ask(e);
		if (e.type === "prompt") answered(e);
		if (e.type === "refined") return refine($script, e);
		if (e.type === "reply") return reply(e);
		if (e.type === "prompt") return add("chatbox-you", "owner", (e.sentences ?? [e.text]).filter(Boolean).join(" "), "owner", e.at, e.id);
		if (e.type === "update") return add("chatbox-update", "", e.text);
		if (e.type === "task") return add("chatbox-update", "task", `${e.title ?? e.id}: ${e.state}${e.now ? " — " + e.now : ""}`);
		if (e.type === "clear") return add("chatbox-update", "", `${WHO[e.by] ?? e.by ?? "someone"} cleared ${e.ref}`);
	}

	return {
		view,
		/** Is the box following new lines right now? */
		locked: () => locked,
		/** Kept so callers still work: your words are drawn once, when they are logged, never twice. */
		echo(){},
		sync(){
			const fresh = source().filter(e => {
				const k = key(e);
				if (seen.has(k)) return false;
				seen.add(k);
				return keep(e);
			});
			fresh.sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).forEach(draw);
		},
	};
}

export { md_into, who_label };
export { role_key } from "./roles.js";
export default chat;
