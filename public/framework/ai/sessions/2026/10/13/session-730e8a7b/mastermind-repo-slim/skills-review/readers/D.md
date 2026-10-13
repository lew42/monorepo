research | 2026-09-04 | improvements.md:7-7 | Name 140-char title limit front and center, test before batching | fact | §0
log-assistant | 2026-09-22 | improvements.md:6-6 | Written as draft, awaits first real agent to run it and report findings | done | N/A
layout | 2026-09-22 | improvements.md:6-15 | PROPOSAL: add live readout + reserved min-height for controls changing size | decision | (new clause)
layout | 2026-09-22 | improvements.md:17-27 | Headless COUNT doubled when measuring hidden pages; check container count + use last() | trap | §Look it then cycle
layout | 2026-09-22 | improvements.md:28-28 | Hidden <details> reports geometry; proof never posts; screenshot is only check | trap | §Look it then cycle
layout | 2026-09-22 | improvements.md:29-29 | Layout invariant measured vs wrong box; reference is innermost REGION, not page | trap | §Look it then cycle
layout | 2026-09-22 | improvements.md:30-30 | Two-column grid row auto; grid-template-rows minmax(0,1fr) unbounds children | trap | §Scrollbars decision
layout | 2026-09-22 | improvements.md:31-31 | Grid region must name own row when sibling hidden; grid-row immun to hidden sibling | trap | (new clause)
layout | 2026-09-22 | improvements.md:32-32 | Page padding is first/last TRACK; grid-template-columns deletes gutters unless restated | trap | padding rule 1
layout | 2026-09-24 | improvements.md:34-34 | padding-check.mjs defaults to localhost:80 (Servex), needs explicit --base url | fact | (new clause)
documentation | 2026-09-22 | improvements.md:5-5 | Show first based on actual page placement; measure y-position for hook-placed content | trap | §page.js section
documentation | 2026-09-24 | improvements.md:6-6 | md/ pattern stale; every .md link opens /<module>/md/doc/<name>/ automatically | done | already applies
documentation | 2026-09-29 | improvements.md:7-7 | Use file_link(path) and class-doc page references instead of raw paths/line numbers | fact | §link properly
finish-task | 2026-09-29 | improvements.md:5-5 | Landing should check git status for uncommitted files touched by task; refuse if any | decision | (new clause)
ui-test | 2026-09-22 | improvements.md:4-4 | querySelector(".pages") wrong; find scroller with max scrollHeight-clientHeight | fact | §pick element
ui-test | 2026-09-22 | improvements.md:5-5 | CLI warning to stderr; execFileSync returns stdout only; use spawnSync joining both | fact | §assertions
Page skill | 2026-09-30 | improvements.md:3-3 | page.jsonl verb shadowing Page property throws silently; check verb name not in property list | trap | (new clause)
code | 2026-09-22 | improvements.md:9-15 | ui.js exports only three things; 27 subdirs are CSS-only with no JS export | fact | §4 or §7
code | 2026-09-22 | improvements.md:16-16 | Binary WAV fixture constructed; measure peak/RMS/duration with same tool as test | trap | §tools section
code | 2026-09-22 | improvements.md:18-18 | route() cold-boots parent page creating hidden copy; add exit guard; parent needs deactivated() | trap | §timing lifecycle
code | 2026-09-22 | improvements.md:19-19 | Bare factory not a View; div.style() throws; rule "element then ANY method" not just .attr() | fact | §bare factory
code | 2026-09-22 | improvements.md:20-20 | Live rebuild of $live on append loses stateful content; hold subtree, re-insert after empty | trap | §timing lifecycle
code | 2026-09-24 | improvements.md:22-22 | Windows case-insensitive git; check sibling whose name differs only in case before creating | fact | (new clause)
code | 2026-09-29 | improvements.md:23-23 | Static import in Page transitively used closes circular import; use dynamic import() instead | trap | §7 timing
code | 2026-09-28 | improvements.md:24-24 | Module-level env const read before test's env-var line executes; use dynamic await import() | trap | §7 before test
code | 2026-10-01 | improvements.md:26-26 | allowedTools auto-approves, not trims; tools: [] is the real restriction for local models | fact | (new clause)
new-page | 2026-10-01 | improvements.md:6-6 | create_page always appends stub to children even when caller hand-writes page.js; fix or ask | fact | step 3
mastermind | 2026-09-04 | improvements.md:6-9 | PROPOSAL: mastermind only relays, execute nothing; minions do skills and hands-on edits | decision | (new role)
mastermind | 2026-09-04 | improvements.md:10-16 | Four find / incidents in 17 days; PreToolUse hook refusing find / needed, not rule alone | decision | settings.json
mastermind | 2026-09-19 | improvements.md:17-19 | PROPOSAL: mastermind writes note and in-flight agent lines for v2 board live updates | decision | (new clause)
mastermind | 2026-10-01 | improvements.md:22-22 | Never delete in main tree; 601 untracked paths erased; cleanup only in own worktree | trap | never-list
sub-mastermind | 2026-09-22 | improvements.md:6-6 | Written as draft; awaits first real Servex-hosted task mastermind to report findings | done | N/A
sub-mastermind | 2026-09-22 | improvements.md:7-7 | role defaulted acceptEdits not bypassPermissions; Servex spawn_agent fails silently non-interactive | fact | §role setup
sub-mastermind | 2026-09-24 | improvements.md:8-8 | mastermind spawn with restart counts as mid-turn; hand restart to non-hosted session | trap | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:9-9 | worktree server never returned; read port from .worktree-logs/<name>.log not .worktrees.json | fact | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:10-10 | health.mjs lock in os.tmpdir() shared; second watcher exits "already running"; set TEMP private | fact | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:11-11 | hold.mjs without --paths holds ai/** only; name fence for sibling module merge paths | fact | merge section
sub-mastermind | 2026-09-24 | improvements.md:12-13 | worktree-up returns immediately but never writes .worktrees.json; run background, read port from log | fact | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:14-14 | Fresh worktree no node_modules; npm ci required before smoke test or start server | fact | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:15-15 | assign.now preview on AI 2; write plainly never commit hashes or minion ids | fact | (new clause)
sub-mastermind | 2026-09-24 | improvements.md:16-16 | Merge breaks standalone task pages; listing option shadowed Page.listing(); test shared module pages | trap | (new clause)
sub-mastermind | 2026-09-25 | improvements.md:17-17 | wait_for_agent tool times out after ~1min regardless of timeout_s; check clock before nudge | trap | (new clause)
sub-mastermind | 2026-09-25 | improvements.md:18-18 | git merge with uncommitted overlap resets files; git stash dangles; check overlap first | trap | (new clause)
sub-mastermind | 2026-09-28 | improvements.md:19-19 | Minion spawned queued runs 20min later; done notice never reaches parent; check list_agents | fact | (new clause)
sub-mastermind | 2026-09-29 | improvements.md:20-20 | worktree health supervisor never starts while main runs; name lock or make per-base | trap | (new clause)
sub-mastermind | 2026-09-29 | improvements.md:21-21 | priority now to working minion ends turn idle; queued corrections or follow now with plain continue | trap | (new clause)
sub-mastermind | 2026-09-29 | improvements.md:22-22 | Long minion run then Monitor re-reads context ~10s each, burns context token budget; start detached | fact | brief guidance
sub-mastermind | 2026-09-29 | improvements.md:23-23 | Card dirs in main tree; imports only in worktree; page breaks until merge; write card files last | fact | brief guidance
sub-mastermind | 2026-09-29 | improvements.md:24-24 | Merge runs main tree smoke.mjs not branch's; fix page or land smoke fix first before merge | fact | (new clause)
sub-mastermind | 2026-09-29 | improvements.md:25-25 | node_modules junction emptied main twice; never link it; ask if take_worktree fails | fact | quick-fix step 6
sub-mastermind | 2026-10-01 | improvements.md:27-27 | Never delete in main tree; 601 untracked paths erased; cleanup only in own worktree | trap | never-list
css | 2026-09-22 | improvements.md:6-6 | Backtick trap in any CSS template literal not just css(); View.style() included | fact | rule name
css | 2026-09-22 | improvements.md:8-8 | util layer margin reset; auto margin/negative margin on flex/grid child needs no utility wrapper | trap | rule 3
css | 2026-10-03 | improvements.md:9-9 | Padding default nowhere; everything no padding; use .pad or .card; never one-off padding | fact | (new clause)
css | 2026-09-22 | improvements.md:10-10 | Unknown custom property silent no-paint; var(--x) not a fallback; give all var() second arg | trap | framework read rule
css | 2026-09-22 | improvements.md:11-11 | Percentage custom property inverts in child; child's containing block different; use length-only token | trap | (new clause)
css | 2026-09-22 | improvements.md:12-12 | getComputedStyle().getPropertyValue() returns TOKEN TEXT not length; read gridTemplateColumns instead | trap | (new clause)
css | 2026-09-22 | improvements.md:13-13 | util-layer collision on uneditable markup; hide with visibility:hidden + pointer-events:none not display | fact | (new clause)
css | 2026-09-22 | improvements.md:14-14 | Two adjacent line-name brackets parse error; one bracket per grid line; read gridTemplateColumns back | trap | (new clause)
css | 2026-09-29 | improvements.md:15-15 | native <details> closed non-summary content not in render tree; use empty <details> + sibling content | trap | (new clause)
css | 2026-09-29 | improvements.md:16-16 | Container query cannot restyle element establishing it; put size rule on plain DESCENDANT wrapper | trap | (new clause)
servex-mastermind | 2026-10-01 | improvements.md:3-7 | jsonl-guard false positive on heredoc/quote with placeholder text; match real redirection not text | fact | hook tests
servex-mastermind | 2026-10-01 | improvements.md:9-9 | Class module readme OPENS with Architecture block (properties, methods); only copy, never central | fact | documentation skill
servex-mastermind | 2026-10-01 | improvements.md:11-11 | Waiting agent revived by heartbeat on every check; add waiting_until time/event; wakes when ready | decision | (new feature)
servex-mastermind | 2026-10-03 | improvements.md:13-20 | mcp__playwright__* opens visible window, never for verification; use site shot/eval instead | trap | never-list
minion | 2026-09-17 | improvements.md:6-6 | Untracked concurrent file broke whole site; run node --check, confirm file not yours, wait | trap | fence guidance
minion | 2026-09-18 | improvements.md:7-7 | Two move-rewrite traps: backtick corruption in sed, cross-realm relative imports; crawl before done | trap | (new clause)
minion | 2026-09-18 | improvements.md:8-8 | Headless proof interrupted by directory.json reload; suppress reload in probe: `S.prototype.reload=()=>{}` | trap | proof guidance
minion | 2026-09-18 | improvements.md:9-9 | CSS class deletion invisible until sibling's thumbnail breaks; grep class name repo before deleting file | trap | (new clause)
minion | 2026-09-19 | improvements.md:10-10 | Own private server dies from sibling edit; tail log, confirm outside fence, wait, restart fresh server | fact | server death
minion | 2026-09-19 | improvements.md:11-11 | Sibling refactors code your brief names mid-task; re-read source file before copying/editing it | trap | fence guidance
minion | 2026-09-19 | improvements.md:12-12 | DevBar import loads every page; lazy-load behind try/await import; use root-absolute paths | trap | (new clause)
minion | 2026-09-22 | improvements.md:13-13 | worktree remove deletes through node_modules junction to main; prefer npm install in worktree | fact | worktree script
minion | 2026-09-22 | improvements.md:14-14 | Kill child PID restarts it; kill SUPERVISOR parent; use Get-CimInstance to find parent tree | fact | kill guidance
minion | 2026-09-22 | improvements.md:15-15 | site MCP permission refused minion non-interactively; fall back HTTP 200 check + node --check | fact | minion fallback
minion | 2026-09-22 | improvements.md:16-16 | Brief fence vs skill guidance conflict; brief fence always wins; leave explicit ask naming owner | fact | fence rule
minion | 2026-09-22 | improvements.md:18-18 | PowerShell tool refuses multi-operation calls; use powershell.exe through Bash instead | fact | (new clause)
minion | 2026-09-22 | improvements.md:19-19 | Killed child twice; found supervisor with Get-CimInstance; taskkill /T /F; verify port stays free | fact | (new clause)
minion | 2026-09-22 | improvements.md:21-21 | Reload hold global; sibling's hold suppresses whole tree's reload broadcast; check is clear first | trap | (new clause)
minion | 2026-09-22 | improvements.md:24-24 | When brief names port, check it free before trusting; kill only owned process, log collision | fact | (new clause)
minion | 2026-09-22 | improvements.md:25-25 | Worktree servers random port; read from .worktree-logs/<slug>.log; start PORT=8096 node server.js | fact | (new clause)
minion | 2026-09-22 | improvements.md:26-26 | carry-in tag wins over branch; git rev-parse both; diff against HEAD if different | fact | (new clause)
minion | 2026-09-22 | improvements.md:27-27 | git apply --3way reads INDEX; uncommitted main files fail; split patch + hand-edit modified files | fact | landing fallback
minion | 2026-09-22 | improvements.md:29-29 | Prove worktree port serves your tree with probe file; 404 for plain file on disk is the tell | fact | (new clause)
minion | 2026-09-22 | improvements.md:30-30 | carry-in shared TAG; diff wrong worktree silently; use SHA from git log, read patch --check line-by-line | fact | (new clause)
minion | 2026-09-22 | improvements.md:31-31 | git apply --3way refuses entire patch if ONE file never committed; --exclude + idempotent script | fact | landing fallback
minion | 2026-09-22 | improvements.md:32-32 | hold.mjs no --paths holds ai/** only; must name batch write paths in hold command | fact | hold section
minion | 2026-09-22 | improvements.md:33-33 | carry-in predates files; git ls-tree carry-in check all files in fence; copy target to scratchpad first | fact | (new clause)
minion | 2026-09-22 | improvements.md:34-34 | Measuring tool finds own defects first; spot-check top 3 findings live before trusting table | trap | (new clause)
minion | 2026-09-23 | improvements.md:35-35 | Headless fonts.gstatic.com hang; context.route to proxy, routeWebSocket to close, await .app | fact | (new clause)
minion | 2026-09-25 | improvements.md:36-36 | Fresh worktree npm ci at root only; Servex needs npm ci in Servex/ too; TEMP private for health.mjs | fact | (new clause)
minion | 2026-09-28 | improvements.md:37-37 | git stash despite rule; safe way: git show HEAD:<path> reads old version no tree touch | fact | (new clause)
minion | 2026-09-28 | improvements.md:38-38 | health-guard false alarm stale; fresh probe shows real content; ignore and proceed | fact | (new clause)
minion | 2026-09-29 | improvements.md:39-39 | take_worktree all 3 taken fallback; node Server/worktree-up.mjs <slug>; merge.mjs needs requirements.md | fact | (new clause)
minion | 2026-09-30 | improvements.md:40-40 | take_worktree returned dead worktree; curl before trusting; --base http://127.0.0.1:<port> fallback | fact | (new clause)
minion | 2026-09-30 | improvements.md:42-42 | Proof clicks real page UI; landed test notes; add self-clear; or use scratch page path | trap | proof rule 8
minion | 2026-09-30 | improvements.md:44-44 | Review finding answered rule shape missing; added to step 10 and merge.mjs refusal message | done | applied
minion | 2026-10-01 | improvements.md:46-46 | Brief assumed existing task dir; rough probe leaves model opening no task; line added | done | applied
minion | 2026-10-01 | improvements.md:48-48 | Landed minion does not loop; return_worktree + last card line + END turn; delete after-land step | trap | (new clause)
minion | 2026-10-01 | improvements.md:50-50 | Never delete in main tree; 601 untracked paths erased; cleanup only in own worktree | trap | never-list
minion | 2026-10-01 | improvements.md:52-52 | Worktree task review invisible to merge gate; use --no-review with explanation; ff merge michael/dev | fact | landing fallback
minion | 2026-10-01 | improvements.md:54-54 | h1.style() throws; h1("text").style() right; no tag method without call; grep real usage first | fact | §7 example
minion | 2026-10-01 | improvements.md:56-56 | "merged" wrong if main had uncommitted edits; git log michael/dev..HEAD check; say "applied" | fact | (new clause)
minion | 2026-10-03 | improvements.md:58-58 | Two masters on one card spawned; substitute smoke.mjs direct proof; guard is textual not path-aware | trap | (new clause)
review | 2026-10-12 | improvements.md:3-3 | one-file API check scans whole tree not diff; scope check to --range diff only | fact | Server/review.mjs
clarity | 2026-09-25 | improvements.md:5-5 | Passed as clear on outcome alone while proposals.md 709 words no picture; run text-check first | done | applied
clarity | 2026-09-30 | improvements.md:7-7 | Self-evident priority one; explain at glance what why where link; cut unlinked unobvious items | fact | (new clause)
new-task | 2026-09-04 | improvements.md:5-5 | PostToolUse hook attributed minion edit to wrong task.jsonl; check own log action lines at landing | fact | section 3
new-task | 2026-09-04 | improvements.md:6-6 | Shared scratchpad overwrite bit mastermind; use per-agent SUBDIRECTORY scratchpad/<slug>/ | fact | section 1
new-task | 2026-09-22 | improvements.md:7-7 | Hand-typing lines.json closing braces error-prone; parse with node before append.mjs | fact | (new clause)

---

### Totals

| Class | Count |
|-------|-------|
| `fact` | 72 |
| `trap` | 34 |
| `decision` | 6 |
| `done` | 5 |
| **Total** | **117** |
