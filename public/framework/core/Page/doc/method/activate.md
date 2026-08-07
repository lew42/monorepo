Placement, and nothing else. `Router.activate()` calls this root-to-leaf over the
entering slice, so my ancestors — and their regions — already exist by the time I
run.

```js
if (this.render().el.parentNode !== container.el)
    container.append(this.view);
```

Idempotent by construction: re-activating a page already in its container is a
no-op, which is what makes the chain diff safe to run on every navigation.

## `render()` owes three things, and all three fail silently

1. **Return/assign `this.view`** — `activate()` appends `this.view`, not the
   return value. Miss it and you read `.el` of `undefined`.
2. **Carry `.page`** — the visibility contract governs only that class, so a
   wrapper without it stays on screen on *every* route.
3. **Never nest a second `.page` inside**, or the inner one is `display: none`.

The root page hit 1 and 2 together during the migration: its `.home` wrapper sat
pinned to the left of every url on the site.

## `activated()` / `deactivated()` are yours

A timer, a focus, a fetch, a `<video>` to release — **page-local** things. Not
global chrome: navigating *up* runs neither, because the page you land on never
left the chain. Appearance that depends on which page is active is a class
(`hides-nav`), not a pair of show/hide calls that has no depth.
