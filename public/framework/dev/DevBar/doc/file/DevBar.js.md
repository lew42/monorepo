The shell: the fixed `<body>`-mounted rail, its header, its tab strip, the
`Ctrl`/`Cmd`+`\` listener, and `devbar`/`devbar.refresh`/`devbar.toggle`/
`devbar.tab` — the names every other file in the framework is allowed to call.
Every other file in this module is either content `devbar()` shows (`tools.js`,
`ask.js`, `parts.js`) or state it reads back (`settings.js`, `grip.js`).

## `refresh()` renders one tab, not seven sections

```js
const [name, shown] = tabs.find(([n]) => n === settings.tab) ?? tabs[0];
```

The open tab is a key in the settings document, so it comes back the way you
left it, and `?? tabs[0]` is what makes a document saved before tabs existed —
or one naming a tab that has since gone — open on `page` rather than on nothing.
⚠ A section that is not rendered does not run, which is the whole reason
`layout` has a tab of its own: it is the one that downloads 45KB and reads every
rect on the page.

## The whole state is one class

`dev-open` on `<html>` is it — see
[docking](/framework/dev/DevBar/doc/docking/) for the CSS side. `devbar()`
never holds an "is it open" boolean; `open()` here is a three-line function
that asks the DOM.

## The bar marks itself `data-layout-ignore`

```js
$bar.attr("data-layout-ignore", "");
```

[`ext/DesignTool`](/framework/ext/DesignTool/)'s probe skips anything under
that attribute, and this is dev chrome rather than part of the page. One
attribute with no import — the same contract `styles/layouts/space/ruler.js`
uses for its miniatures — so it holds for *every* run: the rail's own `layout`
section, the headless crawl, and anyone who points the tool at `document.body`
by hand.

## The keydown listener reads `code`, not `key`

```js
if (!(e.ctrlKey || e.metaKey) || (e.key !== "\\" && e.code !== "Backslash")) return;
```

`e.key` is the *character* the key produces, which moves with keyboard
layout — a French AZERTY backslash is not `"\\"`. `e.code` is the *physical*
key, which doesn't. Checking both is deliberate belt-and-suspenders rather
than redundancy: `code` alone would miss a browser or OS combo that only
reports `key`.

## Boot order: rendered before the world is ready

`devbar(app)` is called from `App.render()` — before the router has resolved
a page and before `Socket` has connected. Everything the rail shows is read
at call time inside `refresh()`, which is why `restore().then(devbar.refresh)`
exists at the bottom of this function rather than assuming the first render
already has good data.

The bar is *built* then, but *mounted* on `app.styles_loaded()`: `inject()`
holds `$app` back until every stylesheet lands, but nothing holds `<body>`.
Appended eagerly, the bar painted unstyled during the download, then visibly
slid off as `devbar.css`'s `transform` and its `transition` arrived in the
same style update. The keystroke, `restore()` and `refresh()` all still run
from call time — they work on the detached bar just as well.

## Improvements

1. **The `resize` listener calls `devbar.refresh()` on every pixel of a
   drag**, not debounced. Cheap today — the DOM it rebuilds is small — but
   it's the one listener in this file with no throttle at all, unlike
   `grip.js`'s deliberate no-rAF reasoning for a *different* reason (a custom
   property write, not a redraw). *(simple, useful.)*
2. **`app` is a module-level variable, assigned once in `devbar(a)`.** Works
   because there is one document and one call, but it means a second call to
   `devbar()` (a test, a second mount) silently overwrites it rather than
   erroring. *(simple, speculative — no second caller exists to motivate it.)*
