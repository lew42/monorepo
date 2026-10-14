/* `node Server/shots.mjs <url or path> [widths] [--note "..."] [--css "rules"] [--vs <round id>]
 *    [--task <task dir>] [--by <agent>] [--base <origin>]`
 *   Shoots one round of a page at its own widths (or the comma list given), diffs it against
 *   `--vs` or the url's own latest round, and prints one short summary line per width.
 * `node Server/shots.mjs --figma <png path | fileKey:nodeId> <url> [width] [--note "..."]
 *    [--task <task dir>] [--by <agent>] [--base <origin>]`
 *   Figma mode (build-c, figma-browser-loop.md): a Figma frame's own screenshot vs the built
 *   page at the same width, cropped to content and scaled to match. Width defaults to the
 *   frame's own. The `fileKey:nodeId` form needs the png already saved at
 *   `ext/Figma/data/<fileKey>/shots/<nodeId, ":"→"-">.png` — fetch it with the Figma MCP's
 *   `get_screenshot` first if it isn't there yet; this CLI can't call an MCP tool itself.
 * `node Server/shots.mjs --judge <round id> better|worse|same "why" [--by <agent>]`
 *   Records a verdict against that round (plan.md "The loop, and who does what").
 * `node Server/shots.mjs --list <url>`
 *   Every round for this url, as a tree (by `parent`).
 *
 * The base url is `http://monorepo.localhost/` (the Servex proxy) unless `--base <origin>` is
 * given — a worktree's own dev server has its own origin, e.g. `--base http://localhost:62292`.
 */
import { Shots } from "../public/framework/ext/Shots/Shots.mjs";
import { close as closeBrowser } from "./Browser.mjs";

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

	if (argv.includes("--figma")){
		const i = argv.indexOf("--figma");
		const ref = argv[i + 1], url = argv[i + 2];
		const widthArg = argv[i + 3] && !argv[i + 3].startsWith("--") ? argv[i + 3] : null;
		if (!ref || !url) usage(2);
		const note = opt("note", null);
		const task = opt("task", null);
		const by = opt("by", null);
		const base = opt("base", null);
		const { run, diffs } = await Shots.figma(ref, url, {
			width: widthArg ? Number(widthArg) : undefined, note, task, by, base: base || undefined,
		});
		console.log(`figma round ${run.id}  ${run.url}  dir: ${run.dir}`);
		for (const w of run.widths){
			const shot = run.shots[w];
			const diff = diffs.find(d => d.width === w);
			const line = [`  ${w}px: ${run.dir}/${shot.file}`, `h${shot.height}`];
			if (diff){
				const movedTotal = diff.moved.length + (diff.movedMore || 0);
				const changedTotal = diff.regions.length + (diff.regionsMore || 0);
				const signed = n => (n >= 0 ? "+" : "") + n;
				const largestMoved = diff.moved[0];
				const movedPart = `moved ${movedTotal} region${movedTotal === 1 ? "" : "s"}` + (largestMoved ? ` (largest ${largestMoved[2]}×${largestMoved[3]} by ${signed(largestMoved[4])},${signed(largestMoved[5])})` : "");
				const largestChanged = diff.regions[0];
				const changedPart = `changed ${changedTotal}` + (largestChanged ? ` (largest ${largestChanged[2]}×${largestChanged[3]} at ${largestChanged[0]},${largestChanged[1]})` : "");
				line.push(`vs ${diff.vs}: ${movedPart}, ${changedPart}`);
				line.push(`overlay: ${run.dir}/${diff.overlay}`);
			}
			console.log(line.join("  ·  "));
		}
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
			const movedTotal = diff.moved.length + (diff.movedMore || 0);
			const changedTotal = diff.regions.length + (diff.regionsMore || 0);
			const signed = n => (n >= 0 ? "+" : "") + n;
			const largestMoved = diff.moved[0];
			const movedPart = `moved ${movedTotal} region${movedTotal === 1 ? "" : "s"}` + (largestMoved ? ` (largest ${largestMoved[2]}×${largestMoved[3]} by ${signed(largestMoved[4])},${signed(largestMoved[5])})` : "");
			const largestChanged = diff.regions[0];
			const changedPart = `changed ${changedTotal}` + (largestChanged ? ` (largest ${largestChanged[2]}×${largestChanged[3]} at ${largestChanged[0]},${largestChanged[1]})` : "");
			line.push(`vs ${diff.vs}: ${movedPart}, ${changedPart}`);
			if (diff.height[0] !== diff.height[1]) line.push(`height ${diff.height[0]}→${diff.height[1]}`);
			line.push(`overlay: ${run.dir}/${diff.overlay}`);
		}
		console.log(line.join("  ·  "));
	}
}

main().then(() => closeBrowser()).catch(e => { console.error(e); closeBrowser().finally(() => process.exit(1)); });
