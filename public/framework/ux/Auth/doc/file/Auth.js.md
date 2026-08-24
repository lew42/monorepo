## `Auth.js`

The class. Three screens (`login()`, `signup()`, `reset()`), each a method that builds
a `<form novalidate>` from `ui/field`'s own template; `switch(view)` throws the old one
away and builds the next — the whole behavior a template can't hold. Validation reads
native `:invalid`/`:user-invalid`; JS only surfaces the message, in `ui/alert`. The
social row is markup with a `data-provider` attribute and one seam, `social(provider)`
— no request, no fake OAuth.
