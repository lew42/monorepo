<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  two tests fail on michael dev" (words: dictation, two, test, fail, michael, dev)

## Tasks (8, best first)
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-03 [prompt-refine](/framework/ai/sessions/2026/10/03/26075318-fb11-4162-97af-dbc4f1802545/prompt-refine/) — One refine() engine, shared by Dictate and the prompt log — landed. 1/2/3/7: ext/Refine/engine.js (clean, mechanical diff+glossary check) + structure.js (every sentence placed, fails loudly if not) + the 3-model litmus test — [doc](/framework/ext/Refine/doc/r… · paths 0/1 exist, gone: framework/ai2/your-prompts/
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-05 [Sessions: voice falls back to OpenRouter on a Claude login failure too](/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/) — Voice sessions now switch to OpenRouter on a Claude login failure, not just a usage-limit refusal. treat auth failure like usage refusal, switch at once, tell the owner: Sessions.js's woken() checks AUTH_FAIL_RE too — [proof](prove-auth-fallback-results.txt),…
- 2026-10-01 [llama-server as a local model provider: chat page, test ladder, two f…](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/build/) — Servex runs a model on this machine's own GPU — proven with real replies, not just wired up. start/stop/swap one llama-server model, idle unload: Servex/ext/local/llama.js a local provider for the SDK (local/<slug>): Servex/ext/local/provider.js, Agents.js, t… · paths 2/2 exist
- 2026-10-17 [Servex pool: reclaim frees slots whose work is on michael/dev; node S…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pool-reclaim/) — pool-status.mjs lists every slot with holder, branch, ahead, uncommitted and FREE/KEPT. Reclaim frees clean-stopped and landed-by-diff slots (commits kept on landed/<slot>-<date>-<sha>) and a hold whose holder was gone 12 h+; kept slots name their branch. Liv…
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-03 [Servex: the main checkout never leaves michael/dev](/framework/ai/sessions/2026/10/03/main-branch-guard/) — public/framework/ai/2026-10-03/main-branch-guard/requirements.md

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files

## Docs and readmes
- [dev](/framework/audit/doc/dev.md) — public/framework/dev/ is two small, well-built modules sharing a tier index: Socket (one WebSocket, one localhost gate, live reload) and De…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Dev — decisions and record](/framework/dev/doc/decisions.md) — *moved from readme.md 2026-08-17; conclusive, not current guidance.* ## What belongs here, and the rule that decides Nothing under dev/ may…
- [Reconnecting without a storm](/framework/dev/Socket/doc/backoff.md) — Restarting node server.js is routine. The socket has to come back on its own, and it has to not make things worse while the server is down.…
- [The LAN rule: a phone gets push traffic, never commands](/framework/dev/Socket/doc/lan.md) — The dev socket carries rpc:cmd (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi s…
- [The wire — Claude to a live tab, and back](/framework/dev/Socket/doc/wire.md) — The dev server is a hinge between two protocols. A Claude session speaks HTTP JSON-RPC to it over POST /mcp; the server speaks the socket f…
- [Draggable architecture — grab a View, hit-test the registry…](/framework/ext/Draggable/doc/architecture.md) — Draggable is grab-and-move for any View; Sortable reorders a collection, across lists and into nested containers, on the same code path. En…
- [MicStream — opens a microphone, hands out its stream, sampl…](/framework/audio/MicStream/readme.md) — new MicStream() opens one microphone (a device_id, else ux/Dictate's remembered pick, else the system default) and gives everything else in…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)

## Commits
- 0a0a024d2 dictation-2: brief for the two failing dictation tests
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- 67f9f1649 one-dictation: answer review round 1 on minion-voice-refine
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- b56663d8d one-dictation/minion-core: fix the nav-before-push ordering bug behind the duplicated-lines/wrong-page bug, r…
- a5646898a ai2/card.js: the card's own sidebar mount is chat.js now, desktop only; Widget.css: the orange assistant-bubb…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: two tests fail on michael/dev

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: two tests fail on michael/dev"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
