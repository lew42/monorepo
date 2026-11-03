/** Common Whisper hallucinations, heard alone (not as part of a longer real line) — a plain array, so a new one
 *  found later is one line to add, not a regex to edit (review note, 2026-11-01). Pulled out of BargeIn.js so a
 *  plain `node` test can check the REAL phrase list and noise() (BargeIn.js itself pulls in Part/MicStream/Whisper,
 *  all browser-only — doc/phantom-gate.md). */
export const PHANTOM_PHRASES = ["thank you.", "thank you", "thanks for watching.", "thanks for watching", "you"];

/** Whisper's own non-speech marks ("[BLANK_AUDIO]", "(wind blowing)", "♪") count as noise, and so do the phrases
 *  above. Trims first, so a leading/trailing space (ComposerMic, or the mic's own transcript) still matches. */
export function noise(text){
	const t = String(text ?? "").trim();
	return !t || /^[\[(♪*].*[\])♪*]$/.test(t) || PHANTOM_PHRASES.includes(t.toLowerCase());
}
