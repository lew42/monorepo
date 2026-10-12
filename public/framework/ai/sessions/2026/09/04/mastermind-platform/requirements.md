# Mastermind run — platform vision & architectural exploration

Run task, group `ai-ops`. The owner's brief is verbatim below (§ "The brief"). This section is the mastermind's plan.

## Assumptions logged (the owner can overrule any of them)

1. **The site stays static; the API is a second runtime beside it.** CLAUDE.md's "no server at runtime" is narrowed, not broken, exactly as `/notes/auth/` already proposed: every page renders with the API returning 500. Any Worker code lives outside `public/`. Nothing in this run deploys anything.
2. **Research first, decisions second, prototypes only where a demo beats a paragraph.** The brief is a research program with a §33 decision framework; the deliverable is a browsable program at `/imagine/platform/`, not a build.
3. **The house research discipline applies** (`ext/Research` Program, credence-graded entries, a skeptic pass) so a reader can tell a Cloudflare price from a hope.
4. Secrets (the fal.ai key found in a neighbouring project's config and in `FAL_KEY`) are never written into the repo.

## Program shape

```
/imagine/platform/                the hub (vision, decisions, prototypes)
  research/                       ext/Research Program over nine topics
    cloudflare/ data/ users/ payments/ realtime/ video/ ai/ community/ security/
      log.jsonl                   entries via entry.mjs — one minion per topic, nobody else writes there
      verdict.md                  one screen: recommendation + the §33 record for the expensive decision
  existing/                       scout: what the framework already has, per concern
  prior/                          scout: the previous Cloudflare work, what to reuse
  decisions/                      wave 3: decision records (Opus)
  mvp/                            the smallest useful vertical slice
  omnibox/  topic/  local/        prototypes, if and when a demo is the clearer answer
```

## Waves

1. **Scouts + research** (Sonnet): `existing-framework`, `prior-cloudflare`; `research-cloudflare`, `research-data`, `research-users`, `research-payments`, `research-realtime`, `research-video`. Expected cost ~8 × 200k tokens.
2. `research-ai`, `research-community`, then `research-security` as the skeptic over the eight verdicts.
3. Decision records (Opus): topic model, data/storage, identity, community/levels. MVP slice.
4. Prototypes where warranted: Omnibox, a topic demo tree on the existing Page model, the local multi-user harness.

## Fences

- Each research minion: its own `research/<topic>/` dir and its own task dir. Nothing else.
- Each scout: its own page dir under `/imagine/platform/` and its own task dir.
- The mastermind alone edits `/imagine/platform/page.js`, `research/page.js`, `/imagine/page.js`.

---

# The brief

> **Important:** This brief describes a vision and a collection of ideas, requirements, hypotheses, and open questions. Do not assume every proposed implementation is correct. The Mastermind should challenge assumptions, investigate alternatives, and recommend better approaches where appropriate.

## 1. Mastermind Role

- You are the **Mastermind**.
- Act as the primary architect, orchestrator, and technical strategist.
- Spawn sub-Claude Code processes ("minions") whenever useful.
- Choose the appropriate model for each minion/task.
- Delegate research, implementation, investigation, testing, security review, UX analysis, and specialized architectural work.
- Coordinate the results from minions.
- Make architectural recommendations and maintain coherence across the project.
- Do not blindly follow speculative implementation ideas in this brief.
- When an idea appears technically questionable, unnecessarily complex, insecure, expensive, or difficult to scale, challenge it and propose alternatives.

## 2. Vision

Build a platform for **topics, communities, learning, creation, and interactive experiences**.

The original working concept was called a "meme," but **topic** may be the better fundamental terminology.

A topic could be something as simple as: JavaScript, Photography, WebGL, Music production.

Or it could become a much richer experience: an encyclopedia/wiki; an educational environment; a community; an interactive visual experience; a WebGL/3D environment; an artistic experience; a collection of subtopics; a collection of discussions and media; a marketplace for topic-specific content; a progression/certification system.

The fundamental idea is that a topic is not merely an article. It can become an entire **world/community around an idea**.

## 3. Existing Framework

- Use the user's existing custom web framework. The AI already knows how to use the framework.
- The website is fundamentally a static-site-oriented framework. Each first-level path represents a page/topic.
- Investigate whether concepts such as `Topic extends Page` or `Meme extends Page` make sense.
- Do not reinvent existing framework capabilities. Inspect the existing framework before introducing new abstractions.

## 4. Core Topic Model

A topic fundamentally consists of: a URL/path; a page/interface; content; potential community functionality; potential subtopics/spaces; potential progression/levels; potential interactive experiences.

Topics should be composable. A topic may contain subtopics, and subtopics may themselves be pages.

However: not every page needs to be a full community; not every subtopic needs levels; not every topic needs every possible feature; the architecture should allow different types of topics; features should be modular and/or configurable where appropriate.

The Mastermind should determine the cleanest abstraction rather than assuming the above inheritance structure is correct.

## 5. Omnibox

Create a core **Omnibox** UI/navigation primitive. The Omnibox should be a major part of the site's interaction model.

Conceptually: always prominent; available throughout the site; keyboard-oriented; fast; searchable; context-aware; capable of autocomplete; capable of showing previews; capable of discovering related topics/content; potentially capable of behaving like a command/chat interface.

Possible behavior: 1. Search within the current topic/page first. 2. If there is a strong global match, surface it. 3. Autocomplete topics/terms/users/content. 4. Preview likely destinations. 5. Potentially behave like mention autocomplete. 6. Investigate whether the Space bar could activate/change Omnibox modes.

These are ideas, not fixed UX requirements. The Mastermind should prototype/evaluate the best interaction model.

## 6. Topic Discovery & Creation

Users should be able to discover topics extremely easily. Potential workflow: user arrives; Omnibox is immediately available; user begins typing; results/autocomplete appear; existing topics are previewed; if something does not exist, the system may offer a way to create or suggest it.

Unrestricted topic creation could produce typos, spam, duplicate topics, thousands of meaningless directories, abuse. Explore governance models: user-created topics requiring approval; with moderation; suggestions first, publication later; AI-assisted topic creation; community voting; reputation-based creation privileges; automatic merging/redirecting of duplicates.

Start with an MVP and do not over-engineer topic governance prematurely.

## 7. Community Model

Every substantial topic can function as a community. Users should potentially be able to participate, communicate, create content, create subtopics, create educational material, create visual experiences, share media, help other users, build the community.

Inspiration: Wikipedia, Reddit, Stack Overflow, Discord, online universities. Do not blindly reproduce their UX or governance systems; combine useful aspects while avoiding known weaknesses.

## 8. Moderation & Governance

The platform owner/company must retain ultimate moderation authority; at the same time encourage democratic/community participation. Explore: topic ownership; community moderation; user moderation privileges; reputation-based moderation; reporting; content removal; appeals/review; admin overrides; community governance; AI-assisted moderation.

Avoid becoming unnecessarily authoritarian. Do not promise users absolute permanence of content when moderation/legal/security requirements may require removal. Moderation should be designed as a serious subsystem rather than an afterthought.

## 9. Users, Authentication & Permissions

We need a real user system: users; authentication; profiles; settings; roles; permissions; sessions; authorization; potentially multiple profiles per user; profile switching.

Investigate how this should integrate with the existing framework, Cloudflare, static content, dynamic APIs, Durable Objects, database/storage. Determine the correct architecture rather than assuming a particular authentication provider or database.

## 10. Local Development & Testing

We need to develop and test the user system locally. Investigate Cloudflare's local development/testing capabilities. Ideally: create fake/test users; switch between users; simulate roles and permissions; test authenticated/anonymous states; test multiple users interacting with the same topic; test real-time functionality locally. Make the system genuinely playable/testable during development rather than requiring production infrastructure for every UX experiment.

## 11. Existing Cloudflare Work

Before designing the infrastructure: inspect the user's previous Cloudflare demo/project; understand how it was structured; reuse useful patterns; identify lessons learned; do not assume the previous architecture should be copied wholesale.

## 12. Cloudflare Architecture

Investigate: Workers; Durable Objects; static hosting; KV / storage options; R2; D1 or other databases; Queues/events; caching; authentication; real-time communication; local development.

One idea is a Durable Object per topic/community for real-time state. **This is a hypothesis, not a requirement.** Determine whether this architecture is appropriate in terms of scale, cost, isolation, concurrency, persistence, complexity, failure modes, migration, security.

## 13. Data & Storage Architecture

One of the most important investigations. The platform is intentionally interested in static/file-based infrastructure wherever practical (cheap, robust, cacheable, scalable, simple, easy to publish), but will also require dynamic state.

Investigate: pure filesystem/static; database-backed; static + database hybrid; JSONL append-only event logs; event sourcing; Durable Objects; Workers + storage; periodically generated static snapshots; other architectures. Explore whether activity could be appended to a log, processed dynamically, periodically compacted, published into static historical content. Investigate whether Workers can intercept requests and dynamically combine static and dynamic information.

Evaluate every architecture on: security, authentication, authorization, privacy, publishing, persistence, real-time requirements, storage costs, bandwidth costs, database costs, scalability, reliability, complexity, local development, backup/recovery, migration, data integrity. Do not assume the filesystem or database is automatically the answer.

## 14. Levels / Progression

Levels are a major conceptual feature; the exact system is undecided: 1–3, 1–5, 1–10, academic 100/200/300/400 or 1000/2000, organic levels added as a topic grows. A standardized progression has value (users learn what a level means across topics). However: Level 3 in an easy topic need not equal Level 3 in a hard one; levels describe progression, not uniformity; not every piece of content needs a manual level; the system should automatically track progression wherever possible; levels should be largely invisible during ordinary browsing.

## 15. Introductory Experience

Each substantial topic should have an extremely approachable introductory experience: roughly 10 minutes; introduces the topic and the community; shows what exists; gives an immediate sense of the environment; can be paused and resumed; does not necessarily award Level 1. Principle: make entering a new topic extremely easy. Level 1 should eventually represent a meaningful accomplishment rather than clicking "Begin."

## 16. Level Advancement & Certification

Progression should represent meaningful knowledge, participation, or contribution: learning, activities, demonstrating knowledge, creating useful content, helping others, participation, projects, contributions. May take hours to months. Long-term, topic levels could become credentials (profile display, resume, recognized community leaders, alternative educational ecosystems). Do not over-engineer certification in the MVP.

## 17. Badges & Gamification

Visual badges for levels, achievements, contributions, milestones, special accomplishments; profiles display badges by topic. The user has badge designs and may provide them. Gamification should encourage learning, participation, contribution, communication, returning, helping — not intrusive or childish.

## 18. Topic Spaces / Channels

Topics may contain multiple spaces/channels (Discord-like but more flexible): text chat, wiki/reference, documentation, media, projects, voice, video, interactive environments, subtopics, community areas. A topic could itself be a WebGL/3D environment where areas represent subtopics. An experiential possibility, not a required default UI.

## 19. User-Created Subtopics

Users should potentially create subtopics/spaces; the main topic experience stays more controlled. Model: core structure curated; users suggest; users publish subject to reputation/permissions/moderation; members improve them; admins retain authority. Subtopics are conceptually pages/directories, but storage is undecided.

## 20. Real-Time Communication

Text chat, channels, voice, streaming audio, recording, playback, rewind, transcription, searchable history. Long-term, activity within a topic could become a persistent public knowledge record. Investigate Durable Objects, WebSockets, WebRTC, audio streaming, recording, transcription, storage, search/indexing, privacy, consent, moderation, retention. Do not assume all conversations should be public/recorded without examining legal, privacy, UX and technical implications.

## 21. Video / YouTube

Video should be strong. Investigate YouTube integration: upload through our interface? what the API permits? user YouTube authentication? simplified publishing? videos automatically become topic content? metadata/transcripts/chapters import? automatic structuring? quotas and limitations? Ideally video creation/publishing/organization feels native.

## 22. AI Integration

The user has connected **fal.ai**. Investigate image generation, visual design, creative exploration, topic/subtopic creation, wiki generation, content assistance, interactive experiences. AI is secondary to core infrastructure and should augment users, not compromise architecture.

## 23. Content Economy

Long-term: users create and publish learning modules, courses, experiences, environments, tools, reference material, premium content; others purchase. Investigate marketplace architecture, creator accounts, ownership, licensing, revenue sharing, refunds, moderation, fraud, payments, tax/legal. Do not implement a marketplace before the content/user/payment architecture is ready.

## 24. Membership

Target **$10/month**, essentially unlimited access; much stays free; boundary undecided. Highly customized payment UX, excellent error handling, users understand exactly what happened. Do not sacrifice security or compliance to own the UI; do not casually build custom payment processing; investigate provider-hosted infrastructure/API options allowing a custom frontend.

## 25. Tipping / Micro-Economy

Tipping should feel like a "like": e.g. Level 1 → ~$0.01, Level 2 → ~$0.10, Level 3 → ~$1, higher progressively larger (examples). Real-dollar accounting, not an opaque coin. One idea: part of the $10 membership becomes a spendable tipping balance — needs serious investigation: accounting, processing, balances, ledger, fraud, refunds, chargebacks, compliance, taxes, history, payouts, minimum transaction costs, whether microtransactions are practical. Do not implement until understood.

## 26. Following / Social Graph

Follow users, topics, creators, communities → notifications, feeds, discovery. Later unless necessary for the MVP.

## 27. Identity & Anonymous Participation

Authentication not required for every interaction. Example: "Anonymous — Level 5 JavaScript". Investigate anonymous identity, topic-specific reputation, abuse prevention, rate limiting, moderation, privacy, permanent vs session-based anonymity. Do not assume this exact model.

## 28. Profiles

Identity, bio, settings, topic levels, badges, contributions, following, reputation, creator activity, earnings. Topic-specific reputation may be more meaningful than one universal score.

## 29. Reputation

Stack Overflow inspiration; topic-specific; gained through activities, useful content, helping, participation, contributions, tips, successful modules. Avoid rewarding spam, low-quality posting, popularity alone, gaming.

## 30. Architecture Principles

Strong MVP; simplicity; robustness; security; scalability; maintainability; modularity; reversibility; good UX; static where appropriate, dynamic where necessary. Do not build the entire vision at once; features become plugins, modules, flags, optional topic capabilities. Reuse existing infrastructure.

## 31. MVP Philosophy

Prove the concept; find the smallest useful vertical slice. Possible progression: 1. framework integration; 2. Topic/Page model; 3. basic static topic experience; 4. Omnibox; 5. users/auth; 6. basic permissions; 7. basic topic/community interaction; 8. minimal progression; 9. local multi-user testing; 10. Cloudflare deployment. Only then: real-time, AI, video, advanced levels, badges, marketplace, payments, tipping, social, 3D. The exact sequence is the Mastermind's.

## 32. Research & Investigation Tasks

Existing work (framework, previous Cloudflare demos, conventions) · Cloudflare (Workers, DO, local dev, auth, storage, real-time, caching, cost/scaling) · Data (filesystem, static publishing, databases, JSONL/event logs, hybrid, migration, backups) · Users (auth, sessions, roles, permissions, anonymous identity, multiple profiles, switching) · Community (topics, subtopics, channels, moderation, reputation, levels, governance) · Real-time (WebSockets, DO, WebRTC, audio, recording, transcription, persistence) · Video (YouTube API, upload, publishing, metadata, transcripts, quotas) · AI (fal.ai, images, content, topic creation, moderation) · Payments (providers, custom UX, membership, creator payments, tipping, compliance, fraud) · Marketplace (premium modules, creator economy, revenue share, licensing, refunds) · Security & privacy (auth, authz, isolation, abuse, privacy, anonymity, consent, financial security).

## 33. Decision-Making Framework

For important decisions record: Decision · Problem · Options considered · Recommended approach · Why · Advantages · Disadvantages · Security · Cost · Scalability · Complexity · Migration/reversibility · What we are deliberately NOT doing yet. Not for trivial details — for decisions that could be expensive or hard to reverse.

## 34. Degrees of Freedom

Ideas/hypotheses, not architecture: `Topic extends Page`; one DO per topic; JSONL event logs; filesystem-first persistence; specific database; number of levels; academic numbering; $10 membership balance; tipping amounts; anonymous level display; YouTube uploading; user-created topics/spaces; automatic recording; 3D environments; any payment provider; any Cloudflare storage technology. Preserve the **intent**; change the implementation freely.

## 35. Core Product Principles

Easy to enter; easy to explore; deep enough to reward serious engagement; community-driven; educational without feeling like school; gamified without feeling childish; social without becoming a generic social network; creative rather than purely textual; open to contribution; structured without being rigid; powerful without overwhelming beginners.

**Discover → Explore → Participate → Learn → Contribute → Level Up → Lead → Create**
