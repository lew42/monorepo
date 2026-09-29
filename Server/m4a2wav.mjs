// m4a2wav.mjs <in.m4a> <out.wav> — decode with headless Chromium's Web Audio (no ffmpeg on this machine), resample to 16 kHz mono, write 16-bit PCM WAV.
import { browser as launch } from "./browser.mjs";
import fs from "node:fs";
const [inp, out] = process.argv.slice(2);
const bytes = fs.readFileSync(inp);
const browser = await launch();
const page = await browser.newPage();
await page.goto("about:blank");
const pcm = await page.evaluate(async (b64) => {
	const bin = atob(b64), buf = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
	const ctx = new AudioContext();
	const decoded = await ctx.decodeAudioData(buf.buffer);
	const rate = 16000, n = Math.ceil(decoded.duration * rate);
	const off = new OfflineAudioContext(1, n, rate);
	const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
	const rendered = await off.startRendering();
	const ch = rendered.getChannelData(0);
	let peak = 0, sum = 0; for (const v of ch) { peak = Math.max(peak, Math.abs(v)); sum += v * v; }
	return { samples: Array.from(ch), duration: decoded.duration, srcRate: decoded.sampleRate, channels: decoded.numberOfChannels, peak, rms: Math.sqrt(sum / ch.length) };
}, bytes.toString("base64"));
await browser.close();
const n = pcm.samples.length, wav = Buffer.alloc(44 + n * 2);
wav.write("RIFF", 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write("WAVE", 8); wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(16000, 24);
wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, pcm.samples[i])); wav.writeInt16LE(v < 0 ? v * 0x8000 : v * 0x7fff, 44 + i * 2); }
fs.writeFileSync(out, wav);
console.log(JSON.stringify({ out, seconds: +pcm.duration.toFixed(2), srcRate: pcm.srcRate, channels: pcm.channels, peak: +pcm.peak.toFixed(3), rms: +pcm.rms.toFixed(4), samples: n }));
