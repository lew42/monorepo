// Counts real Skill invocations from Claude Code transcripts (Skill tool_use + typed /slash commands).
// Usage: node skill-calls.mjs [--out skill-calls.json]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import readline from 'node:readline';
const root = path.join(os.homedir(), '.claude', 'projects');
const dirs = fs.readdirSync(root).filter(d => d.toLowerCase().startsWith('c--code-lew42')).map(d => path.join(root, d));
const files = [];
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'tool-results') walk(p); } else if (e.name.endsWith('.jsonl')) files.push(p); } };
dirs.forEach(walk);
const skills = new Set(fs.readdirSync('.claude/skills'));
const S = {}; // name -> {tool, slash, sub, sessions:Set, first, last}
const rec = (name, kind, at, sid, sub) => {
  const k = name.replace(/^\//, '');
  const r = S[k] ??= { tool: 0, slash: 0, inSubagent: 0, sessions: new Set(), first: null, last: null };
  r[kind]++; if (sub) r.inSubagent++; r.sessions.add(sid);
  if (at) { if (!r.first || at < r.first) r.first = at; if (!r.last || at > r.last) r.last = at; }
};
let lines = 0, bytes = 0, dupes = 0; const seen = new Set(); // a resumed or forked transcript repeats earlier lines: count each tool_use id / message uuid once
for (const f of files) {
  bytes += fs.statSync(f).size;
  const sub = f.includes(`${path.sep}subagents${path.sep}`);
  const sid = path.basename(sub ? path.dirname(path.dirname(f)) : f, '.jsonl');
  const rl = readline.createInterface({ input: fs.createReadStream(f), crlfDelay: Infinity });
  for await (const line of rl) {
    lines++;
    const hasTool = line.includes('"name":"Skill"') && line.includes('"tool_use"');
    const hasSlash = line.includes('<command-name>');
    if (!hasTool && !hasSlash) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    const c = j.message?.content; const at = j.timestamp;
    if (j.type === 'assistant' && Array.isArray(c)) for (const b of c) { if (b.type !== 'tool_use' || b.name !== 'Skill') continue; if (seen.has(b.id)) { dupes++; continue; } seen.add(b.id); rec(String(b.input?.skill ?? b.input?.command ?? '?'), 'tool', at, sid, sub); }
    if (j.type === 'user' && hasSlash) { if (j.uuid && seen.has(j.uuid)) { dupes++; continue; } if (j.uuid) seen.add(j.uuid); const s = typeof c === 'string' ? c : Array.isArray(c) ? c.map(b => b.text ?? '').join('') : ''; for (const m of s.matchAll(/<command-name>\/?([^<]+)<\/command-name>/g)) rec(m[1].trim(), 'slash', at, sid, sub); }
  }
}
const out = Object.entries(S).map(([name, r]) => ({ name, repoSkill: skills.has(name), tool: r.tool, slash: r.slash, inSubagent: r.inSubagent, sessions: r.sessions.size, first: r.first?.slice(0, 10), last: r.last?.slice(0, 10) })).sort((a, b) => (b.tool + b.slash) - (a.tool + a.slash));
for (const s of skills) if (!S[s]) out.push({ name: s, repoSkill: true, tool: 0, slash: 0, inSubagent: 0, sessions: 0, first: null, last: null });
const res = { at: new Date().toISOString(), dupes, files: files.length, gb: +(bytes / 1e9).toFixed(2), lines, skills: out };
const o = process.argv.indexOf('--out'); if (o > 0) fs.writeFileSync(process.argv[o + 1], JSON.stringify(res, null, 1));
console.log(`dupes skipped ${dupes}; files ${res.files}, ${res.gb} GB, ${lines} lines`);
for (const r of out) console.log([r.name.padEnd(28), r.repoSkill ? 'repo' : '    ', String(r.tool).padStart(5), String(r.slash).padStart(5), String(r.sessions).padStart(5), r.first, r.last].join(' '));
