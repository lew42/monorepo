import View, { div, p, h2, a, label, input, button, form, icon } from "../../core/View/View.js";
import { css } from "../../ui/parts.js";

/* One class, one call. `.measure` (framework.css) caps and centres the card — no
 * width rule needed. `:user-invalid` (native, post-interaction) carries the red
 * border; JS only adds what CSS cannot say, the message itself — scoped to this
 * card so it never bleeds into an unrelated form sharing the page. */
css(`@layer theme {
	.ux-auth-card input:user-invalid { border-color: var(--error); }
}`);

/**
 * Auth — login, signup, reset and a social row as ONE class. View switching
 * ("Create account" <-> "Sign in" <-> "Forgot?") is the behavior that earns it;
 * each screen is a method, so a subclass overrides one without forking the rest.
 *
 *   new Auth()                    // starts on "login", appends its own card
 *   new Auth({ view: "signup" })
 *
 * Extend by overriding a seam: `password_field()`, `login_title()`, `social()`,
 * `commit()` — MagicAuth.js is the worked example. doc/decisions.md.
 */
export class Auth extends View {

	initialize(){
		this.view ??= "login";
		this.ac("ux-auth-card measure surface pad").style("--measure", "26em");
		this.append(() => this.draw());
	}

	draw(){ return this[this.view](); }

	// The behavior: throw the screen away, build the next one. No step, no history.
	switch(view){
		this.view = view;
		this.empty(() => this.draw());
	}

	// ---- screens --------------------------------------------------------

	login(){
		const $form = form.c("flex v gap", () => {
			h2(this.login_title());
			this.$error = div();
			this.field("Email", "email", "email");
			this.password_field();
			button.c("prim", this.login_cta()).attr("type", "submit");
			this.switcher(["Forgot password?", "reset"], ["Create account", "signup"]);
			this.social_row();
		}).attr("novalidate", "");

		return $form.on("submit", this.on_submit($form, "login"));
	}

	signup(){
		const $form = form.c("flex v gap", () => {
			h2("Create account");
			this.$error = div();
			this.field("Name", "text", "name");
			this.field("Email", "email", "email");
			this.field("Password", "password", "password", { minlength: "8" });
			button.c("prim", "Create account").attr("type", "submit");
			this.switcher(["Sign in instead", "login"]);
			this.social_row();
		}).attr("novalidate", "");

		return $form.on("submit", this.on_submit($form, "signup"));
	}

	reset(){
		const $form = form.c("flex v gap", () => {
			h2("Reset password");
			p.c("muted", "We will email a link to reset it.");
			this.$error = div();
			this.field("Email", "email", "email");
			button.c("prim", "Send reset link").attr("type", "submit");
			this.switcher(["Sign in instead", "login"]);
		}).attr("novalidate", "");

		return $form.on("submit", this.on_submit($form, "reset"));
	}

	// Seams a named subclass overrides to swap the password step for another —
	// MagicAuth.js replaces all three with a link flow, nothing else moves.
	login_title(){ return "Sign in"; }
	login_cta(){ return "Sign in"; }
	password_field(){ return this.field("Password", "password", "password"); }

	// ---- a field, the ui/field template verbatim -------------------------

	field(text, type, name, attrs = {}){
		let $input;
		label.c("flex v gap", () => {
			div.c("h4", text);
			$input = input().attr("type", type).attr("name", name).attr("required", "");
			for (const k in attrs) $input.attr(k, attrs[k]);
		}).style("--gap", "0.4em");
		return $input;
	}

	// ---- validation: :user-invalid carries the border, this carries the words ----

	// `novalidate` lets every submit reach here; native validity still computes,
	// so `:invalid` and `:user-invalid` both read true without the browser's own
	// blocking + bubble UI taking over.
	on_submit($form, view){
		return e => {
			e.preventDefault();
			const bad = $form.el.querySelector(":invalid");

			if (bad){
				this.fail(bad.validationMessage);
				bad.focus();
				return;
			}

			this.$error.empty();
			this.commit(view, new FormData($form.el));
		};
	}

	// Seam: no request wired here, no fake success either. A subclass sends it
	// and calls this.done()/this.fail() from its own response handler.
	commit(view, data){
		this.done(this.constructor.confirmations[view] ?? "Done.");
	}

	done(msg){ this.$error?.empty(() => this.alert_box("accent", "check_circle", msg)); }
	fail(msg){ this.$error?.empty(() => this.alert_box("error", "error_outline", msg)); }

	// Named alert_box, not alert — a bare `alert` on a View is one letter from
	// shadowing `window.alert`, the exact trap ui/alert/alert.js's own page names.
	alert_box(tone, glyph, msg){
		return div.c(`ui-alert surface pad flex gap ${tone}`, () => {
			icon(glyph);
			p(msg).ac("flex-1");
		});
	}

	// ---- switching between screens ---------------------------------------

	// href="#" only to keep it in the tab order and Enter-activatable — an <a>
	// with no href is not a link, not focusable. preventDefault eats the jump.
	switcher(...links){
		return div.c("flex gap wrap", () => {
			links.forEach(([text, view]) =>
				a(text).href("#").click(e => { e.preventDefault(); this.switch(view); }));
		}).style("--gap", "1em");
	}

	// ---- social row: markup, no fake OAuth --------------------------------

	social_row(){
		return div.c("flex gap wrap", () => {
			this.constructor.providers.forEach(p => this.social_button(p));
		}).style("--gap", "0.4em");
	}

	social_button(provider){
		return button(`Continue with ${provider}`).attr("type", "button")
			.attr("data-provider", provider.toLowerCase())
			.click(() => this.social(provider.toLowerCase()));
	}

	// Seam: a subclass opens the real popup/redirect. Base does nothing that
	// looks like success — there is no OAuth here to fake.
	social(provider){
		console.info(`Auth.social("${provider}") has no listener yet - a subclass wires it.`);
	}
}

Auth.providers = ["Google", "GitHub"];
Auth.confirmations = { login: "Signed in.", signup: "Account created.", reset: "If that address has an account, a reset link is on its way." };

export default Auth;
