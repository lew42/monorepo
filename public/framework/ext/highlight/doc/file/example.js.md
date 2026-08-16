A real, tiny module (6 lines) that exists for exactly one reason: it is what
`code.file(import.meta, "example.js")` fetches and highlights on this
module's own Overview, under "From a file". It is not itself framework code —
nothing imports `greet` — so its only job is to be honest source a reader can
fetch and see rendered exactly as written.

## Improvements

1. **None worth making.** Shrinking it further would leave nothing worth
   fetching; growing it would make the demo about the example instead of
   about `code.file()`. *(n/a)*
