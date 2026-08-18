The `ai` section: this page's threads as a row of pills, and a chat on
whichever one is open. The first `dev` → `ext` import in the repo — it reaches
into `ext/JSONL` and `ext/Ask`, which is allowed (core never imports an ext;
`dev` is downstream of both) but hadn't happened before this file.

Full design: [threads](/framework/dev/DevBar/doc/threads/).

## The shape: `threads()` finds them, `panel()` shows them

`threads()` walks `/directory.json` to `<page>ai/` and returns every child
holding a `task.jsonl` — nothing declared, nothing crawled by a build step.
`panel()` renders the pill row, the `+` button, and the transcript for
whichever thread is selected (remembered per page in
`settings.threads[url]`).

## Two captor-drop points, both handled

`section("ai", …)`'s body and `panel()`'s `show()` both go async
(`threads()`, `TaskJSONL.load()`) and both rebuild their view inside an
`.append(() => …)` callback rather than directly after the `await` — see
[threads](/framework/dev/DevBar/doc/threads/#the-captor-trap-this-file-has-to-dodge)
for why the direct form would silently misplace the DOM.

## The 404-detection trick

```js
const json = url => fetch(url)
    .then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
    .catch(() => null);
```

The SPA fallback (`index.html` for every miss) means a missing
`/directory.json` doesn't 404 — it answers `200` with an HTML document. The
content-type check is the only way to tell "this file doesn't exist" from
"this file exists and is JSON" on this hosting model.

## Improvements

1. **`walk()` is recursive with no depth guard.** A `directory.json` is
   server-generated and bounded by the real filesystem, so this is a latent
   rather than reachable risk — but it's the one function here that would
   stack-overflow on adversarial input rather than fail cleanly.
   *(simple, speculative.)*
2. **A failed `thread(task)` in `add()` shows the error where the transcript
   would go** (`$open.empty(...)`), but the pill row (`$threads`) it never
   got added to leaves no visible sign anything was attempted, once the error
   is dismissed by clicking elsewhere. *(simple, useful.)*
