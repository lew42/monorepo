import { Page, div, p, span, button, icon } from "/app.js";
import { Auth } from "/framework/ux/Auth/Auth.js";

/**
 * flows.js — the five little in-memory Page trees the wall (page.js) puts inside
 * a `demo.app()` box, one per card. Nothing here is fetched or saved: every tree
 * lives only in memory, exactly like `ext/demo/sample.js`'s "Web" tree.
 *
 * `FlowAuth` is the one seam ux/Auth asks a caller to use: base `Auth.commit()`
 * always shows a canned "Signed in." banner and stays put — real work belongs to
 * a subclass (`ux/Auth/doc/decisions.md`). Ours is the demo's version of real
 * work: the click that submits the form is also the click that reaches
 * `/logged-in/`, so the wall's click counter (page.js) can count it.
 *
 * ⚠ ux/Auth gap found while reusing it (logged, not fixed — outside this task's
 * fence): `login()`/`signup()` always draw the social row and the "Forgot
 * password?" link; there is no config word to hide either one, only a seam to
 * override. `hideSocial` below is that override for the email-only cards — a
 * button that silently no-ops (base `Auth.social()` just logs to console) is
 * worse than a form that doesn't show it.
 */
class FlowAuth extends Auth {
	social_row(){ return this.hideSocial ? null : super.social_row(); }

	// Only signup/login mean "logged in" — a password-reset request (`view ===
	// "reset"`) still shows Auth's own confirmation and must NOT advance the
	// flow, or clicking "Forgot password?" would fake a login.
	commit(view, data){
		super.commit(view, data);
		if (view === "signup" || view === "login") this.next?.();
	}
}

// Auth's own card is `--measure: 26em` — right for a solo demo, too wide for a
// wall tile. One instance-level override (the css skill: a token override is
// exactly what an inline `.style()` is for).
const CARD = "18em";

// The state every flow ends on. `via` is the one line that says how this
// particular click got here — the only thing that differs card to card.
function loggedIn(via){
	return {
		content(){
			div.c("flex gap", () => { icon("check_circle"); span.c("h4", "Signed in"); });
			p.c("muted", `Reached by ${via}. This demo never saves anything.`);
		},
	};
}

// A mocked OAuth consent screen — the one page in the tree standing in for the
// real provider redirect. No network call, said again on the card's own fold
// (page.js) where the REAL request is shown instead.
function consent(provider){
	return {
		content(){
			div.c("surface pad flex v gap", () => {
				div.c("flex gap", () => { icon("lock"); span.c("h4", `Continue to ${provider}`); });
				p.c("muted", `Acme wants your name, email and profile photo. Mocked — nothing is sent to ${provider}.`);
				div.c("flex gap", () => {
					button("Cancel").click(() => this.app.go(this.parent.url));
					button.c("prim", "Allow").click(() => this.app.go(this.parent.url + "logged-in/"));
				});
			});
		},
	};
}

// (a) landing -> sign up with email -> logged in
export function emailSignupTree(){
	return new Page({
		title: "Acme",
		content(){
			p("A small email + password sign-up.");
			button.c("prim", "Create account").click(() => this.app.go(this.url + "sign-up/"));
		},
		children: {
			"Sign up": {
				content(){
					// `hideSocial` MUST arrive in the constructor, not as a property set
					// after: Auth's own constructor builds the form (social row included)
					// synchronously, before any line after `new FlowAuth(...)` can run —
					// found the hard way, the code skill's "no DOM after an await" trap's
					// sibling for plain instance state, not just captured DOM.
					const auth = new FlowAuth({ view: "signup", hideSocial: true }).style("--measure", CARD);
					auth.next = () => this.app.go(this.parent.url + "logged-in/");
				},
			},
			"Logged in": loggedIn("email + password"),
		},
	});
}

// (b) landing -> Google sign-in (mocked consent) -> logged in
export function googleTree(){
	return new Page({
		title: "Acme",
		content(){
			p("Sign in with a Google account.");
			button.c("prim", "Continue with Google").click(() => this.app.go(this.url + "consent/"));
		},
		children: { Consent: consent("Google"), "Logged in": loggedIn("Google") },
	});
}

// (c) landing -> GitHub sign-in (mocked consent) -> logged in
export function githubTree(){
	return new Page({
		title: "Acme",
		content(){
			p("Sign in with a GitHub account.");
			button.c("prim", "Continue with GitHub").click(() => this.app.go(this.url + "consent/"));
		},
		children: { Consent: consent("GitHub"), "Logged in": loggedIn("GitHub") },
	});
}

// (d) a returning user: landing -> sign in -> logged in
export function signinTree(){
	return new Page({
		title: "Acme",
		content(){
			p("A returning user, signing back in.");
			button.c("prim", "Sign in").click(() => this.app.go(this.url + "sign-in/"));
		},
		children: {
			"Sign in": {
				content(){
					const auth = new FlowAuth({ view: "login", hideSocial: true }).style("--measure", CARD);
					auth.next = () => this.app.go(this.parent.url + "logged-in/");
				},
			},
			"Logged in": loggedIn("email + password"),
		},
	});
}

// (e) sign out — starts already signed in (0 clicks), one click to leave.
export function signoutTree(){
	return new Page({
		title: "Acme",
		content(){
			div.c("flex gap", () => { icon("check_circle"); span.c("h4", "Signed in as demo@acme.test"); });
			button("Sign out").click(() => this.app.go(this.url + "signed-out/"));
		},
		children: {
			"Signed out": {
				content(){
					div.c("flex gap", () => { icon("logout"); span.c("h4", "Signed out"); });
					p.c("muted", "Session cleared. This demo never saved anything to begin with.");
				},
			},
		},
	});
}

/**
 * gravatarUrl(email) — the real Gravatar url for an email, hashed IN THE
 * BROWSER with WebCrypto (no server, no lookup library). `d=identicon` means
 * it always renders, even for an email with no account.
 */
export async function gravatarUrl(email){
	const bytes = new TextEncoder().encode(email.trim().toLowerCase());
	const hash = await crypto.subtle.digest("SHA-256", bytes);
	const hex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
	return `https://www.gravatar.com/avatar/${hex}?d=identicon`;
}

// A stand-in for "the picture a provider's userinfo call would have returned"
// — an inline SVG data url, so the card needs no fetch and no real login to
// show something img-shaped next to the real Gravatar image beside it.
export const MOCK_PROVIDER_AVATAR = "data:image/svg+xml," + encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">'
	+ '<rect width="64" height="64" rx="32" fill="#6b7280"/>'
	+ '<text x="32" y="41" font-size="24" text-anchor="middle" fill="#fff" font-family="sans-serif">DA</text>'
	+ "</svg>",
);

