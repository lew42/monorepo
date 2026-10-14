// builds batches of dossiers (head, folder readme head, git log -3, size) for the Haiku verdict minions
import fs from "node:fs"; import path from "node:path"; import {execFileSync} from "node:child_process";
import Unreferenced from "../../../../../../../../../../Server/Unreferenced.mjs";
const REPO = process.cwd(), out = path.dirname(new URL(import.meta.url).pathname.replace(/^\//,""));
const u = new Unreferenced().run(), list = u.candidates.sort();
const old = fs.readFileSync("public/framework/ai/doc/unreferenced.md","utf8");
const rows = list.map(f => {
	const size = fs.statSync(f).size, head = fs.readFileSync(f,"utf8").split("\n").slice(0,12).join("\n").slice(0,700);
	let rd = ""; for (let d = path.dirname(f); d.length > 20; d = path.dirname(d)) { const r = path.join(d,"readme.md"); if (fs.existsSync(r) && r !== f) { rd = r + ":\n" + fs.readFileSync(r,"utf8").split("\n").slice(0,10).join("\n").slice(0,500); break; } }
	const log = execFileSync("git",["log","-3","--format=%ad %s","--date=short","--",f],{encoding:"utf8"}).trim();
	return {file:f,size,head,readme:rd,log};
});
fs.writeFileSync(path.join(out,"candidates.json"),JSON.stringify(rows,null,1));
const B = 28, n = Math.ceil(rows.length/B);
for (let i=0;i<n;i++) fs.writeFileSync(path.join(out,`batch-${i+1}.json`),JSON.stringify(rows.slice(i*B,(i+1)*B)));
console.log(rows.length,"files",n,"batches");
