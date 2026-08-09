# Which highlighter, and how many languages

**Options.** Shiki, Prism, highlight.js, speed-highlight, sugar-high.

`ext/` says vendor it, no CDN at runtime, and the repo says no bundler. That constraint
decides this almost by itself — the question is not *"which highlighter is best"* but
**"which one survives being copied into a directory by hand."**

| | ships ESM | vendor cost | sync |
|---|---|---|---|
| Shiki | yes, ESM-only | ✗ deep graph: `@shikijs/core`, `oniguruma-to-es`, `regex`, grammars, wasm-or-JS engine | no |
| Prism v1.30 | ✗ global-based | — | yes |
| highlight.js | yes, `es/` | **one file per language, zero imports** | **yes** |
| speed-highlight | ESM-native | small, langs auto-lazy | no |
| sugar-high | yes | one 36 kB file | yes |

Shiki produces the best output by a distance — real TextMate grammars, VS Code themes.
It is also the one that cannot be vendored without a bundler. Prism v1 is still
global-based (v2, the ESM rewrite, remains unreleased); the `prism-esm`/`refractor`
forks exist but add a fork to trust. sugar-high is genuinely tempting at ~1 kB, but it
is JS/JSX-first and this site documents CSS and HTML too.

**Verdict: highlight.js 11.11.1**, the `@highlightjs/cdn-assets` `es/` build. Each
vendored file is standalone ESM — checked: zero `import` statements, no wasm, no
`sourceMappingURL` to 404. Cost is ~20 kB core + 0.5–13 kB per language, served as
static assets like everything else.

**Synchronous is worth more than it looks.** It is what lets the markdown-fence hook run
inside the same turn as the `innerHTML` write, so there is no frame of un-highlighted
code (`./hooks.md`), and it is what the unbuilt editor's overlay needs. speed-highlight
— otherwise a lovely fit for a no-build repo — would have needed a sequence guard.

## Keep: five languages, not fifty

js, css, xml, markdown, json. Their built-in aliases cover `js`/`jsx`/`mjs`/`cjs`,
`html`/`svg`/`xhtml`, `md`. An unregistered language is not an error, so the cost of
being wrong is a grey code block and the cost of being greedy is real bytes on every
page load.

## Keep: the accessor map is explicit

Generating it from `hljs.listLanguages()` would mint `code.wsf`, `code.xjb`, `code.mkd`
and a dozen aliases nobody types — and, the real hazard, **hljs ships a language called
`c`**, which would silently overwrite `code.c()`, the classes variant every page in the
repo already uses. The install loop skips a name already present and warns, but the
explicit map is what makes that belt-and-braces rather than the only defence.
