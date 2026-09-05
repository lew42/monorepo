# documentation — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-09-04 - "Absolute links only" in the doc/*.md section overstates it - md.resolve() rebases a fetched file's relative links against the FILE url, and md.js's own comment says "which makes a relative link the right thing to write - the same one works on GitHub". Scope the rule to doc/ files that get read from more than one url, or say why absolute is preferred; as written it sent me to read ext/markdown/md.js to be sure ../research/x/ would resolve (decision-data).
