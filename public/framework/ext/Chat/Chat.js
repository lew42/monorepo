import { View, div, p, span, button } from "/app.js";
import { md_into } from "./md.js";
import { who_label, WHO } from "./roles.js";

View.stylesheet(import.meta, "Chat.css");

// A chat log: scrolling message bubbles, yours right, others left. See doc/notes.md#chat-log
// see doc/notes.md#one-bubble-per-run
export const MERGE_GAP_MS = 10000;
export const GUESS_TITLE = "Gray words: the transcriber's guess, still changing. They turn black once it settles.";
export const LIVE_SENT_TITLE = "Faded: already sent, waiting for the cleaned-up line, which replaces this and turns black.";

export function mergeable($box, sender, at){
	const last = $box.el.lastElementChild;
	if (!sender || last?.dataset.sender !== sender) return null;
	return at - Number(last.dataset.at) < MERGE_GAP_MS ? last : null;
}

/** Put a drawn bubble before the first one with a later `at`, so a late line lands in time order (doc/notes.md#bubble-order). */
export function place(b){
	const t = Number(b.dataset.at);
	if (!b.dataset.at || !b.parentElement) return b;
	let at_end = null;   // scan from the end: the in-order case stops at once
	for (let s = b.parentElement.lastElementChild; s; s = s.previousElementSibling){
		if (s === b) continue;
		if (!s.dataset.at) continue;
		if (Number(s.dataset.at) <= t) break;
		at_end = s;
	}
	if (at_end && at_end.previousElementSibling !== b) at_end.before(b);
	return b;
}

// see doc/notes.md#refined-bubbles
const bubbles = new WeakMap();

const el = (cls, tag = "div") => Object.assign(document.createElement(tag), { className: cls });
const para = (cls, text) => md_into(el(cls + " md"), text);

function raw_list(cls, pieces){
	const box = el(cls);
	pieces.forEach(pc => box.append(para("chatbox-text chatbox-raw", pc.text)));
	return box;
}

// see doc/notes.md#via-mark
function via_text(via){ return via === "voice" || via === "whisper" ? "🎤" : "⌨"; }
function via_badge(via){
	const b = el("chatbox-via", "span");
	b.textContent = via_text(via);
	b.title = via_text(via) === "🎤" ? "said" : "typed";
	return b;
}

// see doc/notes.md#failed-send
function failed_badge(){
	const b = el("chatbox-failed muted", "span");
	b.textContent = "— not sent";
	return b;
}

/** "fast ✓ 2.6 s · smart …": when this owner line reached each assistant, counted from the words leaving the draft (a `{sent}` session line). */
export function sent_badge(pc){
	const b = el("chatbox-sent muted", "span");
	const secs = ms => (ms < 100 ? "0" : (ms / 1000).toFixed(1)) + " s";
	b.append(...["fast", "smart"].flatMap((seat, i) => {
		const got = pc.sent?.[seat], part = el("chatbox-sent-" + seat + (got ? " chatbox-sent-done" : ""), "span");
		part.textContent = seat + (got ? " ✓" + (got.delay_ms != null ? " " + secs(got.delay_ms) : "") : " …");
		part.title = got ? `Reached the ${seat} assistant${got.delay_ms != null ? ", " + secs(got.delay_ms) + " after the words left the draft" : ""}.` : `Not yet sent to the ${seat} assistant.`;
		return i ? [" · ", part] : [part];
	}));
	return b;
}

// see doc/notes.md#place-card
export function place_card(place){
	// on_chosen is ours: pulled off before rest reaches the module's constructor
	const { module, on_chosen, ...rest } = place ?? {};
	const box = el("chatbox-text chatbox-place");
	if (!module){ box.textContent = "(no module named)"; return box; }
	import(module).then(mod => {
		const view = new mod.default({ ...rest, capture: false });
			// wrap write(), the module's one seam for "an option got picked" (doc/notes.md#place-card)
		if (on_chosen){
			const original_write = view.write.bind(view);
			view.write = line => { on_chosen(line); return original_write(line); };
		}
		box.append(view.el);
	}).catch(err => {
		box.textContent = "(could not load " + module + ")";
		console.error("chat: place card failed to load", module, err);
	});
	return box;
}

/** Raw line muted above its revised text; a click toggles `.showraw`. See doc/notes.md#revision-pair */
function revision_pair_node(pc){
	const wrap = el("chatbox-text chatbox-revision-pair");
	wrap.dataset.level = pc.revision.level ?? "";
	wrap.append(
		para("chatbox-revision-raw muted", pc.text),
		para("chatbox-revision-revised", pc.revision.text),
	);
	wrap.title = "click to see the raw words";
	wrap.addEventListener("click", () => wrap.classList.toggle("showraw"));
	return wrap;
}

