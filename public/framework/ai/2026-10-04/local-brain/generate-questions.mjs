// generate-questions.mjs — walks real class files under public/framework/{core,ext,ux} and
// builds true/false, value and multiple-choice questions with answers COMPUTED from the code
// (law 7: never written by an AI from memory). Five levels, simplest first:
//   1. one fact from one given file (class name / method count / has-method)
//   2. a harder fact about one file (static vs instance method, a decoy name)
//   3. combine two files (which one has method X, which has more methods)
//   4. combine three files (sum of methods, extends check across files)
//   5. a short trace (follow an `extends` chain, or a multi-file total)
// Run: node generate-questions.mjs > questions.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../..");            // repo root
const SCAN_DIRS = ["public/framework/core", "public/framework/ext", "public/framework/ux"];

function walk(dir, out = []){
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
	for (const e of entries){
		if (e.name === "doc" || e.name === "node_modules" || e.name.startsWith(".")) continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) walk(full, out);
		else if (e.isFile() && e.name.endsWith(".js") && e.name !== "page.js" && !/\.examples\.js$/.test(e.name))
			out.push(full);
	}
	return out;
}

// Strip comments before parsing (a prose comment mentioning "class X extends Y" would otherwise
// be read as real code — caught live: a comment in Item.js saying "class List extends Item"
// was parsed as a real class). Tracks string/template state so `//` or `/*` inside a string or
// template literal is left alone; does not handle nested `${...}` inside templates specially,
// which is fine here — we only need class/method shapes, not full JS semantics.
function stripComments(src){
	let out = "", i = 0, state = "code";   // state: code | line | block | sq | dq | tpl
	while (i < src.length){
		const c = src[i], c2 = src[i + 1];
		if (state === "code"){
			if (c === "/" && c2 === "/"){ state = "line"; i += 2; continue; }
			if (c === "/" && c2 === "*"){ state = "block"; i += 2; continue; }
			if (c === "'"){ state = "sq"; out += c; i++; continue; }
			if (c === '"'){ state = "dq"; out += c; i++; continue; }
			if (c === "`"){ state = "tpl"; out += c; i++; continue; }
			out += c; i++; continue;
		}
		if (state === "line"){ if (c === "\n"){ state = "code"; out += c; } i++; continue; }
		if (state === "block"){ if (c === "*" && c2 === "/"){ state = "code"; i += 2; } else i++; continue; }
		if (state === "sq"){ out += c; if (c === "\\"){ out += c2 ?? ""; i += 2; continue; } if (c === "'") state = "code"; i++; continue; }
		if (state === "dq"){ out += c; if (c === "\\"){ out += c2 ?? ""; i += 2; continue; } if (c === '"') state = "code"; i++; continue; }
		if (state === "tpl"){ out += c; if (c === "\\"){ out += c2 ?? ""; i += 2; continue; } if (c === "`") state = "code"; i++; continue; }
	}
	return out;
}

