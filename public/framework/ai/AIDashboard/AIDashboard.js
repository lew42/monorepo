import { View, div, h2 } from "/app.js";
import chat from "/framework/ux/Dictate/chat.js";
import AINow from "../now/AINow.js";
import DashNeeds from "./DashNeeds.js";
import DashBig from "./DashBig.js";
import DashQueue from "./DashQueue.js";
import InFlightView from "/framework/core/Session/InFlightView.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";
import UsageLine from "./UsageLine.js";
import PageNav from "./PageNav.js";

View.stylesheet(import.meta, "AIDashboard.css");

/** AIDashboard — the default /framework/ai/ page: what matters most, in order. A place to say something; what needs the owner; the big things now; what is running; the task queue; usage pace.
 *  The day's sessions list is one click down, on the Sessions tab. Every section reads real state and says so when it cannot: nothing is drawn from a failed read.
 *  The page's one live source is `AINow` (the "inflight" query); the queue, the waiting list, the merge list and priority.md are each read once. Class table: readme.md */
export default class AIDashboard extends View {
	// This page is a leaf, so `children:` draws no links: the pages the tab row above does not name (Sessions, Tasks, Queue are tabs;
	// Merge is the "Needs you" count) are linked here, in one quiet row at the bottom (the owner, 2026-10-24: one head row on every AI page).
	static NAV = [
		{ href: "/framework/ai/now/", label: "Now", title: "Every session active in the last hour" },
		{ href: "/framework/ai/asks/", label: "Asks", title: "Every ask, who owns it, whether it landed" },
		{ href: "/framework/ai/review/", label: "Review", title: "Review pages" },
		{ href: "/framework/ai/readmes/", label: "Readmes", title: "What an agent in each folder is given to read" },
		{ href: "/framework/ai/usage/", label: "Usage", title: "Usage pace against each limit" },
		{ href: "/framework/ai/quick-fix/", label: "Quick fix", title: "The quick-fix pool" },
		{ href: "/framework/ai/process/", label: "Processes", title: "Tasks run as ordered steps" },
		{ href: "/framework/ai/inbox/", label: "Old Inbox", title: "The old Inbox, with its tabs, tasks and sessions" },
	];

	get classes(){ return "ad-dash"; }

	// The sessions active in the last hour, then InFlightView over their records: only those with something in flight or waiting show.
	async in_flight($box){
		const res = await new QueryClient("inflight", { row: () => {}, stale: () => {} }).ask({ where: [{ field: "state", op: "eq", value: "active" }], sort: { by: "last_activity", dir: "desc" }, limit: 8 }, { timeout: 20000 });
		if (res.error || !res.rows?.length) return;
		$box.append(new InFlightView({ all: true, empty_text: "Nothing is in flight.", urls: res.rows.map(r => r.url.replace(/\/?$/, "/") + "session.jsonl") }));
	}

	render(){
		const $if = div.c("ad-sec ad-inflight");
		this.in_flight($if);
		div.c("ad-grid", () => {
			div.c("ad-col ad-col-a", () => {
				div.c("ad-sec ad-say", () => {
					h2.c("ad-h", "Say something");
					const $box = div.c("ad-saybox");
					chat($box.el, { placeholder: "Say something: it goes to the assistant and is kept.", keep: true });
				});
				new DashNeeds();
			});
			div.c("ad-col ad-col-b", () => new DashBig());
			div.c("ad-col ad-col-c", () => {
				div.c("ad-sec ad-running", () => {
					h2.c("ad-h", "What is running");
					new AINow();
				});
				new DashQueue();
			});
		});
		div.c("ad-sec ad-usage-sec", () => { h2.c("ad-h", "Usage pace"); new UsageLine(); });
		div.c("ad-sec ad-more-sec", () => { h2.c("ad-h", "More pages"); new PageNav({ links: AIDashboard.NAV }); });
	}
}
