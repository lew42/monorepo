// Plans (and, with --apply, moves; with --undo, reverses) the old ai/2026/MM/DD/<name>/ session folders
// into the sessions store ai/sessions/2026/MM/DD/<name>/. Default run is a DRY RUN: it only writes move-manifest.jsonl.
// Usage:
//   node move-old-sessions.mjs            plan only, writes move-manifest.jsonl (no moves)
//   node move-old-sessions.mjs --apply   git mv every manifest line (skips live and conflict lines)
//   node move-old-sessions.mjs --undo    git mv each applied line back, from the manifest
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: here, encoding: "utf8", windowsHide: true }).trim();
const MANIFEST = path.join(here, "move-manifest.jsonl");
const OLD = path.join(REPO, "public", "framework", "ai", "2026");
const TODAY = "10/20"; // folders still written today are skipped (the prompt hook writes there)

// Server/TaskDirs.mjs and Server/SessionRecord.mjs are read-only here: we call them, we do not edit them.
const { default: TaskDirs } = await import(pathToFileURL(path.join(REPO, "Server", "TaskDirs.mjs")).href);
const { default: SessionRecord } = await import(pathToFileURL(path.join(REPO, "Server", "SessionRecord.mjs")).href);

const rel = (p) => path.relative(REPO, p).split(path.sep).join("/");

function allFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) allFiles(f, base, out); else out.push(rel(f));
  }
  return out;
}

// One line per old session folder: ai/2026/MM/DD/<name>/
function oldFolders() {
  const out = [];
  if (!fs.existsSync(OLD)) return out;
  for (const mm of fs.readdirSync(OLD).sort()) {
    if (!/^\d\d$/.test(mm)) continue; // skips the loose files.jsonl at the top of 2026/
    for (const dd of fs.readdirSync(path.join(OLD, mm)).sort()) {
      const dayDir = path.join(OLD, mm, dd);
      if (!/^\d\d$/.test(dd) || !fs.statSync(dayDir).isDirectory()) continue;
      for (const name of fs.readdirSync(dayDir).sort()) {
        const f = path.join(dayDir, name);
        if (fs.statSync(f).isDirectory()) out.push({ mm, dd, name, from: f });
      }
    }
  }
  return out;
}

function plan() {
  const lines = [];
  for (const o of oldFolders()) {
    const day = `2026-${o.mm}-${o.dd}`;
    const to = path.join(TaskDirs.day_dir(day), o.name); // sessions/2026/MM/DD/<name>
    const line = {
      from: rel(o.from),
      to: rel(to),
      files: allFiles(o.from).length,
      record: SessionRecord.file(o.from) ? path.basename(SessionRecord.file(o.from)) : null,
    };
    if (`${o.mm}/${o.dd}` === TODAY) line.skip = "live";
    else if (fs.existsSync(to)) line.conflict = "target exists";
    lines.push(line);
  }
  return lines;
}

const mode = process.argv[2] || "";
const manifest = fs.existsSync(MANIFEST)
  ? fs.readFileSync(MANIFEST, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];

if (mode === "--apply") {
  const lines = manifest.length ? manifest : plan();
  let done = 0;
  for (const l of lines) {
    if (l.skip || l.conflict) continue;
    const to = path.join(REPO, l.to);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    execFileSync("git", ["-C", REPO, "mv", l.from, l.to], { windowsHide: true });
    l.applied = true;
    done++;
  }
  fs.writeFileSync(MANIFEST, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  console.log(`applied ${done} folders`);
} else if (mode === "--undo") {
  let done = 0;
  for (const l of manifest.slice().reverse()) {
    if (!l.applied) continue;
    execFileSync("git", ["-C", REPO, "mv", l.to, l.from], { windowsHide: true });
    done++;
  }
  console.log(`undid ${done} folders`);
} else {
  const lines = plan();
  fs.writeFileSync(MANIFEST, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  const live = lines.filter((l) => l.skip).length;
  const conflicts = lines.filter((l) => l.conflict).length;
  console.log(JSON.stringify({ folders: lines.length, live, conflicts, to_move: lines.length - live - conflicts }));
}
