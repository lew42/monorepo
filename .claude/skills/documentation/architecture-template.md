# architecture.md — the shape, once

A module's `doc/architecture.md` tells a new agent *what is decided and why*, and nothing else. It is not a changelog: the log is `doc/decisions.md` (dates, reversals), read only to learn how a decision moved. Nothing is deleted from the log; it is just not the first thing read.

## Rules

- **Title:** `# <Module> architecture — <the one idea>`.
- **One paragraph:** what the module is, for whom, and the pattern it uses (a class tree, a stream, a registry). Name its main class and files, with links.
- **One entry per decision that holds today.** If a decision was reversed, write only the current one. A superseded design is mentioned only when someone would plausibly rebuild it, as the rejected alternative.
- **No dates** unless the date is the decision. No "the owner said on…". No reversal history.
- **Check the code.** Each entry must be true of the code now; if it isn't, fix the entry or flag it, never copy a stale decision.
- **Under 80 lines** for most modules. A doc that is already good and longer is not shrunk.
- Link the readme's `## More` line to it: `[`doc/architecture.md`](./doc/architecture.md)`.

## Entry shape

```md
## <The decision, as a short name>

**Decided:** one sentence, in the present tense.
**Why:** one or two sentences, the cause (a failure, a constraint, a measurement).
**Instead:** the alternative(s) and what each would have cost or bought, one line.
**Detail:** [log entry or task](/framework/ai/...) — the one link.
```

## Example (a made-up module)

```md
# Router architecture — walk the declared children, nothing else

The Router turns a URL into a Page by walking each page's declared `children:`. Entry: [`Router.js`](./Router.js).

## Routes are declared, never crawled
**Decided:** a page exists only once its parent's `children:` names it.
**Why:** crawling the filesystem needs a server, and production is static.
**Instead:** a generated manifest (a build step, forbidden) or a directory listing (dev-only).
**Detail:** [doc/decisions.md](./doc/decisions.md#declared-children)
```
