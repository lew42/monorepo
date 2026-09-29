import { chat as base } from "/framework/ext/Chat/Chat.js";
import { say } from "./compose.js";

/**
 * The chat log is `ext/Chat` — `/framework/ext/Chat/`. This file only says how AI 2
 * answers a question's button: the choice is sent as your own message into the card
 * `re()` names, the same way the composer's Send does. Everything else re-exports.
 */
export { md_into, who_label, role_key, speak, refine, MERGE_GAP_MS } from "/framework/ext/Chat/Chat.js";

export function chat({ re = () => null, ...rest } = {}){
	return base({ ...rest, answer: choice => say(choice, re()) });
}

export default chat;
