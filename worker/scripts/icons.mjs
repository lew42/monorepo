// Draws the three PNG icons (blue square, white "L") with zlib only: node worker/scripts/icons.mjs. Run once; the PNGs are committed.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const crc_table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buf => { let c = ~0; for (const b of buf) c = crc_table[(c ^ b) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (type, data) => { const t = Buffer.concat([Buffer.from(type), data]); const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(t)); return Buffer.concat([l, t, c]); };

function png(size, inset){   // inset: fraction of the size kept clear around the L (maskable needs a bigger one)
	const rows = [];
	const x0 = size * (inset + .12), x1 = size * (inset + .12) + size * .14, y0 = size * (inset + .08), y1 = size * (1 - inset - .08), x2 = size * (1 - inset - .08), y2 = y1 - size * .14;
	for (let y = 0; y < size; y++){
		const row = Buffer.alloc(1 + size * 3);
		for (let x = 0; x < size; x++){
			const white = (x >= x0 && x < x1 && y >= y0 && y < y1) || (x >= x0 && x < x2 && y >= y2 && y < y1);
			row.set(white ? [255, 255, 255] : [26, 115, 232], 1 + x * 3);
		}
		rows.push(row);
	}
	const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))]);
}

writeFileSync("public/app/icons/icon-192.png", png(192, 0));
writeFileSync("public/app/icons/icon-512.png", png(512, 0));
writeFileSync("public/app/icons/icon-maskable-512.png", png(512, .1));
writeFileSync("public/app/icons/icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1a73e8"/><path d="M26 20h14v48h34v14H26z" fill="#fff"/></svg>`);
