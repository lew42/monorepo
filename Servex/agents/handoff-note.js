/* ASK 1 (ask1-origin, 2026-11-03): the owner's own words for a handed-off task, as one short line for the new agent's first
 * message — quoted verbatim, never retyped. Its own file (no SDK import) so it tests without the heavy Agents.js dependency
 * chain. `origin` is `task_origin()`'s answer (page_tools.js): {from, text}, either optional. `from.sentence` is the sentence's
 * `<at>` (single-voice-assistant.md's `[on <page> at <at>]`); `text` is the raw words. "" when there is nothing to add. */
export function handoff_note(origin){
	const text = origin?.text;
	if (!text) return "";
	const at = origin.from && typeof origin.from === "object" ? origin.from.sentence : undefined;
	return ` The owner's own words${at ? ` (at ${at})` : ""}: "${text}"`;
}
export default handoff_note;
