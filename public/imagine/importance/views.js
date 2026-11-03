/* THE SCREENS — everything with DOM in it. The data layer is `importance.js` and it
   knows nothing about any of this.

   Three views, one each for the three things a person does here:
     ImpRank      you are at a node; these are its children, ranked, with the count
     ImpPropose   add a question, option or caveat under the node you are at
     ImpPair      "which matters more?" — one keypress, one appended line */

import { View, div, p, span, button, input, select, option, a, details, summary, icon, kbd } from "/app.js";
import { store, KINDS } from "./importance.js";

View.stylesheet(import.meta, "importance.css");

// ⚠ Material ICONS, not Symbols — a name only the newer set has renders as its own word.
const GLYPH = { topic: "folder", question: "help_outline", option: "check_circle", caveat: "warning", evidence: "link" };

// The green mark both pages wear: this is an editor, and it says where it writes.
export const SAVED = "Saved to disk — the three `.jsonl` files under `data/`, committed to the repo.";

/* THE HONEST CONFIDENCE LINE, and the one rule the owner named: a node nobody has
   judged says **unranked**, never 0%. 0% is a real, earned score — it means judged and
   lost every time, which is not the same thing at all. */
export function confidence(row){
	if (!row.ranked) return "unranked — no judgments yet";
	return Math.round(row.score * 100) + "% — won " + row.wins + " of " + row.games;
}

// ⚠ TITLED WITH THE KIND IT DRAWS. An untitled `?` and an untitled `⚠` were the only
//   thing telling a question from a caveat of a different question on the judge
//   screen — a plain-English pair that stopped making sense the moment you could not
//   tell they were two different kinds of thing (self-evident-critique-3, finding 3).
export function glyph(node){
	const $g = icon(GLYPH[node?.kind] ?? "help_outline").ac("imp-glyph");
	if (node?.kind) $g.attr("title", node.kind);
	return $g;
}

/* A CONTROL THAT MUST NOT LOOK LIKE A BUTTON. The site's skin gives every `<button>`
   0.8em uppercase bold inside a hairline box (`lew42.css`, and framework.css's control
   grammar under it) — right for "Add", wrong for a question you are reading. So the
   things you click to move around are tappable boxes: same keyboard, no costume. */
export function tap(tag, classes, build, act){
	return tag.c(classes, build)
		.attr("role", "button").attr("tabindex", "0")
		.on("click", act)
		.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); act(); } });
}

/* THE FOUR KEYS THAT JUDGE, and the side each one picks. A map rather than a branch,
   because `ImpPair.key()` has to ask "is this one of the pick keys?" before it asks
   anything else — see the rule on `key()` below. */
export const PICKS = { ArrowLeft: "a", 1: "a", ArrowRight: "b", 2: "b" };

/* THE REUSE MARK — the owner's "see where a caveat or question is reused across
   contexts". One node joined by two edges is in two topics at once, and until this mark
   existed there was nothing on any screen that could tell you so.

   Pressing it opens the list of the other topics IN PLACE — the same gesture as `Why?`
   one line above it: one `flip()`, one slot, a label that cannot disagree with what is
   open. A node that lives in a single topic draws NOTHING, which is what makes the mark
   worth reading when it is there.

   `at` is the node you are looking from. When that is the node itself there is no
   "other", so it counts every topic instead — and then one topic is not news, and it
   still draws nothing. */
export function mark(id, at, pick){
	const here = at === id ? null : store.root(at);
	const others = store.also(id).filter(topic => topic !== here);

	if (others.length < (here ? 1 : 2)) return null;

	let $slot, $mark;

	const flip = () => {
		if ($slot.el.firstChild){ $slot.empty(); return void $mark.text(says(others, false, here)); }
		$slot.empty(() => { new ImpAlso({ id, topics: others, pick }); });
		$mark.text(says(others, true, here));
	};

	$mark = tap(span, "imp-mark", says(others, false, here), flip)
		.attr("title", "the other topics this same node is reached from");

	$slot = div.c("imp-slot imp-also-slot");

	return $mark;
}

