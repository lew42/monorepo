/* `node Server/CatalogThumbs.mjs --plan | --apply | --all [--base <origin>] [--only <url part>]`
 *   One 600x375 webp per catalog page at public/framework/catalog/thumbs/<slug>.webp (ignored by git:
 *   automated pictures are machine output) plus thumbs/index.json (the slugs that exist, read by the card).
 *   --plan  lists every entry and whether its picture is fresh (newer than the page folder's newest file)
 *   --apply shoots the missing or stale ones   --all reshoots everything
 * Uses the one shared Chromium launcher (Server/browser.mjs) that ext/Shots uses; Shots.run itself writes
 * a round folder plus a runs.jsonl line per shot, which 285 thumbnails should not. Doc: catalog/doc/next.md */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAT = path.join(ROOT, "public/framework/catalog");
const THUMBS = path.join(CAT, "thumbs");

export class CatalogThumbs {
	static WIDTH = 1200; static HEIGHT = 750; static OUT_W = 600; static OUT_H = 375;
	// the url and the file name must agree with CatalogPage.slug()
	static slug(url){ return url.replace(/^\/+|\/+$/g, "").replace(/\//g, "__"); }

	static entries(){
		return fs.readFileSync(path.join(CAT, "catalog.jsonl"), "utf8").split("\n").filter(Boolean)
			.map(l => JSON.parse(l)).filter(r => r.kind === "page");
	}

	// newest mtime among the files directly inside the page's folder
	static newest(url){
		const dir = path.join(ROOT, "public", url);
		if (!fs.existsSync(dir)) return 0;
		return Math.max(0, ...fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isFile()).map(d => fs.statSync(path.join(dir, d.name)).mtimeMs));
	}

	static status(entry, all){
		const file = path.join(THUMBS, this.slug(entry.url) + ".webp");
		if (!fs.existsSync(file)) return "missing";
		return all || fs.statSync(file).mtimeMs < this.newest(entry.url) ? "stale" : "fresh";
	}

	static plan(entries, all = false){
		return entries.map(e => ({ ...e, state: this.status(e, all) }));
	}

	// NO_PREVIEW pages hold the thread; skip them
	static skip(url){ return url === "/framework/code/performance/bench/"; }

	static async shoot(entries, base){
		fs.mkdirSync(THUMBS, { recursive: true });
		const b = await browser();
		const ctx = await b.newContext({ viewport: { width: this.WIDTH, height: this.HEIGHT } });
		const page = await ctx.newPage();
		let done = 0;
		for (const e of entries){
			try {
				await page.goto(new URL(e.url, base).toString(), { waitUntil: "load", timeout: 20000 });
				await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {});
				await page.waitForTimeout(300);
				const png = (await page.screenshot()).toString("base64");
				// the webp is made by the browser itself: no image library, no new dependency
				const b64 = await page.evaluate(async ({ png, w, h }) => {
					const img = new Image(); img.src = "data:image/png;base64," + png; await img.decode();
					const c = document.createElement("canvas"); c.width = w; c.height = h;
					c.getContext("2d").drawImage(img, 0, 0, w, h);
					const blob = await new Promise(r => c.toBlob(r, "image/webp", .8));
					const buf = new Uint8Array(await blob.arrayBuffer()); let s = "";
					for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
					return btoa(s);
				}, { png, w: this.OUT_W, h: this.OUT_H });
				fs.writeFileSync(path.join(THUMBS, this.slug(e.url) + ".webp"), Buffer.from(b64, "base64"));
				console.log(`${++done}/${entries.length} ${e.url}`);
			} catch (err){ console.log(`FAIL ${e.url}: ${err.message.split("\n")[0]}`); }
		}
		await ctx.close();
	}

	// the slugs that exist; the card reads this one small file instead of probing 285 urls
	static index(){
		const slugs = fs.existsSync(THUMBS) ? fs.readdirSync(THUMBS).filter(f => f.endsWith(".webp")).map(f => f.slice(0, -5)) : [];
		fs.mkdirSync(THUMBS, { recursive: true });
		fs.writeFileSync(path.join(THUMBS, "index.json"), JSON.stringify(slugs));
		const bytes = slugs.reduce((n, s) => n + fs.statSync(path.join(THUMBS, s + ".webp")).size, 0);
		console.log(`index.json: ${slugs.length} thumbnails, ${(bytes / 1024).toFixed(0)} KB total`);
	}

	static async main(argv){
		const opt = n => { const i = argv.indexOf("--" + n); return i < 0 ? null : argv[i + 1]; };
		const all = argv.includes("--all");
		const only = opt("only");
		let list = this.plan(this.entries(), all).filter(e => !this.skip(e.url) && (!only || e.url.includes(only)));
		if (argv.includes("--plan") || !(argv.includes("--apply") || all)){
			for (const e of list) console.log(e.state.padEnd(8), e.url);
			const n = s => list.filter(e => e.state === s).length;
			console.log(`${list.length} entries: ${n("fresh")} fresh, ${n("stale")} stale, ${n("missing")} missing`);
			return;
		}
		await this.shoot(list.filter(e => e.state !== "fresh"), opt("base") || "http://monorepo.localhost");
		this.index();
		await close();
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await CatalogThumbs.main(process.argv.slice(2));
export default CatalogThumbs;
