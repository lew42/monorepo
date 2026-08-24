import { Auth } from "./Auth.js";

/**
 * MagicAuth — the named-extension proof: a link instead of a password. Four
 * seams override, nothing else moves — signup, reset, switching, the social
 * row and validation are all still Auth's.
 *
 *   new MagicAuth()
 */
export class MagicAuth extends Auth {

	login_title(){ return "Sign in with a link"; }
	login_cta(){ return "Email me a link"; }

	// The seam Auth.login() always calls; returning nothing renders nothing.
	password_field(){ return null; }
}

MagicAuth.confirmations = { ...Auth.confirmations, login: "Check your email for a link." };

export default MagicAuth;