/* ONE OTHER TOPIC IS NAMED, not counted — the name is shorter than "1 other topic" and
   says infinitely more. Two or more becomes a number, because three titles on one line
   stops being a mark and starts being the list the mark opens. */
function says(others, open, here){
	const list = others.length + (here ? " other " : " ") + (others.length === 1 ? "topic" : "topics");

	if (open) return "Hide the " + list;
	if (!here) return "used in " + list;

	return others.length === 1 ? "also in " + (store.node(others[0])?.text ?? others[0]) : "also in " + list;
}

/* WHERE ELSE THIS IS USED — one row per other topic: its name, which takes you there,
   and what this node hangs off over there. That second half is the proof: the same id
   qualifying a different question is one node doing two jobs, not two copies of the
   same words that will drift apart. */
export class ImpAlso extends View {

	render(){
		this.topics.forEach(topic => {
			div.c("imp-also-row", () => {
				glyph(store.node(topic));
				tap(span, "imp-name", store.node(topic)?.text ?? topic, () => this.pick?.(topic));

				const how = this.how(topic);
				if (how) span.c("imp-count muted", how);
			});
		});
	}

	// Empty when this node hangs straight off the topic — the name beside it already
	// said that, and a line repeating it is a line to read twice.
	how(topic){
		return store.up(this.id)
			.filter(parent => parent !== topic && store.root(parent) === topic)
			.map(parent => this.joined(parent))
			.join(" · ");
	}

	joined(parent){
		const edge = store.edges.find(e => (e.src === parent && e.dst === this.id) || (e.src === this.id && e.dst === parent));
		return (edge?.rel ?? "under") + " “" + (store.node(parent)?.text ?? parent) + "”";
	}
}

/* A caveat or a piece of evidence, drawn ATTACHED to whatever it qualifies — never on a
   rank line of its own, because it is not competing with the questions, it is qualifying
   one of them. The same row whether it hangs off the context or off a child. */
export function attachment(edge, context, pick){
	const node = store.node(edge.src);
	const row = store.rank([edge.src], context)[0];

	div.c("imp-attach", () => {
		glyph(node);
		tap(span, "imp-name", node?.text ?? edge.src, () => pick?.(edge.src));
		// ⚠ `edge.rel` IS A VERB WITH NOTHING TO ACT ON. Printed alone ("qualifies") it
		//   reads as a state the caveat is in, not a description of how it hangs off
		//   the rank above it — "the answer above" is the object it always needed
		//   (self-evident-critique-3, finding 4).
		span.c("imp-count muted", edge.rel + " the answer above · " + confidence(row));

		// THE CAVEAT THAT IS IN TWO TOPICS SAYS SO HERE — the one place the car example
		// could never show it, because the car example had one topic.
		mark(edge.src, context, pick);
	});
}

// ════ THE RANKED LIST ═════════════════════════════════════════════════════════
// args: { context, pick(id), }
export class ImpRank extends View {

	render(){
		const ids = store.children(this.context);

		if (!ids.length) return void p.c("muted", "Nothing hangs off this one yet — add the first question or option below.");

		store.rank(ids, this.context).forEach((row, i) => { this.row(row, i + 1); });
	}

	row(row, place){
		div.c("imp-row", () => {
			let $slot, $why;

			// ONE CONTROL, TWO SURFACES, ONE LABEL. The rank numeral opens the judgments
			// — the owner's "click a rank to see them" — and so does the labelled toggle
			// under the bar, which is the one that SAYS so; `flip()` is shared, so the
			// toggle's label can never disagree with what is open.
			const flip = () => { $why?.text(this.label(row, this.trace(row, $slot))); };

			if (row.ranked) tap(div, "imp-place", () => { span.c("imp-number", String(place)); }, flip)
				.attr("title", "the judgments behind this rank");
			else div.c("imp-place", () => { span.c("imp-number", "—"); });

			div.c("imp-main", () => {
				tap(span, "imp-name", row.node?.text ?? row.id, () => this.pick?.(row.id));
				this.bar(row);

				// The two things you can open about a row, on one strip: the judgments
				// behind its rank, and the other topics it is reached from. Either can
				// be absent — an unranked row has no judgments, and most rows live in
				// one topic — so the strip hides itself when both are.
				div.c("imp-toggles", () => {
					if (row.ranked) $why = tap(span, "imp-why", this.label(row, false), flip);
					mark(row.id, this.context, this.pick);
				});

				// ⚠ THE ROWS OPEN DIRECTLY UNDER THE CONTROL THAT OPENED THEM, above the
				//   caveats hanging off this rank. Drawn after them they printed 78px below
				//   a caveat's own line and read as that caveat's record, not this rank's
				//   (round two, finding 9).
				$slot = div.c("imp-slot");
				store.attached(row.id).forEach(edge => { attachment(edge, this.context, this.pick); });
			});
		});
	}

