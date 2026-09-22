# Picking an element, and asking about it

Click **pick an element**, then click anything on the page. The cursor becomes a
crosshair, whatever you hover is outlined, and the click picks it instead of
activating it. Escape cancels. The whole thing is one call:

```js
import { pick } from "/framework/ext/Ask/Ask.js";
const about = await pick({ app });          // null if you pressed Escape
```

Then ask about it. `chat()` and `ask()` both take that object as `context`:

```js
await ask("What is this for?", { context: about, model: "haiku", tools: "" });
```

## What the turn is actually told

The element by itself would tell a model almost nothing, so the picker gathers
the files that explain it and quotes them into the prompt. The turn opens with
plain sentences, in this order:

1. The element, written as a CSS selector, and the page it is on.
2. The first ~600 characters of its markup.
3. The `readme.md` and the `doc/decisions.md` of that page, quoted in full,
   named so the answer can cite them.
4. The readme of the framework module that owns the element's class prefix,
   when there is one — `.tab-bar` brings `ext/tabs`, `.dev-bar` brings
   `dev/DevBar`, `.page-previews` brings `core/Page`. That mapping is read out
   of [`framework/styles/css-scopes.txt`](/framework/styles/css-scopes.txt),
   the same file the `new-css-class` skill checks.

A typical pick is about 7,000 characters of prompt. Each file is capped at 4,000
characters, so a very long readme arrives truncated rather than blowing the turn up.

## The page you are on, and the folder that explains it

They are two different addresses, and the picker reports both.

The element's nearest `.page` ancestor is not always the page you think you are
on. Core renders a `Doc`'s content inside a synthetic child page, so picking
something on `/framework/ext/Ask/` reports the page as
`/framework/ext/Ask/overview/intro/` — a page that owns no files and never was a
folder on disk.

So `page_at()` answers twice: the **url** the reader is standing on, and the
**dir** that page's own files live in, taken from the nearest ancestor `Page`
that carries a `meta` (every page declares `meta: import.meta`). The readme hunt
starts at the dir, then climbs up to three rungs and stops at the first
`readme.md` that exists. The readout on [the module's page](/framework/ext/Ask/)
prints both, labelled `on page` and `explained in`, so an answer that cites a
surprising file is visible rather than silent.

⚠ It used to start at the url and guess its way up, which asked the server about
two directories that have never existed — **two 404s in the console on every
pick**, measured 2026-09-17. Starting at the dir is both quieter and more correct.

⚠ A page nowhere near a readme will still climb into a general one —
`/framework/readme.md` rather than nothing. The url is always named, so you can
see it happened.

## The chip names the element in words

`label()` writes the short form the chip shows: `div.card`, `h1#top`. An element
with no id and no class has nothing to name it by, so it borrows the first 28
characters of its own text instead — `h4 “A card, so there is somethin…”` rather
than a bare `h4`, which told the reader nothing about which `h4` they picked.
`where()` is the full selector and still goes to the turn.

## The floating **?**

`mount()` is the same thing as a control any page can opt into:

```js
import { mount } from "/framework/ext/Ask/chat.js";
content(){ mount({ app: this.app }); }
```

One call, in `content()`. It renders nothing off the dev server, and the panel's
first button is **pick an element**. It is deliberately **not** mounted
site-wide: a page asks for it.

Its turns default to `model: "haiku"` and `tools: ""` — a pure-text turn, about
$0.02, grounded in the files already quoted into the prompt. Pass
`tools: "Read,Grep"` to let the turn go looking for itself.
