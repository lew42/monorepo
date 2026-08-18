#!/usr/bin/env node
/* Capture screenshots headless, ask one FRESH claude session per image, log one
 * JSONL line per shot. Node only — never in the browser (a paid ask wired to a
 * gesture is a bill wired to a mouse). Run from the repo root:
 *
 *   node public/framework/ext/DesignTool/vision/run.mjs --pages /framework/,/framework/ui/ \
 *     --widths 390,1280,3440 --prompt critique-full-v1 --model sonnet --out public/framework/ai/<date>/<slug>
 *
 * ⚠ SYSTEM must stay BYTE-IDENTICAL across every call — it is what the prompt
 * cache is keyed on. Constant: $0.015–0.03 a shot. Edited: every call pays a cold
 * $0.13 cache write. Omitted (the CLI default): $0.060, because 46k of skills and
 * CLAUDE.md are re-read for every image. Measured 2026-08-17.
 */
import { spawn, execSync } from "child_process";
import { createRequire } from "module";
import { randomUUID, createHash } from "crypto";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM = "You are a visual design critic. You are given one screenshot and asked about it. Judge only what is in the image; never open or read any other file.";
const RATE = { sonnet: 0.072, opus: 0.20, fable: 0.32 };   // $/shot, measured on the 2026-08-17 pilot — --dry only
const HEIGHT = { 390: 844, 1280: 800, 3440: 1440 };
const vh = w => HEIGHT[w] ?? Math.round(w * 0.5);

const argv = process.argv.slice(2);
const has = n => argv.includes("--" + n);
const flag = (n, d) => { const i = argv.indexOf("--" + n); return i < 0 ? d : argv[i + 1]; };
const list = (n, d) => String(flag(n, d)).split(",").map(s => s.trim()).filter(Boolean);

const opt = {
    base: flag("base", "http://localhost"), widths: list("widths", "390,1280,3440").map(Number),
    regions: flag("regions", "auto"), prompt: flag("prompt", "critique-full-v1"),
    model: flag("model", "sonnet"), out: flag("out", "public/framework/ai/vision"),
    turn2: flag("turn2", null), max: Number(flag("max-regions", 8)), jobs: Number(flag("jobs", 3)),
    dry: has("dry"), resume: has("resume-run"), replay: flag("replay", null),
    sel: has("sel") ? list("sel", "") : [],
};

/* A fixed block of the site's deliberate choices, prepended to turn 1 after the context
 * header. Turn 2 kept retracting turn-1 findings that were intent all along - cheaper to
 * tell turn 1 up front. On by default for v3; --no-intent switches it off. */
opt.intent = has("no-intent") ? null : flag("intent", /^critique-full-v3/.test(opt.prompt) ? "intent" : null);
const pages = String(flag("pages", "/framework/")).startsWith("@")
    ? fs.readFileSync(String(flag("pages")).slice(1), "utf8").split("\n").map(s => s.trim()).filter(Boolean)
    : list("pages", "/framework/");

const OUT = path.resolve(opt.out), SHOTS = path.join(OUT, "shots"), LOG = path.join(OUT, "vision.jsonl");
const PUBLIC = path.resolve("public");
// A shot the dev server can serve. Outside public/ there is no url — keep the disk path.
const site = f => f.startsWith(PUBLIC + path.sep) ? "/" + path.relative(PUBLIC, f).split(path.sep).join("/") : f;
const read = id => fs.readFileSync(path.join(HERE, "prompts", id + ".md"), "utf8").trim();

/* ⚠ Playwright resolves from the GLOBAL install, never package.json (Shot.js's ten lines). */
let driver;
function chromium(){
    if (driver !== undefined) return driver;
    try { driver = createRequire(path.join(execSync("npm root -g", { encoding: "utf8" }).trim(), "index.js"))("playwright").chromium; }
    catch { driver = null; }
    return driver;
}

main().catch(e => { console.error(e); process.exit(1); });

