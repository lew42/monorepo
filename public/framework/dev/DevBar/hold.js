import { span } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";

/* THE HOLD READOUT — sits beside the Block checkbox in the dev-head-line,
 * DevBar.js. Free (nobody holding): the span is there but empty and
 * `hidden`, so it takes no space and says nothing. Held: "held by
 * <who>, <n>s" (plus "+N more" if several agents hold at once), the
 * seconds ticking once a second while it's shown.
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
		$hold.text(`held by ${first.who}, ${seconds}s${more}`);
	}

	window.addEventListener("dev-hold", render);
	render();   // a hold already on before this tab opened — Socket.hold_holders may already be set

	return $hold;
}
