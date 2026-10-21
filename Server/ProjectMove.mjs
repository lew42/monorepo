#!/usr/bin/env node
// ProjectMove: the command-line and old-name door for moving a project folder into its module. The work lives in Server/DatedFiles.mjs (move, undo); this is a thin caller.
//   node Server/ProjectMove.mjs <folder> <module>            dry run: prints where it would go (default)
//   node Server/ProjectMove.mjs <folder> <module> --apply    git mv to public/framework/<module>/projects/YYYY/MM/DD/<slug>/
//   node Server/ProjectMove.mjs --undo [--run <id>]          put the last (or named) move back
// Doc: Server/doc/dated-files.md · public/framework/ai/tasks/doc/projects.md
import path from "node:path";
import { fileURLToPath } from "node:url";
import DatedFiles from "./DatedFiles.mjs";

export default class ProjectMove {
	static get ROOT(){ return DatedFiles.ROOT; }
	static set ROOT(v){ DatedFiles.ROOT = v; }                         // a test points this at a scratch repo
	static get MANIFEST(){ return DatedFiles.MANIFEST; }
	static plan(a){ return DatedFiles.files.plan(a); }
	static move(a){ return DatedFiles.files.move(a); }
	static undo(a){ return DatedFiles.files.undo(a); }
	/** The Servex MCP door `move_project`, now one of DatedFiles.tools(). */
	static tool(){ return DatedFiles.tools().find(t => t.name === "move_project"); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), flag = n => argv.includes(n), pos = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--run");
	try {
		const r = flag("--undo") ? await ProjectMove.undo({ run: flag("--run") ? argv[argv.indexOf("--run") + 1] : undefined }) : await ProjectMove.move({ from: pos[0], module: pos[1], apply: flag("--apply") });
		console.log(JSON.stringify(r, null, 2));
		if (r.dry_run) console.log("dry run: add --apply to move it");
	} catch (e){ console.error("ProjectMove: " + e.message); process.exit(1); }
}
