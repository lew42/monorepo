# View.depth(steps?)

Marks this view as a layer in the enclosing scene. Returns `this`, so it chains onto
whatever built the element.

```js
section.c("card", () => { … }).depth();     // tier lives in CSS  <- prefer this
section.c("card", () => { … }).depth(2);    // tier inline, wins over any rule
```

**`steps` is optional, and leaving it off is usually right.** Passing it writes an
INLINE `--depth`, which beats every class rule — so a page with a dozen layers can
no longer retune "all its headings" or "all its cards" without editing a dozen call
sites. Bare `.depth()` adds the class and lets a selector say how deep, which is
where a tier belongs. `/resume/` declares all six of its tiers in `resume.css`.

**Patched onto `View` by `ext/depth`.** It is not in `core/` — importing
`depth.js` is what puts it there, which is why the source pane above says
*Replaced at runtime*.

## What it actually does

Adds the class `depth-layer`, and sets `--depth` only if you passed a number. That
is the whole method; every consequence is `depth.css` reading those two things. A
page could write `.ac("depth-layer")` by hand and get the same result — the method
exists so a layer reads as one word at the call site, and so the class name is
spelled in one place.

`.depth-layer` re-declares `--depth: 1`, so a bare `.depth()` with no rule behind it
is one step out rather than inheriting whatever its parent declared.

## What bites

- **`steps` is relative to the enclosing layer, not absolute.** `preserve-3d`
  composes a layer's `translateZ` with its parent's, so `.depth(1)` inside a
  `.depth(1)` is two steps out. Nesting a card inside a card and giving both `3`
  gets you `6`, and the counter-scale will keep the size right while the thing
  drifts twice as far as intended.
- **⚠ `--depth` INHERITS, which is why `.depth-layer` re-declares it.** Without that
  reset a card declaring `--depth: 2` would hand 2 to every layer inside it that had
  no rule of its own — silently, and compounding. Any tier you add in CSS must name
  its own value; do not rely on the cascade to leave it alone.
- **It does not check that a scene exists.** A `.depth(2)` on a page that never
  called `depth()` is inert — the class applies, the transform computes against the
  fallback tokens, and with no `perspective` on an ancestor a `translateZ` has no
  visible effect. Nothing warns, and the page just looks flat.
- **Fractional steps work** (`.depth(0.5)`), because the value goes straight into
  `calc()`. Useful for a third tier inside a card; also an easy way to make a page
  noisy.
- **The value is stringified.** `setProperty` wants a string, and passing a number
  works only because the DOM coerces it — the method does it explicitly so a
  future strict mode cannot silently drop the property.

## Improvements

1. **No warning when there is no scene.** One `closest(".depth-scene")` check in
   dev would turn the commonest mistake — forgetting `depth()` — from a silent
   no-op into a console line. It cannot run at call time (the scene is wired a
   microtask later), so it belongs in the same microtask `wire()` already uses.
   *(simple, important)*
2. **No way to read a layer's absolute depth.** Debugging a nested set means adding
   the numbers up by hand. *(medium, later)*
