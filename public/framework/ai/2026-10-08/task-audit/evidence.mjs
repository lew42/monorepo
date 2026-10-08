// For each open (no landed_at) task: gather cheap evidence (brief preview, files, git commits) and write batches of 8.
import fs from "fs"; import path from "path"; import { execSync } from "child_process";
const S = process.argv[2], root = path.resolve(import.meta.dirname, "../..");
const open = JSON.parse(fs.readFileSync(S + "/open.json", "utf8")).filter(x => x.cls !== "chat");
const sh = c => { try { return execSync(c, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() } catch { return "" } };
const items = open.map((x, i) => {
  const dir = path.join(root, x.dir);
  let files = []; try { files = fs.readdirSync(dir) } catch {}
  let brief = ""; for (const n of ["requirements.md", "brief.md", "report.md"]) { try { brief = fs.readFileSync(path.join(dir, n), "utf8").replace(/\s+/g, " ").slice(0, 380); break } catch {} }
  const gl = sh(`git log --format=%cs -- "${x.dir}"`).split("\n").filter(Boolean);
  return { id: i + 1, dir: x.dir, title: x.title, started: (x.started || "").slice(0, 10), now: String(x.now || "").slice(0, 80), last: String(x.last).slice(0, 140), files: files.filter(f => f !== "task.jsonl").slice(0, 8).join(","), commits: gl.length, lastCommit: gl[0] || "", brief, cls: x.cls };
});
fs.writeFileSync(S + "/items.json", JSON.stringify(items));
const per = 10, batches = [];
for (let i = 0; i < items.length; i += per) batches.push(items.slice(i, i + per));
batches.forEach((b, n) => fs.writeFileSync(`${S}/batch${String(n + 1).padStart(2, "0")}.txt`, b.map(x => `#${x.id} ${x.title} [${x.dir}] started ${x.started}; state "${x.now}"; last log: ${x.last}; files: ${x.files || "none"}; git commits touching dir: ${x.commits} (last ${x.lastCommit || "never"}); brief: ${x.brief || "(none)"}`).join("\n")));
console.log(items.length, "items,", batches.length, "batches");
