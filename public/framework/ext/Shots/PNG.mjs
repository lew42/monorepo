/* PNG.mjs — the smallest PNG reader/writer Shots needs, built on node's own `zlib` (no new npm
 * dependency: CLAUDE.md). `decode()` reads what Chromium's `page.screenshot()` writes: 8-bit
 * depth, colour type 2 (RGB) or 6 (RGBA), non-interlaced, any of the five filter types per row.
 * `encode()` only ever writes colour type 6, filter 0 — Diff's overlay is the only thing this
 * class creates, and it never needs to be small. Doc: doc/png-format.md.
 */
import zlib from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Standard CRC-32 (PNG uses it on every chunk) — no built-in in node, so a small table-based
// implementation here rather than pull in a dependency.
const CRC_TABLE = (() => {
	const t = new Uint32Array(256);
	for (let n = 0; n < 256; n++){
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c >>> 0;
	}
	return t;
})();
function crc32(buf){
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

export class PNG {

	/** PNG.decode(buffer) → {width, height, data} — `data` is a Uint8Array, RGBA, row-major,
	 * top to bottom, 4 bytes per pixel, length === width * height * 4. */
	static decode(buffer){
		if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error("PNG.decode: not a PNG (bad signature)");
		let offset = 8, width, height, depth, colorType, interlace;
		const idatChunks = [];
		while (offset < buffer.length){
			const length = buffer.readUInt32BE(offset);
			const type = buffer.toString("ascii", offset + 4, offset + 8);
			const data = buffer.subarray(offset + 8, offset + 8 + length);
			if (type === "IHDR"){
				width = data.readUInt32BE(0);
				height = data.readUInt32BE(4);
				depth = data[8];
				colorType = data[9];
				interlace = data[12];
			}
			else if (type === "IDAT") idatChunks.push(data);
			else if (type === "IEND") break;
			offset += 8 + length + 4;   // length + type + data + crc
		}
		if (depth !== 8) throw new Error(`PNG.decode: only 8-bit depth is supported, got ${depth}`);
		if (colorType !== 2 && colorType !== 6) throw new Error(`PNG.decode: only colour type 2 (RGB) or 6 (RGBA) is supported, got ${colorType}`);
		if (interlace) throw new Error("PNG.decode: interlaced PNGs are not supported");

		const channels = colorType === 6 ? 4 : 3;
		const raw = zlib.inflateSync(Buffer.concat(idatChunks));
		const data = unfilter(raw, width, height, channels);
		return { width, height, data: channels === 4 ? data : rgbToRgba(data, width, height) };
	}

	/** PNG.trim(image, {tolerance}) → {width, height, data, x, y} — strips uniform margins of the
	 * image's own corner colour from every edge (build-c, figma mode: a Figma frame and a browser
	 * screenshot both carry flat background around the real content, at different sizes, and a
	 * diff over that margin is noise). Only full rows/columns that are entirely within `tolerance`
	 * of the top-left pixel's colour are stripped — an inner row of the same colour (a plain
	 * section of the page) survives, because trimming walks in from the edges only. `x`/`y` are
	 * the crop's own offset into the source image, for a caller that wants to say where it fell. */
	static trim(image, { tolerance = 8 } = {}){
		const { width, height, data } = image;
		const bg = [data[0], data[1], data[2]];
		const close = (x, y) => {
			const i = (y * width + x) * 4;
			return Math.abs(data[i] - bg[0]) <= tolerance && Math.abs(data[i + 1] - bg[1]) <= tolerance && Math.abs(data[i + 2] - bg[2]) <= tolerance;
		};
		const rowIsBg = y => { for (let x = 0; x < width; x++) if (!close(x, y)) return false; return true; };
		let top = 0, bottom = height - 1;
		while (top < bottom && rowIsBg(top)) top++;
		while (bottom > top && rowIsBg(bottom)) bottom--;
		const colIsBg = x => { for (let y = top; y <= bottom; y++) if (!close(x, y)) return false; return true; };
		let left = 0, right = width - 1;
		while (left < right && colIsBg(left)) left++;
		while (right > left && colIsBg(right)) right--;

		const w = right - left + 1, h = bottom - top + 1;
		const out = new Uint8Array(w * h * 4);
		for (let y = 0; y < h; y++){
			const si = ((top + y) * width + left) * 4;
			out.set(data.subarray(si, si + w * 4), y * w * 4);
		}
		return { width: w, height: h, data: out, x: left, y: top };
	}

	/** PNG.scale(image, targetWidth, targetHeight) → {width, height, data} — nearest-neighbour
	 * resample (no npm dependency; a box filter would look smoother but Diff compares in 16px
	 * cells anyway, so nearest-neighbour costs nothing it will notice). Used to bring a Figma
	 * frame's own picture to the built page's width before comparing them (build-c). */
	static scale(image, targetWidth, targetHeight){
		const { width, height, data } = image;
		const out = new Uint8Array(targetWidth * targetHeight * 4);
		for (let y = 0; y < targetHeight; y++){
			const sy = Math.min(height - 1, Math.floor((y * height) / targetHeight));
			for (let x = 0; x < targetWidth; x++){
				const sx = Math.min(width - 1, Math.floor((x * width) / targetWidth));
				const si = (sy * width + sx) * 4, di = (y * targetWidth + x) * 4;
				out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2]; out[di + 3] = data[si + 3];
			}
		}
		return { width: targetWidth, height: targetHeight, data: out };
	}

	/** PNG.encode({width, height, data}) → Buffer. `data` is RGBA, same layout as decode()
	 * returns. Always writes colour type 6, filter 0 (no per-row filtering — Diff's overlay
	 * gains nothing from the extra CPU a real filter choice would cost). */
	static encode({ width, height, data }){
		const ihdr = Buffer.alloc(13);
		ihdr.writeUInt32BE(width, 0);
		ihdr.writeUInt32BE(height, 4);
		ihdr[8] = 8;    // bit depth
		ihdr[9] = 6;    // colour type: RGBA
		ihdr[10] = 0;   // compression
		ihdr[11] = 0;   // filter method
		ihdr[12] = 0;   // interlace

		const stride = width * 4;
		const src = data instanceof Uint8Array ? data : new Uint8Array(data);
		const raw = Buffer.alloc((stride + 1) * height);
		for (let y = 0; y < height; y++){
			const rowStart = y * (stride + 1);
			raw[rowStart] = 0;   // filter type 0: None
			raw.set(src.subarray(y * stride, y * stride + stride), rowStart + 1);
		}
		const idat = zlib.deflateSync(raw, { level: 6 });

		return Buffer.concat([
			SIGNATURE,
			chunk("IHDR", ihdr),
			chunk("IDAT", idat),
			chunk("IEND", Buffer.alloc(0)),
		]);
	}
}

