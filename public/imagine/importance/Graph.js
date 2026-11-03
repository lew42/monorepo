/* THE TYPED GRAPH, WITH NO IO AT ALL — three collections, the edges that join them, and
   the one place a score is invented.

   It imports nothing, so both writers can have it: the browser's `Store` (importance.js,
   fetch + the dev socket) and the command line's `FileStore` (importance.mjs, fs). They
   differ in exactly two methods, `load()` and `append()`, which is why those two are the
   only ones missing here. Everything a rank depends on is therefore the SAME CODE for a
   person clicking and a bot typing — there is no second formula to drift.

     node   {id, kind, text, author, created}
     edge   {src, rel, dst}
     judge  {id, context, a, b, winner, judge, weight, created, goal, reason}  append-only */

export const KINDS = ["topic", "question", "option", "caveat", "evidence"];
export const RELS = ["asks", "answers", "qualifies", "supports", "refutes", "depends_on"];

// The two directions a context reads. DOWN: the context asks/answers/depends_on its
// children. UP: a caveat or a piece of evidence points AT the thing it qualifies, so it
// is found by `dst`. This is what lets one caveat be reused under many topics.
export const DOWN = ["asks", "answers", "depends_on"];
export const UP = ["qualifies", "supports", "refutes"];

// What kind of edge a newly proposed node hangs off the context by.
export const REL_FOR = { question: "asks", option: "answers", caveat: "qualifies", evidence: "supports", topic: "asks" };

export class Graph {

	constructor(...args){ this.assign(...args); this.reset(); }
	assign(...args){ return Object.assign(this, ...args); }

	reset(){
		this.nodes = new Map();
		this.edges = [];
		this.judgments = [];
		return this;
	}

	// ⚠ SUBCLASSES SUPPLY THESE TWO, and nothing else.
	load(){ throw new Error("Graph.load() — a subclass reads the three collections"); }
	append(_kind, _row){ throw new Error("Graph.append() — a subclass writes one line"); }

	// The appended row joins the in-memory collections, so the next screen is already
	// right without a re-read. A reload replays the same line from the file.
	take(kind, row){
		if (kind === "node") this.nodes.set(row.id, row);
		if (kind === "edge") this.edges.push(row);
		if (kind === "judgment") this.judgments.push(row);
		return row;
	}

	// One shard per month, named by it. `shard()` with no argument is today's.
	shard(at = new Date()){ return "judgments/" + this.month(at) + ".jsonl"; }
	month(at){ return at.toISOString().slice(0, 7); }
	file(kind){ return kind === "judgment" ? this.shard() : kind + "s.jsonl"; }

