import { Page, md, div, p, h2, span, b, a, img } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-22/'s board — the ordinary
                page grid. Prose rides `main` at --measure; the wire diagram, the
                tool cards and the doc wall claim `wide`.
   2 SIZE       the three-wire diagram and the three-tool wall are both
                .grid.auto at --column: 16rem — 1 track at 400, 3 at 1280+, never
                a lone card stranded on its own row.
   3 OWN LAYOUT prose flow, one envelope code block, two three-card walls, one
                screenshot, then a wall of three collapsed docs (md.details).
   4 REGIONS    none — one column, top to bottom.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN above the fold: the envelope, the diagram, the three example
     calls. The full shape, the security rule and the build plan are each one
     click away in doc/ — never deleted, never repeated here.
   ⚠ Paper task: nothing here calls a real server. The prototype that proves the
     technique lives in proto/ and is linked, not embedded.
   ⚠ No template literals in this file — plain "…" strings, backticks left for
     p()'s own inline-code reading. */

const WIRES = [
	{ name: "Dev server ↔ browser", carrier: "WebSocket · Socket.rpc / async_rpc",
		note: "one more server-called method beside reload / eval / hold" },
	{ name: "Servex ↔ dashboard", carrier: "HTTP · POST /mcp (tools/call)",
		note: "the envelope IS tools/call's own arguments" },
	{ name: "Any Claude session ↔ either", carrier: "MCP · tools/call",
		note: "params.arguments is { target, method, args }" },
];

const TOOLS = [
	{ name: "list_objects", call: "{ }",
		result: "[\"servex\", \"servex.agents\", \"app\", \"app.router\"]" },
	{ name: "describe", call: "{ \"target\": \"servex.agents\" }",
		result: "[{ \"method\": \"list\", \"summary\": \"Every agent Servex has ever registered.\", \"public\": true }, …]" },
	{ name: "call", call: "{ \"target\": \"servex.agents\", \"method\": \"list\", \"args\": [] }",
		result: "{ \"ok\": true, \"value\": [{ \"id\": \"minion-servex-port\", \"state\": \"idle\" }] }" },
];

const DOCS = [
	{ title: "The envelope, in full", file: "envelope.md",
		text: "Every reply shape including the streaming one, exactly how target resolves, and why the JSDoc technique reads fetched source text rather than toString()." },
	{ title: "Security", file: "security.md",
		text: "call is eval with a nicer name. What stays loopback-only, what a target registry refuses, and the one rule the owner has to keep in mind about @public." },
	{ title: "Build plan", file: "build-plan.md",
		text: "The phase-3 build as four dispatchable briefs: the Node root, the browser root, the dashboard, and retiring eval." },
];

export default new Page({
	meta: import.meta,
	title: "The object layer",
	description: "One envelope, { target, method, args }, ridden by all three wires. Three generic tools reach any live object; JSDoc becomes the tool doc.",
	icon: "cable",

	content(){
		p("Three different wires on this site each carry their own hand-built RPC today — the dev server's socket, Servex's `/mcp`, and every REST route in between. This design puts ", b("one envelope"), " on all three: a `target` (a dotted path to a live object), a `method` (one of its methods), and `args` (a plain array). Three generic MCP tools — `list_objects`, `describe`, `call` — read and drive any object that shape reaches, and their documentation is the object's own JSDoc, not a second copy of it written by hand. This page is the design; nothing here is built yet — the four briefs to build it are one click down.");

		h2("The envelope");
		md("```json\n{ \"target\": \"servex.agents\", \"method\": \"list\", \"args\": [] }\n```");
		p.c("muted", "A reply is { ok: true, value } or { ok: false, error }. A method that yields sends more than one frame — the exact shape, and how each wire carries it, is in envelope.md below.");

		h2("The same envelope, three wires");
		this.wires();

		h2("Three tools, one example call each");
		this.tools();

		h2("See it work");
		p(() => { a("proto/browser.html").href(import.meta.resolve("./proto/browser.html")); });
		p("Loaded headless on a private port: `describe` reads a real `View` subclass's JSDoc straight from its own fetched source — no build step, no toString(). It caught a real bug on the way: the first version of the parser spliced two methods' doc comments together the moment a class had more than one; fixed in both `proto/objects.mjs` and this file, six-for-six after.");
		img().attr("src", import.meta.resolve("./shots/browser-describe.png")).attr("alt", "describe() reading JSDoc from a fetched module in the browser, both methods' own summaries shown correctly, in 9.3ms").style({ "max-width": "40em", "border": "1px solid var(--ink-10)" });
		md("```\nnode proto/objects.mjs\nPASS — list_objects() finds servex, servex.agents, app, app.router\nPASS — describe(servex.agents) exposes only @public methods (list, stop), not assign\nPASS — describe(servex.agents) carries EACH method's own JSDoc summary, not its neighbour's\nPASS — call({target:\"servex.agents\", method:\"list\"}) runs the real method\nPASS — call refuses a method with no @public tag (assign)\nPASS — resolve refuses a \"__proto__\" path segment\n```");

		h2("The detail — one click down");
		this.docs();
		p.c("muted", "Each one in full, without leaving this page.");
		this.reading();

		p.c("muted", () => {
			span("Section I of ");
			a("the Servex Mastermind brief").href("../mastermind-servex/requirements.md");
			span(". The substrate this sits on top of is being built beside it by ");
			a("servex-port").href("../servex-port/");
			span(", ");
			a("agent-host").href("../agent-host/");
			span(" and ");
			a("servex-integrate").href("../servex-integrate/");
			span(".");
		});
	},

	wires(){
		return div.c("grid auto gap", () => {
			WIRES.forEach(w => {
				div.c("card size-small flex v gap-25", () => {
					span.c("h4", w.name);
					p.c("muted", w.carrier);
					p(w.note);
				});
			});
		}).style({ "--column": "16rem" }).ac("wide");
	},

	tools(){
		return div.c("grid auto gap", () => {
			TOOLS.forEach(t => {
				div.c("card size-small flex v gap-25", () => {
					span.c("h4", t.name);
					md("```json\n" + t.call + "\n```");
					p.c("muted", "→");
					md("```json\n" + t.result + "\n```");
				});
			});
		}).style({ "--column": "16rem" }).ac("wide");
	},

	docs(){
		return div.c("grid auto gap", () => {
			DOCS.forEach(d => {
				div.c("card size-small flex v gap-25", () => {
					span.c("h4", d.title);
					p(d.text);
					p.c("muted", "doc/" + d.file);
				});
			});
		}).style({ "--column": "17rem" }).ac("wide");
	},

	reading(){
		return div.c("flex v gap-25", () => {
			DOCS.forEach(d => {
				md.details(import.meta, "doc/" + d.file, d.title + " — doc/" + d.file);
			});
		}).ac("wide");
	},
});
