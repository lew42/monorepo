import { composer as base } from "/framework/ext/Chat/Composer.js";
import { post_prompt } from "/framework/ux/Dictate/Dictate.js";
import { servex_base, is_folder_id, card_prompt, cards_ready } from "./inbox.js";

/**
 * The composer is `ext/Chat` — `/framework/ext/Chat/`. This file is the Servex half:
 * how a finished message is posted (`deliver`), plus AI 2's own words for the box.
 * The same `deliver` serves typed Send and the microphone, so a sentence is never
 * posted twice or by two different routes.
 */

/**
 * THE CARD'S OWN COPY of a sentence said into it. A folder card (`2026/09/24/x`)
 * gets ONE first-class `prompt` record through Servex's `POST /card/append` —
 * the owner's words kept as a quotation, verbatim (`Servex/cards/readme.md`).
 * An old board card still gets its line on the old per-card log. Either way it
 * is beside the `/log/prompts` post, never instead of it: that one is what the
 * fast assistant reads.
 */
async function into_card(re, entry){
	// A Servex not yet restarted onto the card code has no `/card/append`: a
	// folder card's words then go on the old log under its own slug (the last
	// segment), to be copied across once the card routes are live.
	if (is_folder_id(re) && await cards_ready()) return card_prompt(re, entry.text, entry.via).catch(() => null);
	const slug = is_folder_id(re) ? re.split("/").at(-1) : re.split("/")[0];
	return post_prompt(entry, servex_base() + "/log/cards/" + slug).catch(() => {});
}

// The same Servex the rest of this page talks to — `?servex=` included, so a
// test page's microphone never posts into the real one.
async function deliver(entry){
	const ok = await post_prompt(entry, servex_base() + "/log/prompts");
	if (entry.re) into_card(entry.re, entry);
	return ok;
}

const WORDS = {
	deliver,
	placeholder: "say anything — it becomes a card",
	hint: "the fast assistant inside Servex · names in ~2 s",
	sent: "sent — the card is on its way",
	failed: "Servex is not answering, so nothing was sent",
};

// `revise: "clean" | "edit" | "summary"` — plumbing only, left OFF (`false`) by default:
// `revise: "edit"` costs a real model call per sentence, and nothing shows the raw/revised
// pair yet, so that cost buys nothing to look at today (audio review, 2026-09-29, finding 4).
// Turn it back on once ChatPanel shows raw→revised pairs. `ext/Chat/Composer.js` forwards
// this straight to the `ComposerMic` it builds, which then logs each utterance's revision
// for real (`Dictate.js`'s own `log_revision()`) — the box's own text is untouched
// (`ComposerMic` writes from Whisper's raw words, same as before); the revised line is a
// second, separate log entry, not a rewrite of it.
export function composer(opts = {}){
	const set = Object.fromEntries(Object.entries({ revise: false, ...opts }).filter(([, v]) => v !== undefined));
	return base({ ...WORDS, ...set });
}

/** Send words into a card exactly as the composer's Send does — one call, for a button that answers. */
export async function say(msg, target){
	const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text: msg, via: "typed" };
	if (target){ entry.re = target; entry.selected = target; }
	return deliver(entry);
}

export default composer;
