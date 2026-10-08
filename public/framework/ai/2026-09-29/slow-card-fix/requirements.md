# Slow card fix — AI 2 card pages render short, big placed table 3s late

The owner, on the phone over Wi-Fi (verbatim):

> AI 2 card pages render short, and the big placed table appears about 3 seconds later. I measured
> that the placed markdown appears right after /framework/directory.json loads, and that file is
> **3.3 MB, served UNCOMPRESSED** (gzip isn't applied). That's fine on localhost; on phone Wi-Fi it
> costs seconds.
>
> Fix, smallest first:
> 1. Compress the dev server's responses (gzip/brotli via node's built-in zlib; no new npm
>    dependency) for json, js, css, html and md, honouring Accept-Encoding. Check the Server/
>    static handler and the directory.json route.
> 2. Don't block page content on directory.json. Find who awaits it before drawing a card's placed
>    files (core/Page/Markdown.js, ai2/groups.js, ext/files/fs.js, Log.js draw_folder()). Placed
>    .md and modules should draw at once, and anything needing the listing fills in afterwards.
> 3. Measure before and after, loading
>    http://10.0.0.135:8137/framework/ai2/2026/09/29/experiment-3-models-read-the-dictate-spa/
>    headless with network throttled to "Fast 3G" and "Wi-Fi-like" (CDP
>    Network.emulateNetworkConditions): report the time until the table appears, and the bytes
>    transferred.
>
> Post the before/after in one line on card
> 2026/09/29/experiment-3-models-read-the-dictate-spa via POST
> http://127.0.0.1:8090/card/append?id=… using node fetch. The long-term fix, per-page file
> entries in page.jsonl instead of one giant directory.json, is task-mastermind-page-system's job;
> mention the numbers to it (send_to_agent).

## Scope / fence

- `Server/` — static handler + any directory.json route (compression).
- `public/framework/core/Page/Markdown.js`, `public/framework/ai2/groups.js`,
  `public/framework/ext/files/fs.js`, `Log.js` `draw_folder()` — whichever of these actually
  awaits directory.json before drawing placed content.
- Budget: ~$3, quick fix via the worktree pool.

## Deliverables

1. Dev server responses gzip/brotli-compressed (json/js/css/html/md), honouring Accept-Encoding,
   no new npm dependency.
2. Card page content (placed .md / modules) draws without waiting on directory.json; anything
   that needs the listing fills in after.
3. Before/after measurement (time-to-table, bytes) at Fast 3G and Wi-Fi-like throttling, posted to
   the owner's card, and the numbers relayed to task-mastermind-page-system.

