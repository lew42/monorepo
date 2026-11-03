The class. `Doc extends Page` and adds nothing to the constructor — `initialize()`
runs inside `Page`'s and builds the sections, which is why **no line in this file
may be a class field**: a field initializes after `super()` returns, which is after
`initialize()` has already read it.

Everything below `initialize()` is a named part meant to be overridden. The statics
at the bottom (`names`, `label`, `is_class`, `intrinsic`, `declaration`) are the
reflection helpers — pure functions of a subject, no page involved, so they are
testable and reusable without constructing anything.

## Improvements

1. **`api_section()`'s guard defeats an `api()` override.** A subclass whose members
   come entirely from `members()` calls gets no tab and never runs. One
   `getPrototypeOf` check in `sections()` would catch it. *(simple, important)*
2. **`declaration()` re-implements `member()`'s descriptor lookup**, nearly line for
   line, in a different file — exactly the drift `util/source` exists to prevent.
   `util/`'s auditor found the same thing from the other side. *(simple, important)*
3. **`Doc.declared()` and `patched()` are one question asked twice.** The honest
   single form is "was this declared in a class body, and has it since been
   replaced" — worth folding once a third caller appears. *(medium, useful)*
