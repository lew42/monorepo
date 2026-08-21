/* ui-test — drive a page headless and shoot after every gesture.
 *
 *   node drive.mjs plan.json
 *   plan = { url, viewport?, watch?: [sel…], settle?, pause?, out: "<dir>", steps: [ "verb args…" ] }
 *
 * Out: <out>/NN-verb.png after every step, and <out>/steps.json — the verb, its args,
 * console errors since the last step, the watched rects before/after, and layout flags.
 * The json is the evidence; the pngs are the picture. SKILL.md has the verbs. */

import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const plan = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = resolve(plan.out ?? "ui-test-out");
const vp = plan.viewport ?? { width: 1280, height: 900 };
const SEL = { click: 1, hover: 1, type: 1 };   // verbs whose first arg is a selector to watch

mkdirSync(out, { recursive: true });

// "move 100 200 10" → ["move","100","200","10"]; quotes group; eval/type keep their tail verbatim.
function parse(step){
	if (typeof step !== "string") return [step.verb, ...(step.args ?? [])];
	const s = step.trim(), verb = s.split(/\s+/)[0], tail = s.slice(verb.length).trim();
	if (verb === "eval") return [verb, tail];
	if (verb === "type") return [verb, ...(tail.match(/^(\S+)\s+([\s\S]*)$/) ?? []).slice(1)];
	return [verb, ...(tail.match(/"[^"]*"|\S+/g) ?? []).map(a => a.replace(/^"|"$/g, ""))];
}

const browser = await pw.chromium.launch();
const page = await (await browser.newContext({ viewport: vp })).newPage();

const errs = [];
page.on("console", m => m.type() === "error" && errs.push(m.text().slice(0, 200)));
page.on("pageerror", e => errs.push("pageerror: " + String(e).split("\n")[0].slice(0, 200)));

const act = {
	goto: (url = plan.url) => page.goto(url, { waitUntil: "networkidle" }).then(() => page.waitForTimeout(plan.settle ?? 700)),
	move: (x, y, steps = 10) => page.mouse.move(+x, +y, { steps: +steps }),
	down: () => page.mouse.down(),
	up: () => page.mouse.up(),
	click: sel => page.click(sel),
	hover: sel => page.hover(sel),
	key: k => page.keyboard.press(k),
	type: (sel, text) => page.locator(sel).first().pressSequentially(text),
	// One EXPRESSION (an IIFE for statements) — wrapped so an arrow inside it is not
	// mistaken for the function body itself.
	eval: js => page.evaluate(new Function(`return (${js})`)),
	wait: ms => page.waitForTimeout(+ms),
	shot: () => null,   // every step shoots; this one only names a moment
};

// ⚠ CSS only: a Playwright engine selector (`text=…`) THROWS in querySelector, so a
// watched-or-clicked sel that is not CSS reads as null rather than killing the run.
const rects = sels => page.evaluate(list => Object.fromEntries(list.map(s => {
	try {
		const r = document.querySelector(s)?.getBoundingClientRect();
		return [s, r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }];
	} catch { return [s, null]; }
})), sels);

const metrics = () => page.evaluate(() => {
	const e = document.scrollingElement;
	return { sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight };
});

const delta = (a, b) => a && b ? { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h } : null;

// A broken layout, from numbers alone. Overlaps are NOT flagged (a child inside its
// parent overlaps by design) — read the rects for those.
function flags(doc, after){
	const f = [];
	if (doc.sw > doc.cw + 1) f.push(`overflow-x ${doc.sw - doc.cw}px`);
	for (const [s, r] of Object.entries(after).filter(([s]) => (plan.watch ?? []).includes(s))){
		if (!r) f.push(`missing ${s}`);
		else if (!r.w || !r.h) f.push(`zero-size ${s}`);
		else if (r.x < -1 || r.x + r.w > vp.width + 1) f.push(`offscreen-x ${s} (${r.x}…${r.x + r.w})`);
	}
	return f;
}

const steps = String(plan.steps[0] ?? "").startsWith("goto") ? plan.steps : ["goto", ...plan.steps];
const log = [];

for (const [i, step] of steps.entries()){
	const [verb, ...args] = parse(step);
	const sels = [...new Set([...(plan.watch ?? []), ...(SEL[verb] ? [args[0]] : [])])].filter(Boolean);
	const before = i ? await rects(sels) : {};

	let value = null, error = null;
	try {
		if (!act[verb]) throw new Error(`unknown verb "${verb}"`);
		value = (await act[verb](...args)) ?? null;
	} catch (e){ error = String(e).split("\n")[0]; }

	await page.waitForTimeout(plan.pause ?? 150);
	const after = await rects(sels), doc = await metrics();
	const png = `${String(i + 1).padStart(2, "0")}-${verb}.png`;
	await page.screenshot({ path: join(out, png) });

	const entry = {
		n: i + 1, step, verb, args, png, value, error,
		errors: errs.splice(0),
		flags: flags(doc, after),
		doc,
		rects: Object.fromEntries(sels.map(s => [s, { before: before[s] ?? null, after: after[s] ?? null, moved: delta(before[s], after[s]) }])),
	};
	log.push(entry);
	writeFileSync(join(out, "steps.json"), JSON.stringify(log, null, 1));

	const moved = Object.entries(entry.rects).filter(([, r]) => r.moved && Object.values(r.moved).some(Boolean))
		.map(([s, r]) => `${s} ${JSON.stringify(r.moved)}`).join(" ");
	console.log([png, entry.error ? `ERROR ${entry.error}` : "", entry.errors.length ? `console:${entry.errors.length}` : "",
		entry.flags.join(" "), moved, value === null ? "" : `→ ${JSON.stringify(value).slice(0, 200)}`]
		.filter(Boolean).join("  "));
}

await browser.close();
console.log(`\n${log.length} steps · ${out}\\steps.json`);
