import { span } from "/app.js";

/* WHO SAID IT (the owner, 2026-09-30: "have inline messages just with a little
   icon"). Every bubble starts with a small round AVATAR, and the words begin on
   the same line beside it. The avatar doubles as the name: its tooltip is the
   full name, its colour is the role's colour.

   An agent id becomes a role key, the key becomes a class (`chatbox-who-<key>`,
   the colour) and a plain word (the tooltip). The icon comes from `avatar_of()`. */
export const WHO = { owner: "you", "assistant-fast": "assistant", "master-assistant-master": "master assistant" };
const ROLES = { you: "You", assistant: "Assistant", manager: "Manager", master: "Master assistant", minion: "Minion" };

/* THE ICONS (the owner, 2026-09-30): the fast assistant is a bolt ⚡, the smart
   one a brain 🧠, any mastermind the site's own M logo (the favicon the sidebar
   shows top left), and you 👤 until you choose your own (`set_avatar()`). */
export const MLOGO = "/assets/img/favicon.png";
export const AVATARS = { you: "👤", fast: "⚡", smart: "🧠", mastermind: MLOGO, assistant: "💬", manager: "📋", master: "🧭", minion: "🔧", other: "🤖" };

/* YOUR OWN ICON — one setting, no picker yet: an emoji, or an image url (a
   photo). Remembered in this browser only. */
const MINE = "chat.avatar.you";
export function set_avatar(icon){
	try { icon ? localStorage.setItem(MINE, icon) : localStorage.removeItem(MINE); } catch {}
}
function my_avatar(){
	try { return localStorage.getItem(MINE) || AVATARS.you; } catch { return AVATARS.you; }
}

export function role_key(id){
	id = String(id ?? "");
	if (id === "owner" || id === "you") return "you";
	if (id.startsWith("master-assistant") || id.startsWith("mastermind")) return "master";
	if (id === "fast" || id === "smart") return "assistant";   // a voice session's pair (Servex/agents/Sessions.js)
	const first = id.split("-")[0];
	return ROLES[first] ? first : "";
}

/** The icon for an agent id: ⚡ for anything fast, 🧠 for anything smart, the M logo for a mastermind, else the role's own. */
export function avatar_of(id){
	id = String(id ?? "");
	const k = role_key(id);
	if (k === "you") return my_avatar();
	if (/(^|-)mastermind($|-)/.test(id)) return AVATARS.mastermind;
	if (/(^|-)fast($|-)/.test(id)) return AVATARS.fast;
	if (/(^|-)smart($|-)/.test(id)) return AVATARS.smart;
	return AVATARS[k] ?? AVATARS.other;
}

/** The full name, for the avatar's tooltip: "Assistant · assistant-new-card", "Fast assistant". */
export function who_name(id){
	id = String(id ?? "");
	if (id === "fast" || id === "smart") return id[0].toUpperCase() + id.slice(1) + " assistant";
	if (/(^|-)mastermind($|-)/.test(id)) return "Mastermind · " + id;
	const k = role_key(id);
	return k ? (k === "you" || id === k ? ROLES[k] : ROLES[k] + " · " + id) : id;
}

/** The avatar for an agent id — a small round icon, coloured by role — or nothing for an empty id.
 *  Its tooltip names who: the role, and the exact agent id (`agent`, when the line carries one). */
export function who_label(id, agent){
	if (!id) return null;
	const k = role_key(id), icon = avatar_of(id);
	const name = who_name(id) + (agent && agent !== id ? " · " + agent : "");
	const $a = span.c("chatbox-who chatbox-avatar" + (k ? " chatbox-who-" + k : "")).attr("title", name).attr("aria-label", name);
	if (/^(https?:|\/|data:image)/.test(icon)) $a.el.append(Object.assign(document.createElement("img"), { src: icon, alt: "" }));
	else $a.el.textContent = icon;
	return $a;
}