	// The label IS the explanation: what pressing it does, and how many rows that is.
	label(row, open){ return (open ? "Hide the " : "Why? Show the ") + row.games + (row.games === 1 ? " judgment" : " judgments"); }

	// Open, or closed again — one row's rows, in the row's own box. It answers with
	// the state it left behind, which is what the toggle above prints.
	trace(row, $slot){
		if ($slot.el.firstChild){ $slot.empty(); return false; }

		$slot.empty(() => { new ImpTrace({ context: this.context, id: row.id }); });
		return true;
	}

	// An unranked node gets NO BAR at all — an empty meter reads as "zero", and zero is
	// a real score somebody earned by losing. Nothing is not zero.
	bar(row){
		div.c("imp-bar", () => {
			if (row.ranked) div.c("imp-meter", () => { div.c("imp-fill").style("width", Math.round(row.score * 100) + "%"); });
			span.c("imp-count muted", confidence(row));
		});
	}

}

// ════ THE TRACE — why is this one first? ══════════════════════════════════════
export class ImpTrace extends View {

	render(){
		const rows = store.behind(this.context, this.id);

		if (!rows.length) return void p.c("muted", "No judgment has touched this one yet — that is what “unranked” means.");

		rows.forEach(j => {
			div.c("imp-trace-row", () => {
				span.c("imp-trace-win", store.won(j) === this.id ? "won" : "lost").ac(store.won(j) === this.id ? "imp-won" : "imp-lost");
				span("over " + this.other(j));
				span.c("muted", " · " + j.judge + this.counts(j));
				if (j.reason) span.c("imp-trace-why muted", " · “" + j.reason + "”");
			});
		});
	}

	/* ⚠ "weight 1" WAS A WORD NOTHING ON THE SCREEN EXPLAINED (round two, finding 9).
	     One is the default and says nothing, so it says nothing; a judge whose weight was
	     changed is the interesting case, and that one is said in words. doc/scoring.md. */
	counts(j){
		if (j.weight === 1) return "";
		return j.weight ? " · counts " + j.weight + "×" : " · not counted";
	}

	other(j){
		const id = j.a === this.id ? j.b : j.a;
		return store.node(id)?.text ?? id;
	}
}

// ════ PROPOSE ═════════════════════════════════════════════════════════════════
// args: { context, added(node), }
export class ImpPropose extends View {

	render(){
		details.c("imp-add", () => {
			summary("Propose a question, option or caveat");

			// ⚠ EVERY FIELD SAYS WHAT IT IS. A box holding the word "you" is a value, not
			//   a label, and a reader who has not read the docs cannot tell which of the
			//   two it is — the same miss the judge screen's name field made.
			div.c("imp-form", () => {
				span.c("imp-says muted", "add a");

				this.$kind = select.c("imp-kind", () => {
					KINDS.filter(k => k !== "topic").forEach(k => { option(k).attr("value", k); });
				});

				this.$text = input.c("imp-text").attr("placeholder", "What should be asked, answered or qualified here?");

				span.c("imp-says muted", "proposed by");
				this.$author = input.c("imp-who").attr("value", "you").attr("title", "the human or bot proposing this");

				button.c("btn imp-go", "Add").on("click", () => { this.add(); });
				this.$says = span.c("imp-says muted", store.writable() ? "" : "Read-only — there is no dev socket here, so nothing can be appended.");
			});
		});
	}

