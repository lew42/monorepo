import { View, div, h2 } from "/app.js";
import chat from "/framework/ux/Dictate/chat.js";
import AINow from "../now/AINow.js";
import DashNeeds from "./DashNeeds.js";
import DashBig from "./DashBig.js";
import DashQueue from "./DashQueue.js";
import UsageLine from "./UsageLine.js";
import PageNav from "./PageNav.js";

View.stylesheet(import.meta, "AIDashboard.css");

/** AIDashboard — the default /framework/ai/ page: what matters most, in order. A place to say something; what needs the owner; the big things now; what is running; the task queue; usage pace.
 *  The day's sessions list is one click down, on the Sessions tab. Every section reads real state and says so when it cannot: nothing is drawn from a failed read.
 *  The page's one live source is `AINow` (the "inflight" query); the queue, the waiting list, the merge list and priority.md are each read once. Class table: readme.md */
export default class AIDashboard extends View {
	// This page is a leaf, so `children:` draws no links: every page below that people need is linked here. Merge first, it is the one that needs a decision.
	static NAV = [
		PageNav.merge_link(),
		{ href: "/framework/ai/sessions/", label: "Sessions", title: "Every session, newest first, with filters" },
		{ href: "/framework/ai/now/", label: "Now", title: "Every session active in the last hour" },
		{ href: "/framework/ai/tasks/", label: "Tasks", title: "The task log and board" },
		{ href: "/framework/ai/queue/", label: "Queue", title: "Every accepted task, ranked: what it is, why, its cost and its priority" },
		{ href: "/framework/ai/asks/", label: "Asks", title: "Every ask, who owns it, whether it landed" },
		{ href: "/framework/ai/review/", label: "Review", title: "Review pages" },
		{ href: "/framework/ai/readmes/", label: "Readmes", title: "What an agent in each folder is given to read" },
		{ href: "/framework/ai/usage/", label: "Usage", title: "Usage pace against each limit" },
		{ href: "/framework/ai/quick-fix/", label: "Quick fix", title: "The quick-fix pool" },
		{ href: "/framework/ai/process/", label: "Processes", title: "Tasks run as ordered steps" },
		{ href: "/framework/ai/inbox/", label: "Old Inbox", title: "The old Inbox, with its tabs, tasks and sessions" },
	];

	get classes(){ return "ad-dash"; }

	render(){
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
		new PageNav({ links: AIDashboard.NAV });
	}
}
