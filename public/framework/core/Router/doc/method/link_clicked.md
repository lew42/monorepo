Returns the anchor this click should navigate, or `null` meaning *"not ours"*.

Six ways a click is not navigation, and every one of them is a real bug that
shipped once:

```js
e.defaultPrevented || e.button          // someone else handled it; middle-click
e.metaKey || e.ctrlKey || e.shiftKey    // the user asked for a new tab
link.target || link.hasAttribute("download")
link.origin !== location.origin         // external
link.hash && link.pathname === here     // #section — a scroll, not a destination
/\.\w+$/.test(link.pathname)            // /readme.md — a file, let the browser have it
```

The `target`/`download` pair and the modifier keys are the ones that make a
framework feel broken rather than buggy: **the user asked the browser for
something and the framework quietly refused.** Intercepting a ⌘-click is worse
than not intercepting anything.
