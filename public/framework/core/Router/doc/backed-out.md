# Backed out: `redirect()` and `Router.enter()`

Both existed only to make `/tabs/` forward to a default tab, and both put a
routing concept into `Router` to pay for one layout's convenience — `load()` had
to return a page instead of a boolean, and a second entry point existed purely to
distinguish "the browser is already here" from "we're navigating."

Removed. `go()` pushes the url that was asked for, `load()` returns a boolean, and
a tab group is just a url that renders a bar.

**If a default tab is wanted later, reconsider from scratch rather than restoring
this** — the version that existed was built for one demo. What *does* survive as a
real need is different: a renamed page whose old url is in a bookmark. `route()`
cannot serve that, because an alias is two live urls for one state and that breaks
the injective url→state encoding the whole design rests on. **Support redirect,
not alias.**
