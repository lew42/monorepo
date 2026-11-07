import Item from "/framework/core/Item/Item.js";
import View, { div, h4 } from "/framework/core/View/View.js";
import { code } from "/framework/ext/highlight/highlight.js";

/* {"type":"live-code","lang":"js","code":"const x = 1;","title":"Optional","caption":"one line under it"} — a code block
 * card: a title, the code highlighted (ext/highlight), a caption. `lang` is one of js, json, css, html, sh (default js);
 * an unregistered language degrades to escaped plain text (ext/highlight's own rule). A long line scrolls inside the
 * block; the card itself never grows wider than the page. */
export default class LiveCode extends Item {
	static example = { id: "snippet", lang: "js", code: "const sum = (a, b) => a + b;", title: "Add", caption: "Two numbers in, one out." };   // what the item tool's help shows
}

LiveCode.View = class LiveCodeView extends View {
	render(){
		const item = this.item;
		this.ac("bleed");   // code runs edge to edge on a phone: the line has the room it needs (LivePage.css .bleed)
		return div.c("live-code-card", () => {
			h4.c("live-card-title").bind(item, "title", function(t){ this.tc("is-empty", !t).text(t ?? ""); });
			const $wrap = div.c("live-code-wrap");
			const draw = () => {
				const lang = item.get("lang") ?? "js";
				const fn = code[lang] ?? code.js;
				$wrap.empty(() => fn(String(item.get("code") ?? "")));
			};
			["lang", "code"].forEach(key => item.on("change", k => { if (k === key) draw(); }));
			draw();
			div.c("live-code-caption").bind(item, "caption", function(t){ this.tc("is-empty", !t).empty(() => { if (t) this.md(String(t), { safe: true }); }); });
		});
	}
};
Item.register(LiveCode, "live-code");
