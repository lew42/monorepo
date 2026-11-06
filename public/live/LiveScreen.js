import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";

/* One saved screen of /live/: the cards that were on it when voice said {"save":{"name":"plan","title":"The plan"}}.
 * It lives in /live/page.jsonl, in LivePage's own `screens` List, and opens at /live/<name>/ (LivePage.route).
 * {"restore":"plan"} puts its cards back on /live/. Its `content` is a List of the same items /live/ holds. */
export default class LiveScreen extends Item {
	constructor(...args){
		super(...args);
		this.content ??= new List({ owner: this, name: "content" });
	}
}
Item.register(LiveScreen, "live-screen");