/** A ✓/? mark glued after the sentence's last word. See doc/notes.md#check-mark */
function mark_badge(m){
	const b = el("chatbox-mark " + (m.mark === "ok" ? "chatbox-mark-ok" : "chatbox-mark-unclear"), "span");
	b.title = m.purpose || (m.mark === "ok" ? "Reads as clear." : "This sentence might mean more than one thing.");
	b.textContent = m.mark === "ok" ? "✓" : "?";
	return b;
}

// the mark goes inside the last block (not after it) so it stays on the last line
function append_mark(node, m){
	const last = node.lastElementChild ?? node;
	last.append(" ", mark_badge(m));
}

function piece_node(pc){
	const node = piece_body(pc);
	if (pc.id != null) node.dataset.re = pc.id;
	return node;
}

function piece_body(pc){
	if (pc.place) return place_card(pc.place);
	if (pc.revision) return revision_pair_node(pc);
	const node = para("chatbox-text", pc.text);
	if (pc.mark) append_mark(node, pc.mark);
	if (pc.via) (node.lastElementChild ?? node).append(" ", via_badge(pc.via));
	if (pc.failed) (node.lastElementChild ?? node).append(" ", failed_badge());
	if (pc.track) (node.lastElementChild ?? node).append(" ", sent_badge(pc));
	return node;
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

// see doc/notes.md#reactions
export const REACTIONS = ["👍", "✅", "❤️", "😂", "❓", "👎"];
const reacts_of = new WeakMap();
const sender_of = from => String(from?.id || from?.kind || "someone");

/** Apply one reaction line to a bubble. False when it is older than what is already there. */
export function react_on(b, r){
	if (!b) return false;
	const all = reacts_of.get(b) ?? new Map();
	reacts_of.set(b, all);
	const re = String(r.re), who = sender_of(r.from), at = Date.parse(r.at ?? 0) || Date.now();
	const on = all.get(re) ?? new Map();
	all.set(re, on);
	const was = on.get(who);
	if (was && was.at > at) return false;
	on.set(who, { emoji: r.emoji || "", at });
	draw_reacts(b);
	return true;
}

/** What `who` has on message `re` right now ("" for nothing). */
export function reaction_of(b, re, who = "owner"){ return reacts_of.get(b)?.get(String(re))?.get(who)?.emoji ?? ""; }

function draw_reacts(b){
	b.querySelector(":scope > .chatbox-reacts")?.remove();
	const counts = new Map();
	for (const on of (reacts_of.get(b) ?? new Map()).values())
		for (const [who, r] of on) if (r.emoji) counts.set(r.emoji, [...(counts.get(r.emoji) ?? []), who]);
	b.classList.toggle("chatbox-has-reacts", counts.size > 0);
	if (!counts.size) return;
	const box = el("chatbox-reacts", "span");
	for (const [emoji, whos] of counts){
		const chip = el("chatbox-react" + (whos.includes("owner") ? " mine" : ""), "span");
		chip.textContent = emoji + (whos.length > 1 ? whos.length : "");
		chip.title = whos.map(w => (w === "owner" ? "you" : w) + " " + emoji).join(", ");
		box.append(chip);
	}
	b.append(box);
}

/** Draw one message: a new bubble, or a paragraph on the bubble it merges into. See doc/notes.md#speak */
export function speak($box, { cls, who, text, sender, at, id, onmount, via, mark, failed, track, join = true }){
	at = Date.parse(at ?? 0) || Date.now();
	// join: false never merges onto the last bubble (doc/notes.md#speak)
	const last = join ? mergeable($box, sender, at) : null, piece = { id, text, at, via, mark, failed, track };
	if (last){
		// in time order: a line that arrives late (the poll after the live wire) goes before the later ones, never at the end
		const pieces = bubbles.get(last).pieces, i = pieces.findIndex(pc => pc.at > at);
		i < 0 ? pieces.push(piece) : pieces.splice(i, 0, piece);
		last.dataset.at = Math.max(Number(last.dataset.at) || 0, at);
		fill(last);
		return last;
	}
	let made = null;
	$box.append(() => {
		p.c("chatbox " + cls, $b => {
			made = $b.el;
			if (sender){ $b.el.dataset.sender = sender; $b.el.dataset.at = at; }
			if (who && who !== "task") who_label(who);
			bubbles.set($b.el, { pieces: [piece], refined: null });
			fill($b.el);
			onmount?.($b.el);
		});
	});
	return made && place(made);
}

/** Change one piece's fields after speak() drew it and redraw its bubble; false if no such piece. See doc/notes.md#bare-speak-helpers */
export function patch_piece(bubble, id, patch){
	const st = bubble && bubbles.get(bubble);
	const pc = st?.pieces.find(pc => pc.id === id);
	if (!pc) return false;
	Object.assign(pc, patch);
	// in place: only this piece's node is swapped, so nothing else in the bubble is redrawn (ux/Dictate/doc/flicker.md)
	const node = !st.refined && bubble.querySelector(`:scope > [data-re="${CSS.escape(String(id))}"]`);
	if (node) node.replaceWith(piece_node(pc)); else fill(bubble);
	return true;
}

/** Rekey one piece's id in place, no redraw; false if absent. See doc/notes.md#bare-speak-helpers */
export function retag_piece(bubble, old_id, new_id){
	const st = bubble && bubbles.get(bubble);
	const pc = st?.pieces.find(pc => pc.id === old_id);
	if (!pc || old_id === new_id) return false;
	pc.id = new_id;   // never pc.at: it is the time the piece was drawn by, and the new id is another clock (doc/notes.md#bubble-order)
	return true;
}

/** Move `at_id` and every later piece into a new bubble right after; null if not splittable. See doc/notes.md#bare-speak-helpers */
export function split_bubble($box, bubble, at_id){
	const st = bubble && bubbles.get(bubble);
	if (!st) return null;
	const i = st.pieces.findIndex(pc => pc.id === at_id);
	if (i <= 0) return null;
	const moved = st.pieces.splice(i);
	fill(bubble);
	bubble.dataset.at = st.pieces[st.pieces.length - 1].at;
	const who = bubble.dataset.sender;
	let made = null;
	$box.append(() => {
		p.c(bubble.className, $b => {
			made = $b.el;
			if (who){ made.dataset.sender = who; made.dataset.at = moved[moved.length - 1].at; }
			if (who && who !== "task") who_label(who);
			bubbles.set(made, { pieces: moved, refined: null });
			fill(made);
		});
	});
	bubble.after(made);   // `$box.append()` only ever adds at the end — move it right after the original
	return made;
}

/** A refined line: the latest one whose `of` ids are in a bubble replaces its raw paragraphs. */
export function refine($box, e){
	const of = e.of ?? [], at = Date.parse(e.at ?? 0) || 0;
	for (const b of $box.el.children){
		const st = bubbles.get(b);
		// A headed reply is in the map only so it can be opened (card_of): never refined.
		if (!st || st.head || !st.pieces.some(pc => of.includes(pc.id))) continue;
		if (st.refined && st.at > at) return;
		st.refined = e; st.at = at;
		fill(b);
		return;
	}
}

// see doc/notes.md#dedupe-key
const key = e => e.react
	? "react|" + e.react.at + "|" + e.react.re + "|" + sender_of(e.react.from) + "|" + (e.react.emoji ?? "")
	: e.chat
		// a fix's key includes its text so a later fix is not dropped (doc/notes.md#dedupe-key)
	? "chat|" + e.chat.at + "|" + (e.chat.fix ? "fix|" + e.chat.text : "line") + "|" + (e.chat.session ?? "")
	: (e.type === "prompt" && e.id ? "prompt|" + e.id : [e.type, e.id, e.at, e.ref, e.text].join("|"));

// A bubble as a tree for drilling in; see doc/notes.md#bubble-tree
const first_line = t => { const s = String(t ?? "").replace(/^#+\s*/, "").split(/\r?\n/)[0].trim(); return s.length > 70 ? s.slice(0, 67) + "…" : s; };
const leaf = pc => ({ key: String(pc.id), title: first_line(pc.text ?? pc.place?.ask ?? pc.place?.title ?? ""), text: pc.text, place: pc.place, children: [] });
function bubble_key(b){ const st = bubbles.get(b); return st ? String(st.key ?? st.pieces[0]?.id ?? "") : null; }
export function card_of(b){
	const st = bubbles.get(b);
	if (!st) return null;
	const r = st.refined, byid = new Map(st.pieces.map(pc => [pc.id, pc]));
	let children = st.pieces.map(leaf);
	if (r){
		const of = new Set(r.of ?? []);
		children = r.sections.map((sec, i) => ({ key: "s" + i, title: first_line(sec.text), text: sec.text,
			children: (sec.from ?? []).map(id => byid.get(id)).filter(Boolean).map(leaf) }))
			.concat(st.pieces.filter(pc => !of.has(pc.id)).map(leaf));
	}
	if (!st.head && !r && children.length === 1 && !children[0].place) children = [];
	// named by first section plus a count: the section alone is also the next level's title
	const more = r && r.sections.length > 1 ? " (+" + (r.sections.length - 1) + " more)" : "";
	const title = st.head ?? (r ? first_line(r.sections[0]?.text) + more : children[0]?.title ?? first_line(st.pieces[0]?.text));
	return { key: bubble_key(b), title: title || "(untitled)", who: b.querySelector(":scope > .chatbox-who, :scope > .who")?.textContent ?? "", children };
}

/** One sticky-bottom scroll for every chat log; call `pin()` after drawing. See doc/notes.md#sticky-scroll */
export function sticky_scroll(box, { observe = true } = {}){   // observe:false = the caller re-pins on a resize itself (ux/Dictate/Widget.js Thread.anchor)
	let locked = true, last = 0;
	const at_bottom = () => box.scrollHeight - box.scrollTop - box.clientHeight < 4;
	const $btn = document.createElement("button");
	$btn.type = "button";
	$btn.className = "chatbox-jump";
	$btn.title = "jump to the newest message";
	$btn.setAttribute("aria-label", "jump to the newest message");
	$btn.textContent = "↓";   // small round button at the bottom; its title and aria-label say the job (the owner, 2026-10-25)
	$btn.hidden = true;
	box.appendChild($btn);
	const show = on => { $btn.hidden = !on; };
	const go_down = () => { if ($btn !== box.lastChild) box.appendChild($btn); box.scrollTop = box.scrollHeight; last = box.scrollTop; };
	$btn.addEventListener("click", () => { locked = true; show(false); go_down(); });
	box.addEventListener("scroll", () => {
		const top = box.scrollTop;
		if (at_bottom()){ locked = true; show(false); }
		else if (top < last){ locked = false; show(true); }
		last = top;
	}, { passive: true });
	const pin = () => { if (locked) go_down(); else if ($btn !== box.lastChild) box.appendChild($btn); };   // the button stays last, even if a redraw emptied the box
	if (observe && typeof ResizeObserver === "function") new ResizeObserver(pin).observe(box);
	return { pin, locked: () => locked };
}

export function chat({ source, keep = () => true, answer = () => {}, on_select, rename, marks: fetch_marks, on_unclear, on_open, on_react, on_reply, on_refine, recent = 50 } = {}){
	let $script, drawn = false, earlier = [], $earlier = null;
	const seen = new Set();

	const view = div.c("chatbox-log", $s => {
		$script = $s;
	});

	const scroll = sticky_scroll($script.el);
	// one pin per batch (doc/notes.md#pin-per-batch)
	let pinning = false;
	// see doc/notes.md#live-bubbles
	const lives = new Map();   // key -> { el, text, timer }
	const follow = fn => { for (const l of lives.values()) l.el.remove(); fn(); for (const l of lives.values()) $script.el.append(l.el); if (pinning) return; pinning = true; queueMicrotask(() => { pinning = false; scroll.pin(); }); requestAnimationFrame(scroll.pin); };

	// see doc/notes.md#selection
	let $selected = null;
	function deselect(){
		if (!$selected) return;
		$selected.classList.remove("chatbox-selected");
		$selected.querySelector(":scope > .chatbox-rename-btn")?.remove();
		$selected.querySelector(":scope > .chatbox-rename-select")?.remove();
		$selected.querySelector(":scope > .chatbox-rename-fixtures")?.remove();
		$selected.querySelector(":scope > .chatbox-open-btn")?.remove();
		$selected.querySelectorAll(":scope > .chatbox-thread-btn").forEach(btn => btn.remove());
		$selected = null;
		on_select?.(null);
	}
	function title_node($b){ return $b.querySelector(":scope > .chatbox-head") ?? $b.querySelector(":scope > .chatbox-text"); }
	function select_bubble($b){
		if ($selected === $b) return deselect();
		deselect();
		$selected = $b;
		$b.classList.add("chatbox-selected");
		on_select?.({ el: $b, text: title_node($b)?.textContent ?? "" });
		if (rename) add_rename_button($b);
		if (on_open && card_of($b)?.children.length) add_open_button($b);
		if (on_reply) add_reply_button($b);
		if (on_refine && $b.classList.contains("chatbox-you")) add_refine_button($b);
	}

	// see doc/notes.md#threads
	function key_of($b){ return String(bubbles.get($b)?.key ?? bubbles.get($b)?.pieces[0]?.id ?? $b.dataset.re ?? ""); }
	function add_reply_button($b){
		const $btn = document.createElement("button");
		$btn.type = "button"; $btn.className = "chatbox-thread-btn"; $btn.textContent = "Reply ↩";
		$btn.addEventListener("click", e => {
			e.stopPropagation();
			const k = key_of($b), re = root_of.get(k) ?? k;
			on_reply({ re, title: (title_node($b)?.textContent ?? "").replace(/[\s✓?🎤⌨]+$/u, "").trim().slice(0, 80) });
			deselect();
		});
		$b.appendChild($btn);
	}
	// see doc/notes.md#refine
	function add_refine_button($b){
		const $btn = document.createElement("button");
		$btn.type = "button"; $btn.className = "chatbox-thread-btn chatbox-refine-btn"; $btn.textContent = "Refine ✦";
		$btn.addEventListener("click", e => {
			e.stopPropagation();
			const pieces = bubbles.get($b)?.pieces ?? [];
			on_refine({ text: pieces.map(pc => pc.text).join("\n\n"), at: pieces[0]?.at, button: $btn });
		});
		$b.appendChild($btn);
	}
	const threads = new Map(), root_of = new Map();   // root key -> thread; a thread item's at -> its root key
	function thread_for(root){
		let t = threads.get(root);
		if (t) return t;
		const $parent = targets.get(root);
		if (!$parent) return null;
		let $wrap, $body, $toggle;
		$script.append(() => {
			$wrap = div.c("chatbox-thread", () => {
				$toggle = button.c("chatbox-thread-toggle").attr("type", "button");
				$body = div.c("chatbox-thread-body");
			});
		});
		$parent.after($wrap.el);
		t = { $wrap, $body, $toggle, count: 0, open: false };
		const show = () => {
			$toggle.el.textContent = (t.open ? "▾ " : "▸ ") + t.count + (t.count === 1 ? " reply" : " replies");
			$body.el.hidden = !t.open;
			$toggle.attr("aria-expanded", String(t.open));
		};
		t.show = show;
		$toggle.el.addEventListener("click", e => { e.stopPropagation(); t.open = !t.open; show(); });
		threads.set(root, t);
		return t;
	}
	function thread_item(c, cls, who, at){
		const $p = targets.get(String(c.re));
		const root = root_of.get(String(c.re)) ?? ($p ? key_of($p) : String(c.re));
		const t = thread_for(root);
		if (!t) return false;
		root_of.set(String(c.at), root);
		t.count++;
		if (Date.now() - at < 120000) t.open = true;   // a reply from the last two minutes opens its thread, so it is seen
		t.show();
		put_line(t.$body, c, cls, who, at);
		return true;
	}

	// see doc/drill.md
	function add_open_button($b){
		const $btn = document.createElement("button");
		$btn.type = "button"; $btn.className = "chatbox-open-btn"; $btn.textContent = "Open ⤢";
		$btn.addEventListener("click", e => { e.stopPropagation(); on_open(card_of($b)); });
		$b.appendChild($btn);
	}
	function make_selectable($b){
		$b.classList.add("chatbox-selectable");
		$b.tabIndex = 0;
		$b.addEventListener("click", e => {
			if (e.target.closest("select, .chatbox-rename-btn, .chatbox-open-btn, .chatbox-thread-btn, .chatbox-refine-btn, .chatbox-thread-toggle, .chatbox-react-picker, .chatbox-react-btn")) return;
			// the click ending a long-press is not a select and must not reach the document
			if (pressed){ pressed = false; e.stopPropagation(); return; }
			select_bubble($b);
		});
		if (on_react) reactable($b);
	}

	// see doc/notes.md#reacting
	const HOLD_MS = 450;
	let pressed = false, $picker = null;
	function target_of($b, node){
		return node?.closest?.("[data-re]")?.dataset.re ?? $b.dataset.re
			?? [...$b.querySelectorAll(":scope > [data-re]")].pop()?.dataset.re ?? null;
	}
	function close_picker(){ $picker?.remove(); $picker = null; }
	function open_picker($b, node){
		close_picker();
		const re = target_of($b, node);
		if (re == null) return;
		const mine = reaction_of($b, re);
		$picker = el("chatbox-react-picker");
		$picker.setAttribute("role", "toolbar");
		$picker.setAttribute("aria-label", "react");
		REACTIONS.forEach(emoji => {
			const btn = el("chatbox-react-pick" + (emoji === mine ? " mine" : ""), "button");
			btn.type = "button"; btn.textContent = emoji; btn.title = emoji === mine ? "take it off" : "react " + emoji;
			btn.addEventListener("click", e => {
				e.stopPropagation();
				const r = { at: new Date().toISOString(), re, emoji: emoji === mine ? "" : emoji, from: { kind: "owner" } };
				react_on($b, r);
				close_picker();
				Promise.resolve(on_react({ re, emoji: r.emoji, at: r.at })).catch(err => console.error("chat: reaction not saved", err));
			});
			$picker.append(btn);
		});
		$b.append($picker);
		// Near the top of the log there is no room above: open below, so the log never clips it.
		const room = $b.getBoundingClientRect().top - $script.el.getBoundingClientRect().top;
		if (room < $picker.offsetHeight + 8) $picker.classList.add("below");
	}
	function reactable($b){
		const $btn = el("chatbox-react-btn", "button");
		$btn.type = "button"; $btn.textContent = "☺"; $btn.title = "react"; $btn.setAttribute("aria-label", "react");
		$btn.addEventListener("click", e => { e.stopPropagation(); $picker?.parentNode === $b ? close_picker() : open_picker($b, null); });
		$b.append($btn);
		$b.addEventListener("contextmenu", e => { e.preventDefault(); pressed = false; open_picker($b, e.target); });
		let timer = null, x0 = 0, y0 = 0;
		const cancel = () => { clearTimeout(timer); timer = null; };
		$b.addEventListener("pointerdown", e => {
			if (e.pointerType === "mouse" || e.target.closest(".chatbox-react-picker, .chatbox-react-btn")) return;
			x0 = e.clientX; y0 = e.clientY; cancel();
			timer = setTimeout(() => { timer = null; pressed = true; open_picker($b, e.target); }, HOLD_MS);
		});
		$b.addEventListener("pointermove", e => { if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) cancel(); });
		["pointerup", "pointercancel", "pointerleave"].forEach(t => $b.addEventListener(t, cancel));
	}
	if (typeof document !== "undefined"){
		document.addEventListener("click", e => { if ($picker && !e.target.closest(".chatbox-react-picker, .chatbox-react-btn")) close_picker(); });
		document.addEventListener("keydown", e => { if (e.key === "Escape") close_picker(); });
	}

	// message id -> bubble; a reaction arriving before its message waits in `early`
	const targets = new Map(), early = new Map();
	function target(id, $b){
		if (id == null || !$b) return;
		id = String(id);
		targets.set(id, $b);
		const wait = early.get(id);
		if (wait){ early.delete(id); wait.forEach(r => react_on($b, r)); }
	}
	function react_line(r){
		const $b = targets.get(String(r.re));
		if ($b) return react_on($b, r);
		early.set(String(r.re), [...(early.get(String(r.re)) ?? []), r]);
	}
	if (typeof document !== "undefined") document.addEventListener("keydown", e => { if (e.key === "Escape") deselect(); });

	// see doc/notes.md#rename
	function add_rename_button($b){
		const $btn = document.createElement("button");
		$btn.type = "button"; $btn.className = "chatbox-rename-btn"; $btn.textContent = "Rename";
		$btn.addEventListener("click", e => { e.stopPropagation(); start_rename($b); });
		$b.appendChild($btn);
	}
	async function start_rename($b){
		const $title = title_node($b);
		const $btn = $b.querySelector(":scope > .chatbox-rename-btn");
		if (!$title || !rename) return;
		const current = ($title.textContent ?? "").replace(/\s*[✓?]\s*$/, "").trim();
		if ($btn) $btn.disabled = true;
		const out = await rename.options(current);
		$btn?.remove();
		if ($selected !== $b) return;   // deselected while the answer was in flight
		const $sel = document.createElement("select");
		$sel.className = "chatbox-rename-select";
		const opt = (label, value, extra) => Object.assign(document.createElement("option"), { textContent: label, value, ...extra });
		$sel.append(opt("Pick a name…", "", { disabled: true, selected: true }), opt("Keep current — " + current, "__keep"));
		(out.names ?? []).forEach(name => $sel.append(opt(name, name)));
		$sel.addEventListener("click", e => e.stopPropagation());
		$sel.addEventListener("change", () => {
			const name = $sel.value;
			$sel.remove();
			$b.querySelector(":scope > .chatbox-rename-fixtures")?.remove();
			if (name && name !== "__keep") rename.on_renamed?.({ el: $b, piece: bubbles.get($b)?.pieces[0] }, name);
			deselect();
		});
		$b.appendChild($sel);
		if (out.source === "fixtures"){
			const note = document.createElement("small");
			note.className = "muted chatbox-rename-fixtures";
			note.textContent = "fixtures: Servex /api/hitl not reachable";
			$b.appendChild(note);
		}
	}

	// see doc/notes.md#understand-marks
	function mark_owner_piece(bubble, piece, c){
		if (!fetch_marks) return;
		fetch_marks([c.text]).then(out => {
			const m = out?.marks?.[0];
			if (!m) return;
			piece.mark = m;
			fill(bubble);
			if (m.mark === "unclear" && m.question) on_unclear?.(c, m);
		}).catch(() => {});
	}

	function add(cls, who, text, sender, at, id){
		if (!text) return;
		follow(() => target(id, speak($script, { cls, who, text, sender, at, id, onmount: make_selectable })));
	}

	/* A REPLY'S HEADING (the owner, 2026-09-24): a `heading` field, or a first line
	   written `# Heading`, shows as a short bold title above the body. */
	function reply(e){
		// threaded reply: nest under its parent, else fall through to the plain flow (doc/notes.md#threads)
		if (e.thread && e.re){
			let placed = false;
			follow(() => { placed = thread_item(e, "chatbox-reply", e.by, Date.parse(e.at ?? 0) || Date.now()); });
			if (placed) return;
		}
		let head = e.heading, body = e.text ?? "";
		const nl = body.search(/[\r\n]/), first = (nl < 0 ? body : body.slice(0, nl)).trim();
		if (!head && first.startsWith("#")){ head = first.replace(/^#+\s*/, ""); body = nl < 0 ? "" : body.slice(nl + 1).trim(); }
		if (!head) return follow(() => target(e.id, speak($script, { cls: "chatbox-reply", who: e.by, text: body, sender: e.by, at: e.at, id: e.id, onmount: make_selectable })));
		follow(() => $script.append(() => {
			p.c("chatbox chatbox-reply", $b => {
				who_label(e.by);
				span.c("chatbox-head", $t => { md_into($t.el, head, true); });
				if (body) div.c("chatbox-text md", $t => { md_into($t.el, body); });
				if (e.id != null){ $b.el.dataset.re = e.id; target(e.id, $b.el); }
					// never fill()-ed; kept in bubbles so card_of() can open it
				bubbles.set($b.el, { pieces: body ? [{ id: e.id ?? e.at, text: body, at: e.at }] : [], refined: null, head, key: e.id ?? e.at });
				make_selectable($b.el);
			});
		}));
	}

	// A question for you; see doc/notes.md#questions
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
				const id = e.id ?? e.at;
				if (id != null){ $q.el.dataset.re = id; target(id, $q.el); }
				make_selectable($q.el);
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

	// see doc/notes.md#universal-chat-line
	const fix_index = new Map();   // chat.at (string) -> { bubble, piece }

	function chat_line(c){
		const cls = (c.from?.kind ?? "") === "owner" ? "chatbox-you" : "chatbox-reply";
		const who = c.from?.id || c.from?.kind || "";
		if (!c.fix && !c.level) cls === "chatbox-you" ? drop_live([...lives.keys()].find(k => k.startsWith("sent:"))) : drop_live("stream:" + who);
		const at = Date.parse(c.said_at ?? c.at ?? 0) || Date.now();   // said_at = when the owner said it, on Servex's clock (doc/notes.md#bubble-order); old lines have none

		if (c.fix){
			const hit = fix_index.get(c.at);
			if (hit){
				Object.assign(hit.piece, { text: c.text, via: c.via, place: c.place });
				return follow(() => fill(hit.bubble));
			}
			// no original on screen: show the correction as its own line, never drop it
		}

		/* A revision line; see doc/notes.md#revision-lines */
		if (c.re && c.level && !c.fix){
			const hit = fix_index.get(c.re);
			if (hit){
				hit.piece.revision = { text: c.text, level: c.level };
				return follow(() => fill(hit.bubble));
			}
			// raw line not on screen: show as a plain reply
			return follow(() => speak($script, { cls: "chatbox-reply", who: "", text: c.text, sender: "", at: c.at, id: "revision-" + at }));
		}

		// a threaded reply goes under its parent, else falls through to the main flow
		if (c.thread && c.re){
			let placed = false;
			follow(() => { placed = thread_item(c, cls, who, at); });
			if (placed) return;
		}

		follow(() => put_line($script, c, cls, who, at));
	}

	/** One universal chat line into `$box` (the log or a thread body). */
	function put_line($box, c, cls, who, at){
			const last = mergeable($box, who, at);
			const piece = { id: c.at, text: c.text, at, via: c.via, place: c.place };
			if (last){
				const pieces = bubbles.get(last).pieces, i = pieces.findIndex(pc => pc.at > at);   // in time order, as speak() does
				i < 0 ? pieces.push(piece) : pieces.splice(i, 0, piece);
				last.dataset.at = Math.max(Number(last.dataset.at) || 0, at);
				fill(last);
				fix_index.set(c.at, { bubble: last, piece });
				target(c.at, last);
				if (cls === "chatbox-you") mark_owner_piece(last, piece, c);
				return;
			}
			let made = null;
			$box.append(() => {
				p.c("chatbox " + cls, $b => {
					$b.el.dataset.sender = who; $b.el.dataset.at = at;
					if (who) who_label(who, c.from?.agent);
					bubbles.set($b.el, { pieces: [piece], refined: null });
					fill($b.el);
					fix_index.set(c.at, { bubble: $b.el, piece });
					make_selectable($b.el);
					target(c.at, $b.el);
					if (cls === "chatbox-you") mark_owner_piece($b.el, piece, c);
					made = $b.el;
				});
			});
			if (made) place(made);
	}

	function live_bubble(key, cls, who){
		let hit = lives.get(key);
		if (hit) return hit;
		let node;
		$script.append(() => { p.c("chatbox chatbox-live " + cls, $b => { if (who) who_label(who); node = $b.el; }); });
		const text = el("chatbox-text");
		node.append(text);
		lives.set(key, hit = { el: node, text });
		return hit;
	}
	/** The "cleaning…" / "sent, waiting" label beside a faded sent bubble. */
	function set_mark(hit, label){
		if (!hit.mark){ hit.mark = el("chatbox-live-mark muted"); hit.el.append(hit.mark); }
		hit.mark.textContent = label;
	}
	function drop_live(key){
		const hit = key && lives.get(key);
		if (!hit) return;
		clearTimeout(hit.timer);
		hit.el.remove();
		lives.delete(key);
	}
	let sent_n = 0;

	const CHUNK = 50;
	function show_earlier_button(){
		if (!earlier.length){ $earlier?.remove(); $earlier = null; return; }
		if (!$earlier){
			$earlier = document.createElement("button");
			$earlier.type = "button"; $earlier.className = "chatbox-earlier";
			$earlier.addEventListener("click", load_earlier);
		}
		$earlier.textContent = "show earlier (" + earlier.length + ")";
		$script.el.prepend($earlier);
	}
	/** Draw the previous chunk ABOVE what is on screen, keeping the reader where they were. Merge logic only ever looks at the last bubble, so the chunk is drawn into an emptied box and the old children put back after it. */
	function load_earlier(){
		const box = $script.el, chunk = earlier.splice(Math.max(0, earlier.length - CHUNK));
		const before = box.scrollHeight - box.scrollTop;
		$earlier?.remove();
		const old = [...box.children];
		old.forEach(c => c.remove());
		chunk.forEach(draw);
		old.forEach(c => box.append(c));
		show_earlier_button();
		box.scrollTop = box.scrollHeight - before;
	}

	function draw(e){
		if (e.react) return react_line(e.react);
		if (e.chat) return chat_line(e.chat);
		if (e.type === "ask" || (e.type === "prompt" && e.choices?.length)) return ask(e);
		if (e.type === "prompt"){ answered(e); drop_live([...lives.keys()].find(k => k.startsWith("sent:"))); }   // your real line replaces the faded live bubble
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
		locked: scroll.locked,
		/** Kept so callers still work: your words are drawn once, when they are logged, never twice. */
		echo(){},
		/** Start the rename flow on the selected bubble; false when none is selected. */
		rename_selected(){ if (!$selected) return false; start_rename($selected); return true; },
		/** Flip a ✓/? mark in place (the clarification loop-back); false if the piece is off screen. See doc/notes.md#check-mark */
		resolve_mark(at, mark){
			const hit = fix_index.get(at);
			if (!hit) return false;
			hit.piece.mark = mark;
			fill(hit.bubble);
			return true;
		},
		/** Your words while you speak: one growing bubble. See doc/notes.md#live-bubbles */
		live({ text = "", settled = text, guess = "", sent = false } = {}){
			if (!text){
				const hit = lives.get("draft");
				if (!hit) return;
				if (!sent) return drop_live("draft");
				lives.delete("draft");
				const key = "sent:" + (++sent_n);
				hit.el.classList.add("chatbox-live-sent");
				hit.el.title = LIVE_SENT_TITLE;
				set_mark(hit, "cleaning…");
				hit.timer = setTimeout(() => set_mark(hit, "sent, waiting"), 2000);
				lives.set(key, hit);
				return;
			}
			follow(() => {
				const hit = live_bubble("draft", "chatbox-you chatbox-draft", "owner");
				hit.text.textContent = settled;
				if (guess){ const g = el("chatbox-guess", "span"); g.textContent = (settled ? " " : "") + guess; g.title = GUESS_TITLE; hit.text.append(g); }
			});
		},
		/** An assistant's reply while it is written; empty text removes it. */
		stream(who, text){
			if (!text) return drop_live("stream:" + who);
			follow(() => md_into(live_bubble("stream:" + who, "chatbox-reply chatbox-streaming", who).text, text));
		},
		/** The card whose first piece's `at` (or id) is `at`, as a tree — `card_of()`. */
		card(at){
			for (const b of $script.el.children) if (bubble_key(b) === at) return card_of(b);
			return null;
		},
		sync(){
			const fresh = source().filter(e => {
				const k = key(e);
				if (seen.has(k)) return false;
				seen.add(k);
				return keep(e);
			});
			fresh.sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0));
			// WINDOW: the first draw shows only the newest `recent`; the rest wait behind "show earlier".
			if (!drawn && fresh.length > recent){ earlier = fresh.slice(0, fresh.length - recent); fresh.splice(0, earlier.length); show_earlier_button(); }
			drawn = true;
			fresh.forEach(draw);
		},
	};
}

export { md_into, who_label };
export { set_avatar, avatar_of, AVATARS } from "./roles.js";
export { role_key } from "./roles.js";
export default chat;
