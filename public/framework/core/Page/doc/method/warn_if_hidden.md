The arrangement contract's one loud edge: a `.page` with no mark and no `default`
is `display: none`, and nothing throws.

## Usage

One caller: `activate()`, last line. Nothing else may call it — it is a report, not
a check something branches on.

## Necessity

Yes, and it is paid for. Three modules independently discovered this trap in one
week (`demo.app()`, and both per-tier `detail.js` factories), each by staring at a
blank box. It cannot be found by testing: the page renders, the classes are right,
the DOM is there, and the CSS quietly wins.

**Localhost only** — the same gate `dev/Socket` keeps, for the same reason. Nothing
here may become behaviour a static host depends on, and a warning in a visitor's
console is noise about a decision they cannot make.

## Simplicity

Two conditions, and both had to be earned:

- **Deferred to a microtask.** `activate()` runs *before* whatever marks the chain —
  `Router.mark()` is two lines later, `demo.app`'s is one — so an immediate check
  would fire on every navigation.
- **Quiet when a sibling in the same box is marked.** An ancestor that hands its
  child to the box beside it is hidden on purpose and wears no mark of its own;
  that is `demo.app`'s normal state, not a mistake. The cost is a false *negative*
  for a page dropped into a container that already shows something — a narrower
  miss than the noise the alternative makes.