function chunk(type, data){
	const typeBuf = Buffer.from(type, "ascii");
	const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
	const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
	return Buffer.concat([len, typeBuf, data, crc]);
}

// RGB (3 bytes/pixel) → RGBA (4 bytes/pixel, alpha 255) — a flat copy so decode() always
// hands callers (Diff especially) one consistent pixel shape.
function rgbToRgba(rgb, width, height){
	const out = new Uint8Array(width * height * 4);
	for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4){
		out[j] = rgb[i]; out[j + 1] = rgb[i + 1]; out[j + 2] = rgb[i + 2]; out[j + 3] = 255;
	}
	return out;
}

// PNG's per-scanline filters (spec §9.2–9.3): each row picks one of five, applied byte-wise
// against the PRIOR (unfiltered) row and the start of the SAME row — `bpp` bytes back, not
// one, since Paeth and Sub look at the same whole pixel, not the previous byte.
function unfilter(raw, width, height, channels){
	const bpp = channels;            // 8-bit depth, so bytes-per-pixel === channel count
	const stride = width * bpp;
	const out = new Uint8Array(width * height * channels);
	for (let y = 0; y < height; y++){
		const rowStart = y * (stride + 1);
		const filterType = raw[rowStart];
		const srcStart = rowStart + 1;
		const dstStart = y * stride;
		const prevDstStart = y === 0 ? -1 : (y - 1) * stride;
		for (let x = 0; x < stride; x++){
			const left = x >= bpp ? out[dstStart + x - bpp] : 0;
			const up = prevDstStart >= 0 ? out[prevDstStart + x] : 0;
			const upLeft = prevDstStart >= 0 && x >= bpp ? out[prevDstStart + x - bpp] : 0;
			const raw_byte = raw[srcStart + x];
			let v;
			switch (filterType){
				case 0: v = raw_byte; break;                                    // None
				case 1: v = raw_byte + left; break;                             // Sub
				case 2: v = raw_byte + up; break;                               // Up
				case 3: v = raw_byte + ((left + up) >> 1); break;               // Average
				case 4: v = raw_byte + paeth(left, up, upLeft); break;          // Paeth
				default: throw new Error(`PNG.decode: unknown filter type ${filterType} at row ${y}`);
			}
			out[dstStart + x] = v & 0xff;
		}
	}
	return out;
}

function paeth(a, b, c){   // a=left, b=up, c=upLeft — PNG spec §9.3, Paeth predictor
	const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	if (pb <= pc) return b;
	return c;
}

export default PNG;
