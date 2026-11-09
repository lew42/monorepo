Budget: $10 (Sonnet). Load the `minion` skill first.

# Servex `updates`: one place per conversation, logs as the source of truth

Card: `/framework/ai/2026/11/09/voice-chats-stop-losing-or-repeating-upd/` (the owner's words are on it and in the relay from voice-app, 2026-11-09).

## The owner's words (2026-11-09, relayed whole by voice-app)

> "I think the session logs themselves should be the source of truth. And then the update, when any agent is asking for updates… it's sort of just an in-memory tail… giving the updates for each session in a contextual way where… each update is a JSON line that's got the deltas… with the session ID added to them. So a voice agent who's been working with multiple masterminds can see updates from all those masterminds contextually… you're not duplicating data… sometimes it's not bad if an agent wants to give short updates that are a little more chatty than the session logs." And: "We don't want messages lost in transit."

## What is wrong today (measured 2026-11-09)

- `logs/inbox/voice-app.jsonl` under Servex's home (`%LOCALAPPDATA%/lew42/servex/`): 715 KB, 675 lines since October, ~268 unread. ONE cursor (`voice-app.cursor`) shared by every cloud chat (all call as `voice-app`), so one chat's read eats another's.
- Of those lines, ~200 are `from: "servex-follow"` deltas (`follow: N changes under …`, made by `Servex/Follow.js:368`) copied from logs that already exist; many are `done: …` turn-end notes from `Agents.wake_parent` (`Servex/agents/Agents.js`), several identical ("Idle and blocked, no change since …").
- The code: `Servex/agents/External.js` (`deliver()`, `updates()`, `tool()`), `Servex/Follow.js` (how a followed delta reaches an external agent: `agents.send` → `External.deliver`), `Servex/ext/remote/RemoteMCP.js` (`intercept()` / `voice_session()` resolve the record a call belongs to and pass it as `ctx.session = {id, file}`; `hint()` adds "N new updates"). Doc: `Servex/ext/remote/doc/catch-up.md` (its "Not built" section is this task), `Servex/doc/follow.md`.

## Plan (decided; build in this order, one commit + test per step)

Worktree: `take_worktree` (or `node Server/worktree-up.mjs updates-rework`). Never the main tree. After EACH step: `node --check` the files, run the tests, commit by exact path, then message `mastermind-resources` one line ("step N committed <sha>, tests …") and carry on; I merge in batches.

1. **Cursor per conversation.** `updates` gets an optional `conversation` argument. The cursor key is: `args.conversation` → else `ctx.session.id` (the voice record RemoteMCP resolved) → else the caller (today's behaviour). Store every key's place in one file `logs/inbox/<caller>.cursors.json` (`{key: {offset, at, follows: {<file>: offset}}}`); keep reading the old `<caller>.cursor` as the caller-key value so nothing jumps. A NEW key starts at the end of the inbox ("now") and its first answer carries `missed`: the digest (step 3's shape) of the lines between the old shared cursor and now, capped to the last 24 h. Add one sentence to `RemoteMCP.INSTRUCTIONS` / the `updates` description: pass your claude.ai conversation id as `conversation`.
2. **Follows read the logs, not the inbox.** For an external follower, Follow keeps the subscription but no longer calls `deliver` with the delta. At `updates` time, for each follow of that caller (Follow's own list of subscriptions; `list_follows`), read the followed `.jsonl` from this key's byte offset in `follows`, complete lines only, and return each as `{agent, session, path, line}` (agent = the line's `by` or the follow's owner; session = the session id from the path or line). A key's first read of a file starts at the file's current end. Respect the follow's existing filters (`skip_by` etc.). A non-`.jsonl` follow keeps today's one-line note. Spawned (non-external) followers are unchanged.
3. **Digest by default.** `updates` returns `{count, more, updates, digest}`: `digest` = one row per sender (`from`, or `agent` for follow lines): `{from, count, latest: {text|line, at}}`. `updates` holds the latest line per sender (so a caller reading `updates[].text` still works) unless `raw: true`, which returns every line as today. Keep `peek`, `more` and the 50 cap.
4. **No duplicate "done" at the sender.** In `Agents.wake_parent`, when the parent is external (`agents.external.has(parent)`), skip the inbox line if its text equals that child's previous done text to the same parent (after stripping timestamps/ids), or the child's turn changed nothing since that previous done. Log the skip as a count, not a line per skip. Spawned parents unchanged.
5. **Rotation.** On `deliver`, when the inbox's first line is from an earlier calendar month than now, move the file aside to `logs/inbox/archive/<id>-<YYYY-MM>.jsonl` (never delete; append if that archive exists), start a new file holding only the lines some cursor has not read yet, and rebase every cursor in `<id>.cursors.json` to the new file. Prove no unread line is lost and none is repeated.

**Keep `updates`' current shape working**: `count`, `more`, `updates[]` with `from`/`text`/`at` stay; new fields are additions.

## Tests (the deliverable is the green test + the commits)

Extend `Servex/ext/remote/RemoteMCP.test.mjs` or add `Servex/agents/External.test.mjs` (lean, < 1 s, a temp `SERVEX_HOME`). Prove at least: two conversation keys each see every line once, and one's read never moves the other; a new key starts at now with `missed`; a followed jsonl line arrives tagged `{agent, session, path}` and is NOT in the inbox; `raw:true` vs digest; a duplicate done is skipped and a different one is not; rotation keeps unread lines and loses none; and anything else you can think of that breaks this (a half-written last line, a followed file truncated, a cursors file missing).

## Laws and never-list

- Never restart Servex or the dev server (tell me; voice-app does the restart). Never `git stash`, never push, never edit the main tree. Commit by exact path.
- Update `Servex/ext/remote/doc/catch-up.md` (move items from "Not built" to "What is built", short) and `Servex/doc/follow.md` in the same commits as the code they describe.
- Findings go in this folder's `session.jsonl` as log lines. Report back: one screen, the commit shas, the test output's last line, and what is not done.
