// proto/objects.mjs — throwaway prototype for the object layer design (../doc/envelope.md).
// list_objects / describe / call over a root registry, JSDoc read from THIS FILE's own
// source text — never toString(), which cannot see a comment above a function.
// Run: node proto/objects.mjs   (prints six PASS lines, exits 1 on any failure)

import fs from "fs";
import { fileURLToPath } from "url";

const SOURCE = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");

/* ---- fakes standing in for the real objects (servex, app) --------------- */

class Agents {
	/**
	 * Every agent Servex has ever registered.
	 * @public
	 * @returns {object[]} rows, id and state
	 */
	list(){ return [{ id: "minion-servex-port", state: "idle" }]; }

	/**
	 * End a session for good.
	 * @public
	 * @param {string} id
	 */
	stop(id){ return { id, state: "stopped" }; }

	// No @public tag — framework plumbing, never a call target. describe() must
	// drop this even though it is an ordinary enumerable method.
	assign(...args){ return Object.assign(this, ...args); }
}

class Servex {
	constructor(){ this.agents = new Agents(); }
}

class Router {
	/**
	 * The page currently on screen.
	 * @public
	 * @returns {string}
	 */
	current(){ return "/framework/ai/2026-09-22/object-layer/"; }
}

class App {
	constructor(){ this.router = new Router(); }
}

const root = { servex: new Servex(), app: new App() };

/* ---- JSDoc, parsed from source text, scoped to one class's body --------- */

function class_body(name){
	const m = SOURCE.match(new RegExp(`class\\s+${name}\\b[^{]*{`));
	if (!m) return "";
	let i = m.index + m[0].length, depth = 1;
	const start = i;
	while (depth > 0 && i < SOURCE.length) depth += SOURCE[i] === "{" ? 1 : SOURCE[i] === "}" ? -1 : 0, i++;
	return SOURCE.slice(start, i - 1);
}

// Finds THIS method's own definition line, then looks immediately above it for a
// doc comment — never a scan from the top of the class, which a lazy `[\s\S]*?`
// regex mistakes for "nearest /** ... */ before the name" and instead returns
// "furthest, because the first attempt failed" the moment two methods share a
// class (caught by the browser prototype below, ../doc/envelope.md).
function jsdoc(body, method){
	const def = body.match(new RegExp(`(?:^|\\n)[ \\t]*${method}\\s*\\(`));
	if (!def) return null;
	const before = body.slice(0, def.index).trimEnd();
	if (!before.endsWith("*/")) return null;
	const open = before.lastIndexOf("/**");
	if (open === -1) return null;
	const lines = before.slice(open + 3, -2).split("\n").map(l => l.replace(/^\s*\*\s?/, "").trim()).filter(Boolean);
	const tags = lines.filter(l => l.startsWith("@"));
	return {
		summary: lines.filter(l => !l.startsWith("@")).join(" "),
		public: tags.some(t => t.startsWith("@public")),
		params: tags.filter(t => t.startsWith("@param")).map(t => t.replace(/^@param\s*/, "")),
	};
}

/* ---- the three tools ------------------------------------------------------
 * Same refusal as ../doc/security.md: __proto__/constructor/prototype are not
 * resolvable path segments, and only a method carrying @public describes or calls. */

function resolve(target){
	let obj = root;
	for (const part of String(target).split(".")){
		if (["__proto__", "constructor", "prototype"].includes(part))
			throw new Error(`refused: "${part}" is not a resolvable path segment`);
		obj = obj?.[part];
	}
	if (obj === undefined) throw new Error(`no such target "${target}"`);
	return obj;
}

function list_objects(obj = root, prefix = ""){
	return Object.entries(obj).flatMap(([key, val]) => {
		if (!val || typeof val !== "object") return [];
		const path = prefix ? `${prefix}.${key}` : key;
		return [path, ...list_objects(val, path)];
	});
}

function describe(target){
	const obj = resolve(target);
	const body = class_body(obj.constructor.name);
	return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
		.filter(name => name !== "constructor" && typeof obj[name] === "function")
		.map(method => ({ method, ...jsdoc(body, method) }))
		.filter(m => m.public);
}

function call({ target, method, args = [] }){
	if (!describe(target).some(m => m.method === method))
		throw new Error(`refused: "${method}" on "${target}" is not @public`);
	return resolve(target)[method](...args);
}

/* ---- six assertions -------------------------------------------------------- */

let failed = 0;
function check(label, fn){
	try {
		const ok = fn();
		console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
		if (!ok) failed++;
	} catch (e){
		console.log(`FAIL — ${label} (threw: ${e.message})`);
		failed++;
	}
}

check("list_objects() finds servex, servex.agents, app, app.router", () => {
	const found = list_objects();
	return ["servex", "servex.agents", "app", "app.router"].every(p => found.includes(p));
});

check("describe(servex.agents) exposes only @public methods (list, stop), not assign", () => {
	const names = describe("servex.agents").map(m => m.method).sort();
	return JSON.stringify(names) === JSON.stringify(["list", "stop"]);
});

check("describe(servex.agents) carries EACH method's own JSDoc summary, not its neighbour's", () => {
	const rows = describe("servex.agents");
	return rows.find(m => m.method === "list").summary === "Every agent Servex has ever registered."
		&& rows.find(m => m.method === "stop").summary === "End a session for good.";
});

check('call({target:"servex.agents", method:"list"}) runs the real method', () =>
	JSON.stringify(call({ target: "servex.agents", method: "list", args: [] })) === JSON.stringify([{ id: "minion-servex-port", state: "idle" }]));

check("call refuses a method with no @public tag (assign)", () => {
	try { call({ target: "servex.agents", method: "assign", args: [{}] }); return false; }
	catch (e){ return /not @public/.test(e.message); }
});

check('resolve refuses a "__proto__" path segment', () => {
	try { resolve("servex.__proto__.constructor"); return false; }
	catch (e){ return /not a resolvable path segment/.test(e.message); }
});

if (failed) process.exit(1);
