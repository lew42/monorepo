import View, { div, span, button, select, option } from "../../core/View/View.js";
import { section } from "./parts.js";
import { servex_url } from "../servex_url.js";
import { AgentTalk } from "../../ai2/live.js";
import devbar from "./DevBar.js";
import devshell from "../DevShell/DevShell.js";
import { use_v1 } from "../DevShell/pref.js";

View.stylesheet(import.meta, "devbar.css");

let active_talk = null;

function normalize_path(path){
	if (!path) return "/";
	return path.endsWith("/") ? path : path + "/";
}


/**
 * Open the dev bar or dev shell directly to the chat tab for a page.
 * Optionally routes ?chat=<session_id> on the page's URL.
 */
export function open_page_chat(page = null, session_id = null){
	const p = normalize_path(page ?? location.pathname);
	const url = new URL(window.location.href);
	if (session_id) url.searchParams.set("chat", session_id);
	else if (!url.searchParams.has("chat")) url.searchParams.set("chat", "open");
	window.history.replaceState({}, "", url.toString());

	if (use_v1()) devbar.open_tab?.("chat");
	else devshell.open_tab?.("chat");
}

/**
 * An optional button that any page can place to open its page assistant.
 */
export function chat_button({ page = null, text = "Assistant", class: cls = "" } = {}){
	return button.c("dev-chat-btn " + cls, text)
		.attr("title", "Open page assistant chat")
		.click(() => open_page_chat(page));
}

/**
 * The dev bar's chat tab for the current page.
 * Reuses the Live card's AgentTalk view and routes ?chat=<session> on the page's URL.
 */
export default function page_chat(app){
	const raw_page = app?.router?.active?.url ?? location.pathname;
	const page = normalize_path(raw_page);
	const url_params = new URLSearchParams(location.search);
	const chat_param = url_params.get("chat");

	section("chat", () => {
		div.c("dev-chat-root flex v gap", () => {
			const $ctrl = div.c("dev-chat-ctrl flex v-center gap wrap");
			const $talk_mount = div.c("dev-chat-mount flex v");

			const load = async () => {
				try {
					const [agents_res, sess_res] = await Promise.all([
						fetch(servex_url(`/api/page-agents?page=${encodeURIComponent(page)}`)).then(r => r.json()).catch(() => ({})),
						fetch(servex_url(`/api/page-sessions?page=${encodeURIComponent(page)}`)).then(r => r.json()).catch(() => [])
					]);

					let assistant = agents_res?.assistant;
					const sessions = Array.isArray(sess_res) ? sess_res : [];

					// Resume specific session if ?chat=<session_id> differs from current
					if (chat_param && chat_param !== "open" && (!assistant || assistant.session_id !== chat_param)){
						const resume_res = await fetch(servex_url("/api/page-session/resume"), {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({ page, session_id: chat_param })
						}).then(r => r.json()).catch(() => ({}));
						if (resume_res?.ok){
							assistant = { id: resume_res.id, session_id: resume_res.session_id };
						}
					}

					// Keep ?chat=<session_id> synchronized with current session
					if (assistant?.session_id){
						const u = new URL(window.location.href);
						if (u.searchParams.get("chat") !== assistant.session_id){
							u.searchParams.set("chat", assistant.session_id);
							window.history.replaceState({}, "", u.toString());
						}
					}

					$ctrl.empty(() => {
						span.c("dev-chat-page-badge").text(page);
						span.c("dev-chat-asst-id").text(assistant?.id ?? "assistant");

						if (sessions.length > 0){
							const $sel = select.c("dev-chat-select").on("change", async function(){
								const chosen = this.el.value;
								if (!chosen || chosen === assistant?.session_id) return;
								const r = await fetch(servex_url("/api/page-session/resume"), {
									method: "POST",
									headers: { "content-type": "application/json" },
									body: JSON.stringify({ page, session_id: chosen })
								}).then(res => res.json()).catch(() => ({}));
								if (r?.ok){
									const u = new URL(window.location.href);
									u.searchParams.set("chat", r.session_id);
									window.history.replaceState({}, "", u.toString());
									mount_talk(r.id);
								}
							});
							sessions.forEach((s, i) => {
								const opt = option().attr("value", s.session_id).text(
									`#${i + 1} ${(s.session_id ?? "").slice(0, 8)}` + (s.session_id === assistant?.session_id ? " (current)" : "")
								);
								if (s.session_id === assistant?.session_id) opt.attr("selected", true);
								$sel.append(opt);
							});
						}

						button.c("dev-chat-new-btn", "+ New session")
							.attr("title", "Fork a fresh session from the page baseline")
							.click(async () => {
								const r = await fetch(servex_url("/api/page-session/new"), {
									method: "POST",
									headers: { "content-type": "application/json" },
									body: JSON.stringify({ page })
								}).then(res => res.json()).catch(() => ({}));
								if (r?.ok){
									const u = new URL(window.location.href);
									u.searchParams.set("chat", r.session_id);
									window.history.replaceState({}, "", u.toString());
									load();
								}
							});
					});

					const mount_talk = (agent_id) => {
						if (active_talk) active_talk.close();
						$talk_mount.empty();
						active_talk = new AgentTalk({ id: agent_id, name: agent_id });
						$talk_mount.append(active_talk.view);
					};

					if (assistant?.id){
						mount_talk(assistant.id);
					}
				} catch (e){
					$talk_mount.empty(() => {
						span.c("dev-chat-err").text("Could not load page assistant: " + e.message);
					});
				}
			};

			load();
		});
	});
}