	async add(){
		const kind = this.$kind.el.value;
		const text = this.$text.el.value;

		this.$says.text("appending…");

		try {
			// The new row reaches the ranked list off the wire, like everyone else's — so
			// this form is NOT rebuilt, and what you typed and who you are stay put.
			const node = await store.propose({ kind, text, author: this.$author.el.value.trim() || "you", context: this.context });
			this.$text.el.value = "";
			this.$says.text("added — " + node.id + " is unranked, and judge/ will show it first");
		} catch (e){
			this.$says.text(String(e.message || e));
		}
	}
}

// ════ WHICH MATTERS MORE? ═════════════════════════════════════════════════════
// args: { context, judged(row), } — binds the keyboard itself; the page unbinds it.
export class ImpPair extends View {

	render(){
		this.pair = store.pair(this.context);

		if (!this.pair) return void p.c("muted", "There are not two things here yet to compare. Add one from the context view.");

		/* ⚠ THE QUESTION IS THE COLUMN'S OWN TITLE, printed by core one line above this
		   — so this screen does not ask it a second time in its own voice. What the head
		   cannot say is the gesture, and that is the line that stays. (Round two, finding
		   10: this column was saying three things twice.) */
		p.c("imp-how", "Click the one that matters more, or press its key — both scores appear after you pick.");

		this.$choices = div.c("imp-choices", () => { this.both(); });

		// Empty until a pick of mine comes back. It is OUTSIDE `$choices` because
		// another window judging rebuilds those two cards and must not touch this.
		this.$after = div.c("imp-after");

		this.controls();
		this.bind();
	}

	both(){
		this.choice(this.pair.a, "1", "←", "a");
		this.choice(this.pair.b, "2", "→", "b");
	}

	/* SOMEBODY ELSE JUDGED, off the wire. The two items STAY — nothing moves under your
	   hand, and judging the pair another window just judged is two rows, which is the
	   point — but their scores and counts are re-read and the tally line is rewritten.

	   ⚠ ONLY `$choices` and `$says`. The reason field and the judge field are CONTROLS:
	     rebuilt under a caret they lose the caret and whatever was half-typed into them
	     (/imagine/stream/readme.md, "never redraw a control from state"). */
	restream(){
		if (!this.pair || !this.el.isConnected) return this;

		const fresh = store.rank([this.pair.a.id, this.pair.b.id], this.context);
		this.pair = { a: fresh.find(r => r.id === this.pair.a.id), b: fresh.find(r => r.id === this.pair.b.id) };

		this.$choices?.empty(() => { this.both(); });
		this.$says?.text(this.tally());

		return this;
	}

	tally(){ return store.rows(this.context).length + " judgments in this context so far"; }

	/* ⚠ NO SCORE BEFORE THE PICK. A pair that arrives carrying "100% of 3 judgments"
	     against "0% of 1 judgment" has printed the answer on the question it is
	     asking, and the next judgment is the last one repeated. Both scores arrive
	     the moment the pick is in — which is the reward, and the first place the
	     numbers help rather than lead. */
	choice(row, number, arrow, side){
		const done = !!this.picked;
		const won = this.picked === side;

		tap(div, "imp-choice imp-choice-" + side + (won ? " imp-choice-won" : ""), () => {
			// ⚠ THE KIND WORD, beside the glyph — the only thing on this card that used
			//   to say "question" or "caveat" was an untitled icon (self-evident-
			//   critique-3, finding 3). The same one-word tag the ranked view already
			//   wears for TOPIC (`page.js`).
			div.c("imp-choice-kind", () => { glyph(row.node); span.c("imp-tag", row.node?.kind); });
			span.c("imp-choice-text", row.node?.text ?? row.id);

			if (done) span.c("imp-count muted", confidence(row));
			if (won) span.c("imp-tag", "you picked this");

			// THE CARD IS THE BUTTON, and this is the part that says so - a labelled
			// strip at its foot carrying the two keys that do the same thing.
			if (!done) span.c("imp-pick", () => { span("Pick this one"); kbd(number); kbd(arrow); });
		}, () => { this.pick(side); });
	}

