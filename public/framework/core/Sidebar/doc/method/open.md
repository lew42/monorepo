```js
open(on){
    this[on ? "ac" : "rc"]("open");
    this.$toggle.attr("aria-expanded", String(on));
    return this;
}
```

The entire open/closed state: one class and one attribute.

## Usage

Three callers, all internal, and each is a different way the menu is done with:

- `Sidebar.js:67` — the toggle's click, `this.open(!this.hc("open"))`.
- `Sidebar.js:81` — any link click inside the menu. Navigation happened.
- `Sidebar.js:31` — Escape, which also returns focus to the toggle.

## Necessity

Essential, and it is the only public-looking method on the class — a site can call
`sidebar.open(false)` if it needs to.

**One class, one attribute, no boolean field.** The DOM is the state, which is why
there is nothing to reconcile when the media query changes what `.open` means, and
why `hc("open")` is a legitimate read rather than a smell.

## Simplicity

Right-sized, and `this[on ? "ac" : "rc"]("open")` is the one line that has to be
read twice. `on ? this.ac("open") : this.rc("open")` is the same length and reads
straight through — a small, local improvement, noted in the readme.

It returns `this` and nothing chains off it. Harmless; the house shape.
