import { div } from "/framework/core/View/View.js";

/* THE DEBUG TAB (was the Dictation tab until 2026-10-24, which embedded the playground and its own second mic):
   dictation layer by layer, live, read from the chat's own mic. Routed as <path>/ai/debug/ (AIPage.VIEWS);
   ?drawer=dictation and <path>/ai/dictation/ still open it. Imported only when the tab opens. ux/Dictate/doc/debug-tab.md */
export default function debug(){
	div.c("drawer-debug", $d => {
		import("/framework/ux/Dictate/DictateDebug.js")
			.then(m => $d.append(() => { new m.default(); }))
			.catch(e => $d.append(() => { div.c("muted", "The Debug tab could not load: " + e.message); }));
	});
}
