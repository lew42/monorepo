import { div, span, button, p, small, ol, li, input } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { fold } from "/framework/ai/2026-09-22/log-model/fold.js";
import { clock } from "./timeline.js";
import composer from "./compose.js";

/**
 * THE PROMPTS VIEW — what you said, and what was made of it, side by side.
 *
 * You dictate; `ux/Dictate` posts each finished sentence to Servex; the fast
 * assistant (`Servex/agents/Assistant.js`) answers within about two seconds
 * with a NAME for each thing you named, a CARD for the idea, and a REFINED
 * reading that cites the sentences it came from. This view is that thread:
 * newest prompt on top, your own words on the left, never tidied, and
 * everything made of them on the right. Hover the reading and the sentences it
 * is actually reading light up.
 *
 * Nothing here ever waits for you. The ✓ and ✗ on a chip or a card are
 * optional, always — they append one more line to the log and the page carries
 * on either way. The appender is the authority on whether a press is allowed
 * (`Servex/Log.js`'s naming checks); this only shows its answer.
 *
 * Servex may not be running at all. Everything below fails to nothing: no
 * console error, no thrown promise, an empty view and a board that loads
 * exactly as it always has.
 */

export const servex_base = () => new URLSearchParams(location.search).get("servex") || "http://127.0.0.1:8090";

/* ONE CONNECTION, however many readers. The view wants the whole thread; the
   board wants only the cards, folded onto its normal timeline. Both subscribe
   here rather than each opening an `EventSource` of its own — two sockets to
   the same endpoint would double every frame for nothing. */
const streams = new Map();

export function prompt_stream(base = servex_base()) {
	if (streams.has(base)) return streams.get(base);

	const stream = { entries: [], readers: new Set(), ready: null, ok: false };
	streams.set(base, stream);

	stream.ready = fetch(`${base}/log/prompts?n=400`).then(r => (r.ok ? r.json() : null)).catch(() => null).then(list => {
		if (!Array.isArray(list)) return stream;            // Servex not answering — stays empty, nothing logged
		stream.ok = true;
		list.forEach(e => stream.entries.push(e));
		listen(base, stream);
		return stream;
	});

	stream.on = reader => { stream.readers.add(reader); return () => stream.readers.delete(reader); };
	return stream;
}

function listen(base, stream) {
	let source;
	try { source = new EventSource(`${base}/api/stream`); }
	catch { return; }
	source.addEventListener("log", msg => {
		let frame;
		try { frame = JSON.parse(msg.data); } catch { return; }
		if (frame.log !== "prompts" || !frame.entry) return;
		stream.entries.push(frame.entry);
		stream.readers.forEach(reader => reader(frame.entry));
	});
	source.onerror = () => {};   // Servex restarting — EventSource retries on its own
}

/* A line written before ids existed still gets one, positionally, so the fold
   can hold it: nothing in this log is ever dropped for being old. */
const with_ids = entries => entries.map((e, i) => (e.id ? e : { ...e, id: `${e.type ?? "e"}-${i}` }));

/* Everything one prompt produced, gathered off the fold's own `children` —
   every event the assistant appended carries `re` pointing back at the prompt
   it answers, which is the whole reason this is three lines and not a search. */
function threads(entries) {
	const out = fold(with_ids(entries));
	const kids = (thing, type, bin) => (thing?.children ?? [])
		.filter(c => c.type === type).map(c => out[bin][c.id] ?? c);

	return Object.values(out.prompts).reverse().map(prompt => {
		const cards = kids(prompt, "card", "cards");
		return {
			prompt,
			refined: kids(prompt, "refined", "refined"),
			names: kids(prompt, "name", "names"),
			cards,
			/* A pre-proposal answers a CARD you approved, so it hangs off that
			   card, not off the prompt — but it belongs on screen under the
			   sentence that started the whole thread, which is why both places
			   are gathered here rather than only the one the `re` names. */
			proposals: [...kids(prompt, "proposal", "proposals"), ...cards.flatMap(c => kids(c, "proposal", "proposals"))]
		};
	});
}

/* ── the write path ─────────────────────────────────────────────────────── */

/* `by: "owner"` is what the appender checks before it allows an approve at all,
   and 409 is not a failure of this page — it is the log refusing a press the
   naming rules do not permit, with `why` saying which rule. */
async function post(base, entry) {
	try {
		const res = await fetch(`${base}/log/prompts`, {
			method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ by: "owner", ...entry })
		});
		return { status: res.status, body: await res.json().catch(() => null) };
	} catch (e) { return { status: 0, body: { why: "Servex is not answering." } }; }
}

