# Slice 1: one voice session per ✦ press, answered by a fast and a smart assistant

Load the `minion` and `code` skills first. Your parent is task-mastermind-voice-sessions.
The whole task: [../requirements.md](../requirements.md). The source of truth: [../design.md](../design.md) (read its table and the `chat` line shape).

## What the owner said (7:10 PM, on the phone, right now)

The ✦ sheet still answers as the per-page assistant. They want a per-session fast and smart pair ("I'm the fast assistant for this session; you're on /framework/"). "✦ starts a new session, which remembers its home page, follows navigation and never stops while recording."

## Where you work

Worktree `C:/Code/lew42/worktrees/qf-9` (branch `worktree/qf-9`, its own site at http://127.0.0.1:52363/). Commit there by exact path. Don't touch the main tree.

**Fence (only these files):** `Servex/agents/Sessions.js` (new), `Servex/agents/session-fast.md` and `session-smart.md` (new, the two briefs), one install line in `Servex/Servex.js` (next to `Layers`), `Servex/Usage.js` (add `pick(role)` only), `public/framework/ext/Session/` (new: `Session.js`, `readme.md`, `page.js`, `doc/`), and one `children:` line in `public/framework/ext/page.js` (or wherever ext's children are listed).
**Not yours:** `ext/drawer/rail.js` and the ✦ sheet. task-mastermind-mobile-nav wires the sheet to your routes. `ext/Chat` belongs to the audio task, so import it and don't edit it.

## The contract (already agreed with mobile-nav, so build exactly this)

Servex routes. Use CORS like `Layers.js` `route()` (lines ~805-822), and read bodies with its `body(req)` pattern:

- `POST /api/session/new {path, host?}` → `{ok, session, home, file}`. The session id is `v-` plus a short base36 id. `home` is the page path it was pressed on (trailing slash). `file` = `<home>ai/<session>.jsonl`, the same-origin URL the browser polls. On disk: `public<home>ai/<session>.jsonl`. Its first line is `{"session":{"id","home","at","host","fast":<agent id>,"smart":<agent id>,"backing":{"fast":<claude session uuid>,"smart":<uuid>}}}` (ask 14: map each session to the model sessions behind it, inside the file). It also writes ONE pointer line into the home page's `page.jsonl`: `{"session":{"id","file","at"}}`.
- `POST /api/session/say {session, path, text, via}` → `{ok, at, answered_by:[{kind:"assistant",id:"fast",agent},{kind:"assistant",id:"smart",agent}]}`, answered at once. It appends the owner's `chat` line (design.md shape: `from:{kind:"owner"}`), then sends the text to both assistants.
- `POST /api/session/nav {session, from, to}` → `{ok}`. It appends `{"nav":{"at","from","to"}}` to the session file. When `to` is a page the session hasn't visited yet, it also writes the one pointer line into that page's `page.jsonl`.
- Replies are `chat` lines in the same file: `from:{kind:"assistant", id:"fast"|"smart", agent:<agent id>}`, `re` = the `at` of the owner line being answered.

Sessions live in a map, persisted to `place("sessions.json")` (see `Servex/home.js`), so a Servex restart can still find a session's home by its id.

## The two assistants (one pair per session, spawned on /new through `servex.agents`, the way Layers.js spawns a pair)

- **fast**: `claude-sonnet-5`, effort `low`, LEAN like the Layers page assistant (no settings files, no tools). It gets every owner line at once, prefixed with the page it was said on. Its reply: one short line, within seconds, that acknowledges and corrects obvious transcription slips. Its first reply introduces itself ("I'm the fast assistant for this session; you're on /framework/"). It never builds or answers technical questions; those are the smart assistant's.
- **smart**: model from `Usage.pick("smart")`, effort `medium`, cwd = the repo, `bypassPermissions`, Servex MCP tools available. It gets owner lines gathered over a 1.5 s quiet gap (copy `hear()`'s pattern in Layers.js), plus any nav lines since its last message ("(now on /x/)"). It answers questions, refines what was asked, and may `spawn_agent` a task mastermind for real work. It answers in plain sentences, one to three.
- **How replies land:** capture each agent's final assistant text for the turn from its event stream (`Agents.js` `emit`, `transcript` / `result` entries), and have Sessions append it as the chat line. That way the agents need no reply tool. If that proves unreliable, add an in-process `session_reply` tool instead, and say which you chose.
- `Usage.pick(role)`: read the latest weekly numbers `Usage.js` already has. If the week is more than 60% gone and weekly use is below the elapsed share (usage to spare), pick `claude-opus-5-5`. If it is near or over pace, pick `claude-sonnet-5`. `fast` is always `claude-sonnet-5`. It is 20 lines at most, with a one-line comment giving the rule.
- Agent ids come from `Agents.name()`: role `session-fast` / `session-smart`, name = the session id. Add both roles to `Servex/agents/roles.js`, since they must be long-lived. Check `LONG` in Global.js: a `session-` prefix must NOT be reaped after 3 minutes, so add it to that regex (one word; this edit is in your fence).

## The browser client: `public/framework/ext/Session/Session.js`

`start({path})`, `say({session, path, text, via})`, `nav({session, from, to})`, and `watch(file, on_line)`, which polls the file with `cache:"no-store"` every 1.5 s and hands over each new line; it returns `stop()`. Reach Servex with `servex_url` from `/framework/dev/servex_url.js`, the same way `ext/drawer/tabs/ai.js` does. Its `page.js` is a working demo: a Start button, a text box that says a line, and the lines drawn with ext/Chat's `chat()`. Show, don't tell.

## Proof (log each in your task.jsonl as an `experiment`)

Restart only YOUR worktree's server if you must. **Never restart Servex.** Prove the Servex side with a scratch node script that constructs Sessions against a stub, or by running a second Servex on a private port if Servex supports that (check `Servex/readme.md`). Stop every process you start, and set `windowsHide: true` on any spawn. Then:
1. `/new` then `/say` "can you hear me?": the fast reply line lands in under 10 s and the smart reply after it, both with `re` set.
2. Two `/nav` calls: both lines are in the file, and the new page's `page.jsonl` got one pointer line.
3. Zero console errors on `/framework/ext/Session/` at 1920. Take a screenshot.

Log to your own task.jsonl as you go. When you're done, reply with the commits, the proofs, and anything you couldn't do.
