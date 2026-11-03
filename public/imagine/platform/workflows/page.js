import { Page, div, p, h3, span, details, summary, code, img, demo, md } from "/app.js";
import {
	emailSignupTree, googleTree, githubTree, signinTree, signoutTree,
	gravatarUrl, MOCK_PROVIDER_AVATAR,
} from "./flows.js";

/* Container: a COLUMN in /imagine/'s columns host (three levels up — same as every
   other /imagine/platform/ child, `topic/page.js` names the same ancestor). No page
   grid here, so `wide` means nothing and only `bleed` reaches an edge. Size: `large`
   (28-64em), the word every sibling column already wears, so the row still reads as
   one program. Own layout: one intro line, then a `.grid.auto` wall — `--column` set
   in REM (20rem) rather than em, because inside a fixed-width column an em floor
   scales with the COLUMN's own clamp, not the viewport (layout skill, Q3's
   columns-host warning: a `14em` floor measured 182px at 400 for exactly this
   reason). Regions: one. Preview: the default card.

   WHY SIX SMALL LIVE BOXES, NOT SIX PARAGRAPHS: "I know we have demo apps where we
   can see the URL changing and click through different workflows. We really need to
   lean into that system to document these systems." Each card is a real
   `demo.app()` — an in-memory Page tree, a real url bar, real clicks — not a
   screenshot and not a description. Nothing here is fetched or saved; the click
   counter under each title counts the clicks a real visitor makes, live. */

// The counter every card wears: 0 before the first click, "N clicks so far" while
// mid-flow, "N clicks to <goal>" the moment the box shows the goal page. Wired
// AFTER `demo.app()` returns on purpose — its own first `show()` (the landing
// page) already ran during construction with no `.shown` handler attached yet, so
// it costs nothing: only a REAL click ever reaches this hook (doc/decisions.md).
function wireCounter(app, $n, goalName, goalText){
	let n = 0;
	app.shown = page => {
		n++;
		$n.text(page.name === goalName
			? `${n} click${n === 1 ? "" : "s"} to ${goalText}`
			: `${n} click${n === 1 ? "" : "s"} so far`);
	};
}

function card(title, build, goalName, goalText, drawFold){
	return div.c("surface pad flex v gap", () => {
		h3(title);
		const $n = span.c("muted", "0 clicks so far");
		wireCounter(demo.app(build()), $n, goalName, goalText);
		drawFold?.();
	});
}

// The real request the raw API takes, for the card whose consent screen mocks it.
// Read from each provider's own documented OAuth endpoints — never fetched here.
function fold(caption, text){
	return details(() => {
		summary(caption);
		code.lang("http", text);
		p.c("muted", "Nothing on this page calls the provider — this is the request its documented API takes, not a live one.");
	});
}

const GOOGLE_REQUEST = `GET https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=<your_client_id>
  &redirect_uri=https://acme.example/auth/callback
  &response_type=code
  &scope=openid%20email%20profile
  &state=<random>
  &code_challenge=<S256 of a random verifier>
  &code_challenge_method=S256

POST https://oauth2.googleapis.com/token
  code=<from the redirect>&client_id=...&client_secret=...
  &redirect_uri=...&grant_type=authorization_code&code_verifier=...

GET https://openidconnect.googleapis.com/v1/userinfo
  Authorization: Bearer <access_token>
  -> { sub, name, email, picture }   -- picture IS the avatar url`;

const GITHUB_REQUEST = `GET https://github.com/login/oauth/authorize
  ?client_id=<your_client_id>
  &redirect_uri=https://acme.example/auth/callback
  &scope=read:user%20user:email
  &state=<random>
  &code_challenge=<S256 of a random verifier>
  &code_challenge_method=S256

POST https://github.com/login/oauth/access_token
  Accept: application/json
  client_id=...&client_secret=...&code=...&redirect_uri=...&code_verifier=...

GET https://api.github.com/user
  Authorization: Bearer <access_token>
  -> { login, id, avatar_url, name, email }   -- avatar_url IS the avatar`;

// Deliverable 2 — the sixth card: a provider's photo (mocked; there is no real
// login here to fetch one from) beside a real Gravatar, computed in the browser.
function avatarCard(){
	return div.c("surface pad flex v gap", () => {
		h3("Avatar, two ways");
		div.c("flex gap wrap", () => {
			div.c("flex v gap", () => {
				span.c("h4 muted", "Provider picture");
				img().attr("src", MOCK_PROVIDER_AVATAR).attr("width", "64").attr("height", "64")
					.attr("alt", "A mocked provider avatar — no real request was made");
				p.c("muted", "Mocked `userinfo.picture` / `avatar_url` — see the folds above for the real call.");
			});
			div.c("flex v gap", () => {
				span.c("h4 muted", "Gravatar");
				const $img = img().attr("width", "64").attr("height", "64")
					.attr("alt", "The real Gravatar for demo@acme.test");
				gravatarUrl("demo@acme.test").then(url => $img.attr("src", url));
				p.c("muted", "Hashed with `crypto.subtle` right here, `d=identicon` — always renders.");
			});
		});
		p.c("muted", "One line: the provider photo wins once a real login exists — it is the person's actual picture. Gravatar wins before that: no OAuth, no consent screen, works for any email today, and degrades to a generated identicon instead of a broken image.");
	});
}

export default new Page({
	meta: import.meta,
	title: "Workflows",
	description: "Every sign-up and sign-in flow as a demo app you can click through — one wall, a click counter on each card.",
	icon: "grid_view",
	width: "large",

	content(){
		p(`Six sign-up and sign-in workflows, as demo apps you can click through — landing page to
logged in. Each card counts your clicks live; password reset is deliberately not one of the six
(the owner ruled it out for this wall).`);

		div.c("grid auto gap", () => {
			card("Sign up with email", emailSignupTree, "logged-in", "logged in");
			card("Google sign-in", googleTree, "logged-in", "logged in", () => fold("The real request (Google) — not called here", GOOGLE_REQUEST));
			card("GitHub sign-in", githubTree, "logged-in", "logged in", () => fold("The real request (GitHub) — not called here", GITHUB_REQUEST));
			card("Returning user: sign in", signinTree, "logged-in", "logged in");
			card("Sign out", signoutTree, "signed-out", "signed out");
			avatarCard();
		}).style("--column", "20rem");

		md(`## The provider decision

Raw GitHub + Google OAuth, not a third-party auth provider (Auth0, Clerk, Supabase) — matching
[\`decisions/identity.md\`](/imagine/platform/decisions/identity.md)'s own ruling. The owner's own
lean decided it: *"having the raw APIs is almost always better than an aggregate API that shields
you from the underlying API."* A vendor buys speed to many providers, MFA and compliance on day
one; it costs a second domain in the login flow and a webhook-sync problem to keep a database's
own profiles honest, and price does not favor it at this scale (Clerk and Supabase are both free
or near it under 50-100k users). Nothing here needs many providers or same-day compliance, so the
raw APIs win — the exact two folds above are what "raw" costs: three real requests, read and
shown, never called.

Detail, the click count each flow actually took, and the endpoints cited:
[\`doc/decisions.md\`](/imagine/platform/workflows/doc/decisions.md).`);
	},
});
