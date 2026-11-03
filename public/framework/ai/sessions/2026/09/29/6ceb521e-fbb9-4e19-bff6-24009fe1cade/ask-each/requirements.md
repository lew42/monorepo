# Ask-each — one question at a time

The ask, verbatim (from `../harness-research/owner-words.md`, "Added 2026-09-28 about 11:15 PM"):

> So imagine a skill that just dumps 12 questions into the prompt. Those questions are going to
> get lost... the LLM goes through each question, kind of loads it into its... layers, and then
> goes to generate kind of a single response for all of the questions. And so alternatively, to do
> a piecewise prompting... instead of giving a list of 12 questions to think about, you go one
> question at a time. And you just ask it the question and see what the response is. And then you
> go to the next question. So then one at a time, the AI is able to think about it, think, and
> respond directly to that question... I think that'll produce much better results, much more
> focused results.

## Scope (from the Servex dispatch)

Build `Server/ask-each.mjs`:
`node Server/ask-each.mjs <questions.md> [--context <file>] [--model claude-sonnet-5] [--out answers.md]`

- One agent session (Claude Agent SDK, same one Servex uses — `Servex/node_modules/@anthropic-ai/claude-agent-sdk`, pattern from `Servex/agents/Agents.js`'s `query()` call).
- Send context once, then each question as its own turn, same session.
- Write question+answer pairs to the output file.
- Every child process hidden (`windowsHide`), no browser.
- Plain node loop — a future OpenRouter harness swaps the model call, not the loop.

Prove it: a 3-question file, run once via ask-each (one at a time) and once as a single combined
prompt, and note the difference in answer depth and cost in `Server/doc/ask-each.md`.

## File ownership / fence

- `Server/ask-each.mjs` (new)
- `Server/doc/ask-each.md` (new)
- Nothing else — commit only these two files.

## Land

Tell `minion-layout-system` (via `send_to_agent`) the tool is ready and how to call it — that
minion asked for exactly this ("ask one question at a time" for its layout decision questions).

