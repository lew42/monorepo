import { div, p, span, form, textarea, button } from "/framework/core/View/View.js";
import md from "../markdown/md.js";
import { ask, available } from "./Ask.js";
import { pick } from "./pick.js";
import { verdict_mark, verdict_acts } from "./verdict.js";

// ask.css is loaded by pick.js, which this file imports — one <link>, not two.

// ⚠ Built inside `$list.append(fn)` on purpose — the callback re-establishes the
// captor, so a bubble raised from an event handler still lands in the list.
function bubble($list, role, body){
	let $body;
	$list.append(() => { div.c("chat-turn chat-" + role, () => {
		span.c("chat-role muted", role);
		$body = div.c("chat-body", body);
	}); });
	$body.el.scrollIntoView({ block: "nearest" });
	return $body;
}

/**
 * A text input wired to a Claude Code session. `task` — a thread's path under
 * `public/` — files the exchange in that thread's log; `resume` continues a chat
 * session, `from` forks the task's own. `context` is a FUNCTION returning anything
 * the turn should know about the page right now (the dev rail passes the current
 * selection); it is called on send. Renders the recorded history either way —
 * read-only with no server.
 *
 * Above the input is a **pick an element** button: click it, click anything on the
 * page, and the next question is about that element — a chip names it, and the turn
 * is handed that page's readme and decisions (`pick.js`). `picker: false` turns the
 * button off; `app` is the running App, which the picker uses to name the page.
 */
export function chat({ app, task, from, resume, history = [], model = "sonnet", tools, context, picker = true, placeholder = "Ask Claude…" } = {}){
	return div.c("chat flow", () => {
		const $list = div.c("chat-list");
		history.forEach(c => bubble($list, c.role, () => md(c.text ?? "")));

		if (!available()){
			p.c("muted", "The bridge is localhost only — this is the recorded exchange, not a live one.");
			return;
		}

		/* What the next question is about, shown as one line above the input so it is
		   never a surprise. Rebuilt whole on every change — three states, two clicks. */
		let picked = null;
		const $chip = picker && div.c("ask-chip-row flex v-center");

		const show = () => $chip.empty(() => {
			if (!picked) return void button.c("ask-chip-pick", "pick an element").attr("type", "button")
				.click(async () => { picked = await pick({ app }); show(); });

			span.c("ask-chip", picked.label ?? picked.selector).attr("title", picked.selector);
			span.c("ask-chip-page muted", picked.home ?? picked.page).attr("title", picked.page);
			button.c("ask-chip-x", "×").attr("type", "button").attr("title", "ask about the page instead")
				.click(() => { picked = null; show(); });
		});

		if (picker) show();

		form.c("chat-form", $form => {
			const $input = textarea.c("chat-input").attr("placeholder", placeholder).attr("rows", "2");
			const $send = button.c("chat-send", "Send").attr("type", "submit");

			const send = async () => {
				const prompt = $input.el.value.trim();
				if (!prompt || $send.el.disabled) return;

				$input.el.value = "";
				$send.el.disabled = true;
				bubble($list, "user", () => md(prompt));
				const $reply = bubble($list, "assistant", () => span.c("chat-wait muted", "thinking…"));
				let streamed = "";

				try {
					// ⚠ Called at SEND time, not at build time — what is selected is whatever
					// the owner had selected when they hit send, not when the box was drawn.
					const about = picked ? { ...picked, selection: context?.() } : context?.();

					const r = await ask(prompt, { task, model, tools, resume, from, context: about, on: e => {
						streamed += e.text ?? (e.tool ? `\`${e.tool}\`… ` : "");
						$reply.empty(() => md(streamed));
					} });
					resume = r.session_id;
					$reply.empty(() => {
						md(r.text ?? "");
						span.c("chat-cost muted", `$${(r.cost_usd ?? 0).toFixed(3)} · ${Math.round((r.duration_ms ?? 0) / 1000)}s`);
					});
				} catch (e){
					$reply.empty(() => p.c("chat-error", e.message));
				}

				$send.el.disabled = false;
				$input.el.focus();
			};

			$form.on("submit", e => { e.preventDefault(); send(); });
			$input.on("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); });
		});
	});
}

/**
 * A tiny floating **?** in the corner of a page, for any page that wants one.
 * Call it in `content()` and that is the whole opt-in:
 *
 *     import { mount } from "/framework/ext/Ask/chat.js";
 *     content(){ mount({ app: this.app, url: this.url }); }
 *
 * It appears only when the dev server is answering (`available()`), so on the
 * static site it renders nothing at all. Clicking it opens a chat panel whose
 * first button is **pick an element**.
 *
 * `url` is optional and turns on the second thing this control does: Approve
 * and Improve for the WHOLE PAGE, the same verdict `/layouts/browse/` gives
 * its catalogued items — `verdict.js`, `doc/decisions.md`. Pass `this.url`
 * from the `Page` calling `mount()`, never `location.pathname` — see the
 * warning on `verdict_mark()` for why. Leave it out and the control is the
 * plain asker it always was.
 *
 * ⚠ Not mounted site-wide on purpose — a page opts in, one call at a time.
 * ⚠ It is `position: fixed` and it stays INSIDE the page that called it, so the
 *   page's own removal removes it. On a page with a rail, or under a columns host,
 *   core has made that box a containing block (`Page.css`), so the ? pins to the
 *   region's bottom-right instead of the window's — the same corner, to look at.
 * ⚠ `tools: ""` is the default, which makes each turn a PURE TEXT turn. It is the
 *   right default: the readme and the decisions are already quoted into the prompt,
 *   so the answer is grounded without the turn reading anything, and it stays cheap
 *   (~$0.02 on haiku) and fast. Pass `tools: "Read,Grep"` to let it go looking.
 */
export function mount({ app, task, model = "haiku", tools = "", placeholder = "Ask about this page…", url } = {}){
	if (!available()) return null;

	return div.c("ask-float", () => {
		// Built immediately, not lazily — a mark the owner can see WITHOUT
		// opening the panel is the whole point of it (doc/decisions.md).
		if (url) verdict_mark(url);

		const $panel = div.c("ask-float-panel");
		$panel.el.hidden = true;

		// Built on FIRST open, not on mount: a page nobody asks about pays nothing.
		let built = false;

		button.c("ask-float-btn prim", "?").attr("type", "button")
			.attr("title", "Ask Claude about something on this page")
			.click(() => {
				$panel.el.hidden = !$panel.el.hidden;
				if ($panel.el.hidden || built) return;

				built = true;
				$panel.append(() => {
					div.c("ask-float-head flex v-center split", () => {
						span.c("ask-float-title", "Ask about this page");
						button.c("ask-float-x", "×").attr("type", "button")
							.click(() => { $panel.el.hidden = true; });
					});
					if (url) verdict_acts({ url });
					chat({ app, task, model, tools, placeholder });
				});
			});
	});
}

export default chat;
