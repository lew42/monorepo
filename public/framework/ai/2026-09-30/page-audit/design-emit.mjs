// design-emit.mjs <core/Page/audit/design dir> — turns the layout-check --bands output in ./design/
// into the design page's data.js, plus a small jpeg of each page at 400 and 1920.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "design"), OUT = process.argv[2];
fs.mkdirSync(path.join(OUT, "shots"), { recursive: true });

const b = await browser();
const pg = await b.newPage();
const pages = [];
for (const d of fs.readdirSync(SRC)){
	const f = path.join(SRC, d, "layout.json");
	if (!fs.existsSync(f)) continue;
	const j = JSON.parse(fs.readFileSync(f, "utf8"));
	const url = new URL(j.url).pathname;
	const widths = {};
	for (const [w, m] of Object.entries(j.widths)){
		widths[w] = {
			tab_rows: m.tab_rows ?? 0,
			tab_share: Math.round(100 * (m.bands || []).filter(x => /tab-bar/.test(x.cls)).reduce((a, x) => a + x.share, 0)),
			left: m.left_stack?.p?.total ?? m.left_stack?.h1?.total ?? null,
			empty: Math.round(100 * m.empty),
			wraps: (m.wraps || []).length,
			big_empty: (m.bands || []).filter(x => x.big_empty).length,
		};
	}
	const shots = {};
	for (const w of ["400", "1920"]){
		const png = path.join(SRC, d, w + ".png");
		if (!fs.existsSync(png)) continue;
		// a png → jpeg through the browser: show it at its own size, shoot the top 1.5 screens
		const width = Number(w), height = Math.round((w === "400" ? 900 : 1000) * 1.5);
		await pg.setViewportSize({ width, height });
		await pg.goto(pathToFileURL(png).href);
		const name = d.replace(/^monorepo-localhost-?/, "") || "home";
		await pg.screenshot({ path: path.join(OUT, "shots", `${name}-${w}.jpg`), type: "jpeg", quality: 60 });
		shots[w] = `shots/${name}-${w}.jpg`;
	}
	pages.push({ url, widths, shots });
}
await close();
fs.writeFileSync(path.join(OUT, "data.js"), "// Written by ai/2026-09-30/page-audit/design-emit.mjs from layout-check --bands. Re-run it; don't edit by hand.\nexport default " + JSON.stringify(pages, null, "\t") + ";\n");
console.log(pages.length, "pages →", OUT);
