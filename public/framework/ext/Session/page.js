import { Page, p, md, demo, div, button, input, form, h4, View } from "/app.js";
import { chat } from "../Chat/Chat.js";
import { start, resume, recent, say, watch, entry } from "./Session.js";

View.stylesheet(import.meta, "Session.css");

/* "1 day ago", "5 min ago": how long since an `at`. */
function ago(at){
	const s = (Date.now() - Date.parse(at)) / 1000;
	if (!(s >= 0)) return "";
	if (s < 60) return "just now";
	const [n, unit] = s < 3600 ? [s / 60, "min"] : s < 86400 ? [s / 3600, "hour"] : [s / 86400, "day"];
	const k = Math.floor(n);
	return `${k} ${unit}${k === 1 || unit === "min" ? "" : "s"} ago`;
}

/* The demo: Start (which continues this page's session if it spoke in the last hour),
 * a line to say, the session's file drawn by ext/Chat, and the page's Recent sessions. */
function live_session(){
	let session = null, stop = null, talk, $status, $text, $start, $talk, $previous, $recent;

	/* Point the chat at one session's file; a fresh ext/Chat per session so two never mix. */
	function open(made){
		session = made.session;
		stop?.();
		const entries = [];
		$talk.empty(() => { talk = chat({ source: () => entries }); talk.view.style("min-height", "12em").style("max-height", "24em"); });
		stop = watch(made.file, line => { const e = entry(line); if (e){ entries.push(e); talk.sync(); } });
		const name = made.title ? `“${made.title}”` : made.session;
		$status.text(made.resumed ? `Continuing ${name}, last heard ${ago(made.last_at)}.` : `New session ${made.session}, saved at ${made.file}.`);
		$previous.empty(() => {
			const prev = made.previous;
			if (prev) button(`${prev.title ?? prev.session} · ${ago(prev.at)}`).attr("title", prev.summary ?? "").click(() => go(resume(prev.session)));
		});
		list();
	}

	async function go(promise){
		$status.text("starting…");
		try { open(await promise); }
		catch (e){ $status.text(`could not start: ${e.message}`); $start.el.disabled = false; }
	}

	/* The page's Recent sessions, newest first; a click continues one. */
	function list(){
		recent(location.pathname, { limit: 5 }).then(rows => $recent.empty(() => {
			if (!rows.length) return void p("No sessions on this page yet.");
			for (const r of rows)
				button(`${r.title ?? r.session} · ${ago(r.last_at)}`).attr("title", r.summary ?? "").click(() => go(resume(r.session)));
		})).catch(e => $recent.empty(() => { p(`Recent sessions need Servex: ${e.message}`); }));
	}

	div.c("session-demo", () => {
		div.c("session-demo-controls", () => {
			$start = button("Start a session").click(() => { $start.el.disabled = true; go(start({ path: location.pathname })); });
			$status = p.c("session-demo-status").text("no session yet");
			$previous = div.c("session-demo-previous");
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
			h4("Recent sessions on this page");
			$recent = div.c("session-demo-recent", () => { p("Loading…"); });
		});
		// A placeholder (voice-fixes review item 9) so the two-column layout shows before Start
		// is pressed — otherwise this side is empty and the grid looks like one narrow column.
		$talk = div.c("session-demo-talk", () => { p.c("session-demo-placeholder").text("Replies appear here"); });
	}).style("display", "grid").style("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 20em), 1fr))").style("gap", "1em");
	list();   // on page load: the Recent list is the way back in, so it never hides behind a button
	const timer = setInterval(() => { if (!$talk.el.isConnected){ stop?.(); clearInterval(timer); } }, 2000);
}

export default new Page({
	meta: import.meta,
	title: "Session",
	description: "One ✦ press is one voice session: it starts on this page, follows you as you move, and a fast and a smart assistant answer every line.",
	icon: "record_voice_over",

	content(){
		p("Press Start, then type a line and press Say. Your first line starts the two assistants: the fast one answers in a few seconds, the smart one after it. If this page had a session in the last hour, Start continues it. Both assistants are real agents on Servex, so this only works on the dev site.");

		demo(() => live_session(), "`start()` continues this page's session from the last hour or makes a new one, `resume()` continues any session, `recent()` lists this page's sessions, and `watch(file)` hands back every line, drawn by ext/Chat.");

		md(`**Where it is saved:** \`<home page>/ai/<session>.jsonl\`, one file per session, and its title in \`<session>.summary.json\` beside it. Each folder it reaches gets one line in its own \`ai/log.jsonl\`. The two assistants start on your first line, stop after 5 quiet minutes, and wake on the next line. The design: [voice-sessions](/framework/ai/2026-09-29/voice-sessions/design.md). The details: [doc/sessions.md](./doc/sessions.md).`);
	},
});
