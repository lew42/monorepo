// A plugin that is ALSO pluggable: Badge.use(Count) makes a plugin of a plugin (core/Plugin/PluginEntry.js:25-33,
// "row.plugins" and "active"). Badge.attach(inst) runs on the DemoPage instance; it makes the badge element, then
// makes a real `new Badge(...)` instance to hold it, so Badge's own plugins (Count) attach the normal way.
import { Plugin } from "../../../framework/core/Plugin/Plugin.js";
import Count from "./Count.js";

export class Badge extends Plugin {
	static attach(inst){
		inst.el.style.position = inst.el.style.position || "relative";
		const el = document.createElement("span");
		Object.assign(el.style, { position: "absolute", top: "-.6em", right: "-.6em", background: "var(--prime, #6366f1)", color: "#fff",
			borderRadius: "999px", minWidth: "1.4em", height: "1.4em", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".75em" });
		inst.el.appendChild(el);
		inst._badge = new Badge({ el });
	}
	static detach(inst){
		inst._badge?.el.remove();
		inst._badge = null;
	}
}
Badge.use(Count);

export default Badge;
