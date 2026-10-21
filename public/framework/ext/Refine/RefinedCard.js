/**
 * class RefinedCard — one owner prompt, refined by one Haiku call: structured prompt → refined prompt → asks.
 * DOM-free and import-free, so the node queue (`Server/RefineQueue.mjs`) writes it and the session page's
 * Coverage tab (`ai/AISession/AISessionCoverage.js`) reads it with the same code. Doc: `doc/refine-queue.md`.
 *
 *   RefinedCard.sentences(raw)                 // the raw prompt's sentences, numbered from 1: the same split everywhere
 *   RefinedCard.prompt(raw, version)           // the whole user turn sent to Haiku (numbered sentences)
 *   RefinedCard.BRIEF[version]                 // the system prompt (the refine essentials, under 3k tokens)
 *   RefinedCard.parse(answer)                  // Haiku's JSON → { subject, structured, refined, asks, specifics } or throws
 *   RefinedCard.item({ ref, parsed, ... })     // the page item the queue writes with page_add
 *   RefinedCard.score(cards, outcomes)         // coverage: asks with a verdict ÷ asks found
 */
export default class RefinedCard {

	static TYPE = "refined";

	/** Owner text without the IDE's own tags (an opened file, a selection), which are not words the owner said. */
	static strip(raw){
		return String(raw ?? "").replace(/<(ide_[a-z_]+|system-reminder)>[\s\S]*?<\/\1>/g, "").trim();
	}

	/** Mechanical sentence split (engine.js's own raw split): S1 is index 0. A cite `[3]` means sentence 3. */
	static sentences(raw){
		return RefinedCard.strip(raw).replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
	}

	/** Where the raw prompt lives: the session's own SDK transcript, served local-only by the dev server (Server/plugins/AILogs.js). */
	static raw_link(session, line){ return `/ai-logs/${session}#${line}`; }

	/** The click-through a person uses: the session page, Coverage tab, this prompt opened. */
	static page_link(session, line){ return `/framework/ai/sessions/${session}/?tab=coverage#p${line}`; }

	static SHAPE = `Answer with ONE JSON object and nothing else (no code fence):
{
  "subject": "the prompt's one subject, in a few of the owner's words",
  SPECIFICS
  "structured": "markdown: the prompt reorganised, nothing dropped. '## ' + an emoji per part, '- ' bullets in the owner's key words, each bullet ending with the sentence numbers it came from, like [3, 7]",
  "refined": "the essence in 2 to 6 plain sentences: what the owner wants, condensed",
  "asks": [ { "text": "one ask, one line, its action baked in", "cites": [3, 7], "key": "3 to 6 words naming the thing asked for", "module": "the site module or system it concerns (e.g. ai/sessions, ext/Refine, Servex, core/Page, Figma), or 'site' if it is site-wide", "kind": "build | fix | rule | question | idea" } ]
}`;

	static ESSENTIALS = `You refine ONE prompt the owner of a web-framework repo dictated or typed to an AI coding agent. Dictation rambles, repeats and circles back; your job is to keep everything it asks and lose only the noise.

Rules:
- An ASK is anything the owner wants done, changed, kept, checked, answered, or decided, including a preference or rule for how agents work ("always X", "never Y"). A side remark with no want in it is not an ask.
- One ask per distinct want. Two wants in one sentence are two asks. The same want said three times is one ask citing all three sentences.
- Keep the owner's own names for things (pages, classes, tools, models, numbers). Never generalise a specific ("Haiku under 100K tokens") into a vague one ("use a cheap model").
- Hedged words stay hedged: "maybe", "I'm not sure", "might" become an open question or an idea, never a must.
- Cite the numbered sentences each bullet and ask came from. Every sentence that carries a want must be cited by at least one ask.
- Pleasantries, filler, and narration of what the owner is looking at are dropped; nothing else is.`;

	static SPECIFICS = `"specifics": ["FIRST, before condensing anything: every specific suggestion, named thing, number, example and constraint in the prompt, one short line each, in the order said"],`;

