# Users — identity, session, authorization verdict

**MVP recommendation.** GitHub + Google OAuth plus email magic link (defer Apple button, passkeys, phone — see *Providers for the MVP*). DIY on Workers extending `/notes/auth/`'s zero-dependency OAuth-code-flow-plus-WebCrypto design, not a hosted vendor (see *Build vs buy for the MVP*). Keep the existing stateless HMAC cookie for day-to-day auth, add one KV ban-check per request so bans work in seconds instead of a refresh cycle (see *Sessions for the MVP*, and the §33 record below).

## §33 — Sessions & revocation (the expensive-to-reverse one)

| | |
|---|---|
| **Decision** | How a session proves identity, and how a ban takes effect |
| **Problem** | `/notes/auth/`'s stateless HMAC cookie + `token_epoch` (built for an internal dev site) can't ban instantly — revocation only lands on next refresh. This brief's public audience needs bans "now." |
| **Options** | (a) stateless cookie only, as-is · (b) full D1 sessions table, read every request · (c) stateless cookie + KV ban-check every request · (d) Durable Object per user |
| **Recommended** | (c) |
| **Why** | Keeps zero-I/O verification for the 99% case; adds one near-free KV read that turns "ban eventually" into "ban within ~60s" |
| **Advantages** | No schema growth, no per-request D1 dependency, cheap, small diff from the shipped design |
| **Disadvantages** | Not truly instant — a banned user can act for up to ~60s (KV's documented worst-case propagation) |
| **Security** | Closes the "instant ban" gap the Challenge flagged; still needs Origin/Sec-Fetch-Site checks on mutations (SameSite=Lax alone is not enough) |
| **Cost** | KV reads are near-free at this scale; D1 (option b) is also cheap now — $0.001/million rows read — so cost was never the real trade-off, latency and schema were |
| **Scalability** | KV is globally replicated by design; a D1-table alternative now scales too, via read replication + the Sessions API (~96% latency cut measured cross-region) |
| **Complexity** | One KV namespace, one `banned:<user_id>` key convention — smaller than a sessions table + indexes |
| **Migration/reversibility** | Additive — a D1 sessions table can still be introduced later for per-device revoke or audit trail without touching the cookie format |
| **Deliberately NOT doing yet** | A full sessions table, Durable-Object-per-user sessions, sub-second revocation guarantees |

## The three numbers that matter

- **Hosted auth at 10k MAU:** Clerk free (50k MRU included) · Supabase Auth $25/mo (100k MAU included) · Auth0 Essentials ≈ $700/mo (500 MAU included, then $0.07/MAU) — [clerk.com/pricing](https://clerk.com/pricing) · [supabase.com/pricing](https://supabase.com/pricing) · [auth0.com/pricing](https://auth0.com/pricing), fetched 2026-09-04. Confirms build-vs-buy isn't decided by price at this scale.
- **D1 session read cost, if table-backed:** $0.001 per million rows read, 5M/day free; cross-region latency cut ~96% (1800ms→78ms measured) with read replication + Sessions API — [developers.cloudflare.com/d1/platform/pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [blog.cloudflare.com/d1-read-replication-beta](https://blog.cloudflare.com/d1-read-replication-beta/), fetched 2026-09-04. Overturns the old "D1 read on every request is the cost" framing.
- **Passkey first-try enrollment on Windows:** only 25–39% (vs. 41–83% on other platforms) — [corbado.com/passkey-benchmark-2026](https://www.corbado.com/passkey-benchmark-2026), fetched 2026-09-04. The direct answer to the "passkeys-first as a UX bet" challenge.

## If the MVP must shrink further, cut in this order

1. Google as a second social provider — ship GitHub-only first, add Google when it's clearly worth the Apple-4.8 conversation.
2. The KV ban-check — ship the stateless cookie alone and accept refresh-cycle-speed bans until moderation load says otherwise.
3. `profile_id`/`user_id` split — collapse to one row per user until a creator/brand need is real (cheap to undo later per *Multiple profiles* opinion).
4. Anonymous participation entirely — require an account for any write, add anonymous posting once rate-limiting and the upgrade path are proven.
