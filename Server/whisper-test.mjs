/* `node Server/whisper-test.mjs` — runs every recording the owner has saved
 * through `ai/2026-09-22/record/` (`public/framework/ai/recordings/*.wav`)
 * through whisper-server and checks the answer against what the owner actually
 * said. This is how a minion checks the whisper stack still works while the
 * owner is away — see public/framework/ai/2026-09-22/record/requirements.md.
 *
 * `public/framework/ai/recordings/expected.json` is `{"<name>": "<what was
 * said>"}` — the owner fills it in by hand, one entry per recording, in
 * whatever they actually said. A recording with no entry there still gets
 * transcribed and printed; it just has nothing to be checked against.
 *
 * The match is WORD-LEVEL, not exact text: lowercase, strip punctuation, and
 * count how many of the expected words the answer actually contains (as a
 * multiset — repeats have to repeat, order does not have to match, because
 * whisper's own phrasing around a word can differ from the owner's without the
 * word being wrong). Exits non-zero if any compared recording scores under 80%
 * — the floor this file was asked to hold. */
import fs from "fs";
import path from "path";

const DIR = path.resolve("public/framework/ai/recordings");
const WHISPER_URL = process.env.WHISPER_URL || "http://127.0.0.1:8178";
const FLOOR = 80;

function words(text){
	return (text || "").toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
}

/** What fraction of `expected`'s words show up in `got` — a multiset match, so
 *  a repeated word has to repeat, but word ORDER never counts against it. */
function match_percent(expected, got){
	const want = words(expected);
	if (!want.length) return null;
	const have = new Map();
	for (const w of words(got)) have.set(w, (have.get(w) ?? 0) + 1);
	let hit = 0;
	for (const w of want){
		const left = have.get(w) ?? 0;
		if (left > 0){ hit++; have.set(w, left - 1); }
	}
	return (hit / want.length) * 100;
}

async function transcribe(file){
	const form = new FormData();
	form.append("file", new Blob([fs.readFileSync(file)], { type: "audio/wav" }), path.basename(file));
	form.append("response_format", "json");
	const started = performance.now();
	const r = await fetch(WHISPER_URL + "/inference", { method: "POST", body: form });
	const ms = Math.round(performance.now() - started);
	if (!r.ok) throw new Error("whisper-server answered " + r.status);
	const body = await r.json();
	return { text: (body.text ?? "").trim(), ms };
}

/** A real RIFF chunk walk, not a fixed 44-byte offset — a WAV with an 18-byte
 *  `fmt ` chunk (whisper.cpp's own sample clips, among others) shifts `data`
 *  two bytes later than that fixed offset assumes. Same walk as
 *  `Server/plugins/Recordings.js`'s `wav_info`. */
function seconds_of(file){
	const buf = fs.readFileSync(file);
	if (buf.length < 12) return 0;
	let at = 12, rate = 0, data_size = 0;
	while (at + 8 <= buf.length){
		const id = buf.toString("ascii", at, at + 4);
		const size = buf.readUInt32LE(at + 4);
		const body = at + 8;
		if (id === "fmt " && body + 8 <= buf.length) rate = buf.readUInt32LE(body + 4);
		if (id === "data") data_size = Math.min(size, Math.max(0, buf.length - body));
		at = body + size + (size % 2);
	}
	return rate ? data_size / 2 / rate : 0;
}

async function main(){
	const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith(".wav")).sort() : [];
	if (!files.length){ console.log("whisper-test: no recordings under " + DIR + " yet — nothing to check."); return; }

	let expected = {};
	try { expected = JSON.parse(fs.readFileSync(path.join(DIR, "expected.json"), "utf8")); } catch {}

	let worst = 100, compared = 0;
	for (const f of files){
		const name = f.slice(0, -4);
		const { text, ms } = await transcribe(path.join(DIR, f));
		const pct = match_percent(expected[name], text);
		const seconds = seconds_of(path.join(DIR, f));
		const score = pct === null ? "no expected text" : pct.toFixed(0) + "% match";
		console.log(`${name}  ${seconds.toFixed(2)}s  ${ms}ms  ${score}  — "${text}"`);
		if (pct !== null){ compared++; worst = Math.min(worst, pct); }
	}

	if (compared && worst < FLOOR){
		console.error(`whisper-test: worst match ${worst.toFixed(0)}% is under the ${FLOOR}% floor.`);
		process.exit(1);
	}
	console.log(compared ? `whisper-test: ${compared} recording(s) checked, worst match ${worst.toFixed(0)}%.` : "whisper-test: nothing had an expected.json entry to check against.");
}

main().catch(e => { console.error("whisper-test: " + (e?.message ?? e)); process.exit(1); });