async function main(){
    const prompt = read(opt.prompt);
    const intent = opt.intent ? read(opt.intent) : "";
    const most = opt.replay ? reuse(new Set(), true).length
        : pages.length * opt.widths.length * (opt.sel.length ? 1 + opt.sel.length : opt.regions === "auto" ? 1 + opt.max : 1);
    const turns = opt.turn2 ? 2 : 1;   // turn 2 costs about an ask again — more when it reads files
    console.log(`${pages.length} pages × ${opt.widths.length} widths · regions ${opt.regions} · ${opt.model} · ${opt.prompt}${opt.turn2 ? " + " + opt.turn2 : ""}${opt.replay ? " · replay " + opt.replay : ""}`);
    console.log(`plan: ≤ ${most} shots × ${turns} turns · est ≤ $${(most * turns * (RATE[opt.model] ?? 0.05)).toFixed(2)} → ${opt.out}`);
    if (opt.dry) return console.log(pages.map(u => "  " + u).join("\n"));

    fs.mkdirSync(SHOTS, { recursive: true });
    /* MERGE, never overwrite. An out dir accumulates runs — a second run under a
     * different prompt used to erase the first one's text, and a log line whose
     * prompt_id resolves to nothing is a shot with no record of what was asked. */
    const book = path.join(OUT, "prompts.json");
    const had = fs.existsSync(book) ? JSON.parse(fs.readFileSync(book, "utf8")) : {};
    fs.writeFileSync(book, JSON.stringify({
        ...had, system: SYSTEM, [opt.prompt]: prompt, ...(opt.turn2 ? { [opt.turn2]: read(opt.turn2) } : {}),
        ...(opt.intent ? { [opt.intent]: intent } : {}),
    }, null, 1));

    const shots = (opt.replay ? reuse(seen()) : await capture(seen())).filter(s => !s.skip);
    console.log(`captured ${shots.length} shots · asking ${opt.model}, ${opt.jobs} at a time`);

    let spent = 0, n = 0;
    const one = async shot => {
        const head = intent ? context(shot) + "\n\n" + intent : context(shot);
        const res = await ask({ file: path.join(SHOTS, shot.hash + ".png"), prompt, head });
        if (res.error) return console.log(`  ! ${shot.url} @${shot.width} — ${res.error.slice(0, 140)}`);
        const rec = line(shot, res, opt.prompt);
        if (opt.turn2) await second(rec, shot);
        fs.appendFileSync(LOG, JSON.stringify({ shot: rec }) + "\n");   // as we go — a crash keeps what was done
        spent += rec.cost_usd + (rec.turn2?.cost_usd ?? 0);
        const t2 = rec.turn2 ? ` → ${rec.turn2.declared}decl ${rec.turn2.retracted}retract $${rec.turn2.cost_usd.toFixed(3)}` : "";
        console.log(`  ${++n}/${shots.length} ${shot.region?.sel ?? "PAGE"} ${shot.url} @${shot.width} $${rec.cost_usd.toFixed(3)} ${rec.findings.length}f${t2}`);
    };

    if (shots.length) await one(shots[0]);        // warm the shared cache alone — three cold writes cost $0.39
    await pool(shots.slice(1), opt.jobs, one);
    console.log(`done: ${n} shots, $${spent.toFixed(2)} → ${site(LOG)}`);
}

/* --replay <dir>: ask again about images a previous run already captured, instead of
 * taking new ones. Consensus needs the N asks to see the SAME png — re-capturing a live
 * dashboard drifts the content between runs and disagreement stops meaning anything.
 * --pages / --widths filter the replay only when actually passed. */
function reuse(done, dry){
    const from = path.resolve(opt.replay);
    const seenHash = new Set(), out = [];
    for (const l of fs.readFileSync(path.join(from, "vision.jsonl"), "utf8").split("\n").filter(Boolean)){
        let r; try { r = JSON.parse(l).shot; } catch { continue; }
        if (seenHash.has(r.hash)) continue;
        seenHash.add(r.hash);
        if (has("pages") && !pages.includes(r.url)) continue;
        if (has("widths") && !opt.widths.includes(r.width)) continue;
        if (opt.regions !== "auto" && r.region) continue;
        const src = path.join(from, "shots", r.hash + ".png"), dst = path.join(SHOTS, r.hash + ".png");
        if (!dry && !fs.existsSync(dst)){ if (!fs.existsSync(src)) continue; fs.copyFileSync(src, dst); }
        out.push({ url: r.url, width: r.width, region: r.region, page_shot: r.page_shot,
            outline: r.outline ?? null, hash: r.hash, path: site(dst), skip: opt.resume && done.has(asked(r.hash)) });
    }
    return out;
}

async function capture(done){
    const launcher = chromium();
    if (!launcher) throw new Error("playwright is not installed globally — `npm i -g playwright`.");
    const browser = await launcher.launch();
    const shots = [];
    let page = null, navs = 0;

    const fresh = async width => {
        if (page) await page.close();
        page = await browser.newPage({ viewport: { width, height: vh(width) }, deviceScaleFactor: 1 });
        await page.addInitScript(() => { window.$BLOCKRELOAD = true; });   // never touch a live tab's reload
        navs = 0;
    };

    try {
        for (const width of opt.widths){
            await fresh(width);
            for (const url of pages){
                if (++navs > 40) await fresh(width);   // ⚠ chrome wedges after ~85–110 navigations
                shots.push(...await grab(page, url, width, done));
            }
        }
    } finally { await browser.close(); }
    return shots;
}