	id(prefix){ return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
	now(){ return new Date().toISOString(); }

	parse(text){
		return String(text ?? "").split("\n")
			.map(line => line.trim()).filter(Boolean)
			.map(line => { try { return JSON.parse(line); } catch { return null; } })
			.filter(Boolean);
	}

	// ════ WRITING — the two things anyone, human or bot, can do ═══════════════

	/* A proposal is TWO lines: the node, then the edge that hangs it off the context.
	   A caveat or a piece of evidence points AT the context, so its edge is reversed. */
	async propose({ kind, text, author, context }){
		if (!KINDS.includes(kind)) throw new Error(`"${kind}" is not one of ${KINDS.join(", ")}`);
		if (!String(text ?? "").trim()) throw new Error("a node needs text");
		if (kind !== "topic" && !this.node(context)) throw new Error(`there is no node "${context}" to hang this off`);

		const node = { id: this.id(kind[0]), kind, text: String(text).trim(), author: author || "you", created: this.now() };
		await this.append("node", node);

		if (kind === "topic") return node;

		const rel = REL_FOR[kind];
		await this.append("edge", UP.includes(rel) ? { src: node.id, rel, dst: context } : { src: context, rel, dst: node.id });

		return node;
	}

	/* JOIN A NODE THAT ALREADY EXISTS TO A SECOND PLACE — the one write `propose()` cannot
	   do, because `propose()` always mints a new node. Reuse across topics is exactly this
	   line and nothing else: the same caveat id, a second `qualifies` edge, a question in
	   another topic. Refuses a duplicate, so running the seed twice adds nothing. */
	async link({ src, rel, dst }){
		if (!RELS.includes(rel)) throw new Error(`"${rel}" is not one of ${RELS.join(", ")}`);

		for (const [name, id] of [["src", src], ["dst", dst]])
			if (!this.node(id)) throw new Error(`${name}: there is no node "${id}"`);

		if (this.edges.some(e => e.src === src && e.rel === rel && e.dst === dst))
			throw new Error(`${src} already ${rel} ${dst}`);

		return this.append("edge", { src, rel, dst });
	}

	/* One answer to "in `context`, which matters more: `a` or `b`?".
	   `goal` and `reason` are written from day one — empty, but never absent, because the
	   owner named retrofitting `goal` as the painful case. */
	async judge({ context, a, b, winner, judge, weight = 1, goal = "", reason = "" }){
		for (const [name, id] of [["context", context], ["a", a], ["b", b]])
			if (!this.node(id)) throw new Error(`${name}: there is no node "${id}"`);

		if (winner !== a && winner !== b) throw new Error(`the winner must be "${a}" or "${b}"`);

		return this.append("judgment", {
			id: this.id("j"), context, a, b, winner,
			judge: judge || "you", weight: Number(weight), created: this.now(), goal, reason,
		});
	}

	// ════ THE GRAPH ═══════════════════════════════════════════════════════════

	node(id){ return this.nodes.get(id); }

	// The way in: a context view with no `?at=` opens on the first topic in the file.
	topics(){ return [...this.nodes.values()].filter(n => n.kind === "topic"); }

	// The things ranked BENEATH a context.
	children(id){ return this.edges.filter(e => e.src === id && DOWN.includes(e.rel)).map(e => e.dst); }

	// The caveats and evidence pointing AT one node — drawn attached to it, never on a
	// rank line of its own.
	attached(id){ return this.edges.filter(e => e.dst === id && UP.includes(e.rel)); }

	/* Whatever this node hangs off — the trail back up to its topic, and it has to read
	   BOTH directions or a whole kind of node is a dead end. A question hangs DOWNWARD
	   (`car asks q1`), so its parent is the edge's `src`; a caveat hangs UPWARD
	   (`c1 qualifies q1`) — it points AT what it qualifies — so its parent is the edge's
	   `dst`. Following only the downward half left every caveat page with no way back
	   but the browser's own button. */
	up(id){
		return [
			...this.edges.filter(e => e.dst === id && DOWN.includes(e.rel)).map(e => e.src),
			...this.edges.filter(e => e.src === id && UP.includes(e.rel)).map(e => e.dst),
		];
	}

	/* THE TOPIC AT THE ROOT OF A CONTEXT — climb `up()` until one. A context is 2–3 hops
	   deep by the owner's own caveat, and the `seen` list is the same stop the trail
	   carries: two nodes that qualify each other would otherwise climb forever. */
	root(id){
		for (let at = id, seen = []; at && !seen.includes(at); at = this.up(at)[0]){
			if (this.node(at)?.kind === "topic") return at;
			seen.push(at);
		}
		return null;
	}

	/* WHERE ELSE IS THIS USED? Every topic this node is reached from. One caveat joined
	   by two edges — `c1 qualifies q1` under one topic, `c1 qualifies q5` under another —
	   is ONE node in two places, never a copy, and this is the method that can see it.
	   A node hung under a single topic answers with that one topic, so the screen that
	   asks "what else?" draws nothing. Reuse is exactly why edges exist. */
	also(id){ return [...new Set(this.up(id).map(parent => this.root(parent)).filter(Boolean))]; }

	/* Everything you can SEE from a context, and therefore everything judgeable in it:
	   its children, whatever qualifies the context itself, and whatever qualifies one of
	   its children. That last term is what puts the Carfax caveat in the car contest. */
	items(id){
		const kids = this.children(id);
		return [...new Set([
			...kids,
			...this.attached(id).map(e => e.src),
			...kids.flatMap(kid => this.attached(kid).map(e => e.src)),
		])];
	}

	// ════ SCORES — derived on every read, never stored ════════════════════════

	rows(context){ return this.judgments.filter(j => j.context === context && !j.retracted); }

	/* ⚠ The owner's worked example writes the WINNER AS A NODE ID (`car q1 q2 q1 alice`)
	     while the schema table says "a or b". Both are read; the node id is what is written. */
	won(j){ return j.winner === "a" ? j.a : j.winner === "b" ? j.b : j.winner; }

	// wins, games and the summed weights per node. The counts are the uncertainty, and
	// they travel with the score everywhere, so no screen can show a rank without one.
	tallies(context){
		const out = new Map();
		const of = id => out.get(id) ?? out.set(id, { id, games: 0, wins: 0, weight: 0, won: 0 }).get(id);

		for (const j of this.rows(context)){
			const weight = Number(j.weight ?? 1);
			const winner = this.won(j);

			for (const id of [j.a, j.b]){
				const t = of(id);
				t.games++;
				t.weight += weight;
				if (id === winner){ t.wins++; t.won += weight; }
			}
		}

		return out;
	}

	/* THE SWAPPABLE FORMULA, and the only place a number is invented. Today it is the
	   weighted win rate. Elo or Bradley–Terry is this method plus the raw rows, which is
	   why they are handed in — neither needs a column added to any of the three files.
	   doc/scoring.md walks both. */
	score(tally, _rows){ return tally.weight ? tally.won / tally.weight : 0; }

	// A line per id: the node, its score, and how much is behind it. Judged first and
	// best first; anything with no judgments at all sorts last, as `unranked`.
	rank(ids, context){
		const tallies = this.tallies(context);
		const rows = this.rows(context);

		return ids.map(id => {
			const tally = tallies.get(id) ?? { id, games: 0, wins: 0, weight: 0, won: 0 };
			return { ...tally, node: this.node(id), ranked: tally.games > 0, score: this.score(tally, rows) };
		}).sort((x, y) => (y.ranked - x.ranked) || (y.score - x.score) || (y.games - x.games));
	}

	// Every row that touched one node in one context — the trace behind a rank.
	behind(context, id){ return this.rows(context).filter(j => j.a === id || j.b === id); }

	seen(context, a, b){ return this.rows(context).filter(j => (j.a === a && j.b === b) || (j.a === b && j.b === a)).length; }

	/* THE PAIR THAT TEACHES THE SYSTEM THE MOST — lowest cost wins, and every term is a
	   kind of certainty we would rather not have: already asked, already judged, far
	   apart. A brand-new item therefore comes up first, which is the cold-start answer
	   falling out of the numbers instead of needing a rule of its own. */
	pair(context){
		const ids = this.items(context);
		if (ids.length < 2) return null;

		const ranked = new Map(this.rank(ids, context).map(r => [r.id, r]));
		let best = null;

		for (let i = 0; i < ids.length; i++) for (let k = i + 1; k < ids.length; k++){
			const a = ranked.get(ids[i]), b = ranked.get(ids[k]);
			const cost = this.seen(context, a.id, b.id) * 10 + (a.games + b.games) + Math.abs(a.score - b.score) * 5;
			if (!best || cost < best.cost) best = { a, b, cost };
		}

		return best;
	}
}
