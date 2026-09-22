# Decisions — workflow-wall, 2026-09-18

Six sign-up/sign-in flows as `demo.app()` cards on one wall, each with a live click
counter — the owner's ask verbatim: *"creating a grid of user interface cards and
each one represents a specific workflow like registration... how many clicks it
takes to get logged in."* [`page.js`](/imagine/platform/workflows/) is the wall;
this is the record behind it.

## The click counts, measured live

Every number below is a headless Playwright run that clicked the card and read the
counter back — not typed from the design, the actual count `demo.app()` produced.

| Card | Flow | Clicks to the goal |
|---|---|---|
| Sign up with email | landing → Create account → fill the form → submit | **2** |
| Google sign-in | landing → Continue with Google → Allow (mocked consent) | **2** |
| GitHub sign-in | landing → Continue with GitHub → Allow (mocked consent) | **2** |
| Returning user: sign in | landing → Sign in → fill the form → submit | **2** |
| Sign out | already signed in → Sign out | **1** |

Password reset is not a seventh card — the owner ruled it out for this wall. It is
still reachable (ux/Auth's own "Forgot password?" link works inside the email
cards) but a reset request does not count toward "logged in": `FlowAuth.commit()`
only advances on `view === "signup" || view === "login"`.

## How the counter counts a click, not a card

`demo.app()`'s own hook, `shown(page)`, fires every time the box's visible page
changes ([`ext/demo/doc/method/app.md`](/framework/ext/demo/doc/method/app.md)).
The box's first page-show happens **during construction** — `render()` calls
`this.show(this.page)` before `demo.app()` even returns — so wiring
`app.shown = …` right after `const app = demo.app(tree)` misses that first call
for free: nothing has to check "is this the first one," because the handler
was not attached yet when it happened. Every call the handler DOES see is a
`go()` that a click caused, whether a real anchor click (`followed()`) or, on the
email/consent cards, a button's own `.click()` handler calling `app.go()`
directly. Both count; neither is double-counted.

**The tree shape that makes this exact:** every card's landing page links straight
to the right form (`Create account`, `Continue with Google`, `Sign in`) instead of
showing one shared login screen a reader has to toggle between views on first —
so no click is "spent" switching screens before the flow even starts, and the
count is exactly what a fresh visitor's mouse would do.

## The provider decision

**Raw GitHub + Google OAuth, not a third-party auth provider** (Auth0, Clerk,
Supabase) — matching
[`/imagine/platform/decisions/identity.md`](/imagine/platform/decisions/identity.md)
ruling 1, and the owner's own words: *"having the raw APIs is almost always
better than an aggregate API that shields you from the underlying API."* A vendor
wins when a project needs many providers, MFA and compliance from day one, at the
cost of a second domain in the login flow and a webhook-sync problem to keep a
database's own profiles honest — identity.md's own analysis, upheld here rather
than re-argued. Chosen: raw providers, `state` + PKCE on both, unchanged.

## The real requests, read from each provider's documented endpoints

Never fetched — read from Google's and GitHub's own OAuth docs and shown on each
card's fold, because the owner's "how to use those APIs" question deserves the
actual shape of the request, not a description of one.

**Google** — authorize: `GET https://accounts.google.com/o/oauth2/v2/auth`
(`client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile`,
`state`, `code_challenge` + `code_challenge_method=S256`) → token:
`POST https://oauth2.googleapis.com/token` → userinfo:
`GET https://openidconnect.googleapis.com/v1/userinfo`, whose `picture` field is
the avatar url.

**GitHub** — authorize: `GET https://github.com/login/oauth/authorize`
(`client_id`, `redirect_uri`, `scope=read:user user:email`, `state`,
`code_challenge` + `code_challenge_method=S256`) → token:
`POST https://github.com/login/oauth/access_token` → user:
`GET https://api.github.com/user`, whose `avatar_url` field is the avatar.

## Avatar, two ways

The provider picture is mocked (an inline SVG, not a fetch — there is no real
login here to get a real one from). The Gravatar beside it is real: hashed with
`crypto.subtle.digest("sha-256", …)` on `demo@acme.test` in the browser, drawn
from `https://www.gravatar.com/avatar/<hash>?d=identicon`, which is a real image
request — the one exception to "no provider calls," because Gravatar is a public,
unauthenticated image host, not an identity provider, and the owner asked for it
by name ("look for a Gravatar"). One line: the provider photo wins once a real
login exists; Gravatar wins before that, and degrades to a generated identicon
instead of a broken image for any email at all.

## Layout: a `rem` column, not `em`, under the columns host

`/imagine/platform/` is a COLUMN in `/imagine/`'s Miller-columns host, same as
every sibling (`topic/`, `mvp/`, `decisions/`) — no page grid, `wide` is
meaningless, `width: "large"` caps the pane at ~535px at 1280 and ~1152px at 3440.
The wall is `.grid.auto` with `--column: 20rem` — a REM floor, because an `em`
floor inside a fixed-width column scales with the *column's* own clamp, not the
viewport (`layout` skill, the columns-host warning). Measured: 2 cards per row at
1920 (screenshot below), 1 per row at 1400 — the wall degrades to a single
column rather than overflowing, which is the "floor and ceiling" the layout skill
asks for.

## ux/Auth — consumed, not edited; one gap found

`Auth.login()`/`.signup()` always draw the social row and the "Forgot password?"
link; there is no config word to hide either, only the seams `social_row()` and
`password_field()` already document. The email-only cards (signup, sign-in) would
otherwise show two "Continue with Google/GitHub" buttons that silently no-op
(base `Auth.social()` just logs to console) — worse than not showing them, so
[`flows.js`](/imagine/platform/workflows/flows.js)'s `FlowAuth` overrides
`social_row()` behind one instance flag, `hideSocial`, passed in the
**constructor** (`new FlowAuth({ view, hideSocial: true })`), not set as a
property after — `Auth`'s own constructor builds the form, social row included,
synchronously, before any line after `new FlowAuth(…)` can run. Setting it after
was the first version of this file and it shipped the social row anyway; caught
by reading the render order back, not by a screenshot.

## Cut

- **No back/retry buttons inside a flow.** Every card is one straight line
  forward, on purpose — the click count is exactly what it says, with nothing to
  disambiguate ("does clicking back un-count a click?"). A reader can still use
  the box's own breadcrumb urls to explore; the counter simply keeps counting
  whatever they click, which is correct either way.
- **No "which Google account" chooser, no real popup/redirect.** The brief rules
  out real OAuth outright; the mocked consent screen is the one page standing in
  for the whole redirect round-trip.
- **The reset screen is not hidden.** ux/Auth's "Forgot password?" link still
  works on the email cards (it is real Auth behavior, not a bug), it just does
  not advance this wall's counter — see "click counts" above.
