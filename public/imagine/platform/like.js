import { button, span } from "/app.js";

/* like(url) — one button, one D1 row. The client half of the slice.

   `url` is the key and the only argument: /notes/auth/ §4 stores a url, not a
   page id, so `like(this.url)` on two different pages is two independent
   counts with nothing central listing them.

   IT RENDERS WITHOUT THE API. That is the acceptance test the whole platform
   rests on ([mvp](/imagine/platform/mvp/) step 4: turn the Worker off, browse
   the site, every page still renders) — so every fetch here has a `.catch`,
   and a failed one leaves a disabled button that says so instead of a page
   that throws. Open this page on plain `node server.js`, with no worker
   anywhere, and it is a dash.

   NO RE-RENDER, and this is the interesting part (/notes/auth/ §7). The button
   holds its own view and calls `.text()` on it. There is no state, no diff, no
   key, no dependency array — and because nothing re-renders, a like cannot
   disturb anything else on the page.

   ⚠ Every DOM call below is inside a callback ON `$btn`, never after an
   `await` in the captured function: the captor is restored at the first
   `await`, so a factory call textually after one lands in the wrong place and
   nothing throws (the sketch in /notes/auth/ §7 has exactly this bug). */

const HEART = { mine: "♥", not: "♡" };

export function like(url){
	return button.c("platform-like", $btn => {
		const draw = state => {
			$btn.text(`${state.mine ? HEART.mine : HEART.not} ${state.count}`);
			$btn.el.disabled = !state.you;
			$btn.el.title = state.you
				? `You are signed in as ${state.you} — click to ${state.mine ? "un" : ""}like this page`
				: "Sign in to like this page";
		};

		const offline = () => {
			$btn.text(`${HEART.not} —`);
			$btn.el.disabled = true;
			$btn.el.title = "No API here — the page renders anyway, which is the point";
		};

		const ask = (options) => fetch(`/api/likes?url=${encodeURIComponent(url)}`, options)
			.then(r => r.ok ? r.json() : Promise.reject(r.status))
			.then(draw)
			.catch(offline);

		$btn.text(`${HEART.not} …`);
		$btn.el.disabled = true;
		ask();

		$btn.click(() => ask({ method: "POST" }));
	});
}

/* who() — the handle, in words. /notes/auth/ §9's "if only one thing gets built:
   sign-in, and a handle in the corner", which is also the only way a screenshot
   of a like can show WHOSE it is.

   Same rule as above: no API, no throw — it just says nobody is signed in,
   which is the truth from the page's point of view either way. */
export function who(){
	return span.c("platform-who muted", $who => {
		fetch("/api/me")
			.then(r => r.ok ? r.json() : Promise.reject(r.status))
			.then(me => $who.text(me.anonymous
				? "Not signed in — the like above is somebody else's."
				: `Signed in as ${me.handle} (${me.roles[0]}).`))
			.catch(() => $who.text("No API here — the page renders anyway, which is the point."));
	});
}
