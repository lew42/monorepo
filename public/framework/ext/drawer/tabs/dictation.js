import { div, small, a } from "/framework/core/View/View.js";

/* THE DICTATION TAB — the dictation playground (ux/Dictate/playground/), embedded.
   Its module keeps ONE shared instance (`pg`), so words said here are the same words
   the playground's own page shows. Imported only when this tab opens: it brings the
   microphone, the audio meter and its own stylesheet. */
const URL = "/framework/ux/Dictate/playground/";

export default function dictation(){
	div.c("drawer-dictation flex v", $d => {
		a.c("page-link", "Open the playground as a page →").href(URL);
		import(URL + "Playground.js")
			.then(m => $d.append(() => { m.pg.widget(); }))
			.catch(() => $d.append(() => {
				small.c("drawer-wait muted", "The dictation playground is not on this server yet.");
			}));
	});
}
