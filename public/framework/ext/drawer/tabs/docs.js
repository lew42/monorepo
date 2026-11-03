import { div } from "/framework/core/View/View.js";

/* THE DOCS TAB: the ux/Dictate readme and its docs, rendered in place. Routed as <path>/ai/docs/ (AIPage.VIEWS).
   Imported only when the tab opens. ux/Dictate/doc/docs-tab.md */
export default function docs(){
	div.c("drawer-docs pad", $d => {
		import("/framework/ux/Dictate/DictateDocs.js")
			.then(m => $d.append(() => { new m.default(); }))
			.catch(e => $d.append(() => { div.c("muted", "The Docs tab could not load: " + e.message); }));
	});
}
