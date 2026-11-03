/**
 * Measure the WAV files ux/Dictate actually posted to whisper-server.
 *
 *     node measure.mjs dumps/            # every .wav in a folder
 *     node measure.mjs dumps/dumps.jsonl # the base64 lines the $DICTATE_DUMP seam writes
 *
 * For each file it prints the six numbers that decide whether the sound was
 * lost: the sample rate the header claims, how many seconds of audio that makes,
 * the loudest single sample (peak), the average loudness (RMS), and whether the
 * header's own byte count agrees with the file's real length. A WAV whose RMS is
 * under about 0.005 is a quiet room, and whisper answers a quiet room with
 * "Thank you." — that hallucination is the whole reason this script exists.
 */
import fs from "fs";
import path from "path";

const SILENT = 0.005;   // RMS below this is a quiet room, not speech

/** The numbers, read out of the RIFF header and the samples. ⚠ The header is not
 *  always 44 bytes — `jfk.wav`'s own `fmt ` chunk is 18, which puts its samples at
 *  offset 46 — so walk the chunks instead of assuming (a clip built on that
 *  assumption played back as pure silence and sent this task chasing a ghost). */
export function measure(buf, name){
	const r = { name, bytes: buf.length };
	if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") return { ...r, error: "not a RIFF/WAV file" };

	let at = 12, fmt = null, data = null;
	while (at + 8 <= buf.length){
		const id = buf.toString("ascii", at, at + 4), size = buf.readUInt32LE(at + 4);
		if (id === "fmt ") fmt = at + 8;
		if (id === "data"){ data = { at: at + 8, size }; break; }
		at += 8 + size + (size % 2);
	}
	if (fmt === null || !data) return { ...r, error: "no fmt/data chunk" };

	r.channels = buf.readUInt16LE(fmt + 2);
	r.rate = buf.readUInt32LE(fmt + 4);
	r.bits = buf.readUInt16LE(fmt + 14);
	r.header_data_bytes = data.size;
	r.real_data_bytes = buf.length - data.at;
	r.header_agrees = r.header_data_bytes === r.real_data_bytes;

	const samples = Math.min(data.size, r.real_data_bytes) / 2;
	r.samples = samples;
	r.seconds = +(samples / r.rate).toFixed(3);

	let peak = 0, sum = 0;
	for (let i = data.at; i + 1 < data.at + samples * 2; i += 2){
		const s = buf.readInt16LE(i) / 32768;
		const a = Math.abs(s);
		if (a > peak) peak = a;
		sum += s * s;
	}
	r.peak = +peak.toFixed(5);
	r.rms = +Math.sqrt(sum / Math.max(1, samples)).toFixed(5);
	r.verdict = r.rms < SILENT ? "SILENT — whisper will hallucinate" : "has sound";
	return r;
}

/** Every WAV in a folder, or every base64 line in a `$DICTATE_DUMP` jsonl. */
function load(target){
	if (target.endsWith(".jsonl")){
		return fs.readFileSync(target, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line, i) => {
			const o = JSON.parse(line);
			const dump = o.dump ?? o;
			return { name: `${String(i + 1).padStart(3, "0")} ${dump.kind ?? ""} ${dump.at ?? ""}`.trim(), buf: Buffer.from(dump.wav_base64, "base64") };
		});
	}
	return fs.readdirSync(target).filter(f => f.endsWith(".wav")).sort()
		.map(f => ({ name: f, buf: fs.readFileSync(path.join(target, f)) }));
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))){
	const target = process.argv[2] ?? "dumps";
	const rows = load(target).map(({ name, buf }) => measure(buf, name));
	for (const r of rows){
		if (r.error){ console.log(r.name, "—", r.error); continue; }
		console.log(
			r.name.padEnd(26),
			`${r.rate}Hz`.padStart(8),
			`${r.channels}ch ${r.bits}bit`,
			`${r.seconds}s`.padStart(8),
			`peak ${r.peak}`.padStart(13),
			`rms ${r.rms}`.padStart(12),
			r.header_agrees ? "header ok" : `HEADER SAYS ${r.header_data_bytes} BYTES, FILE HAS ${r.real_data_bytes}`,
			" ", r.verdict,
		);
	}
	const loud = rows.filter(r => !r.error && r.rms >= SILENT).length;
	console.log(`\n${rows.length} files — ${loud} with sound, ${rows.length - loud} silent.`);
}
