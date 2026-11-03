// Census of public/framework/ai: every entry, and one level down.
// Prints JSON. Usage: node census.mjs > census.json
import { readdirSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The repo root is the git toplevel of this script's own folder (works in any worktree).
const here = dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: here, encoding: "utf8", windowsHide: true }).trim();
const AI = "public/framework/ai";
const aiAbs = join(REPO, AI);

const git = (args) => {
  try {
    return execFileSync("git", args, { cwd: REPO, encoding: "utf8", windowsHide: true, maxBuffer: 64e6 });
  } catch (e) {
    return "";
  }
};

// Walk a path, summing size and counting files. Skips dated session folders.
function walk(abs, acc = { size: 0, files: 0 }) {
  let st;
  try { st = statSync(abs); } catch { return acc; }
  if (st.isFile()) { acc.size += st.size; acc.files += 1; return acc; }
  for (const name of readdirSync(abs)) walk(join(abs, name), acc);
  return acc;
}

const isDateDir = (name) => /^\d{4}(-\d{2}-\d{2})?$/.test(name) || /^\d{2}$/.test(name);

function readers(name, rel) {
  // Grep for the bare name in code. Exclude sessions/ store and dated folders.
  const out = git([
    "grep", "-l", "-F", name, "--", "*.js", "*.mjs",
    ":!public/framework/ai/sessions/",
    ":!public/framework/ai/2026/",
    ":!public/framework/ai/2026-10-13/",
  ]);
  return out.split("\n").filter(Boolean).filter((p) => p !== rel).slice(0, 5);
}

function newest(rel) {
  return git(["log", "-1", "--format=%cs", "--", rel]).trim() || null;
}

function row(name, rel, abs) {
  const isDir = statSync(abs).isDirectory();
  const w = isDir ? walk(abs) : { size: statSync(abs).size, files: 1 };
  return {
    name,
    path: rel,
    kind: isDir ? "folder" : "file",
    size: w.size,
    files: w.files,
    newest: newest(rel),
    code_refs: readers(name, rel),
  };
}

const rows = [];
let dated = { folders: 0, files: 0, under: [] };

for (const name of readdirSync(aiAbs).sort()) {
  const abs = join(aiAbs, name);
  const rel = `${AI}/${name}`;
  const isDir = statSync(abs).isDirectory();
  if (isDir && (name === "2026" || name === "2026-10-13")) {
    // Old date-pattern trees: count, do not list their children.
    const w = walk(abs);
    dated.under.push({ path: rel, files: w.files, size: w.size });
    dated.folders += 1;
    dated.files += w.files;
    continue;
  }
  rows.push(row(name, rel, abs));
  if (isDir && name !== "sessions") {
    for (const child of readdirSync(abs).sort()) {
      if (isDateDir(child)) continue;
      const cabs = join(abs, child);
      rows.push(row(child, `${rel}/${child}`, cabs));
    }
  } else if (isDir && name === "sessions") {
    // sessions/ is the store; list its top level only (YYYY dirs and index files).
    for (const child of readdirSync(abs).sort()) {
      rows.push(row(child, `${rel}/${child}`, join(abs, child)));
    }
  }
}

const sessionsDir = join(aiAbs, "sessions");
const sessionCount = existsSync(sessionsDir)
  ? walk(sessionsDir).files
  : 0;

process.stdout.write(JSON.stringify({ count: rows.length, dated_old_trees: dated, sessions_files: sessionCount, entries: rows }, null, 1) + "\n");
