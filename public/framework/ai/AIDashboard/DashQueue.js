import { View, div, span, a, h2 } from "/app.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";

/** DashQueue — the task queue in three lines: how many tasks are queued and the top few by score (the dev server's "taskqueue" source, the same rows as /framework/ai/queue/).
 *  It asks ONCE and never listens: a QueryClient takes over the page's single `QueryClient.current`, so this one hands the slot straight back and the live "what is running" list keeps the pushes. */
export default class DashQueue extends View {
	static TOP = 3;
	static usd(n){ return "$" + (n || 0).toFixed(2); }

	get classes(){ return "ad-sec ad-queue"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){
		const live = QueryClient.current;
		this.client = new QueryClient("taskqueue");
		QueryClient.current = live;   // hand the page's live slot back: this client never listens
		super.initialize();
	}

	render(){
		h2.c("ad-h", "Task queue");
		this.$body = div.c("ad-block", () => div.c("ad-none", "Reading the task records…"));
		this.ask();
	}

	async ask(){
		let res = await this.client.ask({ sort: { by: "score", dir: "desc" }, limit: DashQueue.TOP }, { timeout: 30000 });
		if (res.error === "timeout") res = await this.client.ask({ sort: { by: "score", dir: "desc" }, limit: DashQueue.TOP }, { timeout: 30000 });
		this.paint(res);
	}

	paint(res){
		this.$body.empty(() => {
			if (res.error) return void div.c("ad-none", res.error === "no socket" ? "The queue needs the dev server." : "The dev server did not answer with the queue: " + res.error);
			a.c("ad-big").href("/framework/ai/queue/").attr("target", "_self").attr("title", "Every queued task, ranked")
				.append(() => { span.c("ad-num", String(res.total ?? res.rows.length)); span.c("ad-what", "tasks queued"); });
			res.rows.forEach(r => a.c("ad-line").href(r.url).attr("target", "_self").append(() => {
				span.c("ad-rank", "#" + r.rank);
				span(r.title);
				span.c("ad-usd", DashQueue.usd(r.est_usd));
			}));
		});
	}
}
