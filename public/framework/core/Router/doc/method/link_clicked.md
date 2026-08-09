Returns the anchor this click should navigate, or `null` meaning *"not ours"*.

## Usage

`Router.js:20` — `click()`, the only caller.

## Necessity

Essential, and every guard is load-bearing. Six ways a click is not a navigation,
each of which shipped as a bug once:

```js
e.defaultPrevented || e.button          // someone else handled it; middle-click
e.metaKey || e.ctrlKey || e.shiftKey    // the user asked for a new tab
link.target || link.hasAttribute("download")
link.origin !== location.origin         // external
link.hash && link.pathname === here     // #section — a scroll, not a destination
/\.\w+$/.test(link.pathname)            // /readme.md — a file, let the browser have it
```

The modifier keys and the `target`/`download` pair are the ones that make a
framework feel *broken* rather than buggy: **the user asked the browser for
something and the framework quietly refused.** Intercepting a ⌘-click is worse
than intercepting nothing.

## Simplicity

Right-sized. It reads as a list of refusals with an early return each, which is
exactly what it is — and the name is the question the caller is asking, so the
call site reads `const link = this.link_clicked(e); if (!link) return;`.

Extending it means adding a line here, which is the correct shape: a site that
wants `<a data-native>` to opt out has one obvious place to put it.
