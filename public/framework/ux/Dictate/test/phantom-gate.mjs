// node public/framework/ux/Dictate/test/phantom-gate.mjs   (pure; no server, no browser needed)
// Fixtures from the real evidence: ai/whisper/bucket.jsonl seq175 (true silence hallucination) and
// seq995 (the same phrase heard back through the mic while Recite read aloud).
import { should_drop_phantom, whisper_info } from "../phantom-gate.js";

// A stand-in for BargeIn.noise/echo: same two checks (stock-phrase blocklist, fuzzy match against what Recite is
// reading), kept tiny here because the real BargeIn.js cannot load in plain node (it pulls in Part/MicStream/Whisper,
// all browser-only). The real wiring (ux/Dictate/chat.js) passes BargeIn.noise itself, never this copy.
const PHANTOM_PHRASES = ["thank you.", "thank you", "you"];
const noise = text => PHANTOM_PHRASES.includes(String(text).trim().toLowerCase());

const silent = { echo_active: () => false, barge: { echo: () => false } };
const reading = { echo_active: () => true, barge: { echo: text => /thank you/i.test(text) } };

const cases = [
	["seq175: short, low word prob, Recite silent -> dropped",
		"Thank you.", { duration_s: 1.4, word_prob: 0.14 }, silent, true],
	["seq995: Thank you. while Recite reads -> dropped",
		"Thank you.", { duration_s: 6.0, word_prob: 0.29 }, reading, true],
	["a normal sentence that happens to start with Thank you -> kept",
		"Thank you very much for that.", { duration_s: 2.5, word_prob: 0.9 }, silent, false],
	["Thank you. at normal length, Recite silent -> kept",
		"Thank you.", { duration_s: 2.5, word_prob: 0.9 }, silent, false],
	["no info at all (typed line) and Recite silent -> kept",
		"Thank you.", {}, silent, false],
	["a real interruption while Recite reads, not an echo of it -> kept",
		"please stop for a second", { duration_s: 2.0 }, reading, false],
];

let bad = 0;
for (const [name, text, info, recite, want_dropped] of cases){
	const got = should_drop_phantom(text, info, { noise, recite });
	const ok = !!got === want_dropped;
	if (!ok) bad++;
	console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `\n  got: ${JSON.stringify(got)}`);
}

// whisper_info() reads the real on_whisper shape (Dictate.js: {seconds, body:{duration, segments[].words[].probability}})
{
	const line = { seconds: 1.4, body: { duration: 1.3999999523162842, segments: [{ words: [
		{ word: " Thank", probability: 0.13943414390087128 },
		{ word: " you", probability: 0.99486243724823 },
		{ word: ".", probability: 0.8788413405418396 },
	] }] } };
	const info = whisper_info(line);
	const ok = Math.abs(info.duration_s - 1.4) < 0.01 && Math.abs(info.word_prob - 0.139) < 0.01;
	if (!ok) bad++;
	console.log(ok ? "ok  " : "FAIL", "whisper_info() reads duration and the lowest word probability", ok ? "" : `\n  got: ${JSON.stringify(info)}`);
}

process.exit(bad ? 1 : 0);
