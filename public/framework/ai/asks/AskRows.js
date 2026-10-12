/* ask_row() and module_asks() — split out of asks/page.js (review, card-pipeline 2026-10-02):
 * importing a Page module for one function also runs its `export default new Page({...})`, a
 * side effect a non-page caller (a module's own page.js wanting its own "Asks" section) has no
 * reason to pay for. This file has no `Page` in it at all, just the shared ROW LOOK and the
 * module filter — the ledger's own page (`page.js`) imports `ask_row` from here now too, so
 * there is still only one way an ask row is drawn, never two copies of it. */
import { div, span, small, a, details, summary } from "/app.js";
import { AskFold } from "./AskFold.js";

const ASKS_URL = "/framework/ai/asks.jsonl";
const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "");
const parse_lines = text => String(text ?? "").split(/\r?\n/).filter(l => l.trim())
	.map(l => { try { return JSON.parse(l); } catch { return null; } });

export class AskRows {

	static hours_since(at){
		const t = at ? Date.parse(at) : NaN;
		return Number.isFinite(t) ? Math.max(0, (Date.now() - t) / 3600000) : NaN;
	}

	/** A plain "3.2 h ago" / "2 d ago" — the same words `needs.js`'s own stalled rows use. */
	static age_words(at){
		const h = AskRows.hours_since(at);
		if (!Number.isFinite(h)) return "";
		if (h < 1) return Math.round(h * 60) + " min ago";
		if (h < 48) return h.toFixed(1) + " h ago";
		return Math.round(h / 24) + " d ago";
	}

	/** A ledger path ("ai/2026-09-30/x/owner-words.md") as a served url — or `null` when it
	 *  isn't served at all (`.claude/prompts/...`), shown as plain text next to the row instead. */
	static words_url(words){
		if (!words || words.startsWith(".claude/")) return null;
		return "/framework/" + String(words).replace(/^\/+/, "");
	}

	/** ONE ASK, as a row: its title, owner, age, a link to its card and to its own words, and its
	 *  history folded under a "N updates" disclosure. The asks ledger's own page uses this, and so
	 *  does any module's filtered view (`AskRows.forModule()` below) — one look, never drawn twice. */
	static row(ask){
		const words = AskRows.words_url(ask.words);
		div.c("asks-row card pad", () => {
			div.c("asks-row-head flex v-center gap-25", () => {
				span.c("asks-row-title").text(ask.title || "Untitled ask");
				small.c("asks-row-age muted").text(AskRows.age_words(ask.status_at ?? ask.at));
			});
			div.c("asks-row-meta flex wrap gap-25 muted", () => {
				small.c("asks-row-owner").text("owner " + (ask.owner || "—"));
				if (ask.card) a.c("page-link").href("/framework/ai2/" + ask.card + "/").text("card");
				if (words) a.c("page-link").href(words).text("words");
				else if (ask.words) small.c("asks-row-owner").text(ask.words);
			});
			if (ask.status === "stalled" && ask.why) small.c("asks-row-why muted").text(ask.why);
			if (ask.history?.length > 1) details.c("asks-row-history", () => {
				summary.c("muted").text(ask.history.length + " updates");
				ask.history.forEach(h => {
					div.c("asks-row-hist-line muted").text([h.status, h.by, h.at, h.why].filter(Boolean).join(" · "));
				});
			});
		});
	}

	/** A MODULE'S OWN ASKS — a FILTERED VIEW of this one ledger, never a second list (item 5,
	 *  card-pipeline 2026-10-02: "each module should have data about the requests made of it,
	 *  without duplicating data" — decided: `asks.jsonl` stays the one ledger; a per-module summary
	 *  file was rejected, see `Servex/asks/readme.md`). `prefix` is a module dir exactly as it
	 *  appears in an ask's own `paths` field (e.g. `"core/Page"`, `"Servex/asks"`) — written once,
	 *  at landing time, by `Servex/asks/Asks.js`'s `task_closed()`, computed from the task's own
	 *  `files.jsonl`, never hand-typed. Any module's `page.js` calls this with a box it already
	 *  captured (no DOM after an await — CLAUDE.md's own trap) and gets back the SAME row look above,
	 *  so there is only ever one way an ask row looks. Matched case-INSENSITIVELY (review,
	 *  2026-10-02): `module_paths()` (`Asks.js`) names `public/framework/servex/page.js`'s own
	 *  module lowercase (`"servex"`), distinct from the top-level `Servex/` server code it shares a
	 *  name with by coincidence — a reader of either page still expects "did a task touch ME" to
	 *  work regardless of that one path's casing. */
	static forModule($into, prefix){
		const low = prefix.toLowerCase();
		read_text(ASKS_URL).then(text => {
			const asks = Object.values(AskFold.fold(parse_lines(text)))
				.filter(a => (a.paths ?? []).some(p => { const pl = p.toLowerCase(); return pl === low || pl.startsWith(low + "/"); }))
				.sort((x, y) => Date.parse(y.status_at ?? y.at ?? 0) - Date.parse(x.status_at ?? x.at ?? 0));
			$into.empty(() => {
				if (!asks.length) return void small.c("muted").text("No landed task has touched " + prefix + " yet.");
				asks.forEach(ask => AskRows.row(ask));
			});
		});
		return $into;
	}

}

export default AskRows;
