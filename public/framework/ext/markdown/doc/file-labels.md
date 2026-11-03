# A fence can name its file

Added 2026-08-15, alongside `ext/Doc`. A fenced code block's info string can
carry a **second word** naming the file it's from:

````
```js /app.js
import App from "/app.js";
```
````

`marked` keeps only the first word (the language) for highlighting; the rest
used to be discarded. Now it survives as `data-file="/app.js"` on the `<pre>`,
and `ext/highlight`'s stylesheet draws it as a sticky label across the block's
top edge — the same look `code.js(src, "/app.js")` produces from `page.js`.
One `data-file` attribute, two emitters, one rule in `highlight.css`.

## Why this belongs to two modules, not one

`ext/markdown` only ever produces the attribute; `ext/highlight` is the only
place that *draws* it (`pre[data-file]::before { content: attr(data-file) }`)
and the only place that *emits* it from code (`code.js(src, file)`). Neither
imports the other for this — `ext/highlight`'s comment calls the two spellings
"the same look", copied on purpose, because an `ext` may lean on another `ext`
but the two features have to keep agreeing about what `data-file` means
without a shared dependency forcing it.

## How it's implemented — call, don't replace

```js
const fenced = marked.Renderer.prototype.code;

marked.use({ renderer: {
	code(token){
		const html = fenced.call(this, token);
		const file = (token.lang ?? "").trim().split(/\s+/)[1];

		return file ? html.replace("<pre>", `<pre data-file="${file.replaceAll('"', "&quot;")}">`) : html;
	},
} });
```

⚠ The default renderer is **called**, not reimplemented. Escaping a fence's
body correctly — backticks, entities, the works — is `marked`'s job; writing
that logic a second time in this module is how a doc site grows an XSS. The
override only post-processes the HTML string `marked` already produced,
splicing one attribute onto the opening `<pre>`.

## The trap in the string replace

`html.replace("<pre>", ...)` assumes the default renderer's opening tag is the
literal string `<pre>` with no attributes of its own. True for `marked` v18's
default `code()`, and worth re-checking on any future vendor bump — a renderer
that ever adds its own attribute to `<pre>` (a `class`, for instance) would
make this replace silently miss, and the label would stop appearing with no
error anywhere.

## Only markdown fences use the second word

`code.js(src, file)` (from `ext/highlight`) takes the file as an explicit
second argument — no parsing involved. This module's half is purely about the
markdown spelling, for prose written as `.md` rather than built with `code`
factories in a `page.js`.
