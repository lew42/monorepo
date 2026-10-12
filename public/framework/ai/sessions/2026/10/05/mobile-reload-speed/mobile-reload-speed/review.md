verdict: fix

1. [fix] The landing commit (`eecf012a`) points to this task folder for "the before/after measurement" — but no measurement file existed yet, only `requirements.md`, `task.jsonl`, `files.jsonl`. Either add the measurement, or stop claiming it.
2. [note] Step 2, modulepreload, was correctly left out — requirements.md itself marks it "not in scope" pending the owner's URL-versioning call. Worth saying in the landing report so it reads as a choice, not an oversight.
3. [note] `compress.js:54` checks `If-None-Match` with `===` against its own ETag format. A request that skips `compress.js` this time (byte-range, or missing `Accept-Encoding`) but carries one of its old ETags would miss and get a full 200 instead of a 304. Rare on a real phone reload — not worth blocking on.
4. [note] Not yet merged into `michael/dev` — expected, since `merge.mjs` needs this review first. Run `restart_server monorepo` once it lands.
