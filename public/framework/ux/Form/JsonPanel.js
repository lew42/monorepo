import View, { div, h3, p, button, textarea } from "../../core/View/View.js";

View.stylesheet(import.meta, "Form.css");

/**
 * JsonPanel: a form's values as JSON, live, and a place to paste JSON back in.
 *   new JsonPanel({ form })     // the box follows form.values(); Load puts the pasted object into the form
 * Doc: readme.md.
 */
export default class JsonPanel extends View {

	classify(){
		super.classify();
		this.ac("fm-json-panel");
	}

	render(){
		h3(this.title ?? "form.values()");
		this.box = textarea.c("fm-field fm-code", "").attr("spellcheck", "false").attr("aria-label", "The form's values as JSON");
		button.c("prim", "Load").attr("type", "button").click(() => this.load());
		this.status = p.c("fm-status", "");
		this.form.on("change", () => this.show());
		this.show();
	}

	show(){
		this.box.el.value = JSON.stringify(this.form.values(), null, 2);
		this.box.rc("fm-bad");
		return this;
	}

	// Parse the box, put the object into the form, say what happened.
	load(){
		let data;
		try { data = JSON.parse(this.box.el.value); }
		catch (e){ return this.fail("Not valid JSON: " + e.message); }
		if (!data || typeof data !== "object" || Array.isArray(data)) return this.fail('Expected an object like { "intro": 2 }.');
		const ignored = Object.keys(data).filter(id => !this.form.question(id));
		this.form.load(data);
		this.show();
		this.status.rc("fm-bad").text(ignored.length ? `Loaded. Ignored unknown ids: ${ignored.join(", ")}.` : "Loaded.");
		return true;
	}

	fail(message){
		this.box.ac("fm-bad");
		this.status.ac("fm-bad").text(message);
		return false;
	}
}
