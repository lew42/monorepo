# A page to test the clean-transcription step on any model

## The owner, 2026-10-04 (verbatim)
> which models are being used or considered for the clean transcription step? Taking the raw whisper data and trying to like clean it up and do typo or capitalization or punctuation and remove filler words ... do we have any local models that are suited for that that do it well and can we test that somewhere

## Facts
- The clean step is `clean()` in `public/framework/ext/Refine/engine.js` (Echo calls it; local-first `local/qwen2.5-coder`, falls back to Sonnet; context overflow being fixed in task local-model-hunt).
- Scores on refining 10 real owner prompts (`ai/sessions/2026/10/04/new-brain/new-brain/eval-results*.json`): DeepSeek v4.1 flash 10/10, Ling 3.0 flash 10/10, local qwen2.5-coder 8/10, Sonnet 7/10, local Gemma 4 e4b 5/10, local Hermes 3 5/10, local Qwen3 8B 4/10.

## Want
1. **A "Try it" tab on /framework/ext/Refine/:** a text box (paste, or the Dictate mic if it mounts in one line), a model picker (the local models + 3–4 cheap OpenRouter ones + Haiku), a Clean button. Shows the cleaned text, seconds, and real $ per call. "Run all" runs the same text through every model side by side.
2. Calls go through the dev server or Servex (never a key in the browser): reuse the existing local proxy (:8998) and OpenRouter provider (`Servex/ext/openrouter/provider.js`); add the smallest route needed.
3. Uses the SAME `clean()` prompt Echo uses, so what the owner sees is what Echo does.
4. Worktree → check_page (400, 1200) → merge.mjs.

Budget: $4 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
