// The condensed transcript: what a reviewer needs to see both sides of a session, without tool results.
// One line per event: `L<line> HH:MM OWNER| …`, `AI| …`, `TOOL| Edit path`, `TOOL| Bash: <command head>`.
import fs from "node:fs";
import PromptAudit from "../../../../../../../Server/PromptAudit.mjs";

export function condense(transcript){
	const owner = new Map(PromptAudit.prompts(transcript).map(p => [p.line, p])), seen = new Map();
	const out = [];
	fs.readFileSync(transcript, "utf8").split("\n").forEach((raw, i) => {
		const n = i + 1;
		if (owner.has(n)){ const p = owner.get(n), k = p.at + p.text.length;
			if (seen.has(k)){ out.push(`L${n} OWNER| (the prompt at L${seen.get(k)} again, replayed after a compaction)`); return; }
			seen.set(k, n); out.push(`L${n} ${p.at.slice(5, 16)} OWNER| ${p.text.replace(/\s+/g, " ")}`); return; }
		if (!raw.includes('"type":"assistant"')) return;
		let l; try { l = JSON.parse(raw); } catch { return; }
		for (const b of l.message?.content ?? []){
			if (b.type === "text" && b.text.trim()) out.push(`L${n} AI| ${b.text.replace(/\s+/g, " ").slice(0, 1500)}`);
			if (b.type === "tool_use"){
				const x = b.input ?? {}, name = b.name.replace(/^mcp__\w+__/, "");
				const what = x.file_path ?? x.path ?? x.command ?? x.pattern ?? x.prompt ?? x.description ?? JSON.stringify(x);
				out.push(`L${n} TOOL| ${name}: ${String(what).replace(/\s+/g, " ").slice(0, 160)}`);
			}
		}
	});
	return out;
}

if (process.argv[1]?.endsWith("condense.mjs")){
	const t = PromptAudit.locate(process.argv[2]).transcript, lines = condense(t);
	fs.writeFileSync(process.argv[3], lines.join("\n") + "\n");
	console.log(lines.length, "lines", lines.join("\n").length, "chars");
}
