// Census: how many real pages use each layout pattern. Run from the repo root:
//   node public/framework/styles/layouts/catalog/census.mjs   -> census.json (+ prints a table)
// A "page" is a .js file under public/ that builds a Page (new Page( / extends Page / demo.layout().
// Demo dirs (styles/layouts, ai/20*, ai/sessions, Figma/data) are skipped: they show layouts, they are not users.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skip = /^public\/(framework\/(ai\/(20|sessions)|styles\/layouts\/|ext\/Figma\/data)|.*node_modules)/;
const files = execSync("git ls-files -- public/*.js public/**/*.js", { cwd: join(here, "../../../../.."), maxBuffer: 1e8 })
	.toString().split("\n").filter(f => f && f.endsWith(".js") && !skip.test(f));
const root = join(here, "../../../../..");

const PATTERNS = {
	"standard":   null, // computed: a page with none of the others
	"left-nav":   /new Sidebar\(|extends Sidebar|\bSidebar\(|sidebar\s*:/,
	"rail-wall":  /\bbrowse\(/,
	"inbox":      /\bInbox\b|InboxRail/,
	"data-grid":  /DataGrid|ui\/datagrid/,
	"columns":    /\.columns\(|new Columns|extends Columns|columns\s*:\s*["']\w+ \w+|\bcols-\w+/,
	"steps":      /new Wizard|extends Wizard|\bWizard\(/,
	"chat":       /new Chat\(|extends Chat\b|\bChat\(/,
	"tabs":       /\btabs\(|new Tabs|extends Tabs/,
	"wall":       /c\("[^"]*\bwall\b/,
	"rail":       /c\("[^"]*\brail\b/,
	"split":      /c\("[^"]*\bsplit\b/,
	"hero":       /c\("[^"]*\bhero\b/,
	"solo":       /c\("[^"]*\bsolo\b/,
	"toc":        /ext\/toc|\btoc\(/,
	"figma-card": /pal-/,
};

const pages = files.map(f => ({ f, src: readFileSync(join(root, f), "utf8") }))
	.filter(({ src }) => /new Page\(|extends Page\b|demo\.layout\(/.test(src));

const out = {}; for (const k of Object.keys(PATTERNS)) out[k] = [];
for (const { f, src } of pages){
	let any = false;
	for (const [k, re] of Object.entries(PATTERNS)){
		if (!re) continue;
		if (re.test(src)){ out[k].push(f); any = true; }
	}
	if (!any) out.standard.push(f);
}
const table = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length]));
writeFileSync(join(here, "census.json"), JSON.stringify({ at: new Date().toISOString().slice(0, 10), pages: pages.length, counts: table, files: out }, null, 1));
console.log("pages:", pages.length); console.table(table);
