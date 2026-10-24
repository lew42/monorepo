verdict: pass
1. [note] `gateOf` runs `spawnSync` once per stale row inside `readyRows()`, which Servex calls on its own event loop (`Servex/Servex.js:697`). I measured one gate check at about 0.7 s, so every list load, and every Merge click (which runs `readyRows` again), freezes all of Servex for about 0.7 s per stale branch. With two stale rows today it is fine. If the list grows, gate only the branch being merged, or use async `spawn` (Server/ReadyToMerge.mjs:27, :76).
2. [note] `mergeBranch` checks that `opts.head` is the branch head, then runs `merge.mjs <worktree>`, and merge.mjs merges whatever the head is at that moment (Server/ReadyToMerge.mjs:95-99). A commit that lands in between gets merged under the card's sha. merge.mjs runs the review gate again, so nothing unreviewed lands, but the `merged:` log line could name the wrong sha.
3. [note] The edits outside the fence were needed and are logged in session.jsonl. The Servex.js change fixes a real bug: `/api/merge` sent `res.json(<Promise>)`, so the page got `{}`, and the fix awaits it. `--gate-only` in Server/merge.mjs:176 has no entry in that file's header comment yet; the minion flagged this too.
4. [note] Since the stale case is now handled, the module header still says the Merge button "refuses" stale rows: Server/ReadyToMerge.mjs:144-145 ("refuses a branch not on the list, stale, or with no worktree"). That comment is now out of date.
5. [note] Until the merge plus a Servex restart, both stale cards (roles-class, qf-2) will say "Servex's merge.mjs is older than the --gate-only check". That is correct, but the file it means is the main tree's `Server/merge.mjs`, not Servex's own.

## Requirements
- 1 "Stale is not a dead end" — yes. `readyRows` adds `latest` = {sha, ok, why}, worked out by the one real gate (`merge.mjs --gate-only`), not by a copy of it. The card offers "Merge latest (sha)" or a plain reason plus the agent's name (shots/stale-passes-400.png, shots/stale-fails-400.png). `mergeBranch` accepts the head the card showed. The `decision` line names the re-mark-ready alternative (session.jsonl, 22:50).
- 2 "The loading state says why" — yes. It has the states loading, down (shows the URL and the timeout), and error (shows Servex's text). The fetch times out at 8 s and retries every 4 s, with a try count you can see (shots/servex-down-1920.png, servex-error, slow).
- 3 Tests — yes. `node Server/ReadyToMerge.test.mjs` passes 32 checks (I re-ran it). It covers a stale head that passes, a stale head that fails, and `mergeBranch` refusing a failing head without running merge.mjs. It also proves an older merge.mjs is never run with the unknown flag.
- Check it — yes. There are 5 states × 400 and 1920 in the worktree's `merge-latest/shots/`, all headless.
- Deliverable — yes. Branch `worktree/merge-latest` @ 6dbf29064, with the `show:` and `ready:` lines logged.
- New class? — n/a. No class was added; ReadyToMerge already existed.

## Words
- The card text is plain and says who fixes it ("minion-roles marked it ready: ask that agent to fix this"). `plainGate` turns each gate refusal into a sentence. — yes
- The readme's "Where the list comes from" paragraph has grown into one long run-on paragraph (public/framework/ai/merge/readme.md:18). It reads, but could be split. — note, minor
