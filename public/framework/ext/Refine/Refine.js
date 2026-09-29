import { View, div, span, p, h3, ul, ol, li, table, thead, tbody, tr, th, td, select, option } from "../../core/View/View.js";

View.stylesheet(import.meta, "Refine.css");

/**
 * Refine — one run of `Server/refine.mjs` shown as a ladder: raw → clean →
 * structured → brief, side by side, with a coverage table underneath.
 *
 *     import refine from "/framework/ext/Refine/Refine.js";
 *     refine(import.meta, { run: "/framework/ai/2026-09-29/prompt-refine/runs/b/" });
 *
 * Click an ask in Brief, or a bullet in Structured, and its cited sentences
 * `[S3, S7]` light up in Clean, and the matching stretch of Raw beside it —
 * "wait, what did I actually say?" answered in one click.
 *
 * `run` is a directory URL holding raw.txt, clean.md, structured.md, brief.md,
 * coverage.md and refine.json (the exact shape `Server/refine.mjs` writes — see
 * `Server/doc/refine.md`). A run missing some of those files shows what it has
 * and says plainly what's missing, rather than breaking.
 *
 * Pass `runs` — `[{ id, label, dir }, …]` — for a picker (a `<select>` above
 * the ladder) and this view then OWNS `?run=<id>` in the url itself, the same
 * one-owner rule `ext/files` uses for `?file=`: a reload lands back on the
 * same run. Without `runs`, `run` is fixed and the url is left alone.
 *
 * Raw has no sentence numbers of its own — clean.md's numbering is layered on
 * top of near-verbatim text, so "the matching stretch in raw" is found by a
 * word-overlap match between each clean sentence and Raw's own sentences (see
 * `match_sentences` below). It is a heuristic, not a citation the tool wrote:
 * documented in `doc/raw-match.md`.
 *
 * Design record: framework/ext/Refine/readme.md.
 */
