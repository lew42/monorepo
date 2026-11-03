**Usage** — called once, from the constructor (`View.js:10`), before
`initialize()`. Also **replaced at runtime** by `ext/highlight`
(`framework/ext/highlight/highlight.js:232`), which hooks it to catch markup a
view adopts rather than sets.

**Necessity** — yes. Three things have to happen before anything can be appended
to this view, and this is where they happen: the element exists, the captor has
been told about it, and the classes are on.

**Simplicity** — right-sized at three lines, and the **order inside it is
load-bearing**: capture before classify, so a stylesheet keyed on the class chain
applies to an element already in the tree.

The `this.classify &&` guard reads like defensiveness and is not — it lets a
`{ classify: false }` argument turn class derivation off for a view that must not
wear its class name.

