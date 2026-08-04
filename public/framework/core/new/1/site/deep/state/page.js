import { Page, p, a, div, pre, input, button } from "/app.js";
import { section } from "../../ui.js";
import { probe, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "State across navigation",

	// Three inline children, one per kind of thing a page can be holding when
	// you navigate away from it: a value, a timer, and a hardware resource.
	initialize(){

		this.add("field", {
			title: "A value — survives, and that is the feature",
			content(){
				p("Type something, navigate away, come back. `render()` memoizes into `this.view`, so this is the same `<input>` element — nothing was rebuilt and nothing was restored.");
				input.c("field-input").attr("placeholder", "type here, then leave and come back");
				a.c("page-link", "← back to State").href("/deep/state/");
			}
		});

		this.add("leak", {
			title: "A timer nobody stops",
			ticks: 0,
			content(){
				const $ticks = pre.c("probe-out", "0 ticks");

				p("A `setInterval` started in `content()`. `content()` runs once, but the interval outlives every navigation — `display: none` stops paint, not JavaScript.");

				this.interval = setInterval(() => $ticks.text(`${++this.ticks} ticks`), 100);

				p("And a real hardware resource, on the same terms:");

				button.c("page-link", "start an AudioContext").click(() => {
					this.ctx ??= new AudioContext();
					this.ctx.resume();
					$ticks.text(`${this.ticks} ticks · audio ${this.ctx.state}`);
				});

				a.c("page-link", "← back to State").href("/deep/state/");
			}
			// no deactivate(). That is the point.
		});

		this.add("clean", {
			title: "The same two, released",
			ticks: 0,

			content(){
				this.$ticks = pre.c("probe-out", "0 ticks");
				p("Identical to the leaking page, plus a `deactivate()` — and an `activate()` to start again, because there is no other hook that fires when a page comes back.");
				button.c("page-link", "start an AudioContext").click(() => this.resume());
				a.c("page-link", "← back to State").href("/deep/state/");
			},

			resume(){
				this.interval ??= setInterval(() => this.$ticks?.text(`${++this.ticks} ticks · audio ${this.ctx?.state ?? "off"}`), 100);
				this.ctx ??= new AudioContext();
				this.ctx.resume();
			},

			/* Router calls this on every page LEAVING the chain, deepest first.
			 * It is the only lifecycle call the framework makes on the way out. */
			deactivate(){
				clearInterval(this.interval);
				this.interval = null;
				this.ctx?.suspend();
				return this;
			},

			/* …and there is no matching hook on the way back IN. activate() is
			 * placement, so overriding it means calling the base by hand — forget
			 * that one line and the page silently never mounts again. */
			activate(){
				if (this.ctx) this.resume();
				return Page.prototype.activate.call(this);
			}
		});
	},

	content(){
		probe("what is still running while you read this page", (log) => {
			const here = app.router.active;
			const report = (name, page) => log(
				name.padEnd(6),
				page ? `${page.ticks} ticks` : "never visited",
				page ? `· timer ${page.interval ? "RUNNING" : "stopped"}` : "",
				page?.ctx ? `· audio ${page.ctx.state}` : "");

			report("leak", here.leak);
			report("clean", here.clean);
			log("");
			log("Visit both, start both audio contexts, come back, and run this again.");
		});

		p("`leak` keeps ticking and keeps the audio device open forever. `clean` overrides `deactivate()` and stops at the door. Neither is more correct than the other — the framework has no opinion, which is exactly why the override has to exist.").ac("note");

		section("The three children");

		div.c("row", () => {
			a.c("page-link", "a value").href("/deep/state/field/");
			a.c("page-link", "a leak").href("/deep/state/leak/");
			a.c("page-link", "released").href("/deep/state/clean/");
		});

		section("The asymmetry");

		probe("deactivate() is called on the way out; nothing is called on the way in", async (log) => {
			const here = app.router.active;
			const calls = [];

			for (const name of ["leak", "clean"]){
				const page = await here.child(name);
				const original = page.deactivate.bind(page);
				page.deactivate = () => { calls.push(`${name}.deactivate()`); return original(); };
			}

			await app.router.load("/deep/state/leak/");
			await app.router.load("/deep/state/clean/");
			await app.router.load("/deep/state/");

			log("leak → clean → state");
			log("calls:", calls.join(", ") || "none");
			log("");
			log("Every page that left got deactivate(). No page that ARRIVED got anything");
			log("but activate(), which is placement — so 'resume' has no home of its own.");
		});

		whole(import.meta);
	}
});