async function grab(page, url, width, done){
    const res = await page.goto(opt.base + url, { waitUntil: "load" });   // ⚠ never networkidle — the live-reload socket never idles
    if (!res || res.status() >= 400){ console.log(`  ${url} @${width} → HTTP ${res?.status()} — skipped`); return []; }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    /* ⚠ A missing page is HTTP 200. The SPA fallback serves index.html and core/App
     * renders "Page Load Error" inside it, so the status check above sees nothing —
     * /framework/web/ was shot and critiqued as a design sample from the pilot on.
     * Ask the rendered DOM, not the response. */
    const dead = await page.evaluate(() => document.querySelector(".active-page pre.error")?.textContent);
    if (dead){ console.log(`  ${url} @${width} → ${dead.trim().slice(0, 60)} — skipped`); return []; }

    const whole = keep(await page.screenshot(), { url, width, region: null, page_shot: null,
        outline: opt.turn2 ? await page.evaluate(sketch) : null }, done);
    const out = [whole];

    /* --sel: the selectors YOU name, one region row each — a closed list where the auto
     * picker is an open one (it grabbed `div.sidebar` twice tonight). Every match shoots,
     * not just the first: `--sel ".ai-card"` is a set of cards, and one of them is not it. */
    for (const sel of opt.sel){
        for (const el of await page.locator(sel).all()){
            let buf, b;
            try { b = await el.boundingBox(); buf = await el.screenshot({ timeout: 5000 }); } catch { continue; }
            out.push(keep(buf, { url, width, outline: null, page_shot: whole.path,
                region: { sel, box: { x: b?.x ?? 0, y: b?.y ?? 0, w: b?.width ?? 0, h: b?.height ?? 0 } } }, done));
        }
    }
    if (opt.sel.length || opt.regions !== "auto") return out;

    for (const r of await page.evaluate(pick, { max: opt.max })){
        let buf;
        try { buf = await page.locator(r.path).first().screenshot({ timeout: 5000 }); } catch { continue; }
        out.push(keep(buf, { url, width, region: { sel: r.sel, box: r.box }, page_shot: whole.path, outline: r.outline }, done));
    }
    console.log(`  ${url} @${width} → 1 page + ${out.length - 1} regions`);
    return out;
}

function keep(buf, meta, done){
    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
    const file = path.join(SHOTS, hash + ".png");
    if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
    return { ...meta, hash, path: site(file), skip: opt.resume && done.has(asked(hash)) };
}

/* What is already done is an ASK, not an image. Keyed on the png hash alone,
 * re-running the same shots under a new prompt or a new model skipped every one
 * of them and produced an empty run that looked like a success. */
function asked(hash, prompt = opt.prompt, model = opt.model){ return hash + "|" + prompt + "|" + model; }   // hoisted: seen() runs before this line is reached

function seen(){
    if (!fs.existsSync(LOG)) return new Set();
    return new Set(fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean)
        .map(l => { try { const r = JSON.parse(l).shot; return asked(r.hash, r.prompt_id, r.model); } catch { return null; } }));
}

// The page's own two levels, so a whole-page shot can answer the css prompt too.
function sketch(){
    const name = el => el.tagName.toLowerCase() + [...el.classList].slice(0, 3).map(c => "." + c).join("");
    const kids = el => [...el.children].filter(c => c.getBoundingClientRect().width > 0);
    const NL = String.fromCharCode(10);
    return kids(document.body).slice(0, 6).map(a =>
        name(a) + kids(a).slice(0, 8).map(b => NL + "  " + name(b)).join("")).join(NL);
}

