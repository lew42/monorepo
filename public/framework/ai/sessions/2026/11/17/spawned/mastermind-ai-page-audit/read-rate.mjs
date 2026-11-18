import fs from 'fs'; import path from 'path'; import os from 'os';
const repo = 'C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/11';
const tdir = path.join(os.homedir(), '.claude/projects/C--Code-lew42-monorepo');
function walk(d, out=[]) { for (const e of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else if (e.name === 'session.jsonl') out.push(p); } return out; }
const rows = [];
for (const day of ['16','17']) for (const f of walk(path.join(repo, day))) {
  const first = fs.readFileSync(f, 'utf8').split('\n', 1)[0];
  let a; try { a = JSON.parse(first).assign; } catch { continue; }
  if (!a?.session_id || !a.agent) continue;
  const t = path.join(tdir, a.session_id + '.jsonl');
  if (!fs.existsSync(t)) { rows.push({agent:a.agent, day, note:'no transcript'}); continue; }
  const lines = fs.readFileSync(t, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  let firstUser = '', pathLoaded = null, i = 0, firstFigma = -1, rulesAt = -1, aiPageAt = -1, rulesInPrompt = 'no', nFigma = 0, readmeAt = -1;
  for (const l of lines) {
    const c = l.message?.content;
    if (l.type === 'user' && !firstUser) { firstUser = typeof c === 'string' ? c : (Array.isArray(c) ? c.map(x => x.text || '').join('\n') : ''); }
    if (l.type === 'assistant' && Array.isArray(c)) for (const b of c) {
      if (b.type !== 'tool_use') continue; i++;
      const inp = JSON.stringify(b.input || {});
      const figma = /^mcp__figma__(use_figma|get_screenshot|get_metadata|get_design_context)$/.test(b.name);
      if (figma) { nFigma++; if (firstFigma < 0) firstFigma = i; }
      const norm = inp.replace(/\\\\/g, '/');
      if (rulesAt < 0 && /rules\.md|build-checklist\.md/.test(norm) && !/framework\/doc\/rules\.md|css\/doc\/rules|ai\/skills/.test(norm) && !figma) rulesAt = i;
      if (aiPageAt < 0 && figma && /60:360|231:503|60:388|60:361|242:12045/.test(inp)) aiPageAt = i;
      if (readmeAt < 0 && /ext[\/\\]+Figma[\/\\]+readme\.md/.test(inp)) readmeAt = i;
    }
  }
  if (nFigma === 0) continue; // not a Figma agent
  pathLoaded = /Loaded: public\/framework\/ext\/Figma\/readme\.md/.test(firstUser) || /<path-readmes path="public\/framework\/ext\/Figma/.test(firstUser) ? 'yes' : (/ext\/Figma/.test(firstUser) && /WARNING: Servex could NOT load/.test(firstUser) ? 'partial' : 'no');
  const brief = firstUser.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
  rulesInPrompt = /Figma\/doc\/rules\.md|build-checklist|\brules\.md \(|read (doc\/)?rules\.md/i.test(brief) ? 'named' : 'no';
  const before = (x) => x > 0 && x <= firstFigma;
  rows.push({ agent: a.agent, day, model: a.model, path: pathLoaded, promptNamesRules: rulesInPrompt, firstFigma, rulesAt, aiPageAt, readmeAt, rulesBefore: before(rulesAt), aiBefore: before(aiPageAt), nFigma, started: a.requested_at?.slice(0,16) });
}
rows.sort((x,y) => (x.started||'').localeCompare(y.started||''));
console.log(JSON.stringify(rows));
