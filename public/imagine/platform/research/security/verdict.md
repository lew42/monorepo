# Security — the adversary pass, verdict

## The threat model, ranked (likelihood × damage)

1. Account takeover via a stolen HMAC session cookie — the auth readme itself names markdown-rendered content as an XSS surface.
2. Cross-topic/channel leak from the unresolved cloudflare-vs-realtime DO-sharding conflict (per-topic vs per-channel).
3. A compromised or vindictive topic founder mass-deletes their topic — hard-delete rows, no per-topic undo.
4. Anonymous topic-creation spam floods the one-person approval queue (Turnstile solvable ~90% at ~$3/1000).
5. Sybil reputation farming to unlock moderator-add / subtopic-suggest privilege.
6. Stripe webhook forgery/replay against payment state (lower risk — verification design is already correct).
7. Deanonymization of "Anonymous — Level N" by level × topic × timing correlation.
8. A GDPR erasure request lands after data already shaped a derived reputation number or a CDN cache.
9. The fal.ai key or Stripe secret leaks via a committed `.dev.vars` — this exact class already happened once.
10. The dev-only `?as=` switch, or a `wrangler dev` misconfig, reopens the closed `rpc:cmd`-class hole.

## Verdict · what breaks · severity · the fix

| verdict | what breaks | severity | the fix |
|---|---|---|---|
| **cloudflare** | DO-per-topic vs realtime's DO-per-channel — both flag it, unresolved; any check written for one shape leaks across the other | High | Owner picks a shard key before a Worker route ships; re-audit every authorization finding against the winner |
| **data** | §33 (hard-delete rows) and community's §33 (derived-from-log reputation) never state the reputation log is one of the "retained" tables the delete policy governs | Medium | Name the reputation log explicitly as data-governed; state its compaction boundary |
| **users** | OAuth flow names no `state`/PKCE; dev-switch gated by an env flag, not a network fact (weaker than this repo's own `loopback()` lesson); KV ban + Workers rate-limit share one eventually-consistent blind spot under a raid | Medium | Add `state` + PKCE to the auth request; gate `?as=` behind a structural fence, not config alone |
| **payments** | Signature verification is correct; Stripe's own IP-allowlist second layer is not logged | Low — mostly holds | Add IP allowlisting alongside signature verification |
| **realtime** | Recording-off/consent analysis reasons about audio only; stored text chat history is a record too, and inherits the DO-sharding conflict above | Medium-High | Extend consent analysis to persistent text logs; add a minors/actual-knowledge policy before "public record" ships |
| **video** | Holds — embed-only keeps no OAuth token or key in front of a viewer | Low — holds | None needed now; keep creator OAuth tokens server-side-only when that ships |
| **ai** | Design (Worker-secret-behind-proxy) is correct, but the fal.ai key already leaked once in a sibling project — the failure recurs, not the fix | Low-Medium | Add a repo-wide/CI secret-scan step, not just correct handling of the next key |
| **community** | Reputation-gated Sybil defense raises attacker cost, does not remove it; founder-owns + hard-delete has no recovery path short of a whole-database D1 Time Travel restore | Medium | State the gate as cost-raising, not proof; give topic *content* (not personal data) a short undo window distinct from erasure |

## §33 — how the dev-only identity switch is gated (the expensive-to-reverse call)

| | |
|---|---|
| **Decision** | What actually prevents `?as=<handle>` from working in production |
| **Problem** | The users verdict specifies only "an env flag never set in production" — exactly the caller/config-controllable shape that produced this repo's one real incident: `rpc:cmd`'s Origin-header check was defeated because Origin is caller-written, and the fix was `loopback()`, a network fact the caller cannot fake |
| **Options** | (a) env flag only, as proposed · (b) `loopback()`-style network check (dev switch answers loopback callers only) · (c) a separate, never-deployed dev Worker script with no production build target · (d) both (a) and (b) |
| **Recommended** | (d) — env flag for intent, `loopback()` (or Cloudflare's own dev-only binding pattern) as the fence an attacker cannot configure around |
| **Why** | An env flag can survive a copied `wrangler.jsonc` environment or a forgotten `--env` deploy; a network-level check is the one thing in this codebase's own incident history that actually held |
| **Advantages** | Reuses a pattern already proven in this repo (`Server/plugins/MCP.js`); costs one import, no new machinery |
| **Disadvantages** | `loopback()` doesn't exist on Cloudflare Workers the way it does on the Node dev server — the edge has no "local" peer address, so the real implementation is closer to (c): the switch simply is not present in the deployed bundle at all |
| **Security** | Closes the exact gap this brief was asked to attack; matches the repo's own hard-won lesson instead of repeating the pre-fix shape |
| **Cost** | Near zero — a build-time exclusion or a route that 404s outside `wrangler dev` |
| **Scalability** | N/A — dev-only surface |
| **Complexity** | Lower than the env-flag-alone version once framed as "does not exist in prod," not "is disabled in prod" |
| **Migration/reversibility** | Fully reversible; this is a build/deploy decision, not a schema or data choice |
| **Deliberately NOT doing yet** | Any production impersonation feature (support-acts-as-user) — different problem, different audit trail |

## The three numbers

- **60+ seconds** — Workers KV's documented worst-case global propagation, the blind spot behind both the ban-check and any per-key rate limit — [kv/concepts/how-kv-works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- **~$3/1,000 at ~88–91% success** — commercial cost to defeat Turnstile (2Captcha/CapSolver, self-reported, `contested`) — [2captcha.com/p/cloudflare-turnstile](https://2captcha.com/p/cloudflare-turnstile), fetched 2026-09-04
- **30 days Paid / 7 Free, whole-database only** — D1 Time Travel PITR, the sole recovery path from a compromised-founder deletion, and it cannot restore one topic without reverting every other topic in the same window — [d1/reference/time-travel](https://developers.cloudflare.com/d1/reference/time-travel/)

## Challenged

- *A one-person platform can run moderation at all* — legally yes: the EU DSA's notice-and-action duty scales down for small operators (a web form is enough) and applies extraterritorially the moment an EU user can reach the site; the real limit is the owner's reading speed, not the law (see abuse case #4).
- *The KV ban window is acceptable* — the users verdict already argues this to a `question`, unresolved; this pass adds that the Workers rate-limiter shares the same weakness, so the platform's two anti-abuse primitives fail together, not independently, under a raid.
- *"Auth may only ever add to a page" survives a page that shows private data* — holds in principle (capture-then-append is synchronous, nothing awaits before render), but only if `can()` is called on every private fetch; the design is correct, unverified, and BOLA's own literature says the usual failure is one forgotten call site, not a flawed function.
- *The loopback-only dev socket stays safe once a Worker exists beside it* — does not transfer as-is: Workers have no "local peer address" concept, so the socket's exact fence cannot be copied — the switch must not exist in the deployed bundle at all (see §33).

Full evidence: [`log.jsonl`](./log.jsonl), 49 entries (16 established, 16 contested, 1 fringe, 19 speculation — including the seed question) + `--check` clean.
