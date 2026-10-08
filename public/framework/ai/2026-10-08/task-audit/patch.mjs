import fs from "fs"; let s = fs.readFileSync("build.mjs", "utf8");
s = s.replace("const rows = [];", 'const rows = [];\nimport { execSync } from "child_process";\nconst subj = d => { try { return execSync(`git log -3 --format=%s -- "${d}"`, { cwd: ai, encoding: "utf8" }).trim() } catch { return "" } };');
s = s.replace("const scratch = j.scratch ||", 'const runArtefact = /\/runs\/|-17\d{11}$/.test(x.dir);\n  const gl = j.v === "delivered" || runArtefact ? "" : subj(x.dir); const gitLanded = /landed/i.test(gl);\n  const scratch = runArtefact || j.scratch ||');
s = s.replace('const state = scratch ? "scratch" :', 'const state = scratch ? "scratch" : gitLanded ? "done-unverified" :');
s = s.replace("evidence: j.ev,", 'evidence: j.ev + (runArtefact ? " [harness run output, not a task]" : "") + (gitLanded ? " [git subject says landed: " + gl.split("\n").find(l => /landed/i.test(l)).slice(0, 70) + "]" : ""),');
fs.writeFileSync("build.mjs", s);
