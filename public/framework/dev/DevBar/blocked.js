import { span, label, input, button } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";

/* THE PAUSE SWITCH — "block", in the dev-head-line beside the path bar.
 *
 * WHAT IT IS FOR. You are reading a page while agents write files, and a reload
 * takes your scroll position with it. Tick this and nothing reloads THIS TAB
 * until you untick it. It is remembered for the life of the tab, so a reload it
 * fails to stop cannot forget it — which is what the old version did, and why a
 * block that "wasn't working" was usually a block that had already been erased.
 *
 * NOT THE SAME THING AS THE HOLD BESIDE IT. The hold (`Server/hold.mjs`, the
 * readout in hold.js) is the WRITER's: an agent takes it before a batch of
 * writes so every tab on every server gets one reload instead of twenty. This
 * switch is the READER's: it is yours, it is this tab only, and no agent can
 * take it or drop it.
 *
 * ⚠ IT HAS TO SHOW A COUNT. A switch that silently swallows reloads reads as
 * "the dev server has stopped working" ten minutes later, and there is no way
 * to tell those apart from the page. So the count says how many reloads were
 * refused while you were blocked, and clicking it takes them all at once.
 *
 * The state lives on the socket, not here: Socket.js reads `window.$BLOCKRELOAD`
 * at the moment a reload arrives, restores it from sessionStorage at boot, and
 * fires "skipped" through its own `on()` registry each time it refuses one. */
export default function blocked(){
	const socket = Socket.singleton();

	label.c("dev-knob", () => {
		const $box = input().attr("type", "checkbox")
			.on("change", function(){ set(this.el.checked); });

		if (window.$BLOCKRELOAD) $box.attr("checked", true);
		span("block");
	}).attr("title", "Hold reloads in THIS TAB — nothing here reloads until you untick it. Remembered for the life of the tab.");

	const $count = button.c("dev-skipped")
		.attr("title", "Reloads this tab refused while blocked — click to take them, in one reload.")
		.click(() => { set(false); location.reload(); });

	function set(on){
		window.$BLOCKRELOAD = on;
		sessionStorage.setItem("dev-block", on ? "1" : "0");
		if (!on) socket.skipped = 0;
		render(socket.skipped);
	}

	function render(n){
		$count.el.hidden = !n;
		$count.text(n ? `${n} held` : "");
	}

	socket.on("skipped", render);
	render(socket.skipped);
}