export default function refine(meta, { run, runs, route = "run" } = {}){
	const me = { born: Date.now() };
	const owns_url = () => {
		if (!runs?.length || !route) return false;
		const held = claim.me;
		if (held?.el?.isConnected) held.seen = true;
		const stale = !held || (!held.el?.isConnected && (held.seen || Date.now() - held.born > 3000));
		if (held === me || stale) claim.me = me;
		return claim.me === me;
	};

	const find_run = id => runs?.find(r => r.id === id || r.dir === id);
	const start_id = new URLSearchParams(location.search).get(route);
	const state = { run: (runs?.length && owns_url() && find_run(start_id)?.dir) || run || runs?.[0]?.dir };

	const write_url = id => {
		if (!owns_url()) return;
		const q = new URLSearchParams(location.search);
		id ? q.set(route, id) : q.delete(route);
		history.pushState(history.state, "", location.pathname + (q.size ? "?" + q : "") + location.hash);
	};

	let $state, $picker, $ladder, $coverage;
	let matchMap = new Map(); // clean sentence # -> best-matching raw segment #, recomputed by render() on every run
	const cols = {};
	const COLS = ["raw", "clean", "structured", "brief"];
	const LABEL = { raw: "Raw", clean: "Clean", structured: "Structured", brief: "Brief" };

	const $box = div.c("refine", () => {
		if (runs?.length){
			$picker = div.c("refine-picker", () => {
				span.c("refine-picker-label").text("Run: ");
				select.c("refine-picker-select", $sel => {
					runs.forEach(r => option().attr("value", r.id ?? r.dir).text(r.label ?? r.id ?? r.dir));
				}).on("change", function(){
					const r = find_run(this.el.value);
					state.run = r?.dir ?? this.el.value;
					write_url(r?.id ?? r?.dir);
					load();
				});
			});
		}

		$state = div.c("refine-state").text("Loading…");

		div.c("refine-tabs", () => {
			COLS.forEach(name => {
				span.c("refine-tab").attr("data-col", name).text(LABEL[name])
					.on("click", () => select_col(name));
			});
		});

		$ladder = div.c("refine-ladder", () => {
			COLS.forEach(name => {
				div.c("refine-col refine-col-" + name, () => {
					h3.c("refine-col-title").text(LABEL[name]);
					cols[name] = div.c("refine-col-body");
				});
			});
		});

		$coverage = div.c("refine-coverage");
	});

	me.el = $box.el;
	select_col("clean");
	if ($picker && state.run) $picker.el.querySelector("select").value = runs.find(r => r.dir === state.run)?.id ?? state.run;

	function select_col(name){
		$ladder.el.querySelectorAll(".refine-col").forEach(el => el.classList.toggle("refine-col-active", el.classList.contains("refine-col-" + name)));
		$box.el.querySelectorAll(".refine-tab").forEach(el => el.classList.toggle("refine-tab-active", el.dataset.col === name));
	}

	function load(){
		if (!state.run){ $state.text("No run picked."); return; }
		const base = state.run.endsWith("/") ? state.run : state.run + "/";
		const text = name => fetch(base + name).then(r => r.ok ? r.text() : "").catch(() => "");
		const data = name => fetch(base + name).then(r => r.ok ? r.json() : null).catch(() => null);

		$state.text("Loading " + base + " …");
		Promise.all([text("raw.txt"), text("clean.md"), text("structured.md"), text("brief.md"), text("coverage.md"), data("refine.json")])
			.then(files => render(...files));
	}

	function render(raw, cleanMd, structuredMd, briefMd, coverageMd, refineJson){
		const sentences = parse_clean(cleanMd);
		const structured = parse_structured(structuredMd);
		const asks = parse_brief(briefMd);
		const { coverage, flags } = parse_coverage(coverageMd);
		const rawSegments = split_raw(raw);
		matchMap = match_sentences(sentences, rawSegments);
		// Ask refs come as plain numbers from brief.md ("4") but as "#4" from
		// coverage.md's own flags table — digits-only on both sides so they match.
		const flagged_asks = new Set(flags.map(f => String(f.ask).replace(/\D/g, "")));

		if (!sentences.length && !raw){
			$state.text("Nothing here yet — Server/refine.mjs hasn't run on this dictation.");
			COLS.forEach(name => cols[name].empty());
			$coverage.empty();
			return;
		}

		const n_asks = coverage.filter(r => /^ask\b/i.test(r.to)).length;
		const n_context = coverage.filter(r => /^context only/i.test(r.to)).length;
		const n_dropped = coverage.filter(r => /^dropped/i.test(r.to)).length;
		// Anything not asks/context/dropped (mostly "unclassified", a model pass
		// gave up) — named only when it happens, so the common case stays the
		// exact one-line shape asked for.
		const n_other = coverage.length - n_asks - n_context - n_dropped;
		$state.text(`${sentences.length} sentence${sentences.length === 1 ? "" : "s"} · ${n_asks} → asks · ${n_context} context · ${n_dropped} dropped`
			+ (n_other > 0 ? ` · ${n_other} unclassified` : "")
			+ ` · ${flags.length} flag${flags.length === 1 ? "" : "s"}`);

		cols.raw.empty(() => {
			div.c("refine-raw-text", () => {
				rawSegments.forEach((seg, i) => span.c("refine-raw-seg").attr("data-seg", i).text(seg + " "));
			});
			if (!rawSegments.length) p.c("refine-empty").text("No raw.txt for this run.");
		});

		cols.clean.empty(() => {
			sentences.forEach(({ n, text: t }) => {
				const $s = p.c("refine-sentence-p", () => {
					span.c("refine-s-num").text("S" + n + ". ");
					span.c("refine-sentence").attr("data-s", n).text(t);
				});
				$s.on("click", () => highlight([n], $s.el));
			});
			if (!sentences.length) p.c("refine-empty").text("No clean.md for this run.");
		});

		cols.structured.empty(() => {
			structured.forEach(sec => {
				if (sec.title) h3.c("refine-sec-title").text(sec.title);
				ul.c("refine-sec-list", () => {
					sec.bullets.forEach(b => {
						const $li = li.c("refine-bullet");
						$li.append(() => {
							span.c("refine-bullet-text").text(b.text);
							if (b.cites.length) span.c("refine-cite").text(" [" + b.cites.map(c => "S" + c).join(", ") + "]");
						});
						$li.on("click", () => highlight(b.cites, $li.el));
					});
				});
			});
			if (!structured.length) p.c("refine-empty").text("No structured.md for this run.");
		});

		cols.brief.empty(() => {
			ol.c("refine-ask-list", () => {
				asks.forEach(ask => {
					const $li = li.c("refine-ask");
					$li.append(() => {
						span.c("refine-ask-text").text(ask.text);
						if (ask.cites.length) span.c("refine-cite").text(" [" + ask.cites.map(c => "S" + c).join(", ") + "]");
						if (flagged_asks.has(String(ask.n))) span.c("refine-flag-badge").text("⚑ flag");
					});
					$li.on("click", () => highlight(ask.cites, $li.el));
				});
			});
			if (!asks.length) p.c("refine-empty").text("No brief.md for this run.");
		});

		$coverage.empty(() => {
			h3.c("refine-coverage-title").text("Coverage — every sentence, where it went");
			table.c("refine-coverage-table", () => {
				thead(() => tr(() => { th().text("S#"); th().text("Sentence"); th().text("→"); }));
				tbody(() => {
					coverage.forEach(row => {
						const dropped = /^dropped/i.test(row.to);
						tr.c(dropped ? "refine-dropped" : "", () => {
							td().text("S" + row.n);
							td().text(row.sentence);
							td().text(row.to);
						}).on("click", () => highlight([row.n]));
					});
				});
			});
			if (!coverage.length) p.c("refine-empty").text("No coverage.md for this run.");

			h3.c("refine-coverage-title").text("Flags — an ask that may have drifted from what was said");
			if (flags.length){
				table.c("refine-flags-table", () => {
					thead(() => tr(() => { th().text("Ask"); th().text("Flag"); th().text("Detail"); }));
					tbody(() => flags.forEach(f => tr(() => { td().text(f.ask); td().text(f.word); td().text(f.why); })));
				});
			} else {
				p.c("refine-empty").text("None.");
			}

			if (refineJson){
				// cost_usd is one number in this module's own fixture, but a
				// {clean, structured, …, total} breakdown from the real tool.
				const cost = typeof refineJson.cost_usd === "number" ? refineJson.cost_usd : (refineJson.cost_usd?.total ?? 0);
				const models = Object.entries(refineJson.models ?? {}).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("+") : v}`).join(", ") || "—";
				p.c("refine-json-note").text(`Models: ${models}. Cost: $${cost.toFixed(2)}.`);
			}
		});
	}

	function highlight(cites, sourceEl){
		$box.el.querySelectorAll(".refine-hit").forEach(el => el.classList.remove("refine-hit"));
		$box.el.querySelectorAll(".refine-selected").forEach(el => el.classList.remove("refine-selected"));
		sourceEl?.classList.add("refine-selected");

		let first_clean = null, first_raw = null;
		cites.forEach(n => {
			const s = cols.clean.el.querySelector(`.refine-sentence[data-s="${n}"]`);
			if (s){ s.classList.add("refine-hit"); first_clean ??= s; }
			const seg = matchMap.get(n);
			if (seg != null){
				const r = cols.raw.el.querySelector(`.refine-raw-seg[data-seg="${seg}"]`);
				if (r){ r.classList.add("refine-hit"); first_raw ??= r; }
			}
		});
		// Both columns scroll on their own (`.refine-col-body { overflow: auto }`), so
		// each needs its own scrollIntoView — one call only moves the column it's in.
		first_clean?.scrollIntoView({ block: "nearest" });
		first_raw?.scrollIntoView({ block: "nearest" });
	}

	load();

	return $box;
}

/* clean.md: "S3. text…" markers, one per line — `Server/refine.mjs` writes
 * them one sentence per line, with no blank line between; this also reads the
 * blank-line-separated shape (this module's own fixture) the same way. A
 * sentence's text is whatever sits between its own marker and the next one
 * (or the end of the file for the last sentence), so neither spacing style
 * nor a leading "# heading" line trips it up. */
export function parse_clean(md){
	const body = md || "";
	const markers = [...body.matchAll(/^S(\d+)\.\s*/gm)];
	return markers.map((m, i) => {
		const start = m.index + m[0].length;
		const end = i + 1 < markers.length ? markers[i + 1].index : body.length;
		const text = body.slice(start, end).replace(/\r?\n\s*<!--[\s\S]*$/, "").replace(/\s+/g, " ").trim();
		return { n: Number(m[1]), text };
	}).filter(s => s.text);
}

/* A trailing `[S3, S7]` is the citation; everything before it is the text. */
export function parse_cites(text){
	const m = text.match(/\[S([\d,\s]+)\]\s*$/);
	if (!m) return { text: text.trim(), cites: [] };
	return { text: text.slice(0, m.index).trim(), cites: m[1].split(",").map(s => Number(s.trim())).filter(n => n > 0) };
}

/* structured.md: "## Section" headings, "- bullet [S…]" lines under them —
 * but `Server/refine.mjs` today writes a flat list with no headings at all,
 * so a bullet found before any "##" (or when there is never one) goes into
 * one untitled section rather than being silently dropped. */
export function parse_structured(md){
	const sections = [];
	let current = null;
	const start_default = () => { current = { title: "", bullets: [] }; sections.push(current); };
	for (const line of (md || "").split(/\r?\n/)){
		const h = line.match(/^##\s+(.+)$/);
		if (h){ current = { title: h[1].trim(), bullets: [] }; sections.push(current); continue; }
		const b = line.match(/^[-*]\s+(.+)$/);
		if (b){
			if (!current) start_default();
			current.bullets.push(parse_cites(b[1]));
		}
	}
	return sections;
}

/* brief.md: "1. ask text [S…]" numbered lines. */
export function parse_brief(md){
	const asks = [];
	for (const line of (md || "").split(/\r?\n/)){
		const m = line.match(/^(\d+)\.\s+(.+)$/);
		if (m) asks.push({ n: Number(m[1]), ...parse_cites(m[2]) });
	}
	return asks;
}

/* coverage.md: a markdown table of S# | sentence | verdict, then "## Flags"
 * and a second table of ask | word | why. Read literally — no citation
 * parsing needed here, the file already says where each sentence went. */
export function parse_coverage(md){
	md = md || "";
	const idx = md.search(/^##\s*Flags/mi);
	const cov_block = idx >= 0 ? md.slice(0, idx) : md;
	const flag_block = idx >= 0 ? md.slice(idx) : "";

	const rows = block => block.split(/\r?\n/).map(l => l.trim())
		.filter(l => l.startsWith("|") && !/^\|[\s:-]+\|/.test(l))
		.slice(1) // header row
		.map(l => l.slice(1, l.endsWith("|") ? -1 : undefined).split("|").map(c => c.trim()));

	const coverage = rows(cov_block).map(([s, sentence, to]) => ({ n: Number((s || "").replace(/^S/i, "")), sentence, to })).filter(r => r.n);
	const flags = rows(flag_block).map(([ask, word, why]) => ({ ask, word, why })).filter(f => f.ask);
	return { coverage, flags };
}

/* Raw has no sentence markers, so "the matching stretch" is a heuristic: split
 * on sentence-ending punctuation, then pick the raw sentence sharing the most
 * significant (non-filler, 4+ letter) words with each clean sentence. Because
 * clean.md is near-verbatim (same sentence boundaries, fillers removed), this
 * lands on the right raw sentence in practice — it is a POINTER for the eye,
 * not a citation the tool wrote. doc/raw-match.md has the worked example. */
const FILLERS = new Set(["that","this","with","from","into","have","just","like","know","kind","sort","really","actually","gonna","wanna","okay","well","right","going","getting","dont","don't","when","because","especially","given","leaning","mode","the","and","or","but","for","not","are","was","were","been","being","what","whatever"]);

export function split_raw(raw){
	return (raw || "").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

export function sig_words(text){
	return new Set((text || "").toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/)
		.filter(w => w.length >= 4 && !FILLERS.has(w)));
}

export function match_sentences(sentences, rawSegments){
	const raw_sigs = rawSegments.map(sig_words);
	const map = new Map();
	sentences.forEach(({ n, text }) => {
		const sig = sig_words(text);
		let best = -1, best_score = 0;
		raw_sigs.forEach((rs, i) => {
			let score = 0;
			sig.forEach(w => { if (rs.has(w)) score++; });
			if (score > best_score){ best_score = score; best = i; }
		});
		if (best >= 0) map.set(n, best);
	});
	return map;
}

const claim = {};
export { refine };
