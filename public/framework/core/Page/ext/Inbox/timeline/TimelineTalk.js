import { div, small, a } from "/app.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";

/** TimelineTalk — a card's own chat beside a timeline row: its `prompt` and `message` lines, streamed from the card's
 *  page.jsonl, drawn by the same CardChat log and Compose box the card page uses (ai/cards/card.js, chat v1).
 *  Built synchronously into the current captor; the chat parts arrive by dynamic import and fill the box in a callback. */
export default class TimelineTalk {
	static AI = "/framework/ai/";

	/** The card's page.jsonl, read for its chat lines only. */
	static Log = class TalkLog extends JSONL {
		static verbs = [...JSONL.verbs, "prompt", "message"];
		prompts = []; messages = [];
		prompt(v){ this.prompts.push(v); }
		message(v){ this.messages.push(v); }
		reset(){ this.prompts = []; this.messages = []; return super.reset(); }
		skip(){}   // every other card line (title, status, chat…) is the card page's business, not a warning
	};

	constructor(...args){ Object.assign(this, ...args); }

	/** The entries CardChat draws: the same mapping as Card#chat_entries + Card#chat_line. */
	entries(){
		return [
			...this.log.prompts.map(p => ({ type: "prompt", id: p.id, at: p.at, by: p.by, text: p.raw ?? p.text })),
			...this.log.messages.map(m => {
				const kind = m.kind ?? "reply";
				if (m.raw && !m.text) return { type: "update", at: m.at, text: m.raw };
				if (["task", "update", "clear", "ask"].includes(kind)) return { ...m, type: kind };
				return { type: "reply", id: m.id, at: m.at, by: m.by, heading: m.heading, text: m.text ?? m.name ?? m.title };
			}),
		];
	}

	view(){
		const card = this.card, url = TimelineTalk.AI + card + "/";
		this.log = new TimelineTalk.Log({ url: url + "page.jsonl" });
		const $box = div.c("timeline-talk", () => {
			div.c("timeline-talk-head", () => {
				small.c("muted", "Talk to it");
				a.c("timeline-talk-open", "open the card").href(url);
			});
		});
		Promise.all([import("/framework/ai/cards/CardChat.js"), import("/framework/ai/cards/Compose.js")]).then(([{ CardChat }, { Compose }]) => {
			$box.append(() => {
				this.talk = CardChat.chat({ source: () => this.entries(), re: () => card });
				Compose.composer({
					re: () => card, placeholder: "talk into this card",
					on_text: text => this.talk.echo(text),
					on_send_start: text => { this.talk.live({ text }); this.talk.live({ text: "", sent: true }); },
				});
			});
			this.log.live(() => this.talk.sync()).then(() => this.talk.sync());
		});
		return $box;
	}

	stop(){ this.log?.unsubscribe(); }
}
