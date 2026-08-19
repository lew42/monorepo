import { Doc, md, code, div, p, span, button } from "/app.js";
import * as Ask from "./Ask.js";
import { chat } from "./chat.js";

export default new Doc({
	meta: import.meta,
	title: "Ask",
	description: "Chat with a Claude Code session from the browser — one socket message, one headless CLI turn.",
	icon: "forum",

	subject: Ask,
	methods: "ask thread start available",
	notes: "task process fork shot record decisions",
	files: "Ask.js ask.css chat.js page.js readme.md",

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

		md("A string is a selector on **this** page; `{url, selector, width, height}` reaches any other. The dev server drives globally-installed playwright, hands the turn a png, and the turn reads it — so a page can ask about how it looks, not just what it says. Full mechanism: [shot](docs/shot/).");

		this.asker("Ask about the input above", "In ONE sentence: what is this element, and what is its most obvious layout problem?",
			{ model: "haiku", shot: ".chat-form" });

		md("### Opening a thread, and starting a whole task");

		code.js(`await thread("framework/styles/layouts/ai/rhythm");   // a dir + one log line, no process
await start("fix the audit page's severity sort", { group: "layout" });  // scaffolds AND spawns a session`);

		md("`thread()` opens `<page>ai/<slug>/task.jsonl` beside a page — that's what `+` does in the [dev rail](/framework/dev/DevBar/)'s thread panel, and what every `chat()` above is really appending to once a `task` is passed. `start()` is the other door: it scaffolds `framework/ai/<date>/<slug>/` exactly like the `new-task` skill would and spawns a **whole session** to work it, not a turn — that's the compose box on [the board](/framework/ai/). Neither is demoed live here: both write real files, and their live demos are the pages that already use them. Path shape and the fence both take: [task](docs/task/).");

		md(`### The arguments

| | |
|---|---|
| \`from\` | a session id to **fork** — inherit its whole context, get a new id |
| \`resume\` | a session id to **continue** — the id a previous reply returned |
| \`task\` | a thread's path under \`public/\`; the exchange lands in its log |
| \`shot\` | a selector, or \`{url, selector}\` — a picture for the turn to read |
| \`on\` | \`{text}\` / \`{tool}\` as the turn streams |
| \`context\` | what the page is doing right now — the dev rail sends the selection |
| \`model\`, \`tools\` | per call; \`tools: ""\` is a pure-text turn |

Every turn is told the id of **the tab that asked**, and the \`site\` MCP tools take that id — so a second window on the same page is never touched. The server rings the asking tab for the length of the turn. [decisions](docs/decisions/)`);

		md("See it live: the compose box on [the board](/framework/ai/), the thread panel in the [dev rail](/framework/dev/DevBar/), or [vision](/framework/ext/DesignTool/) asking a second opinion about a layout report.");

		md.details(import.meta, "readme.md", "Readme");
	},

	// A button IS the API — the smallest possible caller, and it costs one haiku turn.
	asker(label, prompt, opts){
		div.c("flow", () => {
			let $out;
			button.c("chat-send", label).click(async () => {
				$out.empty(() => span("thinking…"));
				try {
					const r = await Ask.ask(prompt, opts);
					$out.empty(() => span(`${r.text} — $${r.cost_usd.toFixed(3)}, ${Math.round(r.duration_ms / 1000)}s`));
				} catch (e){
					$out.empty(() => span(e.message));
				}
			});
			$out = p.c("muted", Ask.available() ? "—" : "No dev server: the bridge is absent, not broken.");
		});
	},
});