/* Runs INSIDE the page — self-contained, no closure over anything out here. */
async function pick({ max }){
    const { probe } = await import("/framework/ext/DesignTool/probe.js");
    const { nodes, viewport } = probe(document.documentElement);
    const kids = nodes.map(() => []);
    nodes.forEach(n => { if (n.parent >= 0) kids[n.parent].push(n.i); });

    /* ⚠ The size gates are the whole picker. Without the AREA cap the biggest
     * non-nested box wins and swallows every card under it; without the HEIGHT
     * cap a `.page` whose scroll height is 4423px is shot in full — one image
     * six times the price of the page it came from. Framed first: a box that
     * paints a surface is a component, a bare flex wrapper usually isn't. */
    const area = viewport.w * viewport.h;
    const worth = n => n.path && n.w >= 120 && n.h >= 80
        && n.h <= viewport.h * 1.2 && n.w * n.h <= area * 0.35
        && (n.framed || n.display === "flex" || n.display === "grid")
        && n.y + n.h > 0 && n.y < viewport.h;

    const chosen = [], sels = {};
    for (const n of nodes.filter(worth).sort((a, b) => (b.framed - a.framed) || (b.w * b.h - a.w * a.h))){
        if (chosen.length >= max) break;
        if ((sels[n.sel] = (sels[n.sel] ?? 0) + 1) > 2) continue;      // five identical cards teach nothing
        if (chosen.some(c => under(n, c) || under(c, n))) continue;    // no nested regions
        chosen.push(n);
    }
    return chosen.map(n => ({
        sel: n.sel, path: n.path, box: { x: n.x, y: n.y, w: n.w, h: n.h },
        outline: n.sel + "\n" + kids[n.i].slice(0, 8).map(c =>
            "  " + nodes[c].sel + kids[c].slice(0, 6).map(g => "\n    " + nodes[g].sel).join("")).join("\n"),
    }));

    function under(a, b){ for (let i = a.parent; i >= 0; i = nodes[i].parent) if (nodes[i] === b) return true; return false; }
}

/* One headless turn. Fresh session per image — resuming one session across images
 * cost 3.5× on cache reads for strictly worse independence (2026-08-14). */
/* What the picture cannot say about itself. A heading hard against the top edge of a
 * crop reads as "scrolled to here" — ~12 reads of the day page all let a zero-space
 * h1 through because nothing told them the crop started at scroll 0. Context, never
 * judgement: it says where the image came from and stops. Out of SYSTEM on purpose —
 * SYSTEM is the cache key and this line changes every shot. */
function context(shot){
    const at = `URL: ${shot.url} · viewport: ${shot.width}`;
    return shot.region
        ? `${at} · REGION ${shot.region.sel} at ${Math.round(shot.region.box.x)},${Math.round(shot.region.box.y)} ${Math.round(shot.region.box.w)}×${Math.round(shot.region.box.h)} of that page`
        : `${at}×${vh(shot.width)} · this is the TOP of the page, scroll 0 (unscrolled)`;
}

function ask({ file, prompt, resume, head }){
    const args = ["-p", "--model", opt.model, "--output-format", "json", "--allowedTools", "Read",
        "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', "--setting-sources", "",
        "--exclude-dynamic-system-prompt-sections", "--system-prompt", SYSTEM,
        ...(resume ? ["--resume", resume] : ["--session-id", randomUUID()])];

    const child = spawn(process.env.CLAUDE_BIN || "claude", args, { windowsHide: true });
    child.stdin.end(file ? `Read the screenshot at ${file}, then:\n\n${head}\n\n${prompt}` : prompt);

    let out = "", err = "";
    child.stdout.on("data", d => out += d);
    child.stderr.on("data", d => err += d);
    return new Promise(resolve => {
        child.on("error", e => resolve({ error: "spawn failed: " + e.message }));
        child.on("close", code => {
            try { resolve(JSON.parse(out)); }
            catch { resolve({ error: err.trim().slice(-300) || `claude exited ${code}: ${out.slice(0, 200)}` }); }
        });
    });
}

function line(shot, res, prompt_id){
    const u = res.usage ?? {};
    return {
        at: new Date().toISOString(), path: shot.path, hash: shot.hash, url: shot.url, width: shot.width,
        region: shot.region, page_shot: shot.page_shot, outline: shot.outline ?? null, prompt_id, model: opt.model,
        session_id: res.session_id ?? null,
        tokens: { input: u.input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0,
            cache_read: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0 },
        cost_usd: res.total_cost_usd ?? 0, duration_ms: res.duration_ms ?? 0,
        ...split(res.result ?? ""),
    };
}

/* Prose first, then one fenced JSON block. Anything else is prose and no findings.
 * The block is an array of findings (turn 1) or `{fixes, skill_notes}` (turn 2). */
