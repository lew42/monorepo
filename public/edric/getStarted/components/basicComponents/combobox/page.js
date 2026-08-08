import { Page, h2, demo } from "/app.js";
import { combobox_demo, combobox_disabled_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Combobox / Autocomplete",
	description: "A plain text input plus a `<datalist>`, the browser supplies the filtering.",

	content(){
		demo(combobox_demo, "`list` on the input points at a `<datalist>`'s `id`; the browser owns the filtering, the matching and the keyboard nav.").ac("mb");

		h2("Disabled").ac("mb");
		demo(combobox_disabled_demo, "Same as any input: `disabled` is an attribute, not a look framework.css invents.");
	}
});