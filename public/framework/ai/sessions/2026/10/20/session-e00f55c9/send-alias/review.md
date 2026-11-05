verdict: fix
1. [fix] `Servex/agents/readme.md` doesn't mention the new behaviour or its test. Around line 73, where `send_to_agent` to a tab is described with `External.test.mjs`, add one line: "`send_to_agent` takes `{to, message}` as well as `{id, text}`; a missing recipient names the field. Test: `send-alias.test.mjs`. Needs a Servex restart." As it stands, the new test is unindexed, and nothing says the change only takes effect after a restart.
2. [note] `public/framework/tasks/readme.md:37`: the heading is struck through as solved, but its sub-bullets still say "To find: which tool or wording they read". The 16:51 and 16:53 reports (v1-2-scroll-fix, process-runner-stall) may have used `{to, message}` or may have had another cause. Either trim the sub-bullets or say that this cause covers those two reports.
3. [note] There's no simpler way: aliasing in the handler and dropping `required` is the smallest change. The older comment at `Servex/agents/tools.js` ("a call with `message` instead of `text` delivered the word 'undefined'… (09-29)") now describes a case that the alias accepts. It is still true history but could mislead; one clause saying "now accepted as an alias" would help.
4. [note] The task folder holds only `requirements.md`. A fresh agent has to find the branch `worktree/send-alias` (`C:/Code/lew42/worktrees/send-alias`, commit 14b3586f5) through `git worktree list`. Naming the branch in requirements.md, or in a task.jsonl, would let someone continue from the folder alone.

## Requirements
- 1 "accepts both spellings" — yes — `tools.js` handler: `id = id ?? to; text = text ?? message`; `required` is now `[]`, so the zod schema (tools.js:562) makes every field optional
- 2 "names the missing field" — yes — a missing id returns `why: "send_to_agent needs `id` …"`; a missing text keeps its existing message
- 3 "Test: Servex/agents/send-alias.test.mjs" — yes — I ran it in the worktree: "send-alias: 5 checks pass"
- class added or changed — n/a
## Words
- the plain-language checks on the new readme lines and code comments — yes — short, dated, and they name the agents and the cause; see note 2 for the stale sub-bullets
