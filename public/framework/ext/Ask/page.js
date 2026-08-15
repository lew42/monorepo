import { Page, md, code, div, p, span, button } from "/app.js";
import { ask, available } from "./Ask.js";
import { chat } from "./chat.js";

export default new Page({
	meta: import.meta,
	title: "Ask",
	label: "Ask",
	description: "Chat with a Claude Code session from the browser — one socket message, one headless CLI turn.",
	icon: "forum",

	content(){

		code.js(`const { text } = await ask("Name the three widest elements on this page.");`);

		md("A button or a text input sends a prompt over the dev socket; the server runs **one headless turn** of the `claude` CLI and streams the reply back. Continuity is the transcript on disk, so there is no wrapped terminal and no long-lived child process.");

		md("**Localhost only.** Off the dev server `ask()` rejects and `chat()` renders read-only — the same gate `dev/Socket` has always had.");

		this.asker("Ask: what is 2 + 2?", "What is 2 + 2? Reply with the number alone.", { model: "haiku", tools: "" });

		md("### The panel");

		md("`chat()` is the same call as a view: history, an input, streaming bubbles. Pass `task` — a thread's path under `public/`, like `framework/styles/layouts/ai/rhythm` — and the exchange is appended to that thread's `task.jsonl` as `chat` lines. That is what [a task's detail page](/framework/ai/2026-08-14/browser-cli-bridge/) mounts, and what the [dev rail](/framework/dev/DevBar/) mounts on every page. This one records nothing.");

		chat({ model: "haiku", placeholder: "Ask haiku something (no tools, no record)…", tools: "" });

		md("### Let it look at the element");

		code.js(`await ask("What is wrong with this element's layout?", { shot: ".chat-form" });`);

		md("A string is a selector on **this** page; `{url, selector, width, height}` reaches any other. The dev server drives globally-installed playwright, hands the turn a png, and the turn reads it — so a page can ask about how it looks, not just what it says.");

		this.asker("Ask about the input above", "In ONE sentence: what is this element, and what is its most obvious layout problem?",
			{ model: "haiku", shot: ".chat-form" });

		md(`### The arguments

| | |
|---|---|
| \`from\` | a session id to **fork** — inherit its whole context, get a new id |
| \`resume\` | a session id to **continue** — the id a previous reply returned |
| \`task\` | a thread's path under \`public/\`; the exchange lands in its log |
| \`shot\` | a selector, or \`{url, selector}\` — a picture for the turn to read |
| \`on\` | \`{text}\` / \`{tool}\` as the turn streams |
| \`model\`, \`tools\` | per call; \`tools: ""\` is a pure-text turn |

Design record, and why the first message on a task forks rather than resumes: [readme.md](readme.md).`);
	},

	// A button IS the API — the smallest possible caller, and it costs one haiku turn.
	asker(label, prompt, opts){
		div.c("flow", () => {
			let $out;
			button.c("chat-send", label).click(async () => {
				$out.empty(() => span("thinking…"));
				try {
					const r = await ask(prompt, opts);
					$out.empty(() => span(`${r.text} — $${r.cost_usd.toFixed(3)}, ${Math.round(r.duration_ms / 1000)}s`));
				} catch (e){
					$out.empty(() => span(e.message));
				}
			});
			$out = p.c("muted", available() ? "—" : "No dev server: the bridge is absent, not broken.");
		});
	},
});
