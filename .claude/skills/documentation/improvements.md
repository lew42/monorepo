# documentation — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-09-04 - "Absolute links only" in the doc/*.md section overstates it - md.resolve() rebases a fetched file's relative links against the FILE url, and md.js's own comment says "which makes a relative link the right thing to write - the same one works on GitHub". Scope the rule to doc/ files that get read from more than one url, or say why absolute is preferred; as written it sent me to read ext/markdown/md.js to be sure ../research/x/ would resolve (decision-data).

- 2026-09-06 (layout-a): the `/module/doc/<name>/` note says a plain Page-based module needs a `doc/page.js` with a `route()`. A simpler form works and gives more: declare the notes as children with their `.md`, the `styles/rules/page.js` idiom — `const note = (title, file, description) => [title, { description, content(){ return md.file(import.meta, file); } }]`. Real titles and descriptions on the cards, the pretty url resolves in-app, and it avoids the four console 404s a bare declared name costs while `Page.file()` probes for the markdown (measured: four notes, four red lines, page working perfectly).
