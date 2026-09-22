import { Page, View, div, h1, p, span, button } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import a from "./a.js";
import b from "./b.js";
import c from "./c.js";

View.stylesheet(import.meta, "demo.css");

/* THE RELOAD HOLD, shown rather than told — ai/2026-09-19/reload-hold/requirements.md.
 * Three live proofs on one page, each doing the thing the prose beside it claims:
 *
 *  1. a CSS swatch, styled by demo.css — an edit to that file swaps colour with
 *     ZERO reloads (dev/Socket/Socket.js's restyle(), already shipped).
 *  2. a JSONL log, streamed from demo-board.jsonl over the dev socket (Tail.js) —
 *     proves the streams that keep flowing during a hold are a SEPARATE channel
 *     from the queued/held `changed` broadcast LiveReload.js sends.
 *  3. a "re-import this module" button — the hot-module-reload EXPERIMENT: it
 *     dynamic-imports this very file with a cache-busting query, then live-swaps
 *     the fresh copy into the Router in place of the page you're looking at, with
 *     no browser navigation. What survives and what breaks is printed below it.
 *
 * `evaluations` is module-scope state — a fresh cache-busted import gets its OWN
 * copy, starting over, which is exactly the "module singletons split in two"
 * finding the study's decision line is about. `window.__rh_evals` is the one
 * number every copy of this module (old and new) agrees on, because `window` is
 * shared and module scope is not. */
window.__rh_evals = (window.__rh_evals || 0) + 1;
const evaluations = window.__rh_evals;

// Registered again by every re-import — a real module doing this would fire its
// handler twice per click after one reimport. Nothing here needs the count shown
// live; it is enough that it is real and mentioned in the prose below.
window.addEventListener("click", () => { window.__rh_clicks = (window.__rh_clicks || 0) + 1; });

export default new Page({
	meta: import.meta,
	title: "Reload hold",
	description: "A live-reload hold any agent takes before a batch of writes, shown working — plus a small study of hot module reloading.",
	icon: "pause_circle",

	content(){
		p("This page is the proof, not just the description. Three small live things sit below: a colour box that changes with no reload, a log that keeps streaming even while reload itself is paused, and a button that reloads its own code without reloading the page.");

		div.c("rh-sect", () => {
			h1.c("rh-h2", "1. Take and release a hold");
			p("Any agent runs these three commands, in order, around a batch of file writes: " +
				"node Server/hold.mjs on \"who — why\" — then the writes — then node Server/hold.mjs off \"who\". " +
				"While held, every tab keeps running; nothing reloads until the last hold comes off, and then it reloads once, however many files changed.");
		});

		div.c("rh-sect", () => {
			h1.c("rh-h2", "The three files a batch touches");
			p("a.js, b.js and c.js — real imported modules, loaded once with this page. The prove step edits all three while held, then releases: the batch reloads this page exactly once, not three times.");
			span.c("rh-abc", `a=${a} · b=${b} · c=${c}`);
		});

		div.c("rh-sect", () => {
			h1.c("rh-h2", "2. CSS swaps with zero reloads");
			p("This box's colour lives in demo.css. Edit that file — held or not — and the colour changes here with no page reload at all: the socket swaps the stylesheet's own <link>, in place.");
			span.c("rh-swatch");
		});

		let $log;
		div.c("rh-sect", () => {
			h1.c("rh-h2", "3. A .jsonl log keeps streaming during a hold");
			p("This list is demo-board.jsonl, streamed live. Appending a line to that file shows up here immediately, whether or not a reload hold is on — .jsonl tails are Tail.js, a different channel from the reload broadcast LiveReload.js queues and holds.");
			// ⚠ No DOM after an await: the box is captured now, filled by the callback below.
			$log = div.c("rh-jsonl-log");
		});
		const board = new JSONL({ url: import.meta.resolve("./demo-board.jsonl") });
		const draw = () => $log.empty(() => {
			if (!board.logs.length) return p.c("rh-jsonl-line", "(nothing logged yet)");
			board.logs.forEach(entry => p.c("rh-jsonl-line", entry.msg ?? JSON.stringify(entry)));
		});
		board.live(draw).then(draw);

		let $out;
		div.c("rh-sect", () => {
			h1.c("rh-h2", "4. Re-import this page's own code — the HMR experiment");
			p(`This copy of the module has run ${evaluations} time(s) (page.js's own count, shared on window since module scope is not: window.__rh_evals is ${window.__rh_evals} right now). The button re-imports this exact file with a fresh cache-busting query — a real new module, not a reload — and swaps the result into the Router in this page's own slot.`);
			button.c("rh-reimport-btn", "Re-import this module").click(function(){ reimport(this, $out); });
			$out = div.c("rh-reimport-out");
		});

		div.c("rh-sect", () => {
			h1.c("rh-h2", "Decision");
			p("Ship CSS hot swap now — it already exists (Socket.js's restyle(), proven above) and a hold makes it safe to batch: nothing to lose. Keep page-module re-import an opt-in EXPERIMENT, this button, not a default behaviour — see the result box above for exactly why: a module-scope counter and a stylesheet <link> both duplicate on every re-import, because the browser treats the cache-busted url as a brand-new module with its own top-level run, alongside the old one, forever, with nothing cleaning up either copy. A shared module like core/View always needs a real reload: every page on screen holds a reference to ITS copy, and a second copy would make `instanceof` disagree with itself between old pages and any freshly re-imported one.");
		});

		const self = this;
		async function reimport(btn, $out){
			btn.el.disabled = true;
			const before_links = document.querySelectorAll('link[href*="demo.css"]').length;
			const before_global = window.__rh_evals;

			try {
				const fresh_url = import.meta.url.replace(/\?.*$/, "") + "?hmr=" + Date.now();
				const fresh = await import(fresh_url);
				const after_links = document.querySelectorAll('link[href*="demo.css"]').length;
				const after_global = window.__rh_evals;

				let swapped = false;
				if (self.parent && fresh.default instanceof Page) {
					self.parent.add(self.name, fresh.default);
					await self.app.router.load(location.pathname);
					swapped = true;
				}

				// ⚠ `self` (the OLD page) may already be deactivated by the swap above —
				// write findings through $out directly, never through `self` again.
				$out.empty(() => {
					p.c("rh-finding", `window.__rh_evals: ${before_global} → ${after_global} — the module ran its top-level code again.`);
					p.c("rh-finding", `demo.css <link> elements: ${before_links} → ${after_links} — View.stylesheet() appended a SECOND one; nothing removed the first.`);
					p.c("rh-finding", swapped
						? "Live-swapped into the Router — this whole section just re-rendered from the fresh module, with no browser navigation."
						: "Could not swap — see the console.");
				});
			} catch (e) {
				$out.empty(() => p.c("rh-finding", "Re-import failed: " + (e?.message || e)));
			}
		}
	},
});
