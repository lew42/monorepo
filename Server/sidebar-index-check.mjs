/* Sidebar search index: size, load time, and whether every declared child of the `leaf: true`
   pages is in it (a leaf page draws flat in the rail, so its children were once skipped).
   Usage: node Server/sidebar-index-check.mjs [http://monorepo.localhost]   Doc: core/Sidebar/doc/index.md */
import { browser } from "./Browser.mjs";
const base = process.argv[2] || "http://monorepo.localhost";
const b = await browser(), p = await b.newPage();
await p.goto(base + "/framework/ui/", { waitUntil: "load" });
await p.waitForTimeout(5000);
const r = await p.evaluate(async () => {
	const side = app.router.active?.parent?.$sidebar ?? Object.values(app).find(v => v?.$sidebar)?.$sidebar;
	if (!side) return null;
	const t = performance.now(), list = await side.index(), ms = Math.round(performance.now() - t);
	const have = new Set(list.map(x => x.href)), missing = [];
	// Every declared child of the leaf pages that are still not indexed (data-fed ones excluded by design).
	const walk = async (page, depth) => {
		await page.load_all_children(1).loading;
		for (const [name, child] of page.children){
			if (!child) continue;
			const url = page.nav_for(name).url;
			if (!(await page.nav_ready(name))) continue;
			if (page.leaf && !page.child_source && !have.has(url)) missing.push(url);
			if (child.leaf && !child.child_source && depth < 4) await walk(child, depth + 1);
		}
	};
	await walk(app.router.root ?? app.router.active.parent, 0);
	return { pages: list.length, bytes: JSON.stringify(list).length, ms, missing };
});
console.log(r ? JSON.stringify(r, null, 1) : "no sidebar found");
await b.close(); process.exit(r?.missing.length ? 1 : 0);
