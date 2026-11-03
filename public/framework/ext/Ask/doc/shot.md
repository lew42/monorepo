# `shot` — let the turn look at the element

```js
await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
```

A turn already has the CLI's full tool set; the one thing missing was the
browser *making a picture* for it to read. `shot` closes that gap: the server
screenshots one element to a temp png and rewrites the prompt to `"Read the
screenshot at <file>, then: <prompt>"` (`Server/plugins/Ask.js`'s `ask()`)
before spawning the turn — from the model's point of view it's an ordinary
`Read` tool call, not a special image channel.

## Global, deliberately

`Shot.js` resolves `playwright` from the **global** npm root
(`execSync("npm root -g")`), never from `package.json` — a browser driver is
tooling for the person at the keyboard, the same rule `CLAUDE.md` states for
every dev-only dependency in this repo. Not installed, and `shot()` throws
`"playwright is not installed globally — npm i -g playwright"` rather than
going quietly blind; `ask()` lets that error surface as the turn's own
`{error}`.

## A string, or the full shape

`{ shot: ".chat-form" }` is shorthand for `{url: location.href, selector:
".chat-form"}` — rewritten in `ask()` before the request goes out (see
[ask](/framework/ext/Ask/api/ask/)). Passing the full `{url, selector, width, height}`
reaches any other page, including one this tab never opened; `width` defaults
to the caller's own `report.viewport?.w ?? 1280` in `ext/DesignTool/vision.js`
so a screenshot matches the viewport the numeric report was scored against.

## Measured

`.chat-form` on this page, haiku, 7s, $0.034 — and it correctly named the send
button's baseline against the taller textarea. Of that ~7s, roughly 1.5s is
the playwright launch; the rest is the model call.
