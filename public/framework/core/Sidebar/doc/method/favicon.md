```js
static favicon(){
    return document.querySelector('link[rel~="icon"]')?.href;
}
```

The default logo: whatever the document already declares as the site's icon.

## Usage

`Sidebar.js:47` — `header()`, as the fallback for `this.logo`. The only caller.

## Necessity

Keep, narrowly. The alternative is hardcoding an asset path in a core component,
which would be a core file asserting something about one site's directory layout.

The win is real: a site that has a favicon gets a branded sidebar with no
configuration at all, and `logo: false` still turns it off, because `??` only falls
through on `null`/`undefined`.

## Simplicity

**It reads DOM this class does not own**, which is the one bit of magic in the
component — nothing in `Sidebar` emits a `<link rel="icon">`, and nothing in the
document knows a Sidebar might read it. Neat, and neat is the warning sign.

`rel~="icon"` rather than `rel="icon"` is deliberate: it matches
`rel="shortcut icon"` too, which is still what a lot of documents ship.

Static rather than an instance method because it depends on nothing about the
instance — the honest signal, and it makes `Sidebar.favicon()` usable by a site
building its own header.
