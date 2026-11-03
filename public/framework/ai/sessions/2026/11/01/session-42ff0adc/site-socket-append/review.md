verdict: fix
1. [fix] The live proof the brief asks for is missing: there is no record that an append through a gateway to a worktree dev server answered "append successful" while cmd and write were refused. task.jsonl has only its opening line (requirements.md "Proof"). Run it and log the result, or log why it could not be run.
2. [fix] Two readmes are now stale. Server/plugins/SocketServer/readme.md:3 says "a LAN peer gets push traffic only", says nothing about the site tier, and its test list (lines 47–48) leaves out the new Socket.test.mjs. public/framework/dev/Socket/readme.md:13 lists the tiers (loopback, LAN, refused) but not the site tier's `append`.
3. [fix] The reconnect strip docs still describe the old behaviour. public/framework/dev/Socket/readme.md:30 and doc/backoff.md:76 both say the strip goes up "the moment a retry is scheduled". It now goes up only after 5 s down (public/framework/dev/Socket/Socket.js:111).
4. [fix] A fresh agent could not continue from this task folder. task.jsonl logs no test run, no commit (d7e85061a on worktree/site-socket-append) and no landing steps, and page.jsonl lists `review/` but no outcome.
5. [note] The TCP keep-alive in Server/SiteGateway.mjs:155–157 does not keep a socket alive through Cloudflare. TCP keep-alive probes never leave the two local legs, so they don't reach Cloudflare's edge. The WebSocket ping in Socket.js and the SSE comment are what actually stop the ~100 s cut, so the header comment at SiteGateway.mjs:24 over-credits keep-alive. It does no harm.
6. [note] The site tier may append to any `.jsonl` under public/, and that includes agent inboxes and `asks.jsonl`. Only someone with the key cookie can reach it, so this is fine for now. Once Cloudflare Access replaces the key, it is worth a line in doc/lan.md.
7. [note] I re-ran the tests in the worktree: Socket.test.mjs prints "all pass" (7 tier cases, including the forged header from 10.9.9.9 and the ::ffff: form), and Append.test.mjs prints 12 passed. I found no logic error in the diff. The SSE beat is cleared on close, the ping is cleared in close(), and hide_reconnecting() clears the strip timer.

## Requirements
- 1 "The internet … may `append` a JSONL line, and nothing more" — yes — Socket.js SITE_OK = {append}; Socket.test.mjs: own address + header gets only append and hello. Append.js:23 limits it to a .jsonl under public/
- 2 "A phone on the Wi-Fi forging the `x-lew42-remote` header gains nothing" — yes — own() checks the peer against os.networkInterfaces(); the test case 10.9.9.9 + header gets ["hello"]
- 3 "The WebSocket and the SSE streams survive Cloudflare's ~100 s idle cut" — yes in code (ws ping every 25 s, SSE comment after 20 s of silence) — not proven live (finding 1)
- 4 "The 'server restarting' strip shows only after the socket has been down 5 s" — yes — dev/Socket/Socket.js:111 uses a 5 s timer and checks `!this.connected`; hide_reconnecting clears it
- Proof — partly — Socket.test.mjs exists and passes; the gateway append is not recorded (finding 1)
- Class page with live instances — n/a (no new class)

## Words
- Comments and doc/lan.md's new paragraph are plain and clear — yes — public/framework/dev/Socket/doc/lan.md "The site tier" paragraph
- Readmes say what the code now does — no — findings 2 and 3
