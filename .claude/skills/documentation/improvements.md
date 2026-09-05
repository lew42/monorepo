# documentation — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-09-04 - "Absolute links only" in the doc/*.md section overstates it - md.resolve() rebases a fetched file's relative links against the FILE url, and md.js's own comment says "which makes a relative link the right thing to write - the same one works on GitHub". Scope the rule to doc/ files that get read from more than one url, or say why absolute is preferred; as written it sent me to read ext/markdown/md.js to be sure ../research/x/ would resolve (decision-data).
2026-09-05 - "Beside a plain Page-based module, link the literal file path... the pretty form 404s" is now stale for a module that adds a doc/page.js with a route() (paging's own fix, copied to /imagine/mag/doc/page.js today). Verified live on the real dev server, not assumed: the .md-extension link left the SPA entirely (page.url ended in .md, zero .page elements in the DOM) while the route()-based pretty URL (/imagine/mag/doc/decisions/) resolved in-app both directions, real title, zero console errors. Worth a line: prefer a route()-based doc/page.js (one extra small file) over the literal-.md-link workaround when the module can afford it - it is what the newest sibling realm (paging) already does.