function split(text){
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    let found = null;
    if (m) try { found = JSON.parse(m[1]); } catch { found = null; }
    const arr = Array.isArray(found) ? found : Array.isArray(found?.fixes) ? found.fixes : [];
    return {
        prose: (m ? text.slice(0, m.index) : text).trim(),
        skill_notes: Array.isArray(found?.skill_notes) ? found.skill_notes : [],
        findings: arr.map(f => ({
            class: f.class === "broken" ? "broken" : "maybe", what: f.what ?? "", where: f.where ?? "",
            ...aim(f.fix), sel: f.sel || null, decl: f.decl || null,
            why: f.why || null, ladder_rung: f.ladder_rung || null,
            retracted: !!f.retract || !!f.retracted,
        })),
    };
}

/* v4's `fix` is a direction + a property + an amount — words a model can say from a
 * picture, translated to CSS next turn. `fix` itself stays the STRING: browse.js prints
 * it as text, and an object there renders one stacked line per key. The three parts ride
 * beside it. A v1–v3 run's plain-string `fix` lands unchanged. */
function aim(fix){
    if (!fix || typeof fix === "string") return { fix: fix || null, direction: null, property: null, amount: null };
    const { direction = null, property = null, amount = null } = fix;
    return { direction, property, amount,
        fix: fix.text || [direction, property, amount].filter(Boolean).join(" ") || null };
}

/* Turn 2: resume THIS image's session with the css prompt + the region's DOM outline. */
async function second(rec, shot){
    // ⚠ A function replacer, never a string — a `$&` in a DOM outline would splice itself in.
    const fill = { url: rec.url, width: String(rec.width), sel: rec.region?.sel ?? "the whole page",
        outline: shot.outline ?? "(whole page — no outline captured)", module: sheets(rec.url) };
    const filled = read(opt.turn2).replace(/\{\{(\w+)\}\}/g, (m, k) => fill[k] ?? m);

    const res = await ask({ prompt: filled, resume: rec.session_id });
    if (res.error) return;

    /* ⚠ Match on a NORMALISED prefix, never on `what` verbatim. Told to repeat the
     * finding word for word, the model paraphrases anyway — exact matching landed
     * 1 fix out of 8 and lost the rest silently. Same count in the same order is
     * the honest fallback. */
    const turn = split(res.result ?? ""), fixes = turn.findings;
    const key = t => t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    fixes.forEach((fix, i) => {
        const hit = rec.findings.find(f => key(f.what) === key(fix.what))
            ?? (fixes.length === rec.findings.length ? rec.findings[i] : null);
        if (!hit) return;
        hit.why = fix.why;
        /* A retract is an ANSWER — the one place the code corrects the eye. Counted, not
         * dropped; browse.js already dims a retracted finding. */
        if (fix.retracted){ hit.retracted = true; return; }
        hit.sel = fix.sel; hit.decl = fix.decl; hit.ladder_rung = fix.ladder_rung;
    });
    improve(turn.skill_notes, rec.hash);
    const u = res.usage ?? {};
    rec.turn2 = { prompt_id: opt.turn2, cost_usd: res.total_cost_usd ?? 0, duration_ms: res.duration_ms ?? 0,
        answered: fixes.length, retracted: rec.findings.filter(f => f.retracted).length,
        declared: rec.findings.filter(f => f.decl).length,
        tokens: { input: u.input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0,
            cache_read: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0 } };
}

// The page's own stylesheets, so turn 2 can read the rung it is proposing to write on.
function sheets(url){
    const dir = path.join(PUBLIC, url.replace(/^\/+|\/+$/g, "").split("/").join(path.sep));
    let files = [];
    try { files = fs.readdirSync(dir).filter(f => f.endsWith(".css")); } catch {}
    return files.map(f => `\n  \`public${site(path.join(dir, f))}\` (this page's own stylesheet),`).join("");
}

/* Turn 2 may report what in the css/layout skills misled it. Append one line, in the
 * skill's own format, and never the same note twice — three passes × six pages would
 * otherwise write the same complaint eighteen times. */
function improve(notes, hash){
    const day = new Date().toISOString().slice(0, 10);
    for (const n of notes ?? []){
        const skill = ["css", "layout"].includes(n?.skill) ? n.skill : null;
        const note = String(n?.note ?? "").replace(/\s+/g, " ").trim();
        if (!skill || note.length < 20) continue;
        const file = path.resolve(".claude/skills", skill, "improvements.md");
        if (!fs.existsSync(file)) continue;
        if (fs.readFileSync(file, "utf8").includes(note.slice(0, 50))) continue;
        fs.appendFileSync(file, `\n${day} · ${note} · (vision, ${hash})`);
    }
}

async function pool(items, n, fn){
    const it = items[Symbol.iterator]();
    await Promise.all(Array.from({ length: n }, async () => { for (const item of it) await fn(item); }));
}
