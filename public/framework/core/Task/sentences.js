// The one sentence splitter: Prompt.sentences (core) uses it, and the chat's fold (ext/Chat/v2/ChatV2Model.js, which still has its own regex) should,
// so a reply anchored to "a2" points at the same words on every surface. Pure, no imports.
/** Split after . ! ? … (with closing quotes), at whitespace; a newline always ends one. "3.5" and "session.json" stay whole. */
export default function split(text){ return String(text ?? "").split(/(?<=[.!?…]["'”’)\]]*)\s+|\n+/).map(s => s.trim()).filter(Boolean); }
