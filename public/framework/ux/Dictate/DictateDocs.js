import { View, div, a, span, button } from "../../core/View/View.js";
import md from "../../ext/markdown/md.js";

View.stylesheet(import.meta, "DictateDocs.css");

/**
 * class DictateDocs — the Docs tab: this module's readme, rendered by ext/markdown, and a list of its docs. One click on a doc
 * (in the list or any .md link in the text) opens it here, with a Back link; nothing leaves the tab. Doc: doc/docs-tab.md.
 *
 *   new DictateDocs();
 */
export default class DictateDocs extends View {

	static HOME = "/framework/ux/Dictate/";
	static DOCS = [
		["settings.md", "Settings", "what the settings panel changes"],
		["architecture.md", "Architecture", "two engines, one stream"],
		["whisper.md", "Whisper", "the transcriber"],
		["debug-tab.md", "Debug tab", "the lights and the live log"],
		["voice-architecture.md", "Voice architecture", "the sessions and their seats"],
	];

	render(){
		this.ac("dictate-docs flex v");
		this.$bar = div.c("dictate-docs-bar flex wrap v-center");
		this.$body = div.c("dictate-docs-body");
		this.$body.el.addEventListener("click", e => {
			const link = e.target.closest?.("a[data-md]");
			if (!link || !link.dataset.md.startsWith(this.constructor.HOME) || e.metaKey || e.ctrlKey || e.shiftKey) return;
			e.preventDefault();
			this.open(link.dataset.md);
		});
		this.open(this.constructor.HOME + "readme.md");
	}

	// Show one .md file (an absolute path); the readme is home, any other file gets a Back link.
	async open(path){
		const home = path === this.constructor.HOME + "readme.md";
		this.$bar.empty(() => {
			if (home) span.c("muted", "ux/Dictate readme");
			else {
				button.c("dictate-docs-back", "← Back to the readme").attr("type", "button").click(() => this.open(this.constructor.HOME + "readme.md"));
				span.c("muted", path.slice(this.constructor.HOME.length));
			}
		});
		this.$body.empty(() => { span.c("muted", "loading…"); });
		const view = await md.file(import.meta, path);
		this.$body.empty(() => {
			if (home) this.list();
			this.$body.el.append(view.el);
		});
		this.$body.el.scrollTop = 0;
		this.el.scrollIntoView?.({ block: "nearest" });
	}

	// The docs a reader wants first, above the readme: one line each.
	list(){
		div.c("dictate-docs-list flex wrap", () => {
			span.c("muted", "Docs:");
			this.constructor.DOCS.forEach(([file, label, why]) =>
				a(label).href("#").attr("title", why).click(e => { e.preventDefault(); this.open(this.constructor.HOME + "doc/" + file); }));
		});
	}
}
