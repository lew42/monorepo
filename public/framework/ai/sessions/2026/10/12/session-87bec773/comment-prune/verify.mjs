// Usage: node verify.mjs <file> [gitRef=HEAD]  — exits 1 unless the file differs from <gitRef> in comments only.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Strips // and /* */ comments (string, template and regex aware) and collapses whitespace.
export function strip(src) {
	let out = "", i = 0, prev = "";
	const tpl = []; // brace depth stack for template ${ }
	let depth = 0;
	const regexOk = () => prev === "" || /[(,=:\[!&|?{};+\-*%<>~^]/.test(prev) || /(?:return|typeof|case|in|of|delete|void|throw|new|else|do)$/.test(out.trimEnd());
	while (i < src.length) {
		const c = src[i], n = src[i + 1];
		if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
		if (c === "/" && n === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; out += " "; continue; }
		if (c === '"' || c === "'") {
			let j = i + 1; while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
			out += src.slice(i, j + 1); i = j + 1; prev = c; continue;
		}
		if (c === "`" || (c === "}" && tpl.length && tpl[tpl.length - 1] === depth)) {
			if (c === "}") { tpl.pop(); depth--; }
			let j = i + 1, inExpr = false;
			while (j < src.length) {
				if (src[j] === "\\") { j += 2; continue; }
				if (src[j] === "`") break;
				if (src[j] === "$" && src[j + 1] === "{") { inExpr = true; break; }
				j++;
			}
			if (inExpr) { out += src.slice(i, j + 2); i = j + 2; depth++; tpl.push(depth); prev = "{"; continue; }
			out += src.slice(i, j + 1); i = j + 1; prev = "`"; continue;
		}
		if (c === "/" && regexOk()) {
			let j = i + 1, cls = false;
			while (j < src.length && src[j] !== "\n") { if (src[j] === "\\") j++; else if (src[j] === "[") cls = true; else if (src[j] === "]") cls = false; else if (src[j] === "/" && !cls) break; j++; }
			if (src[j] === "/") { j++; while (/[a-z]/.test(src[j])) j++; out += src.slice(i, j); i = j; prev = "/"; continue; }
		}
		if (c === "{") depth++;
		if (c === "}") depth--;
		out += c; if (!/\s/.test(c)) prev = c; i++;
	}
	return out.replace(/\s+/g, " ").trim();
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
	const [file, ref = "HEAD"] = process.argv.slice(2);
	const before = execSync(`git show ${ref}:${file}`, { maxBuffer: 1 << 28 }).toString();
	const after = readFileSync(file, "utf8");
	const a = strip(before), b = strip(after);
	if (a === b) { console.log(`OK ${file}: code identical (${before.split("\n").length} -> ${after.split("\n").length} lines)`); }
	else {
		let k = 0; while (a[k] === b[k]) k++;
		console.log(`DIFF ${file} at ${k}:\n before: ${a.slice(Math.max(0, k - 60), k + 80)}\n after:  ${b.slice(Math.max(0, k - 60), k + 80)}`); process.exit(1);
	}
}
