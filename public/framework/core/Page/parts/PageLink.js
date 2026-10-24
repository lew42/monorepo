import Item from "../../Item/Item.js";
import View, { div, a, h4 } from "../../View/View.js";

/* {"type":"part-link","path":"./notes/"} — a card for a child page: its title and summary, a link to its url. doc/part-link.md */
export default class PageLink extends Item {}
PageLink.View = class PageLinkView extends View {
	render(){
		const item = this.item, path = item.get("path"), title = item.get("title"), text = item.get("text");
		// Relative to the page that holds the link, not the address bar: a parent's parts also render under its children.
		const page = this.item.parent, base = page?.log_folder ? location.origin + page.log_folder() : location.href;
		const href = new URL(path, base).pathname;
		let $title, $text;
		const $card = a.c("part-link card", () => {
			$title = h4(title ?? path);
			$text = div.c("part-link-text", text ?? "");
		});
		// The child's own first line (title, description) is the truth; the link's copy shows until it arrives.
		fetch(href + "page.jsonl").then(r => r.ok ? r.text() : "").then(src => {
			try {
				const first = JSON.parse(src.split("\n")[0]);
				if (first.title) $title.el.textContent = first.title;
				if (first.description) $text.el.textContent = first.description;
			} catch {}
		}).catch(() => {});
		$card.attr("href", href);
		return $card;
	}
};
Item.register(PageLink, "part-link");
