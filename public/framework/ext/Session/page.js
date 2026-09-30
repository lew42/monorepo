import { Page, p, md, demo, div, button, input, form } from "/app.js";
import { chat } from "../Chat/Chat.js";
import { start, say, watch, entry } from "./Session.js";

/* The demo: a Start button, a line to say, and the session's file drawn by ext/Chat. */
function live_session(){
	const entries = [];
	let talk, session = null, stop = null, $status, $text, $start;
	div.c("session-demo", () => {
		div.c("session-demo-controls", () => {
			$start = button("Start a session").click(async () => {
				$start.el.disabled = true;
				$status.text("starting…");
				try {
					const made = await start({ path: location.pathname });
					session = made.session;
					$status.text(`${made.session}, saved at ${made.file}`);
					stop = watch(made.file, line => { const e = entry(line); if (e){ entries.push(e); talk.sync(); } });
				} catch (e){ $status.text(`could not start: ${e.message}`); $start.el.disabled = false; }
			});
			$status = p.c("session-demo-status").text("no session yet");
			form(() => {
				$text = input().attr("placeholder", "can you hear me?").attr("aria-label", "A line to say");
				button("Say").attr("type", "submit");
			}).on("submit", async ev => {
				ev.preventDefault();
				const text = $text.el.value.trim() || "can you hear me?";
				if (!session) return $status.text("press Start first");
				$text.el.value = "";
				try { await say({ session, path: location.pathname, text }); }
				catch (e){ $status.text(`not sent: ${e.message}`); }
			});
		});
		talk = chat({ source: () => entries });
		talk.view.style("min-height", "12em").style("max-height", "24em");
	}).style("display", "grid").style("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 20em), 1fr))").style("gap", "1em");
	const timer = setInterval(() => { if (!talk.view.el.isConnected){ stop?.(); clearInterval(timer); } }, 2000);
}

export default new Page({
	meta: import.meta,
	title: "Session",
	description: "One ✦ press is one voice session: it starts on this page, follows you as you move, and a fast and a smart assistant answer every line.",
	icon: "record_voice_over",

	content(){
		p("Press Start, then type a line and press Say. The fast assistant answers in a few seconds; the smart one answers after it. Both are real agents on Servex, so this only works on the dev site.");

		demo(() => live_session(), "`start()` makes the session, `say()` sends a line, `watch(file)` hands back every line of the session's file, drawn here by ext/Chat.");

		md(`**Where it is saved:** \`<home page>/ai/<session>.jsonl\`, one file per session. Each page it visits gets one pointer line in its own \`page.jsonl\`. The design: [voice-sessions](/framework/ai/2026-09-29/voice-sessions/design.md). The details: [doc/](./doc/).`);
	},
});
