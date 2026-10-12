# Local brain: qualify a local model, then move Echo's prompt cleaning onto it

## The ask (owner, 2026-10-04, dictated, verbatim excerpts)
> we should find a local model that's the best that we can run for quick tasks ... if you want to try an eight gigabyte model, fine. I would suggest maybe staying a little lighter at six gigabytes

> look at any class and compose a question that has a true or false answer or a multiple choice answer or even a simple value like a number or a name ... you should be able to generate a million questions about anything and then you just ask a simple local minion ... breaking down to simple tasks, progressively more difficult tasks ... figuring out where each model's limitations are ... making a bad mistake even 5% of the time is almost unacceptable ... Unless you're in a brainstorming or a pure search mode.

## Facts (vscode-mastermind, measured)
- On disk: qwen2.5-coder 7B (4.7 GB), gemma-4-e4b, gemma-3-4b; served by Servex on :8998 (`local/<name>`), unloaded after 10 idle min.
- new-brain run 2 (`ai/2026-10-03/new-brain/`): local qwen2.5-coder 4/5 docs, 3/3 reasoning, 8/10 prompt refine, 22 s, $0.
- Echo (`Servex/agents/Echo.js`, `clean()`/`structure()` in `ext/Refine/engine.js`) refines every owner prompt on Claude Sonnet at ~$0.21–0.34 each (38 prompts in one tab so far).

## Do
1. **A question generator in node** (no model writes the questions): walk `public/framework/core|ext|ux` classes and emit questions with answers computed from the code: true/false ("does List have a method `move`?"), a value ("what class does ext/JSONL/JSONL.js export?", "how many methods does X define?"), multiple choice. Five levels, simplest first (a fact in one given file → combine two files → trace a call). Give the model the file text it needs; never the readme chain.
2. **Run 100+ questions per level** on the three local models; score by exact match. Report each model's error rate per level and the last level under 5% errors. (Add a downloaded model only if all three fail level 2; keep it under 6 GB; one download at most.)
3. **If qwen2.5-coder passes the prompt-refine bar** (8/10 or better, as in new-brain): switch Echo's clean + structure calls to `local/qwen2.5-coder`, falling back to the current model when the local server is down. Show 3 real prompts refined locally at $0.
4. Work in a worktree (`take_worktree`; if the pool is broken, `Server/worktree-up.mjs`), check_page nothing broke, merge. The main site is production.

Budget: $4
Model: Sonnet, ONE agent, no minions. Never the mcp__playwright tools.
