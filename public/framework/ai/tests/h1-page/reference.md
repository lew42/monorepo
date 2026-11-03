# h1-page — reference answer

**Agreement: 3/3 strong runs agreed (and the fourth, Haiku, matched too — 4/4).** Opus 5.5, Sonnet 5 and GPT-6-sol all wrote the same answer, nearly character for character.

## What a good answer does (most important first)

1. **Adds `hello/page.js`** beside this page, built the house way:
   ```js
   import { Page, h1 } from "/app.js";
   export default new Page({
   	meta: import.meta,
   	title: "Hello",
   	description: "…one line…",
   	content(){ h1("Hello from the floor test"); }
   });
   ```
2. **The H1 text is exact:** `Hello from the floor test`, written with the `h1()` factory — no HTML string, no `innerHTML`.
3. **Links it from the parent:** adds `children: "hello"` to this folder's own `page.js`, so the parent's `previews()` wall shows it and the route resolves.
4. Both files parse (`node --check`) and the page loads with no console error.

## Where they differed (none of it matters to the score)

- **Where the H1 comes from.** All four set `title: "Hello"` *and* called `h1("Hello from the floor test")`, so the page shows two H1s (the title's and the content's). Nobody used the title itself as the H1 (`title: "Hello from the floor test"`), which the test calls the easiest route. Both work.
- **Extra files.** GPT-6-sol added `hello/readme.md` and `hello/page.jsonl` (the `create_page` tool's output shape); Haiku added an empty-section `readme.md`. Opus and Sonnet wrote only `page.js`.
- **Logging.** Sonnet kept a full task log with a landing line; Opus wrote one log line; GPT-6-sol left no `task.jsonl` at all.
