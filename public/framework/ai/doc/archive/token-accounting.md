# How AI cost is counted

## You pay per request, not per token
A **request** is one call to the model's API: send everything so far, get one reply back.

- The model reads the whole input **once** per request.
- It writes the reply one token at a time, reusing what it already worked out (its working memory, the "KV cache"), so earlier tokens are **not** re-billed for each new token.
- The bill for one request = input tokens × input price + output tokens × output price.

## Why an agent reads millions of tokens
An agent makes a **new request after every tool call** (read a file, run a command), and each request re-sends the whole conversation so far.

- 100 tool calls × ~110k of context ≈ **11M input tokens**: the median minion this week.
- So cost grows with **turns × context size**. Fewer turns and shorter sessions are the biggest saving.

## The cache discount
Each request starts with the same text as the one before. Providers bill that repeated start at a **cached price**:

- Claude: about a tenth of the normal input price; writing to the cache costs a little more than normal input.
- OpenRouter models vary: some discount cached input, some don't (gpt-oss-120b's cheapest host doesn't).
- 93–99% of what our agents read is cached. Only the newest part (the last tool result and the reply) is billed in full.

## Where the numbers come from
Every request's token counts (input, cache write, cache read, output) come back from the API itself, and its cost from those counts × the model's prices. One source of truth, everything else computed from it: being settled by [token-accounting](/framework/ai/sessions/2026/10/04/token-accounting/token-accounting/). Prices and context windows per model: the Models tab.
