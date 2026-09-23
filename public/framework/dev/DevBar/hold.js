import { span } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";

/* THE HOLD READOUT — sits beside the Block checkbox in the dev-head-line,
 * DevBar.js. Free (nobody holding): the span is there but empty and
 * `hidden`, so it takes no space and says nothing. Held: "<who> holds
 * <what>, <n>s" (plus "+N more" if several agents hold at once), the
 * seconds ticking once a second while it's shown.
 *
 * ⚠ IT HAS TO SAY *WHAT* IS HELD, not just who (2026-09-22). It said
 * "held by board-declutter, 220s" while the owner's own save failed to
 * reload the owner's own tab, and the readout gave them no way to tell
 * whether that hold was the reason — because back then a hold was global
 * and it WAS the reason. A hold is a fence now (Server/hold.mjs), so the
 * honest readout names the fence: "board-declutter holds ai/v/3/**, 220s"
 * reads as "and nothing else is affected", which is the fact that was
 * missing. Reason: ai/2026-09-22/reload-rethink/.
 *
 * There is no BUTTON here — a hold is taken from a terminal
 * (`node Server/hold.mjs on|off`), never clicked, so this file only ever
 * reads state and never writes it. The state itself lives on the socket:
 * Socket.js's own `hold(holders)` method (called BY the server, the same
 * way `reload()` and `changed()` are) stores `socket.hold_holders` and
 * fires a "dev-hold" window event — read that file before this one if the
 * wiring here is unclear.
 *
 * Built for ai/2026-09-19/reload-hold/requirements.md — the full design
 * (the lock file, the queue, the one flush) is Server/hold.mjs and
 * Server/plugins/SocketServer/LiveReload.js; this is only the readout. */
/* `public/framework/ai/v/3/**` → `ai/v/3/**`. The same shortening
 * Server/hold.mjs's own `short()` does for the terminal — duplicated in four
 * lines rather than imported, because this file must not reach into Server/
 * (nothing under public/ may: the site is static in production). */
const short = p => String(p).replace(/\\/g, "/")
	.replace(/^\.?\//, "").replace(/^public\//, "").replace(/^framework\//, "");

/* One fence, short enough for a 17rem rail: the first glob, and "+2" if the
 * holder named more. The whole list is in the tooltip. */
function fence(holder){
	const paths = (holder.paths ?? []).map(short);
	if (!paths.length) return "everything";
	return paths[0] + (paths.length > 1 ? ` +${paths.length - 1}` : "");
}

export default function hold(){
	const $hold = span.c("dev-hold");
	$hold.el.hidden = true;
	let timer = null;

	function render(){
		const holders = Socket.singleton().hold_holders || [];

		if (!holders.length) {
			clearInterval(timer);
			timer = null;
			$hold.el.hidden = true;
			$hold.text("");
			return;
		}

		if (!timer) timer = setInterval(render, 1000);

		const [first, ...rest] = holders;
		const seconds = Math.max(0, Math.round((Date.now() - first.since) / 1000));
		const more = rest.length ? ` +${rest.length} more` : "";
		$hold.el.hidden = false;
		$hold.text(`${first.who} holds ${fence(first)}, ${seconds}s${more}`);

		// The full fence, every holder, on hover — the line itself has to stay
		// short enough to sit in a 17rem rail beside two checkboxes.
		$hold.attr("title", holders.map(h =>
			`${h.who} holds ${(h.paths ?? []).map(short).join(" ") || "(no fence)"}` +
			`${h.fenced ? "" : "  ⚠ took no --paths; this is the default fence"}` +
			`${h.what ? ` — ${h.what}` : ""}`).join("\n")
			+ "\n\nEverything outside these fences still reloads normally.");
	}

	window.addEventListener("dev-hold", render);
	render();   // a hold already on before this tab opened — Socket.hold_holders may already be set

	return $hold;
}
