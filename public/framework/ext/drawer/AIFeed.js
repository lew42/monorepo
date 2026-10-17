// AIFeed: the live space. This page's events (<page>ai/log.jsonl, streamed with live(), never a timed refresh)
// as rows in the chat's own bubble column, so the chat and the page's events are one stream, newest at the bottom.
// Used by the phone's Sheet.Panel and the desktop AI tab. doc/sheet.md
import { View, div, span, a } from "/framework/core/View/View.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

View.stylesheet(import.meta, "AIFeed.css");

// The page's ai/log.jsonl as a list of events: every line with a verb and some text, in order.
export class AIFeedLog extends JSONL {
	events = [];
	apply(entry){
		const event = AIFeed.event(entry);
		if (event){ this.events.push(event); this.added?.(event); }
		return this;
	}
	reset(){ this.events = []; return super.reset(); }
}

export default class AIFeed extends View {

	static BACKLOG = 5;   // the last few events shown above the chat when it opens
	static feeds = new Set();   // the feeds open now (the probe and the page's debug view read it)
	static ICONS = { task: "☑", decision: "◆", log: "·", note: "✎", merge: "⇄", reference: "↗", ask: "?" };

	// One feed inside a chat mount's box, about one page.
	static on(box, page){
		const feed = new this({ capture: false }).ac("drawer-ai-feed flex v");
		feed.attach(box);
		feed.follow(page);
		this.feeds.add(feed);
		return feed;
	}

	// {task:{title, event, dir, at}}, {decision:{what, at}}, {log:{msg, at}}… → {verb, text, at, dir}, or null.
	static event(entry){
		const verb = Object.keys(entry ?? {})[0], value = entry?.[verb];
		if (!verb || verb === "chat" || !value || typeof value !== "object") return null;
		const text = value.title ?? value.what ?? value.msg ?? value.text ?? value.summary;
		if (!text) return null;
		return { verb, text: value.event ? `${value.event}: ${text}` : String(text), at: value.at ?? entry.at, dir: value.dir };
	}

	// The backlog sits at the top of the chat's bubble column; the widget may redraw it, so it is put back.
	attach(box){
		this.box = box;
		const place = () => {
			const bubbles = box.querySelector(".ux-dictate-widget-bubbles");
			if (!bubbles) return;
			this.bubbles = bubbles;
			if (this.el.parentNode !== bubbles) bubbles.prepend(this.el);
		};
		place();
		this.watch = new MutationObserver(place);
		this.watch.observe(box, { childList: true, subtree: true });
		return this;
	}

	// Switch to another page's log (the sheet followed a navigation).
	follow(page){
		const url = String(page ?? "/").replace(/\/?$/, "/") + "ai/log.jsonl";
		if (this.log?.url === url) return this;
		this.log?.unsubscribe();
		this.empty();
		const log = this.log = new AIFeedLog({ url });
		let replayed = false;
		log.added = event => { if (replayed && log === this.log) this.bubbles?.append(this.row(event).el); };
		log.live().then(() => {
			if (log !== this.log) return;
			replayed = true;
			log.events.slice(-this.constructor.BACKLOG).forEach(event => this.el.append(this.row(event).el));
		});
		return this;
	}

	row(event){
		const $row = new View({ capture: false }).ac("drawer-ai-feed-row flex v-center muted").ac("drawer-ai-feed-" + event.verb);
		$row.append(() => {
			span.c("drawer-ai-feed-icon", this.constructor.ICONS[event.verb] ?? "•");
			const href = event.dir && "/" + event.dir.replace(/^public\//, "").replace(/\/?$/, "/");
			href ? a.c("drawer-ai-feed-text", event.text).href(href) : span.c("drawer-ai-feed-text", event.text);
			if (event.at) span.c("drawer-ai-feed-at", String(event.at).slice(5, 16).replace("T", " "));
		});
		return $row;
	}

	stop(){
		this.constructor.feeds.delete(this);
		this.log?.unsubscribe();
		this.watch?.disconnect();
		this.el.remove();
	}
}

export { AIFeed };
