import View, { div, p, video } from "../../core/View/View.js";
import { css } from "../../ui/parts.js";
import { GoogleButton } from "./GoogleButton.js";

/* A portrait frame (9:16) that never stretches: on a phone it is the screen's width, on a desktop it is
 * centred at a sensible height. The scrim is a soft bottom ramp so the white line and the button read on
 * any still; the overlay sits at the bottom, where a thumb is. */
css(`@layer site {
	.ux-auth-video {
		--h: min(82vh, 56rem);
		position: relative; overflow: hidden; margin-inline: auto;
		aspect-ratio: 9 / 16; width: min(100%, calc(var(--h) * 9 / 16));
		background: #111; border-radius: var(--radius);
	}
	.ux-auth-video-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
	.ux-auth-video-scrim { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.38) 28%, rgba(0,0,0,0) 55%); }
	.ux-auth-video-over {
		position: absolute; inset-inline: 0; bottom: 0; display: flex; flex-direction: column; gap: 0.9em;
		padding: 1.25em 1.25em max(1.5em, env(safe-area-inset-bottom));
	}
	.ux-auth-video-line { margin: 0; color: #fff; font-size: 1.15em; font-weight: 600; line-height: 1.3; text-align: center; text-shadow: 0 1px 6px rgba(0,0,0,0.55); }
}`);

/**
 * VideoSignIn: a talking-head video with ONE button over it, "Sign in with Google". The owner found whole
 * forms over video distracting, so the overlay is a single button and (if it reads well) the host's one line.
 *
 *   new VideoSignIn({ poster: "/…/V01.jpg", line: "Sign in and I will save your place." })
 *   new VideoSignIn({ poster, src: "/…/host.mp4" })    // a clip drops in later; the poster shows until it plays
 *
 * It is a real `<video>`: with no `src` it shows the poster, with one it plays muted and looped. The
 * button is a GoogleButton (dark, mock unless a client id is set), and its `signin` event bubbles out of this view.
 */
export class VideoSignIn extends View {

	initialize(){
		this.label ??= GoogleButton.labels[0];
		this.ac("ux-auth-video");
		this.append(() => this.draw());
	}

	draw(){
		this.$media = video.c("ux-auth-video-media").attr("poster", this.poster).attr("playsinline", "").attr("preload", this.src ? "auto" : "none").attr("aria-label", this.alt ?? "");
		this.$media.el.muted = true;
		this.$media.el.loop = true;
		if (this.src) this.$media.attr("src", this.src).attr("autoplay", "");
		div.c("ux-auth-video-scrim");
		div.c("ux-auth-video-over size-large", () => {
			if (this.line) p.c("ux-auth-video-line", this.line);
			this.$button = new GoogleButton({ theme: "dark", on_video: true, client_id: this.client_id, label: this.label });
		});
	}
}

export default VideoSignIn;
