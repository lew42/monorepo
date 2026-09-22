import { Doc, md, code, div, p, h4, pre, span, button, details, summary } from "/app.js";
import * as Ask from "./Ask.js";
import { chat, mount } from "./chat.js";

export default new Doc({
	meta: import.meta,
	title: "Ask",
	description: "Chat with a Claude Code session from the browser — one socket message, one headless CLI turn.",
	icon: "forum",

	subject: Ask,
	methods: "ask thread start available pick",
	notes: "reply picking task process fork shot record decisions",
	files: "Ask.js pick.js reply.js mic.js verdict.js ask.css chat.js page.js readme.md",

	content(){

		// The floating ? this page is demonstrating, on this page — and pass `url`
		// too, and the same **?** carries Approve/Improve for this page ITSELF
		// (verdict.js). Off the dev server it renders nothing either way.
		mount({ app: this.app, url: this.url });

		code.js(`const { text } = await ask("Name the three widest elements on this page.");`);

		md("A button or a text input sends a prompt over the dev socket; the server runs **one headless turn** of the `claude` CLI and streams the reply back. Continuity is the transcript on disk, so there is no wrapped terminal and no long-lived child process.");

		md("**Localhost only, and the dev rail's own switch.** Off the dev server `ask()` rejects and `chat()` renders read-only; the dev rail also carries an **edit** checkbox (`ctrl + \\`) that previews that same read-only state on localhost, without leaving it — `edit.js`, [`doc/decisions.md`](./doc/decisions.md).");

		md("**Open the `?` in the corner and press Approve.** This page is now judged the same way [`/layouts/browse/`](/layouts/browse/) judges its 102 catalogued items — the check mark that appears is a real line in `/layouts/verdicts.jsonl`, keyed by this page's own url. Ten real layout pages carry this today; the growing set of approvals reads back on [the approved library](/layouts/doc/studies/approved/). [`verdict.js`](./verdict.js), [`doc/decisions.md`](./doc/decisions.md).");

		this.asker("Ask: what is 2 + 2?", "What is 2 + 2? Reply with the number alone.", { model: "haiku", tools: "" });

		md("### Pick an element, and see what a question about it is told");

		md("Click **pick an element** and then click anything on this page. Nothing is sent and nothing is spent — this prints the context the picker gathered, which is what the next question would open with. The floating **?** in the bottom corner of this page is the same thing as a chat.");

		this.picker();

		md("### The panel");

		md("`chat()` is the same call as a view: history, an input, streaming bubbles. Pass `task` — a thread's path under `public/`, like `framework/styles/layouts/ai/rhythm` — and the exchange is appended to that thread's `task.jsonl` as `chat` lines. That is what [a task's detail page](/framework/ai/2026-08-14/browser-cli-bridge/) mounts, and what the [dev rail](/framework/dev/DevBar/) mounts on every page. This one records nothing.");

		chat({ model: "haiku", placeholder: "Ask haiku something (no tools, no record)…", tools: "" });

		md("### Reply to one item, where it already is");

		code.js(`import { reply, dictate } from "/framework/ext/Ask/reply.js";

reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary, quote: ask.quote } });
dictate({ m, about: { kind: "dictation", id: "asks" } });`);

		md("Two small buttons — **reply** and **🎤** — under any item of a task's hierarchy: an ask card, a decision row, a task card on the day board. Press either and a one-line box opens under that item; what you type or say goes to Claude with the item **already explained**, so you never say which one you mean, and the answer lands under the same item a few seconds later. The 🎤 is the browser's own speech recognition (Chrome desktop and Android; elsewhere the button is not drawn and a line says to type).");

		md("The turn is a minion, not a chat partner: it answers in four sentences, and where the reply asked for something it also writes `ask` / `decision` / `log` lines into that task's log — which stream straight back onto the tab as new cards and rows. `dictate()` is the same machine set to split a dictation into one ask per thing you named. Both: [reply](/framework/ext/Ask/doc/reply/).");

		md("Not demoed here, for the same reason `thread()` and `start()` are not: every press writes real lines into a real log. It is live on [this module's own task](/framework/ai/2026-09-18/reply-in-place/) — open the **Asks** tab and press **reply** under any card — and on every task page under [the board](/framework/ai/).");

		md("### Let it look at the element");

		code.js(`await ask("What is wrong with this element's layout?", { shot: ".chat-form" });`);

		md("A string is a selector on **this** page; `{url, selector, width, height}` reaches any other. The dev server drives globally-installed playwright, hands the turn a png, and the turn reads it — so a page can ask about how it looks, not just what it says. Full mechanism: [shot](/framework/ext/Ask/doc/shot/).");

		this.asker("Ask about the input above", "In ONE sentence: what is this element, and what is its most obvious layout problem?",
			{ model: "haiku", shot: ".chat-form" });

		md("### Opening a thread, and starting a whole task");

		code.js(`await thread("framework/styles/layouts/ai/rhythm");   // a dir + one log line, no process
await start("fix the audit page's severity sort", { group: "layout" });  // scaffolds AND spawns a session`);

		md("`thread()` opens `<page>ai/<slug>/task.jsonl` beside a page — that's what `+` does in the [dev rail](/framework/dev/DevBar/)'s thread panel, and what every `chat()` above is really appending to once a `task` is passed. `start()` is the other door: it scaffolds `framework/ai/<date>/<slug>/` exactly like the `new-task` skill would and spawns a **whole session** to work it, not a turn — that's the compose box on [the board](/framework/ai/). Neither is demoed live here: both write real files, and their live demos are the pages that already use them. Path shape and the fence both take: [task](/framework/ext/Ask/doc/task/).");

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

Every turn is told the id of **the tab that asked**, and the \`site\` MCP tools take that id — so a second window on the same page is never touched. The server rings the asking tab for the length of the turn. [decisions](/framework/ext/Ask/doc/decisions/)`);

		md("See it live: the compose box on [the board](/framework/ai/), the thread panel in the [dev rail](/framework/dev/DevBar/), or [vision](/framework/ext/DesignTool/) asking a second opinion about a layout report.");

		md.details(import.meta, "readme.md", "Readme").ac("ask-fold");
	},

	/* One pick, printed — and NOT sent. Seeing what a turn would be handed before
	   spending one is the whole demo; the card above the button exists so there is
	   something obvious to pick. */
	picker(){
		div.c("flow", () => {
			div.c("ask-demo-card surface pad flow", () => {
				h4("A card, so there is something to pick");
				p("An ordinary div on this page. Pick it and the readout below fills in with the page it sits on and the files that explain that page.");
			});

			let $out;

			button.c("chat-send", "Pick an element").click(async () => {
				const about = await Ask.pick({ app: this.app });
				// ⚠ A block body: a captured callback's RETURN VALUE would be appended too.
				$out.empty(() => { about ? this.readout(about) : p.c("muted", "Cancelled — nothing picked."); });
			});

			$out = div.c("ask-demo-readout flow", () => { p.c("muted", "Nothing picked yet."); });
		});
	},

	// What one pick gathered: a summary anyone can read, with the turn's actual
	// opening sentences one click down.
	readout(about){
		const file = f => f ? `${f.url} — ${f.text.length} characters` : "none beside that page";
		const row = (key, value) => key.padEnd(13) + value;

		/* ⚠ "on page" and "explained in" are not the same address, and printing only
		   the first was this readout's most confusing line: core renders a Doc's
		   content into a synthetic child page (`…/Ask/overview/intro/`) that owns no
		   files, so the page you are standing on and the folder whose readme answers
		   for it are two different places (2026-09-17). */
		pre.c("ask-demo-out", [
			row("element", about.label),
			row("on page", about.page),
			row("explained in", about.home),
			row("readme", file(about.readme)),
			row("decisions", file(about.decisions)),
			row("module", about.module ? about.module.url : "no framework module owns its class prefix"),
			row("markup", about.html.slice(0, 100) + "…"),
		].join("\n"));

		details(() => {
			summary("The exact sentences the turn opens with");
			pre.c("ask-demo-out", Ask.describe(about));
		});
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
			// ⚠ Say what will happen, not "—". A bare em dash under a button is a
			//   placeholder that tells the reader nothing at all (2026-09-17).
			$out = p.c("muted", Ask.available() ? "Press it and the answer lands here." : "No dev server: the bridge is absent, not broken.");
		});
	},
});