const tell_assistant = (base, text, re) => fetch(`${base}/api/assistant/message`, {
	method: "POST", headers: { "content-type": "application/json" },
	body: JSON.stringify({ text, from: "board", re })
}).catch(() => null);

/* ── the view ───────────────────────────────────────────────────────────── */

export function prompts_view(base = servex_base()) {
	const stream = prompt_stream(base);
	let $list, held = false, dirty = false;

	/* Its own box, built into whatever captor is open — the same shape
	   `days_view()` uses, and for the same reason: `.v3-wall` is
	   `display: contents` and can pad nothing, so the view owns its own
	   padded container. */
	div.c("v3-prompts", () => {
		composer();   // the box lives here too — top of the tab, above the thread it feeds
		$list = div.c("v3-prompts-list flex v gap");
		p.c("v3-prompts-note muted").text("Stage 1 and 2 of five are live here: your raw words, and the reading made of them. A ✓ on a card asks for stage 3, a pre-proposal. Stage 4 (a full proposal, naming classes) and stage 5 (the build) are phase 3.");
	});

	const paint = () => {
		if (!$list) return;
		if (held) return void (dirty = true);   // an open "why" box must not be torn down under the owner
		const list = threads(stream.entries);
		$list.empty(() => {
			if (!list.length) return void p.c("muted").text(stream.ok ? "Nothing said yet." : "Servex is not running, so there is nothing to show here.");
			list.forEach(row);
		});
	};

	const hold = on => { held = on; if (!on && dirty) { dirty = false; paint(); } };

	stream.ready.then(paint);
	// `stream.on()` only ever fires for a LIVE arrival (the initial batch above
	// comes through `stream.ready` instead), and the newest thread is always
	// row 0 (`threads()` reverses the fold) — so this is "scroll to the new
	// row when the reply lands" for a prompt, a name, a card or a refined
	// reading alike, with no separate tracking of what just changed.
	stream.on(() => { paint(); $list.el.firstElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" }); });

	/* ONE PROMPT — your sentences on the left, what was made of them on the
	   right. The `data-i` on each sentence is the citation vocabulary itself:
	   a refined line says "sentences 0 and 2" and hovering it lights exactly
	   those two, so a summary can be audited against your own words by eye. */
	function row({ prompt, refined, names, cards, proposals }) {
		div.c("v3-prompt-row", () => {
			div.c("v3-prompt-said", () => {
				small.c("v3-prompt-when muted").text(`${clock(prompt.at)} · ${prompt.by ?? "owner"} · ${prompt.source ?? prompt.via ?? "typed"} · ${prompt.id}`);
				ol.c("v3-prompt-sentences", () => (prompt.sentences ?? [prompt.text ?? ""])
					.forEach((s, i) => li.c("v3-prompt-sentence").attr("data-i", String(i)).text(s)));
			});
			div.c("v3-prompt-made flex v gap-35", $made => {
				refined.forEach(r => reading($made, r));
				if (names.length) div.c("v3-prompt-chips flex wrap gap-25", () => names.forEach(chip));
				cards.forEach(card);
				proposals.forEach(proposal);
				/* "Waiting" only while waiting is still plausible. A prompt from
				   before the assistant existed will never be answered — nothing
				   ever goes back over the backlog, because that would put words
				   in your mouth about something you said hours ago — so an old
				   bare prompt says so instead of sitting on a spinner forever. */
				if (!refined.length && !names.length && !cards.length)
					small.c("muted").text(Date.now() - Date.parse(prompt.at ?? 0) < 120000
						? "waiting for the assistant…" : "said before the assistant was listening — nothing was made of it");
			});
		});
	}

	function reading($made, r) {
		const cited = (r.cites ?? []).flatMap(c => c.sentences ?? []);
		const $r = div.c("v3-prompt-refined").text(r.text ?? "");
		const glow = on => cited.forEach(i => $made.el.closest(".v3-prompt-row")
			?.querySelector(`.v3-prompt-sentence[data-i="${i}"]`)?.classList.toggle("lit", on));
		$r.on("mouseenter", () => glow(true)).on("mouseleave", () => glow(false));
		if (cited.length) $r.append(() => { small.c("v3-prompt-cites muted").text(`from ${cited.length === 1 ? "sentence" : "sentences"} ${cited.join(", ")}`); });
	}

	function chip(n) {
		div.c("v3-chip" + (n.locked ? " locked" : ""), () => {
			span.c("v3-chip-name").text(n.name ?? n.id);
			if (n.kind) span.c("v3-chip-kind muted").text(n.kind);
			if (n.locked) span.c("v3-chip-lock").text("✓");
			else judge(n.id, { alt: `Not this — what else could "${n.name}" be called? Give two alternatives as name lines, nothing else.` });
			(n.alternatives ?? []).forEach(a => a.name && span.c("v3-chip-alt muted").text(`or ${a.name}`));
			(n.children ?? []).filter(c => c.type === "dispute").forEach(d => small.c("v3-chip-why").text(`✗ ${d.text}`));
		});
	}

	function card(c) {
		div.c("v3-prompt-card card" + (c.locked ? " locked" : ""), () => {
			div.c("v3-prompt-card-head flex v-center gap-25", () => {
				if (c.icon) icon(c.icon);
				span.c("v3-prompt-card-title").text(c.title ?? c.id);
				if (c.locked) span.c("v3-chip-lock").text("✓");
				else judge(c.id, { proposal: c.title });
			});
			if (c.text) p.c("v3-prompt-card-text").text(c.text);
			(c.children ?? []).filter(d => d.type === "dispute").forEach(d => small.c("v3-chip-why").text(`✗ ${d.text}`));
		});
	}

	function proposal(pr) {
		div.c("v3-prompt-proposal card", () => {
			small.c("v3-prompt-stage muted").text(`pre-proposal · stage ${pr.stage ?? "pre"}`);
			div.c("v3-prompt-card-title").text(pr.title ?? pr.id);
			if ((pr.shape ?? []).length) ol.c("v3-prompt-shape", () => pr.shape.forEach(s => li(s)));
		});
	}

	/* ✓ ✗ and "what else?" — three small buttons that appear on hover and are
	   never required. ✗ opens its own one-line box rather than `window.prompt`,
	   which would freeze the page and lose the live thread behind it. */
	function judge(id, { alt, proposal: title } = {}) {
		div.c("v3-judge flex v-center gap-25", $j => {
			/* The answer stays on screen for a moment before the hold comes off,
			   because lifting the hold is what lets the live repaint replace
			   this whole row with the line that just landed in the log. */
			const done = ({ status, body }) => {
				$j.append(() => { small.c("v3-judge-said").text(status === 200 ? (body?.became === "dispute" ? "filed beside it" : "logged") : (body?.why ?? "refused")); });
				setTimeout(() => hold(false), 1500);
			};

			button.c("v3-judge-btn").attr("type", "button").attr("title", "Yes, this one").text("✓")
				.click(async () => {
					await post(base, { type: "approve", id, re: id });
					if (title) tell_assistant(base, `The owner approved the card "${title}". Append ONE proposal, stage "pre": a title, three shape bullets saying what it is made of, and no class names yet.`, id);
				});

			button.c("v3-judge-btn").attr("type", "button").attr("title", "Not this — say why").text("✗")
				.click(() => {
					hold(true);
					$j.append(() => {
						const $why = input().attr("placeholder", "what is wrong with it?").ac("v3-judge-why");
						$why.on("keydown", async e => {
							if (e.key === "Escape") return void (hold(false), paint());
							if (e.key !== "Enter") return;
							done(await post(base, { type: "dispute", id, re: id, text: $why.el.value.trim() || "Not this." }));
						});
						setTimeout(() => $why.el.focus(), 0);
					});
				});

			if (alt) button.c("v3-judge-btn").attr("type", "button").attr("title", "Not this — what else could it be called?").text("?")
				.click(async () => {
					await post(base, { type: "ask", id: `ask-${id}`, re: id, question: `Not this — what else could "${id}" be called?` });
					tell_assistant(base, alt, id);
				});
		});
	}

	return { update() {} };   // board.jsonl updates never touch this view — its data is the prompt log
}

/* THE SAME CARDS, ON THE NORMAL BOARD. Every `card` the assistant appends is a
   preview card like any other, so it joins the timeline and the grid through
   the model they already read — see page.js's call site and this task's own
   `decision` line for why this mapping is six lines here rather than a shared
   helper with `agents.js`. */
export function prompt_board_cards(on_card, base = servex_base()) {
	const stream = prompt_stream(base);
	const send = e => e.type === "card" && on_card({
		id: `prompt-${e.id}`, author: "assistant", title: e.title, text: e.text ?? "",
		icon: e.icon, status: "done", at: e.at, updated_at: e.at
	});
	stream.ready.then(() => { stream.entries.forEach(send); stream.on(send); });
}

export default prompts_view;
