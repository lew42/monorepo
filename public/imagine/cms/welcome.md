# Welcome

This page has no `page.js`. Its whole source is the file `public/imagine/cms/welcome.md`,
and core renders it because a `.md` file beside a page **is** a page.

Change this text at [/imagine/cms/edit/](/imagine/cms/edit/) and the file on disk changes.
Then `git diff` shows your edit as prose — real lines, not an escaped blob — and `git commit`
publishes it. That is the entire content pipeline.

## Why this is the interesting case

- **The content is not in a database.** It is a file, in the repo, next to the page it draws.
- **The diff is readable.** A paragraph edit is a one-line diff, which is the thing JSON
  gives up the moment prose goes inside a string.
- **It works offline, on a plane, with no server.** The dev server is only needed to *write*;
  reading is a static asset.
- **Nothing is locked in.** If this file ever needs to live in D1 instead, the page does not
  change — only what answers the fetch does.
