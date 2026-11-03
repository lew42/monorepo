// The cleaner now lives in the class: Cleaner.js. These are the old function names, kept so no caller breaks.
// Browser-safe AND Node-safe (Cleaner.js has no top-level node:* imports). History and design: doc/notes.md, doc/cleaner.md
import Cleaner from "./Cleaner.js";

export const GLOSSARY = Cleaner.GLOSSARY;
export const clean = (text, opts) => Cleaner.clean(text, opts);
export const quick_clean = text => Cleaner.quick_clean(text);
export const word_overlap_score = (a, b) => Cleaner.word_overlap_score(a, b);
export default clean;
