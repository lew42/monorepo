import { Page, p, a } from "/app.js";
import DashChips from "/framework/ai/rail/DashChips.js";

/** An old dashboard url kept alive as a saved filter of the Inbox: it forwards to `/framework/ai/` with the chips named by `preset`
 *  (a key of DashChips.SAVED), the rest of its url (hash, extra query) kept. Doc: ai/doc/one-dashboard.md */
export default class SavedFilter extends Page {
	content(){
		if (location.pathname !== this.url) return;     // a routed child (Lanes, Architecture, a task) draws its own page
		const to = DashChips.saved(this.preset ?? "tasks", location.search);
		p(() => a().href(to).text("This list is now a filter of the Inbox: " + to));
		location.replace(to + location.hash);
	}
}
