// Makes a small JPEG of every saved screenshot (data/<key>/thumbs/<name>.jpg, 480 px wide) so the browse
// grid loads about a tenth of the bytes; the full PNG loads only on the page's own view.
//   node public/framework/ext/Figma/thumbs.mjs [fileKey]
import { readdirSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../Server/browser.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const key = process.argv[2] || "QYN0G2URSBHYH5I06MOjxU";
const shots = join(here, "data", key, "shots"), out = join(here, "data", key, "thumbs");
mkdirSync(out, { recursive: true });
const page = await (await (await browser()).newContext()).newPage();
let total = 0;
for (const f of readdirSync(shots).filter(f => f.endsWith(".png"))){
	const b64 = readFileSync(join(shots, f)).toString("base64");
	const jpg = await page.evaluate(async b64 => {
		const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
		const w = Math.min(480, img.width), c = document.createElement("canvas");
		c.width = w; c.height = Math.round(img.height * w / img.width);
		const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
		return c.toDataURL("image/jpeg", .8).split(",")[1];
	}, b64);
	const buf = Buffer.from(jpg, "base64"); total += buf.length;
	writeFileSync(join(out, f.replace(/\.png$/, ".jpg")), buf);
}
console.log(`thumbs written, ${Math.round(total / 1024)} KB total`);
await close();
