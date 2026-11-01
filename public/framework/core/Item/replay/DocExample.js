import LabExample from "./LabExample.js";
import LabDoc from "./LabDoc.js";
import { div, p, b } from "../../View/View.js";

// Example 4: summarize() asks an AI.
export default class DocExample extends LabExample {

	static id = "ai";
	static tab = "Ask an AI";
	static title = "Ask an AI to summarize a document";
	static look = "Press **Summarize**, then **Reload the page** two or three times. Watch the text and the money.";
	static hint = "The fake AI gives a different answer each time and costs $0.03 a call. `summarize()` already says “if there is a summary, do nothing”; a reload begins with an empty document, so that guard cannot help.";
	static Class = LabDoc;
	static counts = ["ai"];
	static first(){ return { id: "notes", title: "Q3 planning notes", summary: "" }; }
	static buttons = [{ label: "Summarize", verb: "summarize" }];
	static options = [{ key: "skip", label: "A replaying flag: skip the AI call while the page loads (checks Store.replaying)" }];
	static keys = [{ key: "summary", label: "summary", read: d => d.summary || "", show: v => v ? `“${v.slice(0, 38)}…”` : "none" }];

	apply_options(){ LabDoc.skip_when_replaying = this.options.skip; }

	draw(item){
		div.c("core-item-replay-card", () => {
			b(item.title);
			p.c("core-item-replay-summary" + (item.summary ? "" : " is-empty"), item.summary || "No summary yet.");
		});
	}

	why(kind){
		const { fx } = this.columns[kind].after;
		if (kind === "changes") return "The summary text was saved, so a reload just shows it. Nothing was asked again.";
		if (fx.ai) return "`summarize()` asked the AI again: different text, and paid again on every reload.";
		return this.options.skip ? "The flag stopped the AI call, but the text was never saved, so the summary is gone." : "";
	}
}
