# Fix local model context overflow + add a cheap fallback before Sonnet

## The ask (vscode-mastermind, 2026-10-04, routed mid-flight on local-model-hunt)
> Found by day-cards: local/qwen2.5-coder overflows its context on every Echo call, so every refine silently falls back to paid Sonnet. You're already in Servex/ext/local/provider.js and Echo.js: include in your task (a) the llama-server context size fix (e.g. --ctx-size 16384, check VRAM), proven with one long real owner prompt, and (b) if local still fails, Echo's refine falls back to deepseek/deepseek-v4.1-flash (10/10 on our refine test, ~$0.001) before Sonnet. Commit your files by path when done.

## Do
1. Find why local calls overflow context and fix it (checked VRAM headroom before changing anything).
2. Prove it with one long real owner prompt through Echo's actual refine path.
3. If local still can't do it, wire deepseek/deepseek-v4.1-flash as the fallback ahead of Sonnet in Echo's refine.
4. Commit by exact path.

Picked up as a follow-on to `ai/sessions/2026/10/05/local-ctx-fix/local-model-hunt/` (already landed) since the ask named files that task was already in.
