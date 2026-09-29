import { span } from "/app.js";

/* THE ROLE LABEL above a message (the owner, 2026-09-24): one line, once per
   message, coloured per role. An agent id becomes a role key, the key becomes a
   class (`chatbox-who-<key>`) and a plain word. */
export const WHO = { owner: "you", "assistant-fast": "assistant", "master-assistant-master": "master assistant" };
const ROLES = { you: "You", assistant: "Assistant", manager: "Manager", master: "Master assistant", minion: "Minion" };

export function role_key(id){
	id = String(id ?? "");
	if (id === "owner" || id === "you") return "you";
	if (id.startsWith("master-assistant") || id.startsWith("mastermind")) return "master";
	const first = id.split("-")[0];
	return ROLES[first] ? first : "";
}

/** The label span for an agent id — "Assistant · assistant-new-card" — or nothing for an empty id. */
export function who_label(id){
	const k = role_key(id);
	if (k) return span.c("chatbox-who chatbox-who-" + k).text(k === "you" || id === k ? ROLES[k] : ROLES[k] + " · " + id);
	return id ? span.c("chatbox-who").text(id) : null;
}
