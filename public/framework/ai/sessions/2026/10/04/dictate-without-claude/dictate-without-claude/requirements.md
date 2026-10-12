# Dictate keeps working when Claude cuts off

## The ask (owner, 2026-10-04 ~15:00, dictated; full text: /framework/ai/2026/10/03/session-60d9def6/, Prompt a0327b80)
> We're facing a Claude shutdown. Like once we hit 100%, we're done on Claude ... I don't think I can even use a VS Code sidebar session anymore. So I have to rely entirely 100% on the website and whether the voice dictation system works. And so that's kind of a top priority

## Facts
- [Dictate](/framework/ux/Dictate/)'s voice sessions run a fast and a smart assistant (`Servex/agents/roles.js` `session-fast`/`session-smart`, `Servex/agents/Sessions.js`), today on Claude models. Whisper is local and free.
- Cheap models that passed our test (`/framework/ai/2026-10-03/new-brain/`, Models tab): local qwen2.5-coder ($0, weak at tool calls), gpt-oss-20b/120b (fast on Groq), DeepSeek v4.1 flash, GPT-6 luna. OpenRouter spawns are live again with real cost tracking.

## Want
1. **A switch:** session-fast and session-smart can run on an OpenRouter model (and the fast one on local Qwen if it can do its job without tools), chosen by one setting, plus an automatic fallback when a Claude call is refused for usage limits.
2. **Prove it:** with the switch on, talk to Dictate on the site (headless, `Server/browser.mjs` / check_page; feed text if audio can't be driven) for 3 sentences; show the replies and their real $ per reply.
3. Pick the default after-cutoff pair (fast, smart) by cost and quality, write it in `Servex/agents/readme.md`.
4. Worktree → check_page → merge.mjs → restart Servex.

Budget: $5 (a guide; finish it right)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