// Pull every top-level `class Name [extends Base] { ... }` block out of a file's text with a
// brace counter (good enough for this codebase's plain class syntax; no npm parser — law: no
// new dependency). Returns [{name, extends, methods:[{name,isStatic}]}].
function parseClasses(rawText){
	const text = stripComments(rawText);
	const classes = [];
	const re = /(?:export\s+(?:default\s+)?)?class\s+(\w+)(?:\s+extends\s+([^\{]+))?\{/g;
	let m;
	while ((m = re.exec(text))){
		const name = m[1];
		const extendsRaw = m[2] ? m[2].trim() : null;
		// find the matching closing brace by counting from the opening one found
		let depth = 1, i = re.lastIndex;
		const start = i;
		while (depth > 0 && i < text.length){
			if (text[i] === "{") depth++;
			else if (text[i] === "}") depth--;
			i++;
		}
		const body = text.slice(start, i - 1);
		const methods = [];
		const methodRe = /(?:^|\n)\s*(static\s+)?(?:async\s+)?(?:\*\s*)?(get\s+|set\s+)?(#?[\w$]+)\s*\(/g;
		let mm;
		const RESERVED = new Set(["if", "for", "while", "switch", "catch", "constructor", "return"]);
		while ((mm = methodRe.exec(body))){
			const isStatic = !!mm[1];
			const accessor = mm[2] ? mm[2].trim() : null;
			const mname = mm[3];
			if (RESERVED.has(mname) || mname.startsWith("#")) continue;
			methods.push({ name: mname, isStatic, accessor });
		}
		// de-dup by name+isStatic (a getter+setter pair shows up twice, which is correct info,
		// but for "how many methods" we count unique callable names once)
		const uniq = [...new Map(methods.map(x => [`${x.isStatic}:${x.name}`, x])).values()];
		classes.push({ name, extends: extendsRaw, methods: uniq });
	}
	return classes;
}

function buildFacts(){
	const files = SCAN_DIRS.flatMap(d => walk(path.join(ROOT, d)));
	const facts = [];
	for (const full of files){
		const rel = path.relative(ROOT, full).replace(/\\/g, "/");
		let text;
		try { text = fs.readFileSync(full, "utf8"); } catch { continue; }
		const classes = parseClasses(text);
		if (classes.length) facts.push({ file: rel, classes });
	}
	return facts;
}

function pick(arr, n, rng){
	const copy = [...arr];
	const out = [];
	for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
	return out;
}

// Sample WITH replacement — used where the question pool (files, classes) is smaller than the
// number of questions wanted: several different questions about the same file/class are still
// different, distinct facts, just not distinct SOURCE FILES.
function sampleReplace(arr, n, rng){
	const out = [];
	for (let i = 0; i < n && arr.length; i++) out.push(arr[Math.floor(rng() * arr.length)]);
	return out;
}

// Deterministic PRNG so re-running produces the same question set (mulberry32).
function mulberry32(seed){
	return function(){
		seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function main(){
	const facts = buildFacts();   // [{file, classes:[{name, extends, methods}]}]
	const withClasses = facts.filter(f => f.classes.some(c => c.methods.length > 0));
	const rng = mulberry32(42);
	const allMethodNames = [...new Set(facts.flatMap(f => f.classes.flatMap(c => c.methods.map(m => m.name))))];
	const allClassNames = [...new Set(facts.flatMap(f => f.classes.map(c => c.name)))];

	const Q = { level1: [], level2: [], level3: [], level4: [], level5: [] };
	let qid = 0;
	const next = () => `q${++qid}`;

	// ---------- Level 1: one fact, one file ----------
	for (const f of sampleReplace(withClasses, 140, rng)){
		const c = f.classes[0];
		const r = rng();
		if (r < 0.34){
			Q.level1.push({
				id: next(), type: "value",
				question: `In ${f.file}, what is the exact name of the class it defines (the first one, if more than one)?`,
				answer: c.name, context_files: [f.file]
			});
		} else if (r < 0.67){
			const decoyPool = allMethodNames.filter(n => !c.methods.some(m => m.name === n));
			const useReal = rng() < 0.5;
			const probe = useReal && c.methods.length ? c.methods[Math.floor(rng() * c.methods.length)].name
				: decoyPool[Math.floor(rng() * decoyPool.length)];
			const truth = c.methods.some(m => m.name === probe);
			Q.level1.push({
				id: next(), type: "boolean",
				question: `True or false: class ${c.name} in ${f.file} defines a method called "${probe}".`,
				answer: truth, context_files: [f.file]
			});
		} else {
			Q.level1.push({
				id: next(), type: "value",
				question: `In ${f.file}, how many distinct methods (static + instance, not counting the constructor) does class ${c.name} define?`,
				answer: String(c.methods.length), context_files: [f.file]
			});
		}
	}

	// ---------- Level 2: a harder single-file fact ----------
	for (const f of sampleReplace(withClasses.filter(f => f.classes[0].methods.length > 0), 120, rng)){
		const c = f.classes[0];
		const r = rng();
		if (r < 0.4){
			const statics = c.methods.filter(m => m.isStatic);
			Q.level2.push({
				id: next(), type: "value",
				question: `In ${f.file}, how many of class ${c.name}'s methods are static (written as "static name(...)")?`,
				answer: String(statics.length), context_files: [f.file]
			});
		} else if (r < 0.7 && c.extends !== null){
			Q.level2.push({
				id: next(), type: "boolean",
				question: `True or false: class ${c.name} in ${f.file} has an "extends" clause (it extends something).`,
				answer: true, context_files: [f.file]
			});
		} else if (c.extends === null){
			Q.level2.push({
				id: next(), type: "boolean",
				question: `True or false: class ${c.name} in ${f.file} has an "extends" clause (it extends something).`,
				answer: false, context_files: [f.file]
			});
		} else {
			const method = c.methods[Math.floor(rng() * c.methods.length)];
			Q.level2.push({
				id: next(), type: "multiple_choice",
				question: `In ${f.file}, is the method "${method.name}" on class ${c.name} static or an instance method? Answer exactly "static" or "instance".`,
				choices: ["static", "instance"],
				answer: method.isStatic ? "static" : "instance", context_files: [f.file]
			});
		}
	}

	// ---------- Level 3: combine two files ----------
	const pairs = [];
	for (let i = 0; i < 130; i++){
		const [a, b] = sampleReplace(withClasses, 2, rng);
		if (a && b && a !== b) pairs.push([a, b]);
	}
	for (const [a, b] of pairs){
		const ca = a.classes[0], cb = b.classes[0];
		const r = rng();
		if (r < 0.34){
			const more = ca.methods.length === cb.methods.length ? "tie" : (ca.methods.length > cb.methods.length ? ca.name : cb.name);
			Q.level3.push({
				id: next(), type: "multiple_choice",
				question: `Between class ${ca.name} (${a.file}) and class ${cb.name} (${b.file}), which defines MORE methods? Answer exactly "${ca.name}", "${cb.name}", or "tie".`,
				choices: [ca.name, cb.name, "tie"],
				answer: more, context_files: [a.file, b.file]
			});
		} else if (r < 0.67 && cb.methods.length){
			const method = cb.methods[Math.floor(rng() * cb.methods.length)].name;
			const aHas = ca.methods.some(m => m.name === method);
			Q.level3.push({
				id: next(), type: "multiple_choice",
				question: `The method "${method}" is defined on class ${cb.name} in ${b.file}. Is it ALSO defined on class ${ca.name} in ${a.file}? Answer exactly "yes" or "no".`,
				choices: ["yes", "no"],
				answer: aHas ? "yes" : "no", context_files: [a.file, b.file]
			});
		} else {
			Q.level3.push({
				id: next(), type: "value",
				question: `Adding them together: class ${ca.name} (${a.file}) has some methods, and class ${cb.name} (${b.file}) has some methods. What is the TOTAL number of methods across both classes combined?`,
				answer: String(ca.methods.length + cb.methods.length), context_files: [a.file, b.file]
			});
		}
	}

	// ---------- Level 4: combine three files ----------
	for (let i = 0; i < 115; i++){
		const trio = [...new Set(sampleReplace(withClasses, 3, rng))];
		if (trio.length < 3) continue;
		const [a, b, c] = trio;
		const classes = [a, b, c].map(f => f.classes[0]);
		const total = classes.reduce((s, cl) => s + cl.methods.length, 0);
		const r = rng();
		if (r < 0.5){
			Q.level4.push({
				id: next(), type: "value",
				question: `Three classes: ${classes[0].name} (${a.file}), ${classes[1].name} (${b.file}), ${classes[2].name} (${c.file}). What is the TOTAL number of methods across all three classes?`,
				answer: String(total), context_files: [a.file, b.file, c.file]
			});
		} else {
			const names = classes.map(cl => cl.name);
			const counts = classes.map(cl => cl.methods.length);
			const maxIdx = counts.indexOf(Math.max(...counts));
			const tie = counts.filter(n => n === counts[maxIdx]).length > 1;
			Q.level4.push({
				id: next(), type: "multiple_choice",
				question: `Of these three classes — ${names[0]} (${a.file}), ${names[1]} (${b.file}), ${names[2]} (${c.file}) — which one defines the MOST methods? Answer exactly one of "${names[0]}", "${names[1]}", "${names[2]}", or "tie" if two or more are equal.`,
				choices: [...names, "tie"],
				answer: tie ? "tie" : names[maxIdx], context_files: [a.file, b.file, c.file]
			});
		}
	}

	// ---------- Level 5: a short trace (extends chain / cross-file inheritance check) ----------
	// Build a lookup: class name -> {file, extends, methods}
	const byName = new Map();
	for (const f of facts) for (const c of f.classes) if (!byName.has(c.name)) byName.set(c.name, { ...c, file: f.file });
	const extendsOf = name => {
		const c = byName.get(name);
		if (!c || !c.extends) return null;
		// extends clause may be "Base" or "Events(Object)" (a mixin call) — take the first bare identifier
		const m = c.extends.match(/^([A-Za-z_$][\w$]*)/);
		return m ? m[1] : null;
	};
	const chainClasses = [...byName.keys()].filter(n => extendsOf(n) && byName.has(extendsOf(n)));
	for (const name of sampleReplace(chainClasses, 60, rng)){
		const base = extendsOf(name);
		const c = byName.get(name), b = byName.get(base);
		Q.level5.push({
			id: next(), type: "boolean",
			question: `Class ${name} (${c.file}) extends ${base}. True or false: ${base} is defined in ${b.file}.`,
			answer: true, context_files: [c.file, b.file]
		});
		// a decoy version against a wrong file
		const wrongFile = withClasses[Math.floor(rng() * withClasses.length)].file;
		if (wrongFile !== b.file){
			Q.level5.push({
				id: next(), type: "boolean",
				question: `Class ${name} (${c.file}) extends ${base}. True or false: ${base} is defined in ${wrongFile}.`,
				answer: false, context_files: [c.file, wrongFile]
			});
		}
	}
	// top up level 5 with three-way "total method count across the whole extends chain" if short
	while (Q.level5.length < 100 && chainClasses.length){
		const name = chainClasses[Math.floor(rng() * chainClasses.length)];
		const base = extendsOf(name);
		const c = byName.get(name), b = byName.get(base);
		if (!b) continue;
		const total = c.methods.length + b.methods.length;
		Q.level5.push({
			id: next(), type: "value",
			question: `Class ${name} (${c.file}, ${c.methods.length} methods) extends ${base} (${b.file}, ${b.methods.length} methods). What is ${name}'s own method count PLUS ${base}'s own method count?`,
			answer: String(total), context_files: [c.file, b.file]
		});
	}

	const out = { generated_at: new Date().toISOString(), file_count: facts.length, class_count: facts.reduce((s, f) => s + f.classes.length, 0), levels: Q };
	console.log(JSON.stringify(out, null, 2));
}

main();
