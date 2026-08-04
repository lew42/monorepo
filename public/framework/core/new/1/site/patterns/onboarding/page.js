import { Page, p, div, a, input, select, option, label, progress } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";

/* Five ordered steps, and the question the product exists to answer: what stops
 * somebody typing step four into the address bar?
 *
 * The honest answer is nothing, and that it should stay nothing. Every url
 * resolves if the walk resolves, `content()` runs once so it cannot gate, and a
 * redirect from inside `activate()` re-enters the Router mid-activation. So:
 * let them arrive, tell them what is missing, and guard the ACTION instead.
 */
const steps = [
	["account",   "Create your account"],
	["workspace", "Name your workspace"],
	["invite",    "Invite your team"],
	["connect",   "Connect a repository"],
	["finish",    "You are set up"],
];

// The prerequisite that makes this a flow rather than five pages
const needs = { connect: "workspace", finish: "connect" };

const done = new Set();
const watchers = [];

const nav = () => ({
	meta: import.meta,
	title: "Onboarding",

	// Five inline children, in order. `children` is a Map in declaration order,
	// so the order of the flow is the order of these lines and nothing else
	// records it.
	initialize(){
		steps.forEach(([name, title], i) => this.add(name, {
			title,
			content(){ step(name, title, i); },
		}));
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Five steps, five urls, no files. Walk it forward, then type step four straight into the address bar and see what happens.");

		this.progress();

		section("Steps");

		this.previews();

		section("The guard question");

		code(`
a guard in content()     content() runs ONCE — the check is stale the moment
                         anything changes, and never runs again on re-entry
a guard in child()       returning null 404s, and Router.go() hands a 404 to
                         location.assign() — a full reload to say "not yet"
a redirect in activate() re-enters the Router mid-activation; open issue 4 says
                         there is no in-flight guard, so it races
none of them             render the step, say what is missing, disable the
                         button. The url is the state; let them arrive.`);

		p("The last one is the answer, and the readme already reached it from the other side: `redirect()` and `Router.enter()` were backed out for being one layout's convenience. A guard is a product requirement rather than a convenience, and it still does not earn a Router concept — because on static hosting there is no security boundary to enforce anyway. Guard the action; never the url.");

		section("But one hook is genuinely missing");

		code(`
deactivate(){ return this; }    // "Override to release a socket, a timer, a <video>"

// …and nothing to acquire them with. activate() does the mounting, so
// overriding it in an options object silently breaks container().`);

		p("Leaving has a hook and entering does not. The progress bar above updates only because every step calls a module-level `complete()` that both pages can see — explicit, visible at the call site, and impossible the moment two pages live in two modules. The request is one line at the end of `activate()`: `this.entered?.()`.").ac("note");

		div.c("row", () => {
			a.c("page-link", "start").href("/patterns/onboarding/account/");
			a.c("page-link", "skip to step 4").href("/patterns/onboarding/connect/");
			a.c("page-link", "the gallery →").href("/patterns/gallery/");
		});
	},

	progress(){
		const $bar = progress().attr("max", String(steps.length));
		const $text = p("").ac("note");

		watch(() => {
			$bar.attr("value", String(done.size));
			$text.text(`${done.size} of ${steps.length} complete${done.size ? "" : " — and a reload puts it back to zero, because progress is server state and there is no server"}`);
		});
	},
});

function step(name, title, i){
	const previous = needs[name];

	if (previous){
		const $guard = div();
		watch(() => $guard.empty(() => done.has(previous)
			? p(`Prerequisite met: ${previous}.`).ac("note")
			: p(`You have not finished "${previous}" yet. You are welcome to read this step; the button is off until you do.`).ac("note")));
	}

	fields(name);

	div.c("row", () => {
		const next = steps[i + 1];

		if (next){
			const $go = a.c("page-link", `Continue to ${next[1]} →`).href(`/patterns/onboarding/${next[0]}/`);

			$go.on("click", () => complete(name));
			watch(() => previous && !done.has(previous) ? $go.hide() : $go.show());
		}

		a.c("page-link", "← Onboarding").href("/patterns/onboarding/");
	});

	p(`Step ${i + 1} of ${steps.length}. Reachable cold, linkable, and reload-safe — everything except the progress, which nothing here can persist.`).ac("note");

	// A step replaces the flow page rather than nesting inside it, so my
	// parent's recipe is not on screen anywhere. Print it here.
	recipe(nav, "the flow's navigation — initialize() produced this step");
}

function fields(name){
	const rows = {
		account:   [["Email", "email"], ["Password", "password"]],
		workspace: [["Workspace name", "text"], ["URL slug", "text"]],
		invite:    [["Teammate email", "email"], ["Another", "email"]],
		connect:   [["Repository", "select"], ["Branch", "text"]],
		finish:    [],
	}[name];

	rows.forEach(([text, type]) => div.c("row", () => {
		label(text + " ");
		type === "select"
			? select(() => ["acme/api", "acme/web", "acme/infra"].forEach(r => option(r)))
			: input().attr("type", type).attr("size", 24);
	}));

	if (name === "finish") code("Everything is connected.\nFirst build starts in a moment.");
}

/* The explicit coordination the missing hook forces. Every step calls this, and
 * every view that shows progress registered a redraw — which works only because
 * all of them live in this one module. */
function complete(name){
	done.add(name);
	watchers.forEach(redraw => redraw());
}

function watch(redraw){
	watchers.push(redraw);
	redraw();
}
