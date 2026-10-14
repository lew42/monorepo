#!/usr/bin/env node
// servex-proof.mjs — the one-tree resolver on a PRIVATE Servex (ports 8490/8489/8488, throwaway LOCALAPPDATA), booted from a
// checkout that has the move applied: create a card, open it, reply to it, and do the same for a card folder left in the OLD
// tree (what a Servex not yet restarted writes). Cleans up what it made.   node servex-proof.mjs --repo <checkout>
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2), REPO = path.resolve(argv[argv.indexOf("--repo") + 1] ?? ".");
const AI = path.join(REPO, "public/framework/ai");
const local = fs.mkdtempSync(path.join(os.tmpdir(), "one-tree-proof-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "one-tree proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8490", SERVEX_PROXY_PORT: "8489", SERVEX_PROXY_INTERNAL: "8488", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8487", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_HEARTBEAT: "1" };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT"]) delete env[k];

// a card folder only the OLD tree has
const OLD = "2025/12/31/old-tree-proof", oldDir = path.join(AI, ...OLD.split("/"));
fs.mkdirSync(oldDir, { recursive: true });
fs.writeFileSync(path.join(oldDir, "page.jsonl"), JSON.stringify({ class: "/framework/ai/cards/card.js", title: "Old tree proof", type: "card", id: OLD, created: new Date().toISOString(), by: "proof" }) + "\n");
const MOVED = "2026/10/13/ai-modules-home-decided-4-things-for-you";

const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", fs.openSync(path.join(local, "out.log"), "w"), fs.openSync(path.join(local, "out.log"), "a")], windowsHide: true });
const base = "http://127.0.0.1:8490", sleep = ms => new Promise(r => setTimeout(r, ms));
const get = async u => (await fetch(base + u)).json();
const post = async (u, b) => (await fetch(base + u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json();
const mcp = async (name, args) => JSON.parse(await (await fetch(base + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) })).text());
let failed = 0, made = null;
const check = (name, ok, detail) => { console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok ? "" : "  — " + JSON.stringify(detail).slice(0, 300)}`); if (!ok) failed++; };
try {
	let up = false;
	for (let i = 0; i < 80 && !up; i++){ try { up = Array.isArray(await get("/api/agents")); } catch {} if (!up) await sleep(500); }
	check("private Servex up on 8490", up);

	// 1. create: lands in the store
	made = await post("/card/create", { title: "one tree proof", by: "proof" });
	const [y, m, d, ...rest] = (made.id ?? "").split("/");
	const storeFile = path.join(AI, "sessions", y, m, d, "cards", ...rest, "page.jsonl");
	check("create writes the new card into ai/sessions/<day>/cards/", made.ok && fs.existsSync(storeFile) && !fs.existsSync(path.join(AI, ...made.id.split("/"), "page.jsonl")), made);
	check("create answers the card's page url, unchanged", made.url === `/framework/ai/${made.id}/`, made.url);
	// 2. open + reply on the new card, a moved card and an old-tree card
	for (const [label, id] of [["new", made.id], ["moved", MOVED], ["old-tree", OLD]]){
		const card = await get("/card?id=" + encodeURIComponent(id));
		check(`open ${label} card (${id})`, card?.id === id || card?.title, card);
	}
	const r1 = await post("/card/append?id=" + encodeURIComponent(made.id), { message: { by: "proof", text: "reply on the new card", at: new Date().toISOString() } });
	check("reply on the new card appends in the store", r1.ok !== false && fs.readFileSync(storeFile, "utf8").includes("reply on the new card"), r1);
	const r2 = await post("/card/append?id=" + encodeURIComponent(OLD), { message: { by: "proof", text: "reply on the old-tree card", at: new Date().toISOString() } });
	check("reply on an old-tree card appends in place (no copy in the store)", r2.ok !== false && fs.readFileSync(path.join(oldDir, "page.jsonl"), "utf8").includes("reply on the old-tree card") && !fs.existsSync(path.join(AI, "sessions/2025/12/31/cards/old-tree-proof")), r2);
	const all = await get("/cards?view=all");
	check("the card list has the new, the moved and the old-tree card", [made.id, MOVED, OLD].every(id => all.some(c => c.id === id)), all.length);
	// 3. the page tools resolve a card page to its folder (Layers)
	const read = await mcp("page_read", { path: `/framework/ai/${MOVED}/` });
	const text = JSON.stringify(read);
	check("page_read on a moved card's page reads its folder", /ai-modules-home|owner_note|decided/.test(text) && !/no such|ENOENT|not found/i.test(text), text.slice(0, 300));
} catch (e){ failed++; console.log("FAIL ", e.message); }
finally {
	child.kill();
	await sleep(500);
	// clean up what the proof made: its two cards, and the index lines it appended (tracked files go back to HEAD)
	if (made?.id) fs.rmSync(path.join(AI, ...("sessions/" + made.id.split("/").slice(0, 3).join("/") + "/cards/" + made.id.split("/").slice(3).join("/")).split("/")), { recursive: true, force: true });
	fs.rmSync(path.join(AI, "2025"), { recursive: true, force: true });
	try { execFileSync("git", ["checkout", "--", "public/framework/ai/cards.jsonl", "public/framework/ai/sessions"], { cwd: REPO, windowsHide: true }); } catch {}
	if (failed) console.log(fs.readFileSync(path.join(local, "out.log"), "utf8").slice(-1500));
	console.log(failed ? `\n${failed} FAILED` : "\nall passed");
	process.exit(failed ? 1 : 0);
}
