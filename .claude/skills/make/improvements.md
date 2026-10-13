# new-page — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- 2026-10-01 (local-ai/build) · `create_page` should ask, or default to the bare name, when the caller is about to delete the stub and hand-write a page.js · the skill itself (step 3) blesses "write page.js, delete the stub", but `create_page` always appends `<name>/page.jsonl` to the parent's `children:` string regardless — my page.js-based page at /framework/ai/local/ had a dead link in the parent until I caught and fixed it by hand.