	/** v2's additions: the ways v1 went wrong in the 10-product review (doc/refine-queue.md, "Review"). */
	static V2_RULES = `- Work in order: list every specific first (the "specifics" field), then write the asks so each specific lands in an ask or is plainly not a want.
- A self-correction wins: "add it to X, oh well, probably Y" asks for Y.
- What the owner describes seeing ("the costs go back three days", "it seems laggy") is evidence for an ask, never an ask of its own.
- When the owner restates the agent's idea and pushes back, the ask is the pushback, not the idea.
- Name the exact thing: "our own name for this tab" said about a chat tab means that chat tab, not a page that lists tabs.`;

	/** v3: every item is a task, a question or a statement, in the prompt's order. Matching to filed tasks/docs is code (`match`), not the model. */
	static V3_SHAPE = `Answer with ONE JSON object and nothing else (no code fence):
{
  "subject": "the prompt's one subject, in a few of the owner's words",
  "items": [ { "type": "task | question | statement", "text": "one line, the owner's own names", "cites": [3, 7], "target": "the thing it concerns as a mention: a site path like /framework/ai/sessions/ or a class like #RefinedCard, or 'site'", "details": ["for a task only: its suggestions, constraints and examples, one short line each"] } ]
}`;

	static V3_RULES = `Sort EVERYTHING the owner said that matters into items, in the order said, close to one item per sentence that carries a want:
- task: anything clearly asked to happen (build, fix, change, check, keep, stop, "always X", "never Y"). The suggestions, constraints, numbers and examples that belong to it go in its "details", not as separate items.
- question: something the owner wants answered or explained; it belongs in that module's FAQ.
- statement: an architectural decision, principle or fact the owner states that belongs in a module doc.
A sentence that only narrates what the owner is looking at, or is a pleasantry, is not an item. Hedged ("maybe", "I'm not sure") is a question or a statement, never a task. A self-correction wins. When the owner pushes back on the agent's idea, the item is the pushback. Every sentence that carries a want is cited by at least one item.`;

	/** The system prompt per brief version. v1: the essentials. v2: the same, plus list every specific first. v3: typed items (task|question|statement). */
	static BRIEF = {
		v1: RefinedCard.ESSENTIALS + "\n\n" + RefinedCard.SHAPE.replace("  SPECIFICS\n", ""),
		v2: RefinedCard.ESSENTIALS + "\n" + RefinedCard.V2_RULES + "\n\n" + RefinedCard.SHAPE.replace("SPECIFICS", RefinedCard.SPECIFICS),
		v3: `You sort ONE prompt the owner of a web-framework repo dictated to an AI coding agent. Dictation rambles, repeats and circles back; keep every want, lose only the noise. Keep the owner's own names (pages, classes, tools, numbers); never generalise a specific.\n\n` + RefinedCard.V3_RULES + "\n\n" + RefinedCard.V3_SHAPE,
	};

	/** v3 only: the filed task (or answering doc) each item matches, computed from the task titles, never remembered by the model.
	 *  `filed` = [{ title, url }]. Adds `match`: the best filed task's url, or null = "not filed". Questions/statements keep null until a doc index exists. */
	static match(items, filed){
		return items.map(it => {
			if (it.type !== "task") return { ...it, match: null };
			const words = RefinedCard.words(it.text + " " + it.target);
			let best = null, most = 1;
			for (const f of filed){ const n = RefinedCard.shared(words, RefinedCard.words(f.title)); if (n > most){ best = f; most = n; } }
			return { ...it, match: best?.url ?? null };
		});
	}

	static prompt(raw, version = "v2"){
		const s = RefinedCard.sentences(raw);
		return `The prompt, one numbered sentence per line:\n\n${s.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nRefine it now, as the JSON object.`;
	}

