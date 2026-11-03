/**
 * `import Transcriber from "/framework/audio/Transcriber/index.js"` — the one
 * door that hands back `Transcriber` with EVERY engine already attached
 * (`Transcriber.Whisper` — the rolling local-agreement window, the current
 * default; `Transcriber.WhisperSegments` — v1, cut-and-append, kept
 * reachable; `Transcriber.Browser`). `Transcriber.js` alone does not import
 * any engine (that would be the import cycle each engine file already has
 * one leg of — see the note at the bottom of `Whisper.js`), so a caller that
 * only needs the base class can import it directly and pay for nothing else.
 */
import Transcriber from "./Transcriber.js";
import "./Whisper.js";
import "./WhisperSegments.js";
import "./Browser.js";

export default Transcriber;
export { Transcriber };
