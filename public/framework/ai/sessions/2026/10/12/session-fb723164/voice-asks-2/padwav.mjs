// node padwav.mjs <in.wav> <out.wav> [lead_s] [tail_s] — the same 16 kHz mono clip with silence before and after, so a headless
// fake mic starts speaking only AFTER the page has opened it (an engine check at load would otherwise eat the clip).
import fs from "node:fs";
const [, , inp, out, lead = 5, tail = 20] = process.argv, b = fs.readFileSync(inp), at = b.indexOf("data") + 8, pcm = b.subarray(at);
const rate = b.readUInt32LE(24), z = s => Buffer.alloc(Math.round(rate * s) * 2), all = Buffer.concat([z(lead), pcm, z(tail)]);
const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + all.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(all.length, 40);
fs.writeFileSync(out, Buffer.concat([h, all]));
