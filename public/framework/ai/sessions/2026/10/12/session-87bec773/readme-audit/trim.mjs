// Verbatim readme trims: node trim.mjs [--apply]. Moved lines are copied byte-for-byte into doc/*.md; a pointer replaces them.
import fs from 'fs'; import path from 'path';
const apply = process.argv.includes('--apply'), F = 'public/framework/', S = 'Servex/';
const plan1 = [
 [F+'core/new/1', [[13,'END','readme-full-2026-10-12.md','the full design record']]],
 [F+'ux/Dictate', [[13,'END','readme-full-2026-10-12.md','usage, design and mechanics in full']]],
 [S+'agents', [[20,87,'api.md','the API'],[100,227,'architecture.md','the architecture']]],
 [S+'ext/openrouter', [[9,39,'snapshot.md','the model snapshot'],[48,140,'operations.md','operations']]],
 [F+'core/Page/generator', [[25,115,'spec-language.md','the spec language'],[217,262,'traps.md','traps']]],
 [F+'ai/v/3', [[4,66,'views.md','the views'],[77,189,'traps.md','traps']]],
 [F+'ext/AITask', [[4,72,'api.md','the API']]],
 [F+'ui', [[56,71,'readme-full-2026-10-12.md','detail'],[35,43,'readme-full-2026-10-12.md','detail']]],
 [F+'ext/files', [[28,91,'readme-full-2026-10-12.md','detail']]],
 [S+'asks', [[8,46,'asks-operations.md','how asks run']]],
 [F+'ai', [[5,13,'readme-full-2026-10-12.md','the page tabs, in full']]],
];
const plan2 = [
 [S+'ext/openrouter', [[20,96,'tests.md','rule tests and the test library'],[138,174,'probe-tasks.md','probe tasks']]],
 [F+'core/Page/generator', [[36,88,'export-and-code-tab.md','export and the code tab'],[89,128,'cut-words.md','the four cut words']]],
 [F+'ext/DesignTool/diff', [[53,102,'options-and-selftest.md','options, masking, measures, self-test']]],
 [F+'ux/Dictate/playground', [[8,56,'what.md','what the playground is']]],
 [F+'ai', [[64,103,'watch-out-2026-10-12.md','the watch-out list']]],
];
const plan = process.argv.includes('--plan2') ? plan2 : plan1;
for (const [dir, moves] of plan) {
  const rf = path.join(dir,'readme.md'); let lines = fs.readFileSync(rf,'utf8').split('\n');
  const total = lines.length; const dd = path.join(dir,'doc');
  for (const [a,bb,doc,what] of moves.sort((x,y)=>y[0]-x[0])) {
    const b = bb==='END' ? (lines[lines.length-1]===''?lines.length-1:lines.length) : bb;
    const seg = lines.slice(a-1,b); const fences = seg.filter(l=>/^\s*```/.test(l)).length;
    console.log(`${rf} ${a}-${b} -> doc/${doc} (${seg.length} lines, fences ${fences%2?'ODD!':'ok'})`);
    if (fences%2) continue;
    if (!apply) continue;
    fs.mkdirSync(dd,{recursive:true}); const tp = path.join(dd,doc);
    const head = `\n<!-- moved verbatim from readme.md lines ${a}-${b}, 2026-10-12 readme audit -->\n`;
    const body = (fs.existsSync(tp)? fs.readFileSync(tp,'utf8').replace(/\n*$/,'\n') : `# ${path.basename(dir)} — ${what} (moved from the readme)\n`) + head + seg.join('\n') + '\n';
    fs.writeFileSync(tp, body);
    lines.splice(a-1, b-a+1, `- Moved verbatim to [doc/${doc}](./doc/${doc}): ${what}.`);
  }
  if (apply) fs.writeFileSync(rf, lines.join('\n'));
}
