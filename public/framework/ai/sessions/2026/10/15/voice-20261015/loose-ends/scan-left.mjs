// Read-only: last 14 days. Counts how landed tasks say "left / needs the owner" and whether
// any owner_note / Note: card line exists for them. Usage: node scan-left.mjs
import fs from "node:fs";
import { execSync } from "node:child_process";

const since = Date.now() - 14 * 864e5;
const tracked = (glob) => execSync(`git ls-files -- ${glob}`, { encoding: "utf8" }).split("\n").filter(Boolean)
  .filter(f => fs.existsSync(f) && fs.statSync(f).mtimeMs >= since);

// Narrow: a line that says the owner must act, or a "left" heading in a landing outcome.
const WAIT = /(partially done|need[s]? [^.\n]{0,60}from (the )?owner|waiting on (the )?owner|awaits? (the )?owner|blocked on (the )?owner|\bBLOCKED\b)/i;
const LEFT = /(\*\*left|^left:|left deliberately|left open|left for)/im;

const tasks = tracked("public/framework/ai").filter(f => f.endsWith("task.jsonl"));
let landed = 0, wait_hits = 0, left_hits = 0, both_zero_card = 0;
const samples = [];
for (const f of tasks) {
  let did = false, outcome = "", wait = null;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    let o; try { o = JSON.parse(line); } catch { continue; }
    if (o.assign?.landed_at) did = true;
    if (typeof o.assign?.outcome === "string") outcome = o.assign.outcome;
    const text = JSON.stringify(o);
    if (!wait && WAIT.test(text)) wait = text.match(WAIT)[0];
  }
  if (did) landed++;
  const w = wait ?? null, l = LEFT.test(outcome);
  if (w) wait_hits++;
  if (l) left_hits++;
  if ((w || l) && did) { both_zero_card++; if (samples.length < 12) samples.push(`${f} :: ${w ? "wait:" + w : ""}${l ? " left-heading" : ""}`); }
}

// Where did any of it reach the owner? Cards with an owner_note line, and Decision/Question placements.
const pages = tracked("public/framework/ai").concat(tracked("Servex/cards")).filter(f => f.endsWith("page.jsonl"));
let note_cards = 0, placed_asks = 0;
for (const f of pages) {
  const t = fs.readFileSync(f, "utf8");
  if (/"owner_note"/.test(t)) note_cards++;
  if (/"place"\s*:/.test(t)) placed_asks++;
}

console.log(JSON.stringify({ task_files_14d: tasks.length, landed_14d: landed,
  task_with_owner_wait_phrase: wait_hits, task_with_left_heading: left_hits,
  landed_with_wait_or_left: both_zero_card,
  page_files_14d: pages.length, pages_with_owner_note_line: note_cards, pages_with_place_line: placed_asks }, null, 1));
for (const s of samples) console.log(s.slice(0, 220));