	/** Haiku's answer → the parsed card fields. Tolerates a code fence or text around the object; throws when there is no usable object. */
	static parse(answer){
		const text = String(answer ?? "");
		const start = text.indexOf("{"), end = text.lastIndexOf("}");
		if (start < 0 || end < start) throw new Error("no JSON object in the answer");
		const o = JSON.parse(text.slice(start, end + 1));
		if (Array.isArray(o.items) && !Array.isArray(o.asks)){   // brief v3: items → asks (kind = type) so the card machinery is unchanged
			const items = o.items.filter(a => a && typeof a.text === "string" && a.text.trim()).map(a => ({ type: String(a.type ?? "task"), text: a.text.trim(),
				cites: (Array.isArray(a.cites) ? a.cites : []).map(Number).filter(n => Number.isInteger(n) && n > 0), target: String(a.target ?? ""), details: (a.details ?? []).map(String) }));
			o.asks = items.map(i => ({ text: i.text, cites: i.cites, key: i.target, module: i.target, kind: i.type }));
			o.v3items = items;
		}
		if (!Array.isArray(o.asks)) throw new Error("answer has no asks list");
		const asks = o.asks.filter(a => a && typeof a.text === "string" && a.text.trim()).map((a, i) => ({
			id: "a" + (i + 1), text: a.text.trim(),
			cites: (Array.isArray(a.cites) ? a.cites : []).map(Number).filter(n => Number.isInteger(n) && n > 0),
			key: String(a.key ?? "").trim(), module: String(a.module ?? "").trim(), kind: String(a.kind ?? "").trim(),
		}));
		return { subject: String(o.subject ?? "").trim(), structured: String(o.structured ?? "").trim(), refined: String(o.refined ?? "").trim(),
			asks, ...(o.v3items ? { items: o.v3items } : {}), ...(Array.isArray(o.specifics) ? { specifics: o.specifics.map(String) } : {}) };
	}

	/** Sentences no ask cites: the mechanical half of a dropped-detail check (a sentence can be uncited and still be noise). */
	static uncited(parsed, count){
		const cited = new Set(parsed.asks.flatMap(a => a.cites));
		return Array.from({ length: count }, (_, i) => i + 1).filter(n => !cited.has(n));
	}

	/** The page item: `ref` = { session, line, at }. The raw text is NOT copied in: `raw` is a link and `sentences` a count. */
	static item({ ref, parsed, count, brief, model, usd, tokens }){
		return {
			type: RefinedCard.TYPE, id: `refined-${ref.line}`,
			session: ref.session, line: ref.line, at: ref.at, raw: RefinedCard.raw_link(ref.session, ref.line), sentences: count,
			subject: parsed.subject, structured: parsed.structured, refined: parsed.refined, asks: parsed.asks,
			uncited: RefinedCard.uncited(parsed, count), brief, model, usd, tokens,
		};
	}

	/** Every refined card in a page log's lines, later writes replacing earlier ones (a rerun of the same prompt wins). */
	static from_lines(lines){
		const cards = new Map();
		for (const l of lines ?? []){
			const add = l?.content?.add;
			if (add?.type === RefinedCard.TYPE && add.id) cards.set(add.id, add);
		}
		return [...cards.values()].sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
	}

	/** One verdict per ask, from the asks-outcomes lines (prompt-outcomes' tally) matched on session + transcript line, else "unreviewed". */
	static STATUSES = ["done", "partly", "not done", "open", "unreviewed"];
	static status_of(ask, card, outcomes){
		const here = outcomes?.get?.(`${String(card.session).slice(0, 8)}:${card.line}`) ?? [];
		// The tally's own asks for this prompt: the one sharing the most content words (at least 2) with this ask.
		const mine = RefinedCard.words(ask.text + " " + ask.key);
		let best = null, most = 1;
		for (const o of here){ const n = RefinedCard.shared(mine, RefinedCard.words(o.ask + " " + o.feature)); if (o.status && n > most){ best = o; most = n; } }
		// Else a feature the tally judged whose name (2+ content words) is wholly inside this ask's key and text.
		best ??= outcomes?.features?.find(f => { const w = RefinedCard.words(f.feature); return w.size >= 2 && RefinedCard.shared(w, mine) === w.size; });
		return best ? RefinedCard.verdict(best) ?? "unreviewed" : "unreviewed";
	}

