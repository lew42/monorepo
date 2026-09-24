import View from "../../core/View/View.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";

View.stylesheet(import.meta, "content.css");

/**
 * class ContentModule extends View — what Question, Decision and Quotation share: where
 * their log is, how to read it once, and ONE seam for writing a line to it.
 *
 * Everything a module needs arrives as one data object, so a page.jsonl line
 * `{"place": {"module": "<url>", ...data}}` can construct it with `new Module({ page, ...data })`:
 *
 *   page   the Page it sits on (its `jsonl_url` is the default log)
 *   log    an explicit log url (`/…/x.jsonl`), beats the page's
 *   card   a card id — the host log is a card, so writes go through Servex first
 *   by     who is writing ("owner" by default)
 *
 * ⚠ Never call `.text()` on a Quotation — its data field `text` shadows View's method.
 */
export default class ContentModule extends View {

	/* The log this module lives in, or undefined when it has none (a purely local card). */
	log_url(){ return this.log ?? this.page?.jsonl_url; }

	who(){ return this.by ?? "owner"; }

	/* Every line of the log, once. A missing log, a failed request or a bad line is just
	 * "nothing there yet" — a card with no history is a normal, fresh card. */
	async history(){
		const url = this.log_url();
		if (!url) return [];

		try {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) return [];
			return (await res.text()).split("\n").flatMap(text => {
				try { return text.trim() ? [JSON.parse(text)] : []; } catch { return []; }
			});
		} catch { return []; }
	}

	/* THE write seam. A card host: POST to Servex (its single writer for card folders);
	 * anything else, or a failed POST: the dev socket's `append`. With edit() off the click
	 * shows locally and nothing is written. Resolves to true when a line was written. */
	async write(line){
		if (!edit()) return false;

		if (this.card){
			try {
				const res = await fetch(`/card/append?id=${encodeURIComponent(this.card)}`, {
					method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(line) });
				if (res.ok) return true;
			} catch {}
		}

		const url = this.log_url();
		if (!url) return false;

		await Socket.singleton().request({ method: "append", args: [url, line] });
		return true;
	}

	now(){ return new Date().toISOString(); }

	/* "2026-09-24T15:03:00Z" → the reader's own clock, as words. */
	when(iso){ return iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : ""; }
}

ContentModule.prototype.tag = "section";
