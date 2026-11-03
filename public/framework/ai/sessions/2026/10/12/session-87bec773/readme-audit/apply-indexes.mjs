// Appends index bullets (append-only) to parent readmes. Run from repo root.
import fs from 'fs';
const H = '\n## Also here (readme audit, 2026-10-13)\n';
const add = {
 'public/framework/ext/readme.md': [
  ['Classify','light overlay that outlines layout classes'],['Collab','mastermind members move through phases to a vote, as a live object'],
  ['DataGrid','a grid for records: table or card rail, a setting not a class'],['ErrorLog','UI errors logged, one line per session'],
  ['filesystem','file and directory objects: FsFile, Dir, links'],['Mention','#Page and @owner icons and words in written content'],
  ['Refine','prompt refinement: raw to clean to cards with flags'],['Session','voice session started by the ✦ press, fast and smart assistants'],
  ['Shots','screenshot helper'],['Query','query helper']],
 'public/framework/ai/readme.md': [
  ['AISession','one Claude session\'s cost, read from its transcript'],['audits','read-only audits of how the framework is built'],
  ['health','page health monitor, checks every page in a hidden browser'],['quick-fix','log of every quick-fix request'],
  ['review','review questions per system, read live from the skills'],['tests','test library: small tasks with known-good outcomes']],
 'public/framework/core/Page/readme.md': [
  ['content-shapes','every shape a page\'s content can take'],['dynamic','pages without a filesystem: seed to spec to page tree'],
  ['generator','a virtual page tree from a spec string, real urls'],['overview','palette: one card per building block'],
  ['settings','tabs that manage themselves, the page\'s own nav switch'],['weight','one number per page saying how much it matters']],
 'public/framework/readme.md': [
  ['audio','microphone building blocks: MicStream, Recorder, Whisper'],['code','code in the framework: patterns, dos and don\'ts'],
  ['design','layout, color, navigation, content and UI decisions'],['servex','the always-on process: runs agents, starts servers, owns logs'],
  ['sources','source library wall of topics, each with a file browser']],
 'public/framework/ux/readme.md': [
  ['Hotkeys','one flat list of every hotkey in the app'],['Objects','inspect live objects: classes, maps, sets, arrays'],['Revise','text in, revised text out, at a chosen level']],
 'public/framework/core/readme.md': [
  ['Events','on/off/emit mixin everything else builds on'],['track','opt-in instance tracking: call once, read back live']],
};
for (const [f, rows] of Object.entries(add)) {
  let t = fs.readFileSync(f, 'utf8'); const have = t.toLowerCase();
  const lines = rows.filter(([n]) => !have.includes(n.toLowerCase() + '/') && !have.includes('['+n.toLowerCase()+']'))
    .map(([n, d]) => `- [${n}](./${n}/) — ${d}`);
  if (!lines.length) continue;
  fs.writeFileSync(f, t.replace(/\n*$/, '\n') + H + lines.join('\n') + '\n');
  console.log(f, lines.length);
}