	static words(t){ return new Set(String(t ?? "").toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(x => !RefinedCard.STOP.has(x)) ?? []); }
	static shared(A, B){ let n = 0; for (const x of A) if (B.has(x)) n++; return n; }

	/** A tally line's verdict as one of STATUSES ("contradicted" reads as open); null when it carries none. */
	static verdict(o){
		for (const v of [o?.status, o?.verdict, o?.state, o?.outcome]){
			const s = String(v ?? "").toLowerCase().replace(/[_-]/g, " ").trim();
			if (RefinedCard.STATUSES.includes(s) && s !== "unreviewed") return s;
			if (s === "contradicted") return "open";
		}
		return null;
	}

	/** asks-outcomes.jsonl (Server/AskTally.mjs: `{"ask":{source:"<id8>:<line>", ask, raw, feature:<tag>}}`, `{"merge":{from:<tag>, to:{feature}}}`,
	 *  `{"feature":{name, status}}`) → a Map `<id8>:<line>` → [{ ask, raw, feature, status }], plus `.features` = [{ feature, status }] for matching by name. */
	static outcomes(text){
		const asks = [], tag_to = new Map(), status = new Map(), map = new Map();
		for (const line of String(text ?? "").split("\n")){
			let o; try { o = JSON.parse(line); } catch { continue; }
			if (o?.ask?.source) asks.push(o.ask);
			else if (o?.merge?.from) tag_to.set(o.merge.from, o.merge.to?.feature ?? o.merge.to);
			else if (o?.feature?.name){ const v = RefinedCard.verdict(o.feature); if (v) status.set(o.feature.name, v); }
		}
		map.features = [...status].map(([feature, s]) => ({ feature, status: s }));
		for (const a of asks){
			const hit = /([0-9a-f]{8})[0-9a-f-]*:(\d+)\s*$/.exec(String(a.source));
			if (!hit) continue;
			const feature = tag_to.get(a.feature) ?? a.feature, key = `${hit[1]}:${hit[2]}`;
			(map.get(key) ?? map.set(key, []).get(key)).push({ ask: a.ask, raw: a.raw, feature, status: status.get(feature) ?? null });
		}
		return map;
	}

	/** Two asks are the same when most of the shorter one's content words are in the other (a cheap, stated heuristic). */
	static same(a, b){
		const w = t => new Set(String(t ?? "").toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
		const A = w(a), B = w(b), small = Math.min(A.size, B.size);
		if (!small) return false;
		let n = 0; for (const x of A) if (B.has(x)) n++;
		return n / small >= 0.6;
	}

	/** Two ask keys name the same thing: at least two content words shared, and most of the LONGER key's words (stricter than same()). */
	static same_key(a, b){
		const w = t => new Set(String(t ?? "").toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(x => !RefinedCard.STOP.has(x)) ?? []);
		const A = w(a), B = w(b);
		let n = 0; for (const x of A) if (B.has(x)) n++;
		return n >= 2 && n / Math.max(A.size, B.size) >= 0.6;
	}
	static STOP = new Set(["the", "and", "for", "with", "from", "into", "per", "all", "not", "via", "own", "page", "pages", "build", "make", "use", "add", "system", "systems", "agent", "agents", "keep", "new", "set", "every", "thing", "things", "check", "whether", "when", "that", "this", "its", "have", "should", "can"]);

	/** Coverage of a session: asks found, how many have a verdict, the score (with a verdict ÷ found), counts per status. */
	static score(cards, outcomes){
		const by = Object.fromEntries(RefinedCard.STATUSES.map(s => [s, 0]));
		let found = 0;
		for (const c of cards) for (const a of c.asks ?? []){ found++; by[RefinedCard.status_of(a, c, outcomes)]++; }
		const judged = found - by.unreviewed;
		return { found, judged, score: found ? judged / found : null, by };
	}
}
