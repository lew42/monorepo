The pinned strip under the nav: the colour-scheme toggle and a placeholder avatar.
**Also the name of the property that replaces it.**

## Usage

`Sidebar.js:80` — `menu()`, called optionally (`this.footer?.()`), so `footer:
null` means *no footer*. No caller in the repo replaces it; the site's `/framework/`
sidebar uses the default (`framework/page.js:22`).

## Necessity

Keep. It is the one place `mode()` is rendered, and rendering it *here* is what
retired a `position: fixed` pill that floated over every page, full-bleed ones
included.

```js
if (this.app) this.$mode = mode(this.app);
```

**Quietly absent when the sidebar wasn't given an app**, which is correct — `mode()`
styles `app.$app` and has nothing to write to otherwise — and is also the failure
mode most likely to confuse: a sidebar built without `app: this.app` simply has no
toggle, with nothing in the console. [views](/framework/core/Sidebar/docs/views/) has
the measured case where that happens by accident.

Outside the scroller, so it stays put while the nav scrolls, and inside `menu()`,
so it rides along when the narrow menu drops.

## Simplicity

Right-sized, with one honest wart: **the avatar is a placeholder.** `div
.sidebar-avatar` with `title="Account"` is a styled empty box that does nothing and
means nothing — a slot for the account mark a site will want. It is the only piece
of this component that is speculative.

Replaced rather than configured, same as `header`. Pass a function, never a View —
a View built to be handed in is constructed before the Sidebar captures.
