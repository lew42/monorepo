import View, { p, button, span } from "../../core/View/View.js";
import { css } from "../../ui/parts.js";

/* Google's own branding (developers.google.com/identity/branding-guidelines): light = white, #747775
 * stroke, #1F1F1F text; dark = #131314, #8E918F stroke, #E3E3E3 text. The control grammar supplies the
 * box (height, corner, size word); these rules recolour it and nothing else. Never an alpha fill: the
 * coloured G is only allowed on a solid white or dark button. */
css(`@layer site {
	.ux-auth-google { display: flex; flex-direction: column; gap: 0.5em; align-items: stretch; }
	.ux-auth-google-btn {
		display: flex; align-items: center; justify-content: center; gap: 0.7em;
		font-weight: 500; text-transform: none; letter-spacing: 0;
		background-color: #fff; color: #1f1f1f; border: 1px solid #747775; box-shadow: none;
	}
	.ux-auth-google-dark .ux-auth-google-btn { background-color: #131314; color: #e3e3e3; border-color: #8e918f; }
	.ux-auth-google-btn:hover { box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
	.ux-auth-google-g { display: inline-flex; width: 1.15em; height: 1.15em; flex: none; }
	.ux-auth-google-g svg { width: 100%; height: 100%; display: block; }
	.ux-auth-google-note:empty { display: none; }
	.ux-auth-google-note { margin: 0; text-align: center; font-size: 0.8em; }
	.ux-auth-google-note.ux-auth-google-bad { color: var(--error); }
	.ux-auth-google-on-video .ux-auth-google-note { color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
}`);

// Google's four-colour mark, as supplied in its sign-in docs. Never recoloured, never alone.
const G_MARK = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

let gsi;   // /app/app.js loads Google Identity Services the same way: one script, once

/**
 * GoogleButton: the Google sign-in button, in Google's own branding.
 *
 *   new GoogleButton()                                     // light; "Continue with Google"
 *   new GoogleButton({ theme: "dark", label: "Sign in with Google", on_video: true })
 *   new GoogleButton().on("signin", e => e.detail.user)    // detail: { user, mock }
 *
 * A client id decides what it is. Given one (`client_id: "…"`, or the one `/api/config` answers, as
 * /app/ reads it), Google's own SDK draws the button and the ID token goes to `/api/auth/google`
 * (verified by worker/google.js). With none, the button is a MOCK: it fires `signin` with a fake user
 * and says so on screen. `client_id: ""` forces the mock; leave it out to look the id up.
 * Real sign-in is /app/'s; this is the same call, not a second auth system. readme.md.
 */
export class GoogleButton extends View {

	initialize(){
		this.theme ??= "light";
		this.label ??= GoogleButton.labels[2];
		this.ac("ux-auth-google", `ux-auth-google-${this.theme}`);
		if (this.on_video) this.ac("ux-auth-google-on-video");
		this.append(() => this.draw());
		if (this.client_id === undefined) this.look_up();
		else if (this.client_id) this.go_real(this.client_id);
	}

	draw(){
		this.$button = this.mock_button();
		this.$note = p.c("ux-auth-google-note", "");
	}

	mock_button(){
		return button.c("ux-auth-google-btn", () => {
			span.c("ux-auth-google-g").html_unsafe(G_MARK);
			span(this.label);
		}).attr("type", "button").click(() => this.signed_in(GoogleButton.fake_user, true));
	}

	// ---- mock vs real ----------------------------------------------------

	async look_up(){
		const id = await GoogleButton.config_client_id();
		if (id) this.go_real(id);
	}

	// The same two calls /app/app.js makes: initialize, then renderButton. Raw DOM after the awaits, no capturing.
	async go_real(client_id){
		try {
			await GoogleButton.load_gsi();
			google.accounts.id.initialize({ client_id, auto_select: false, use_fedcm_for_button: true, callback: res => this.credential(res.credential) });
			const slot = document.createElement("div");
			google.accounts.id.renderButton(slot, {
				theme: this.theme === "dark" ? "filled_black" : "outline", size: "large", shape: "rectangular", logo_alignment: "left",
				text: GoogleButton.gsi_text[this.label] ?? "continue_with", width: Math.min(400, Math.max(200, this.el.offsetWidth || 320))
			});
			this.$button.el.replaceWith(slot);
			this.real = true;
		} catch (err){
			this.say(err.message, true);
		}
	}

	async credential(credential){
		try {
			const res = await fetch("/api/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential }) });
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
			this.signed_in(data.user, false);
		} catch (err){
			this.say(err.message, true);
		}
	}

	// ---- the event and the words on screen ------------------------------

	signed_in(user, mock){
		this.user = user;
		this.say(mock ? `Mock sign-in as ${user.name}: no Google client id is set, so no real account was used.` : `Signed in as ${user.name}.`);
		this.el.dispatchEvent(new CustomEvent("signin", { detail: { user, mock }, bubbles: true }));
	}

	say(msg, bad = false){
		this.$note.text(msg);
		this.$note.rc("ux-auth-google-bad");
		if (bad) this.$note.ac("ux-auth-google-bad");
	}

	static async config_client_id(){
		try {
			const res = await fetch("/api/config");
			return (await res.json()).client_id || "";   // a static host answers with the page itself: not JSON, so no id
		} catch { return ""; }
	}

	static load_gsi(){
		return gsi ??= new Promise((ok, no) => {
			const s = document.createElement("script");
			s.src = "https://accounts.google.com/gsi/client";
			s.onload = ok; s.onerror = () => { gsi = null; no(new Error("could not load Google sign-in (offline?)")); };
			document.head.append(s);
		});
	}
}

// Google allows exactly these three wordings; the GIS `text` value for each.
GoogleButton.labels = ["Sign in with Google", "Sign up with Google", "Continue with Google"];
GoogleButton.gsi_text = { "Sign in with Google": "signin_with", "Sign up with Google": "signup_with", "Continue with Google": "continue_with" };
GoogleButton.fake_user = { name: "Demo Person", handle: "demo", email: "demo@example.com", avatar_url: "" };

export default GoogleButton;
