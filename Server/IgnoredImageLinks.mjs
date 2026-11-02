/* IgnoredImageLinks.find(dir, changed) — a changed .md that links a picture git ignores.
 * .gitignore drops most images under public/framework/ai/ (repo size; only a doc/ folder keeps them), so a
 * walkthrough that links <task>/shots/x.png reads fine in the worktree and shows a broken picture once merged.
 * merge.mjs warns; the fix is to keep the picture in <task>/doc/screens/. Test: Server/IgnoredImageLinks.test.mjs */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const IMAGE = /\]\(\s*<?([^)\s>]+\.(?:png|jpe?g|gif|webp))(?:\s+"[^"]*")?\s*>?\)/gi;

export default class IgnoredImageLinks {
	/** Repo-relative path a link points at, or null for an external link / a link out of the repo. */
	static target(mdRel, link){
		if (/^[a-z]+:/i.test(link) || link.startsWith("//")) return null;
		const clean = decodeURI(link.split("#")[0].split("?")[0]);
		const abs = clean.startsWith("/") ? path.posix.join("public", clean) : path.posix.join(path.posix.dirname(mdRel), clean);
		return abs.startsWith("..") ? null : abs;
	}

	/** [{md, link, target}] for every picture linked from a changed .md that exists in `dir` and is git-ignored there. */
	static find(dir, changed){
		const hits = [];
		for (const md of changed.filter(f => f.endsWith(".md"))) {
			let text; try { text = fs.readFileSync(path.join(dir, md), "utf8"); } catch { continue; }
			for (const m of text.matchAll(IMAGE)) {
				const target = this.target(md, m[1]);
				if (!target || !fs.existsSync(path.join(dir, target))) continue;
				if (spawnSync("git", ["check-ignore", "-q", "--", target], { cwd: dir, windowsHide: true }).status === 0) hits.push({ md, link: m[1], target });
			}
		}
		return hits;
	}

	static sentence(hits){
		return `!!! ${hits.length} picture(s) linked from a changed .md are git-ignored and will not reach the main tree: ${hits.map(h => `${h.md} -> ${h.link}`).join("; ")}. Keep hand-kept pictures in <task>/doc/screens/ (only doc/ is tracked) !!!`;
	}
}
