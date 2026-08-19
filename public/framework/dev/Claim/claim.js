import View, { div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "claim.css");

/* A tab, claimed: a ring around the whole viewport and a mark in the title, so the
 * person at the keyboard can see at a glance which window an agent is driving. The
 * caller is `Server/plugins/MCP.js` — its `claim` and `release` tools, which wrap the
 * two exports below in an `eval` so a session never has to know this path.
 *
 * ⚠ View, not /app.js — app.js imports DevBar, DevBar calls `reclaim()`, and a
 *   `/app.js` import here would close that circle. Design record: readme.md. */

const MARK = "\u{1F7E0} ";
const KEY = "dev-claim";

let $ring, watching;

export function claim(who = "claude", note = ""){
	release();
	sessionStorage.setItem(KEY, JSON.stringify({ who, note }));
	paint(who, note);

	return `claimed ${location.pathname} — ${who}`;
}

export function release(){
	sessionStorage.removeItem(KEY);
	$ring?.el.remove();
	$ring = null;
	watching?.disconnect();
	watching = null;
	document.title = document.title.replace(MARK, "");

	return "released";
}

/* A live reload takes the ring with it, and an agent editing files reloads its own
   claimed tab every few seconds — so the claim is session state and DevBar reinstates
   it on boot. Per TAB, which is exactly the scope of a claim. */
export function reclaim(){
	const held = sessionStorage.getItem(KEY);
	if (held) paint(...Object.values(JSON.parse(held)));
}

export const claimed = () => !!$ring;

function paint(who, note){
	// ⚠ Built with no captor and placed by hand: an `eval` runs at global scope, so a
	//   factory here captures nothing.
	$ring = div.c("claim-ring", () => div.c("claim-tag", () => {
		span.c("claim-dot");
		span.c("claim-who", who);
		note && span.c("claim-note", note);
	}));

	// ⚠ Inside `.app`, not on `body`: the theme class rides `.app`, so a ring on the
	//   body reads `var(--prim)` as unset and paints a 6px `currentColor` line. The
	//   Router empties `.pages`, never `.app`, so this outlives every navigation.
	(document.querySelector(".app") ?? document.body).append($ring.el);
	mark();
}

/* The ring is gone the moment the tab is behind another one, and a background tab is
   exactly when a claim matters — so the title carries it too. ⚠ Every route change
   rewrites the title, which is why this is an observer and not one assignment. */
function mark(){
	if (!document.title.startsWith(MARK)) document.title = MARK + document.title;

	watching = new MutationObserver(mark);
	watching.observe(document.querySelector("title"), { childList: true });
}

export default claim;
