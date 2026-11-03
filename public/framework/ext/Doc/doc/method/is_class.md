Does this subject have instances? It decides one thing only: whether a member page
prints the **Overrides** line, which claims that `new Subject({ member: … })` shadows
the prototype's. For `md` or `ui` that sentence is nonsense.

**⚠ `typeof subject === "function"` is not the test.** `md`, `demo`, `files` and
`toc` are all functions, and every function owns a `prototype` object — so the
obvious check passes for all of them. Reading the source text is the honest answer,
and it is exact here because this codebase has no build step and no transpilation:
a `class` in a file is a `class` at runtime.

It would answer `false` for a pre-ES6 `function Foo(){}` constructor. There are none
here, and if one appears the failure is a missing sentence rather than a wrong one.
