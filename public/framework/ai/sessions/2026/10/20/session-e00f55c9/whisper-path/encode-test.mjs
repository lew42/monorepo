#!/usr/bin/env node
/* encode-test.mjs — does whisper-server read a smaller WAV, and does the text hold?
 *   node encode-test.mjs [clip.wav]
 * Sends the same clip as 16-bit PCM and as 8-bit mu-law (half the bytes) and prints bytes, ms and text. */
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2] || path.resolve(import.meta.dirname, "../../../../09/22/whisper-servex/whisper-servex/clip.wav");
const pcm = fs.readFileSync(file);
const data = pcm.indexOf("data") + 8, rate = pcm.readUInt32LE(24);
const n = (pcm.length - data) >> 1;
// QUIET=1: a quiet, noisy copy (a third of the level plus hiss), closer to a phone on a walk
const quiet = !!process.env.QUIET;
let seed = 1; const hiss = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5) * 1200;
const raw16 = Int16Array.from({ length: n }, (_, i) => quiet ? Math.max(-32768, Math.min(32767, Math.round(pcm.readInt16LE(data + i * 2) / 3 + hiss()))) : pcm.readInt16LE(data + i * 2));
const s16 = i => raw16[i];

function header(fmt, bits, bytes){
	const h = Buffer.alloc(44);
	h.write("RIFF", 0); h.writeUInt32LE(36 + bytes, 4); h.write("WAVE", 8);
	h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(fmt, 20); h.writeUInt16LE(1, 22);
	h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * bits / 8, 28); h.writeUInt16LE(bits / 8, 32); h.writeUInt16LE(bits, 34);
	h.write("data", 36); h.writeUInt32LE(bytes, 40);
	return h;
}
// G.711 mu-law, the standard encoder
function mulaw(x){
	const BIAS = 0x84, CLIP = 32635;
	let sign = (x >> 8) & 0x80; if (sign) x = -x; if (x > CLIP) x = CLIP; x += BIAS;
	let exp = 7; for (let m = 0x4000; (x & m) === 0 && exp > 0; m >>= 1) exp--;
	return ~(sign | (exp << 4) | ((x >> (exp + 3)) & 0x0f)) & 0xff;
}
const mu = Buffer.alloc(n); for (let i = 0; i < n; i++) mu[i] = mulaw(s16(i));
// IMA ADPCM (WAVE format 0x11), 4 bits a sample: blocks of 256 bytes = 4-byte header + 252 bytes = 505 samples
const STEP = [7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767];
const IDX = [-1,-1,-1,-1,2,4,6,8];
function ima(get, n, block = 256){
	const per = (block - 4) * 2 + 1, blocks = Math.ceil(n / per), out = Buffer.alloc(blocks * block);
	let idx = 0;
	for (let b = 0; b < blocks; b++){
		const o = b * block, first = b * per;
		let pred = first < n ? get(first) : 0;
		out.writeInt16LE(pred, o); out[o + 2] = idx; out[o + 3] = 0;
		for (let k = 0; k < per - 1; k++){
			const i = first + 1 + k, x = i < n ? get(i) : 0;
			let step = STEP[idx], diff = x - pred, code = 0;
			if (diff < 0){ code = 8; diff = -diff; }
			let dq = step >> 3;
			if (diff >= step){ code |= 4; diff -= step; dq += step; } step >>= 1;
			if (diff >= step){ code |= 2; diff -= step; dq += step; } step >>= 1;
			if (diff >= step){ code |= 1; dq += step; }
			pred += (code & 8) ? -dq : dq; pred = Math.max(-32768, Math.min(32767, pred));
			idx = Math.max(0, Math.min(88, idx + IDX[code & 7]));
			// sample k of the block body: 8 samples per 4 bytes, low nibble first
			const byte = o + 4 + (k >> 3) * 4 + ((k & 7) >> 1);
			out[byte] |= (k & 1) ? code << 4 : code;
		}
	}
	const h = Buffer.alloc(48);
	h.write("RIFF", 0); h.writeUInt32LE(40 + out.length, 4); h.write("WAVE", 8);
	h.write("fmt ", 12); h.writeUInt32LE(20, 16); h.writeUInt16LE(0x11, 20); h.writeUInt16LE(1, 22);
	h.writeUInt32LE(rate, 24); h.writeUInt32LE(Math.round(rate * block / per), 28); h.writeUInt16LE(block, 32); h.writeUInt16LE(4, 34);
	h.writeUInt16LE(2, 36); h.writeUInt16LE(per, 38);
	h.write("data", 40); h.writeUInt32LE(out.length, 44);
	return Buffer.concat([h, out]);
}
const variants = { "ima4": ima(s16, n),  "pcm16": Buffer.concat([header(1, 16, n * 2), Buffer.from(raw16.buffer)]), "mulaw8": Buffer.concat([header(7, 8, n), mu]) };

for (const [name, buf] of Object.entries(variants)){
	const form = new FormData(); form.append("file", new Blob([buf], { type: "audio/wav" }), "t.wav"); form.append("response_format", "json");
	const t = performance.now();
	const r = await fetch("http://127.0.0.1:8178/inference", { method: "POST", body: form });
	const body = await r.text();
	console.log(name.padEnd(7), String(buf.length).padStart(7), "bytes", Math.round(performance.now() - t), "ms", r.status, body.replace(/\s+/g, " ").slice(0, 160));
}
