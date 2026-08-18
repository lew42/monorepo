The tab order: **Overview first, the reference sections last, declared children
between** — whatever order they were actually added in.

It reads `this.children` rather than the config, so a section added by a subclass's
`sections()` lands in the middle with no further arrangement, and a section that was
never added (no notes, no Docs) is filtered out by the final `has()` rather than
having to be predicted.

The order is a claim about reading: what the module *is*, then the parts of it
someone chose to write about, then the reference material you consult rather than
read.
