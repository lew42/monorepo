// node MdToParts.mjs <readme.md> <out.json>  — turns a markdown file into page.jsonl lines of parts.
// "# x" -> heading, a "## x" section's first line -> card title, everything else -> text blocks.
import fs from "node:fs";

export default class MdToParts {

	static lines(markdown, title){
		const out = [{ title, class: "../Parts.js" }];
		let n = 0, buffer = [];
		const add = data => out.push({ content: { add: { id: "p" + (++n), ...data } } });
		const flush = () => { const text = buffer.join("\n").trim(); buffer = []; if (text) add({ type: "part-text", text }); };
		for (const line of markdown.split("\n")){
			const head = line.match(/^(#{1,3})\s+(.*)/);
			if (head){ flush(); add({ type: "part-heading", text: head[2] }); }
			else buffer.push(line);
		}
		flush();
		return out;
	}

	static run([src, dest, title]){
		fs.writeFileSync(dest, JSON.stringify(MdToParts.lines(fs.readFileSync(src, "utf8"), title ?? src)));
	}
}

if (process.argv[1]?.endsWith("MdToParts.mjs")) MdToParts.run(process.argv.slice(2));
