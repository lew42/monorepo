import { Page, p, div, select, option, h2, span, a } from "/app.js";
import { page_work } from "/framework/core/Page/ai/work.js";
import { ChatPanel } from "/framework/ext/Chat/ChatPanel.js";
import { servex_url } from "/framework/dev/servex_url.js";

/* THE REPORT LINK (review.md findings 2 and 8, 2026-10-01): the owner's first ask
 * for this page was a REPORT of everything local-AI on this machine (owner-words.md,
 * 15:50) before "a little UI harness" was added to it (15:55) — "that page", same
 * url. The full inventory (programs, models, disk used, what's half-broken) lives
 * in the task card, not retyped here — this page points at it instead of repeating
 * it (CLAUDE.md "Docs point, they don't explain"). Also used wherever a message
 * below needs a real place to click instead of a dangling "see the readme". */
const REPORT_URL = "/framework/ai2/2026-10-01/local-ai/";

/* THE LOCAL-MODELS CHAT HARNESS (requirements.md Phase 2 ask 2, Phase 3 ask 2) —
 * one page to actually TALK to a model running on this machine's own GPU,
 * through Servex's `local` provider (Servex/ext/local/). It reuses the one
 * chat widget the whole framework already has, `ChatPanel` (ext/Chat), the
 * same component the drawer's AI tab and the mobile ✦ sheet use — CLAUDE.md
 * law 6, one of everything. The only new piece is `deliver`: instead of going
 * to the owner's own cloud agent (the drawer's `send()`), it posts straight to
 * `/api/local-chat` (Servex.js), a tiny one-shot call that runs through the
 * local provider — Servex starts (or swaps) llama-server for whichever model
 * the dropdown picked, and this page only ever sees the finished reply.
 *
 * `GET /api/local-chat` answers the dropdown's own list — every gguf file
 * `Servex/ext/local/provider.js` actually found on disk right now, so a model
 * that isn't there yet (the brief's "copy or symlink" choice) just isn't
 * offered, with no error anywhere. */
const CHAT_ENDPOINT = "/api/local-chat";

export default new Page({
	meta: import.meta,
	title: "Local Models",
	description: "Talk to a model running on this machine's own GPU — no cloud, no cost, pick which gguf file answers.",
	icon: "chat",
	/* Once inbox-ext's auto-tab-detection lands (public/framework/ai/2026-09-30/
	 * inbox-ext/), a page.jsonl line {"settings":{"tab":true}} is what makes a
	 * page show up as its own top tab with no further edit. This page has no
	 * page.jsonl (it needs real interactivity, so it's a hand-written page.js
	 * instead — new-page skill, step 3), so the same flag is set here, on the
	 * instance, instead — it does nothing until that feature reads it, and
	 * nothing here has to change again once it does. */
	settings: { tab: true },

	content(){
		p("This box talks straight to a model on your own graphics card, through llama.cpp — "
			+ "no cloud, no cost. The first reply takes a few seconds while the model loads; "
			+ "after that it's fast, and Servex unloads it again once you stop, to free the GPU.");

		h2("What's installed");
		p(() => {
			span("Searched this PC for every local AI program and model file (Ollama, llama.cpp, "
				+ "LM Studio, ComfyUI, Stability Matrix, whisper-server) — about 57 GB of model "
				+ "files across them. ");
			a("Full inventory, what's running, what's half set up").href(REPORT_URL);
		});

		let models = [], picked = null, panel, fetchFailed = false, $picker;

		const draw_picker = () => {
			$picker.empty(() => {
				if (fetchFailed){
					p.c("muted", "Couldn't reach Servex to list local models — it may not be running this change yet.");
					return;
				}
				if (!models.length){
					p.c("muted", () => { span("No local model file was found on disk. "); a("See the full inventory").href(REPORT_URL); });
					return;
				}
				picked = models.includes(picked) ? picked : models[0];
				select(() => models.forEach(m => option(m).attr("value", m)))
					.attr("value", picked)
					.on("change", e => { picked = e.target.value; });
			});
		};

		// One card, not a floating picker above a separate chat card (review.md
		// findings: spacing 34/35/39, layout 4) — pick-a-model and talk-to-it are
		// one unit, so they sit inside one frame together.
		div.c("card pad flow", () => {
			$picker = div.c("pad");
			draw_picker();   // an empty picker first, so the page has something to show before the fetch answers

			panel = new ChatPanel({
				placeholder: "ask the local model something",
				deliver: async entry => {
					if (!picked){
						panel.say({ chat: { at: new Date().toISOString(), from: { kind: "assistant" }, text: "_No local model is available yet — see the inventory above._" } });
						return false;
					}
					const reply_at = new Date(Date.now() + 1).toISOString();
					panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: `_${picked} is thinking…_` } });
					try {
						const r = await fetch(servex_url(CHAT_ENDPOINT), { method: "POST", headers: { "content-type": "application/json" },
							body: JSON.stringify({ model: `local/${picked}`, text: entry.text }) });
						const body = await r.json();
						panel.say({ chat: { at: reply_at, from: { kind: "assistant" },
							text: body.ok ? body.text : `**${picked} could not answer:** ${body.why}`, fix: true } });
						return !!body.ok;
					} catch (e){
						panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: `**Could not reach Servex:** ${e.message}`, fix: true } });
						return false;
					}
				},
			});
		});

		fetch(servex_url(CHAT_ENDPOINT)).then(r => r.json()).then(body => { models = body.models ?? []; draw_picker(); })
			.catch(() => { fetchFailed = true; draw_picker(); });

		// Plain, not "card" — an empty framed box reads as a mistake (review.md finding 7);
		// a muted line of text doesn't.
		div.c("pad", $box => page_work($box, { match: ["local model", "llama", "gguf", "local-ai"], page: this }));
	},
});
