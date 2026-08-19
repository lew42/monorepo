import { View, div, p, span, form, textarea, button } from "/framework/core/View/View.js";
import md from "../markdown/md.js";
import { ask, available } from "./Ask.js";

View.stylesheet(import.meta, "ask.css");

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
 */
export function chat({ task, from, resume, history = [], model = "sonnet", tools, context, placeholder = "Ask Claude…" } = {}){
	return div.c("chat flow", () => {
		const $list = div.c("chat-list");
		history.forEach(c => bubble($list, c.role, () => md(c.text ?? "")));

		if (!available()){
			p.c("muted", "The bridge is localhost only — this is the recorded exchange, not a live one.");
			return;
		}

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
					const r = await ask(prompt, { task, model, tools, resume, from, context: context?.(), on: e => {
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

export default chat;
