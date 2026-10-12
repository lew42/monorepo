/* `node Server/shots.mjs <url or path> [widths] [--note "..."] [--css "rules"] [--vs <round id>]
 *    [--task <task dir>] [--by <agent>] [--base <origin>]`
 *   Shoots one round of a page at its own widths (or the comma list given), diffs it against
 *   `--vs` or the url's own latest round, and prints one short summary line per width.
 * `node Server/shots.mjs --judge <round id> better|worse|same "why" [--by <agent>]`
 *   Records a verdict against that round (plan.md "The loop, and who does what").
 * `node Server/shots.mjs --list <url>`
 *   Every round for this url, as a tree (by `parent`).
 *
 * The base url is `http://monorepo.localhost/` (the Servex proxy) unless `--base <origin>` is
 * given — a worktree's own dev server has its own origin, e.g. `--base http://localhost:62292`.
 */
import { Shots } from "../public/framework/ext/Shots/Shots.mjs";
import { close as closeBrowser } from "./browser.mjs";

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf("--" + name); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v; };

function usage(code){
	console.error(`usage:
  node Server/shots.mjs <url or path> [widths] [--note "..."] [--css "rules"] [--vs <round id>] [--task <task dir>] [--by <agent>] [--base <origin>]
  node Server/shots.mjs --judge <round id> better|worse|same "why" [--by <agent>]
  node Server/shots.mjs --list <url>`);
	process.exit(code);
}

async function main(){
	if (argv.includes("--judge")){
		const i = argv.indexOf("--judge");
		const [id, verdict, why] = argv.slice(i + 1, i + 4);
		const by = opt("by", null);
		if (!id || !verdict) usage(2);
		const judge = Shots.judge(id, verdict, why, by);
		console.log(`judged ${id} ${judge.verdict}${judge.vs ? ` vs ${judge.vs}` : ""}${why ? ` — ${why}` : ""}`);
		return;
	}

	if (argv.includes("--list")){
		const i = argv.indexOf("--list");
		const url = argv[i + 1];
		if (!url) usage(2);
		const lines = Shots.rounds(url);
		if (!lines.length){ console.log(`no rounds for ${url}`); return; }
		const byId = new Map(lines.filter(l => l.run).map(l => [l.run.id, l.run]));
		const print = (id, depth) => {
			const run = byId.get(id);
			if (!run) return;
			console.log(`${"  ".repeat(depth)}${run.id}  widths:[${run.widths.join(",")}]${run.note ? `  "${run.note}"` : ""}`);
			for (const l of lines) if (l.judge?.id === id) console.log(`${"  ".repeat(depth + 1)}judged ${l.judge.verdict}${l.judge.why ? ` — ${l.judge.why}` : ""}`);
			for (const child of byId.values()) if (child.parent === id) print(child.id, depth + 1);
		};
		for (const run of byId.values()) if (!run.parent) print(run.id, 0);
		return;
	}

	const note = opt("note", null);
	const css = opt("css", null);
	const vs = opt("vs", null);
	const task = opt("task", null);
	const by = opt("by", null);
	const base = opt("base", null);
	const [url, widthArg] = argv.filter(a => !a.startsWith("--"));
	if (!url) usage(2);
	const widths = widthArg ? widthArg.split(",").map(Number) : null;

	const { run, diffs } = await Shots.run(url, { widths, note, css, vs, task, by, base: base || undefined });
	console.log(`round ${run.id}  ${run.url}  dir: ${run.dir}`);
	for (const w of run.widths){
		const shot = run.shots[w];
		const diff = diffs.find(d => d.width === w);
		const line = [`  ${w}px: ${run.dir}/${shot.file}`, `h${shot.height}${shot.cut ? " (cut)" : ""}`];
		if (diff){
			const top = diff.regions.slice(0, 3).map(([x, y, rw, rh, amt]) => `[${x},${y},${rw}x${rh}]@${amt}`).join(" ");
			line.push(`vs ${diff.vs}: ${diff.regions.length} region${diff.regions.length === 1 ? "" : "s"}${top ? " " + top : ""}`);
			if (diff.height[0] !== diff.height[1]) line.push(`height ${diff.height[0]}→${diff.height[1]}`);
			line.push(`overlay: ${run.dir}/${diff.overlay}`);
		}
		console.log(line.join("  ·  "));
	}
}

main().then(() => closeBrowser()).catch(e => { console.error(e); closeBrowser().finally(() => process.exit(1)); });
