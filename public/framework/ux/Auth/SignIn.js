import { div, p, h2, a, button, form } from "../../core/View/View.js";
import { Auth } from "./Auth.js";
import { GoogleButton } from "./GoogleButton.js";

/**
 * SignIn: the quick sign-in view. Google first, then Apple, then an email link, and "Use a
 * password instead" one tap down. Auth's own login screen (the password one) is still here as
 * `password()`; signup, reset, validation and the switching are all still Auth's.
 *
 *   new SignIn()
 *   new SignIn({ client_id: "" })    // forces the Google mock; leave it out to use /api/config
 *   new SignIn().on("signin", e => e.detail.user)
 *
 * Seams it overrides: `login()` (the first screen), `social_button()` (Google is a GoogleButton),
 * `social()` (Apple is a mock), and the confirmation copy.
 */
export class SignIn extends Auth {

	login(){
		const $form = form.c("flex v gap", () => {
			h2(this.login_title());
			this.$error = div();
			this.social_row();
			p.c("muted", "or use your email");
			this.field("Email", "email", "email");
			button.c("prim", "Email me a link").attr("type", "submit");
			div.c("flex gap wrap", () => a("Use a password instead").href("#").click(e => { e.preventDefault(); this.switch("password"); }));
		}).attr("novalidate", "");

		return $form.on("submit", this.on_submit($form, "link"));
	}

	// Auth's own login screen: email and password, the social row, the switcher.
	password(){ return super.login(); }

	social_row(){
		return div.c("flex v gap", () => {
			this.constructor.providers.forEach(provider => this.social_button(provider));
		}).style("--gap", "0.5em");
	}

	social_button(provider){
		if (provider !== "Google") return super.social_button(provider).ac(provider === "Apple" ? "bg" : "");
		return new GoogleButton({ client_id: this.client_id, label: GoogleButton.labels[0] });
	}

	social(provider){
		const name = provider[0].toUpperCase() + provider.slice(1);
		this.done(`${name} sign-in is a mock here: no ${name} client is set.`);
	}
}

SignIn.providers = ["Google", "Apple"];
SignIn.confirmations = { ...Auth.confirmations, link: "Check your email for a link." };

export default SignIn;
