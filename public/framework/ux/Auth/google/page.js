import { Doc, md, div, p } from "/app.js";
import { GoogleButton } from "../GoogleButton.js";
import { VideoSignIn } from "../VideoSignIn.js";
import { SignIn } from "../SignIn.js";

const still = name => new URL(name, import.meta.url).pathname;
const host = () => new VideoSignIn({ poster: still("V01.jpg"), alt: "A woman talking to the camera in a bright kitchen", line: "Hi! Sign in with one tap and I will pick up where you left off." });

export default new Doc({
	meta: import.meta,
	title: "Sign in with Google",
	description: "A talking-head video with one Google button over it, the button's variants, and the quick sign-in view.",
	icon: "login",

	files: "page.js V01.jpg ../GoogleButton.js ../VideoSignIn.js ../SignIn.js",

	content(){
		let $last;

		div.c("flex auto gap", () => {

			div.c("flex v gap", () => {
				host();
				p.c("muted", "A real `<video>` with the still as its poster: a clip drops in with `src` and the button stays. One button over a soft bottom scrim, where a thumb is.");
			});

			div.c("flex v gap", () => {
				md("## The button");
				md("Google's own branding: white or dark, the coloured G, one of three wordings. A mock until a client id is set (below).");
				[["light", "wash"], ["dark", "bg-dark"]].forEach(([theme, ground]) => {
					div.c(`flex v gap pad ${ground}`, () => {
						GoogleButton.labels.forEach(label => new GoogleButton({ theme, label, client_id: "" }));
					});
				});
				$last = p.c("muted", "No sign-in event yet. Press a button.");
			}).on("signin", e => $last.text(`signin event: ${e.detail.user.name} (${e.detail.mock ? "mock" : "real"})`));

			div.c("flex v gap", () => {
				md("## The sign-in view");
				md("`SignIn extends Auth`: Google first, then Apple and an email link. \"Use a password instead\" is one tap down, and it is Auth's own login screen.");
				div.c("wash pad", () => new SignIn({ client_id: "" }));
			});

		}).ac("bleed").style("--column", "22em");

		md("## Mock or real");
		md("With no Google client id the button is a **mock**: a press fires `signin` with a fake user and the page says so under the button. With one (`GOOGLE_CLIENT_ID` on the Worker, which `/api/config` hands to the page, exactly as [/app/](/app/) reads it) Google's own SDK draws the button and the ID token goes to `/api/auth/google`. It is the same call, not a second auth system.");
		md("Back to [ux/Auth](/framework/ux/Auth/).");

		md.details(import.meta, "../readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad wash", host)); },
});
