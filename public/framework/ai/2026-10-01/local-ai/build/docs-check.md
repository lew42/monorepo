# Docs check — local-ai

## Verdict: makes sense, two small gaps worth a line

Read the full chain: root CLAUDE.md → `Servex/readme.md` → `Servex/ext/local/readme.md`,
and separately `public/framework/readme.md` → `public/framework/ai/readme.md` →
`public/framework/ai/local/readme.md`. Cross-checked both against the real code
(`provider.js`, and the `Servex/ext/openrouter/` sibling it's copied from).

A newcomer who has never seen this task can follow it: what `local` is (a third
Agent SDK provider, same base-url trick as OpenRouter, pointed at `llama.cpp`
instead), how to use it (`model: "local/qwen2.5-coder"`), what each file does,
and the real traps (port answers before the model loads; `allowedTools` doesn't
restrict what a model is offered). The reader-facing page readme is even
clearer — plain sentences, the chat box shown before any code.

## What's missing

1. **Where `llama-server.exe` itself comes from is never said.** `provider.js`'s
   comment explains `LLAMA_HOME` is "where the llama.cpp release was unzipped,"
   but neither readme tells a newcomer they need llama.cpp installed at
   `C:\llama` before any of this works — only that the model *files* live
   there. Someone copying this pattern to a second machine would hit a missing
   `.exe` with no pointer back to this fact.
2. **The GPU number (RTX 4070 Super, 12 GB) only appears in a code comment**
   (`provider.js` line 65), not in either readme — worth one clause in
   `Servex/ext/local/readme.md`'s "Only one loads at a time" line, since that's
   the fact that explains the whole single-model-at-a-time design.

Neither blocks understanding the task; both are one-line additions, not
restructuring. Everything else — the three files' roles, the `local/` prefix
rule, the merge-and-restart caveat, the links to the task folder and the model
ladder — is accurate and in the right place.