	/* THE RESULT, AND IT STAYS ON SCREEN. My own judgment came back off the wire:
	   the two cards keep their places and now carry the scores it just changed, the
	   one I picked is marked, and the next pair waits behind a control I press. A
	   screen that swapped both items by itself is a click whose consequence nobody
	   can see — and it is where the old screen spent its scores. */
	reveal(){
		if (!this.pair) return this;

		this.restream();

		this.$after?.empty(() => {
			button.c("btn prim", "Next two").on("click", () => { this.next?.(); });
			span.c("imp-says muted", "or press Enter");
		});

		return this;
	}

	controls(){
		div.c("imp-controls", () => {
			// ⚠ THE OPPOSITE RULE FROM `$judge` BELOW, SAID FOR THE SAME REASON: the name
			//   box's title says its key rule, this box carried none (self-evident-
			//   critique-3, finding 6).
			this.$reason = input.c("imp-reason").attr("placeholder", "why? (optional, one line)")
				.attr("title", "why the pick was made — 1, 2 and the arrows are just text in here, they never judge");
			span.c("imp-says muted", "judging as");
			this.$judge = input.c("imp-who").attr("value", "you")
				.attr("title", "the human or bot judging — 1, 2 and the arrows judge from in here, they are never typed");
			this.$says = span.c("imp-says muted", store.writable()
				? this.tally()
				: "Read-only — there is no dev socket here, so no judgment can be appended.");
		});
	}

	// ════ the keyboard ════
	bind(){
		this.keys ??= e => this.key(e);
		document.addEventListener("keydown", this.keys);
	}

	unbind(){ if (this.keys) document.removeEventListener("keydown", this.keys); }

	/* ⚠ A PICK KEY IS NEVER TEXT IN THE NAME BOX. The natural first move is to click
	     "judging as", type a name and press 2 — and the digit used to land IN THE NAME,
	     with nothing cast, so the next press wrote the corrupted name to the committed
	     file as the judge (round two, finding 2). 1 / 2 / ← / → judge from in there now
	     and never reach the field; the trade is that a name is typed without those two
	     digits, which the box's own title says.
	   ⚠ THE REASON BESIDE IT IS THE OPPOSITE, and deliberately so: it is a line of
	     prose, "a bent frame is 2 grand" is a reason somebody will type, and a judgment
	     is APPEND-ONLY — a key that cast one halfway through a sentence would write a
	     row nothing can take back. There the digit is text, as it reads.
	   ⚠ MY OWN box, not "a field is focused": the propose form in the column next door
	     shares this document, and everything typed into it is text. */
	key(e){
		if (!this.el.isConnected) return this.unbind();

		const side = PICKS[e.key];
		const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName);

		if (typing && !(this.naming(e.target) && (side || e.key === "Enter"))) return;

		// The pick is in and the screen is showing the result: the two keys that
		// judged are spent, and the only thing left is to ask for the next two.
		if (this.picked){
			// Spent — and still never text: a second press of 2 with the caret still in the
			// name box would otherwise type the digit the first press swallowed, and the
			// NEXT judgment would carry the corrupted name.
			if (side && typing) return void e.preventDefault();
			if (e.key !== "Enter" && e.key !== " ") return;
			e.preventDefault();
			return void this.next?.();
		}

		if (!side) return;

		e.preventDefault();
		this.pick(side);
	}

	// The one box a judgment is cast FROM rather than typed into.
	naming(el){ return el === this.$judge?.el; }

	async pick(side){
		if (this.busy || this.picked) return;
		this.busy = true;
		this.$says.text("appending…");

		const { a, b } = this.pair;

		try {
			const row = await store.judge({
				context: this.context, a: a.id, b: b.id,
				winner: side === "a" ? a.id : b.id,
				judge: this.$judge.el.value.trim() || "you",
				reason: this.$reason.el.value.trim(),
			});

			// Set BEFORE `judged`, which is what arms the page to call `reveal()`.
			this.picked = side;
			this.judged?.(row);
		} catch (e){
			this.busy = false;
			this.$says.text(String(e.message || e));
		}
	}
}
