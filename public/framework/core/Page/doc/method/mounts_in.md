Return a container, and log which claim won.

**Usage** — three callers, all inside `container()` (`Page.class.js:100,103,105`).

**Necessity** — as behaviour, no: it returns its first argument. As **observability**,
yes — `container()` is the one step a reader of this file cannot see the answer to,
because a parent three files away decided it.

**Simplicity** — this is the house rule *encapsulate the fiddly bit and name it*
applied to a `console.log`. It works: `container()` reads as three claims in
priority order instead of three claims interleaved with logging.

The cost is a public prototype member whose entire job is a side effect, and a name
that reads like a question (`mounts_in`) but is an imperative. If the logging ever
goes, so does this. Worth reconsidering as `container()` returning early with a
plain log line — three lines longer, one member fewer.

