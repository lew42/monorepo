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
	// `on_chosen` (the ✓/? loop-back, below) is OURS, never the module's own
	// constructor prop — pulled off before `rest` reaches `new mod.default(...)`.
	const { module, on_chosen, ...rest } = place ?? {};
	const box = el("chatbox-text chatbox-place");
	if (!module){ box.textContent = "(no module named)"; return box; }
	import(module).then(mod => {
		const view = new mod.default({ ...rest, capture: false });
		// The module's own `write()` is its ONE seam for "an option got picked"
		// (`ux/Content/ContentModule`'s own doc comment) — wrapping it, rather
		// than adding a second prop the module has to know about, is the same
		// "reuse, never rebuild" rule the rename/marks features already follow.
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

/** A REVISION, drawn as a PAIR under its raw line (the owner, 2026-09-29:
 *  "the revised text right under its raw line, raw greyed"): the raw words
 *  stay, muted, above the tidied-up version. A click toggles `.showraw` —
 *  the revised line hides and the raw one loses its muting, "back to raw" —
 *  a second click returns to the pair. `pc.revision` is `{text, level}`,
 *  set by `chat_line()` below when a revision line's `re` matches this
 *  piece's own `at`. */
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

/** One piece of a bubble's own text — a `place` card if it has one, else its
 *  markdown, or (once a revision has landed) the raw/revised PAIR above. The
 *  via mark (if the piece carries one) is on the bubble's own sender label
 *  instead — see `label_via()` above. */
/** A ✓/? mark (`ux/Understand`'s own shape, `{mark: "ok"|"unclear", purpose}`),
 *  glued after the sentence's OWN LAST WORD, not on a line of its own — the
 *  owner's own words, "a green check mark after it." A non-breaking space is
 *  `ux/Understand`'s own trick for this (`Understand.js`'s `row()`): it makes
 *  the mark wrap like a word instead of a block dropping onto its own line. */
function mark_badge(m){
	const b = el("chatbox-mark " + (m.mark === "ok" ? "chatbox-mark-ok" : "chatbox-mark-unclear"), "span");
	b.title = m.purpose || (m.mark === "ok" ? "Reads as clear." : "This sentence might mean more than one thing.");
	b.textContent = m.mark === "ok" ? "✓" : "?";
	return b;
}

/* `md_into` (Markdown) renders `pc.text` as one or more BLOCK elements (a `<p>`,
   a list, …) inside `node` — appending the mark to `node` itself lands it AFTER
   that block, on its own line. Landing it inside the LAST block's own last
   child, with a non-breaking space in front, keeps it on the sentence's own
   line, right after the last word, the way `ux/Understand` already draws it. */
function append_mark(node, m){
	const last = node.lastElementChild ?? node;
	last.append(" ", mark_badge(m));
}

function piece_node(pc){
	if (pc.place) return place_card(pc.place);
	if (pc.revision) return revision_pair_node(pc);
	const node = para("chatbox-text", pc.text);
	if (pc.mark) append_mark(node, pc.mark);
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

/** Draw one message: a new bubble, or a paragraph on the bubble it merges into.
 *  `onmount(el)` fires once, only for a brand-new bubble — `chat()`'s own
 *  selection wiring (below) hangs off it. */
export function speak($box, { cls, who, text, sender, at, id, onmount }){
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
			onmount?.($b.el);
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

export function chat({ source, keep = () => true, answer = () => {}, on_select, rename, marks: fetch_marks, on_unclear } = {}){
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

	/* SELECTION (the owner: "when you click on a specific card, first it kind of
	   selects that card"). One bubble at a time, in THIS log; a second tap on the
	   same bubble, or Esc, clears it — added on top of whatever a bubble's own
	   click already does (opening a refined bubble, a place card's own clicks),
	   never instead of it: two listeners on the SAME element both still fire even
	   when one of them calls `stopPropagation()` (that only blocks bubbling up to
	   an ANCESTOR, never a sibling listener on the same node — requirements.md's
	   own "a tap selects AND opens what's inside"). */
	let $selected = null;
	function deselect(){
		if (!$selected) return;
		$selected.classList.remove("chatbox-selected");
		$selected.querySelector(":scope > .chatbox-rename-btn")?.remove();
		$selected.querySelector(":scope > .chatbox-rename-select")?.remove();
		$selected.querySelector(":scope > .chatbox-rename-fixtures")?.remove();
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
	}
	function make_selectable($b){
		$b.classList.add("chatbox-selectable");
		$b.tabIndex = 0;
		$b.addEventListener("click", e => { if (e.target.closest("select, .chatbox-rename-btn")) return; select_bubble($b); });
	}
	if (typeof document !== "undefined") document.addEventListener("keydown", e => { if (e.key === "Escape") deselect(); });

	/* RENAME (`ux/Rename`'s own ask, reused — never rebuilt here): `rename.options(text)`
	   is `rename_options` from `ux/Rename/Rename.js`, handed in by the caller
	   (`ChatPanel`) so this file never imports `ux/` itself. Choosing a name calls
	   `rename.on_renamed({el, piece}, name)` — the CALLER delivers the new title
	   the normal way (a `fix` line, same `at`, so latest wins everywhere the log
	   is read); `chat_line()`'s own fix handling below then redraws the title
	   from that line, same as any other correction. */
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

	/* ✓/? MARKS (`ux/Understand`'s own `marks()`, reused — never rebuilt here):
	   after each of YOUR OWN lines, asked once, in the background ("the smart
	   assistant, no hurry" — requirements.md). `fetch_marks` is `marks` from
	   `ux/Understand/Understand.js`, handed in by `ChatPanel` the same way
	   `rename` is, so this file never imports `ux/` either. The mark is stored
	   ON THE PIECE (`piece.mark`) and drawn by `piece_node()` above, so a later
	   `fill()` keeps showing it without asking again. An UNCLEAR sentence also
	   calls `on_unclear(chat_line, mark)` once, so the caller can drop a
	   clarification card into the flow. */
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
		follow(() => speak($script, { cls, who, text, sender, at, id, onmount: make_selectable }));
	}

	/* A REPLY'S HEADING (the owner, 2026-09-24): a `heading` field, or a first line
	   written `# Heading`, shows as a short bold title above the body. */
	function reply(e){
		let head = e.heading, body = e.text ?? "";
		const nl = body.search(/[\r\n]/), first = (nl < 0 ? body : body.slice(0, nl)).trim();
		if (!head && first.startsWith("#")){ head = first.replace(/^#+\s*/, ""); body = nl < 0 ? "" : body.slice(nl + 1).trim(); }
		if (!head) return follow(() => speak($script, { cls: "chatbox-reply", who: e.by, text: body, sender: e.by, at: e.at, id: e.id, onmount: make_selectable }));
		follow(() => $script.append(() => {
			p.c("chatbox chatbox-reply", $b => {
				who_label(e.by);
				span.c("chatbox-head", $t => { md_into($t.el, head, true); });
				if (body) div.c("chatbox-text md", $t => { md_into($t.el, body); });
				make_selectable($b.el);
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

		/* A REVISION (`ext/Chat/readme.md`'s "revision line"): `c.re` names the
		   RAW line's own `at` this tidies up, `c.level` says how much — never a
		   `fix` (a correction to what was actually said) and never its own
		   bubble. Keyed on the LINE'S SHAPE alone (`re` + `level`, no `fix`), not
		   on who wrote it, so `ChatPanel`'s own `handle_revision()` and a later
		   voice-sessions assistant writing the identical shape both land here
		   with no change. */
		if (c.re && c.level && !c.fix){
			const hit = fix_index.get(c.re);
			if (hit){
				hit.piece.revision = { text: c.text, level: c.level };
				return follow(() => fill(hit.bubble));
			}
			// The raw line isn't on screen (a page opened mid-conversation) —
			// still shown, as a plain reply, rather than a revision nobody can see.
			return follow(() => speak($script, { cls: "chatbox-reply", who: "", text: c.text, sender: "", at: c.at, id: "revision-" + at }));
		}

		follow(() => {
			const last = mergeable($script, who, at);
			const piece = { id: c.at, text: c.text, at, via: c.via, place: c.place };
			if (last){
				bubbles.get(last).pieces.push(piece);
				last.dataset.at = at;
				fill(last);
				fix_index.set(c.at, { bubble: last, piece });
				if (cls === "chatbox-you") mark_owner_piece(last, piece, c);
				return;
			}
			$script.append(() => {
				p.c("chatbox " + cls, $b => {
					$b.el.dataset.sender = who; $b.el.dataset.at = at;
					if (who) label_via(who_label(who), c.via);
					bubbles.set($b.el, { pieces: [piece], refined: null });
					fill($b.el);
					fix_index.set(c.at, { bubble: $b.el, piece });
					make_selectable($b.el);
					if (cls === "chatbox-you") mark_owner_piece($b.el, piece, c);
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
		/** Start (or re-start) the rename flow on whatever is currently selected —
		 *  the composer's "rename this" hooks here (`ChatPanel.js`'s `try_command`),
		 *  so typing it never ALSO sends it as a message. `false` when nothing is
		 *  selected — the caller decides what to do then (send it as a plain line). */
		rename_selected(){ if (!$selected) return false; start_rename($selected); return true; },
		/** The ✓/? LOOP-BACK: a clarification card's own answer (`place_card()`'s
		 *  wrapped `write()`) calls this with the ORIGINAL line's `at` and a new
		 *  mark — flips that sentence's ? back to a ✓ in place, same as choosing
		 *  an answer in `ux/Understand`'s own demo does. `false` when the piece
		 *  isn't on screen any more (a page opened after it scrolled off). */
		resolve_mark(at, mark){
			const hit = fix_index.get(at);
			if (!hit) return false;
			hit.piece.mark = mark;
			fill(hit.bubble);
			return true;
		},
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
