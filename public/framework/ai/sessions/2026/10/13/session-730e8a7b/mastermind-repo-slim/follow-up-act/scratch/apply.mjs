import fs from "node:fs"; import {execFileSync} from "node:child_process";
const all = JSON.parse(fs.readFileSync(process.argv[2]+"/all.json","utf8"));
const L = (s)=>"/framework/ai/"+s.replace(/^public\/framework\/ai\//,"")+"/";
const D = {}; for (const a of all) (D[a.slug] ??= []).push(a.dir);
const T = (slug, title, outcome, links=[], pick=0) => ({slug, pick, title, outcome, links});
const rows = [
 T("page-templates-merge","Review and merge the page-template slice","Read-only review of the Template slice finished; merge prep was done on qf-2 (e118b8f73). Landed through the later page-templates run.",[]),
 T("worktree-pool-ready","Worktree pool ready","Landed and closed (8c37a7af6, 4ab5f031a).",[]),
 T("notifications-lab","Notifications lab","Merged to michael/dev (6aa438200), dev server restarted, /push/key live.",[]),
 T("local-ctx-fix","Local model context fix","Fix (llama-server --parallel 1 in Servex/ext/local/) landed as 3e1d0530f by the sibling task local-model-hunt.",["/framework/ai/sessions/2026/10/05/local-ctx-fix/local-model-hunt/"]),
 T("voice-pipeline","Voice pipeline","Two bugs fixed and merged: Dictate dup-bubble (4963c7c6f), Whisper timing (dfc3f7c36), status words (ec6d7692e).",[]),
 T("push-to-talk","Push-to-talk","Site-wide push-to-talk dictation and hotkey manager merged (c25c5a394).",[]),
 T("new-brain","New brain: cheap model sweep","14-model sweep, per-model token counts and models catalog merged (6024de4c1, b42dfe9a0).",[]),
 T("spend-gate","Spend gate","Spend gate shipped on michael/dev (5ac92c930, 5c3e48758); proof script Servex/agents/spend-gate-proof.mjs (the planned test file was never written under that name).",[]),
 T("main-branch-guard","Main-branch guard","Superseded: .claude/hooks/git-guard.mjs blocks checkout, stash, reset, clean in the main tree (3657d8d12, 00c327b4a). The worktree-violation alarm was not separately built.",[]),
 T("phone-server","Phone server on 0.0.0.0","Superseded by phone-https (9f45f5899); Servex binds 0.0.0.0 (Servex.js, ReverseProxy.js).",["/framework/ai/sessions/2026/10/12/session-f73e4a4a/phone-https/"]),
 T("retire-ai2","Retire AI 2","Superseded by ai2-merge: nav (a02d9b044) then the full migration (4a6ba4b2c).",["/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/"]),
 T("ai-system-docs","AI system docs","Landed: worktree/ai-system-docs merged into michael/dev (c49f32fe4) plus four addendum commits; requirement 1 (system page as cards) was only partly shown at review.",[]),
 T("live-not-polling","Live, not polling","Findings landed (01d39eb1f); worktree/qf-6 has 0 commits ahead of michael/dev, so its work is merged.",[]),
 T("session-detail-live","Session detail live","Session page live two-sided via ext/Chat, merged 5ff7890cc. Open per the heartbeat: per-line transcript push.",[]),
 T("checker-1","Feedback council checker 1","Verified all 48 open asks against the live site (1ea84b4ee); stopped by its parent on purpose.",[]),
 T("feedback-council","Feedback council run (older)","Superseded by the 2026-10-12 council run, which carries the open asks forward.",["/framework/ai/2026-10-12/feedback-council/"], "old"),
 T("session-trace","Session trace","Unverified: the earlier landed line claims it, but trace_of_transcript is not in Server/session-cost.mjs and no page exists in this task dir. Treat as open; see todo.md.",[]),
];
const sel = (r)=> r.pick==="old" ? (D[r.slug]||[]).filter(d=>!d.includes("2026-10-12")) : (D[r.slug]||[]).slice(0,1);
let n=0;
for (const r of rows) for (const dir of sel(r)) {
  const f = process.argv[2]+"/line.json";
  fs.writeFileSync(f, JSON.stringify([{assign:{now:"landed",landed_at:"NOW",title:r.title,outcome:r.outcome,links:r.links,by:"task-mastermind-follow-up-act"}}]));
  if (process.argv[3]==="--apply"){ execFileSync("node",[".claude/hooks/append.mjs",dir+"/task.jsonl",f],{stdio:"inherit"}); }
  n++; console.log(dir);
}
console.log(n,"lines");
