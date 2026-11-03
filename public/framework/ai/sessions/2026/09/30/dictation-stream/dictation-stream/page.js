import { AITask, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* ⚠ An `AITask`, not a plain `Page`: it renders this task's own record (landing, links,
   log) and calls `extra()` for the one thing only this task has to show, the walkthrough.
   Shape copied from `ext/drawer/walkthrough/page.js`: one real screenshot per step, one
   sentence under it, the step in the address (`#2`) so a reload lands on the same step.
   Layout: the Wizard in AITask's own `wide` track; the phone shots are tall and narrow, so
   they are capped at 68vh and never stretched. */
const shot = name => new URL("proof/" + name, import.meta.url).href;

const STEPS = [
	{ title: "Your words grow in the chat", pic: "1-words-growing.png",
		say: "Open ✦ on a phone and talk. Your words appear as a bubble in the chat while you speak, grey until Whisper settles them. The text box stays empty for typing." },
	{ title: "Sent, then answered", pic: "2-sent-reply-starts.png",
		say: "When you stop, the bubble is sent as your message, with punctuation fixed by the clean-up. The assistants answer only once you have been quiet for 2.5 seconds." },
	{ title: "The reply types itself out", pic: "3-reply-streaming.png",
		say: "The smart assistant's reply appears while it is being written, with a caret at the end." },
	{ title: "Done", pic: "4-reply-done.png",
		say: "The finished reply replaces the growing one. The fast assistant stays silent unless it has something real to say." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new AITask({
	meta: import.meta,
	extra(){
		const w = new Wizard({
			index: from_hash(),
			steps: STEPS.map(s => ({ title: s.title, content(){
				div.c("flow", () => {
					p().style({ fontSize: "1.2em", maxWidth: "40em" }).text(s.say);
					img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.pic)).attr("alt", s.title);
					a.c("page-link").href("/framework/ux/Dictate/").text("Try it: open ✦ on /framework/ux/Dictate/ →");
				});
			} })),
			done(){ this.go(0); },
		});
		const go = w.go.bind(w);
		w.go = i => { const r = go(i); history.replaceState(null, "", "#" + (w.index + 1)); return r; };
		w.ac("wide");
		w.$body.el.classList.remove("measure");
	},
});

