// MissSample: for sessions whose first prompt says "Load the `X` skill", was a Skill call for X made? Classify misses.
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
export default class MissSample {
	constructor(root = path.join(os.homedir(), ".claude", "projects")){ this.root = root; this.told = 0; this.loaded = 0; this.misses = []; this.by_cause = {}; }
	run(){
		for (const d of fs.readdirSync(this.root)) { const dir = path.join(this.root, d); if (!fs.statSync(dir).isDirectory()) continue;
			for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsonl")) this.scan(path.join(dir, f)); }
		return this;
	}
	scan(file){
		const txt = fs.readFileSync(file, "utf8"); const head = txt.slice(0, 60000);
		const m = /Load the ((?:`[\w-]+`(?:, | and |, and )?)+) skills?, then/.exec(head); if (!m) return;
		const names = [...m[1].matchAll(/`([\w-]+)`/g)].map(x => x[1]);
		const assistants = (txt.match(/"type":"assistant"/g) || []).length;
		for (const n of names) { this.told++;
			const called = txt.includes(`"skill":"${n}"`) && new RegExp(`"name":"Skill","input":\{"skill":"${n}"`).test(txt);
			// skill text already in prompt (inlined or injected via a command-name block)?
			if (called) { this.loaded++; continue; }
			let cause = assistants < 2 ? "ended-before-first-turn" : /<command-name>/.test(head) ? "text-already-loaded" : /"skill":"/.test(txt) ? "loaded-other-skill-only" : "model-skipped";
			this.by_cause[cause] = (this.by_cause[cause] || 0) + 1; this.misses.push({ file: path.basename(file), skill: n, cause, assistants });
		}
	}
}
if (process.argv[1]?.endsWith("MissSample.mjs")) { const r = new MissSample().run();
	console.log(JSON.stringify({ told: r.told, loaded: r.loaded, rate: +(r.loaded / r.told).toFixed(3), by_cause: r.by_cause, sample: r.misses.slice(0, 10) }, null, 1));
	fs.mkdirSync("data", { recursive: true }); fs.writeFileSync("data/misses.json", JSON.stringify(r.misses, null, 1)); }
