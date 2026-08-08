import { Page, View, md, h2, h3, demo, div, p, ul, ol, li, img, input, el } from "/app.js";

View.stylesheet(import.meta, "toggle-switch.css");

customElements.define("toggle-switch", class extends HTMLElement {
	connectedCallback(){
		const checked = this.hasAttribute("checked");
		this.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox" ${checked ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;
		this.querySelector("input").addEventListener("change", e => {
			this.dispatchEvent(new CustomEvent("toggle", { detail: e.target.checked }));
		});
	}
});

export default new Page({
	meta: import.meta,
	title: "HTML basics",
	description: "The reset — what plain tags look like before you add a class.",
	icon: "html",

	content(){

		demo(() => {
			h3("A heading");
			p("A paragraph of body text. Comfortable line height and spacing, all from the reset with no classes applied.");
			ul(() => {
				li("List items get sensible left padding");
				li("So the bullets are not clipped");
			});
			ol(() => {
				li("Ordered lists too");
				li("Same padding");
			});
		}, "You get these for free. `framework.css` styles plain tags, so raw HTML already looks reasonable.");

		h2("The reset");

		md(`- \`box-sizing: border-box\` on everything, so padding and borders never blow out your widths.
- A readable \`body\`: system font, \`line-height: 1.5\`, a size that scales gently with the viewport.
- Media is block-level and never overflows — \`img, video, svg { max-width: 100% }\`.
- Long words wrap instead of overflowing, and \`pre\` scrolls sideways rather than stretching the page.`);

		h2("Full-width form fields");

		demo(() => {
			input().attr("type", "text").attr("placeholder", "I fill the width automatically");
		}, "Text inputs, selects and textareas stretch to fill their container, which keeps forms tidy with no extra CSS.");

		h2("Responsive image");

		demo(() => {
			img()
				.attr("src", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='120'%3E%3Crect width='320' height='120' fill='%235a57ff'/%3E%3Ctext x='160' y='68' font-family='sans-serif' font-size='20' fill='white' text-anchor='middle'%3E320 x 120 image%3C/text%3E%3C/svg%3E")
				.attr("alt", "Example image");
		}, "`img` is block-level and capped at `max-width: 100%`, so it never overflows its container.");

		h2("Custom web components");

		demo(() => {
			const $toggle = el("toggle-switch").attr("checked", "");
			const $label = el("span").ac("toggle-label").text("On");
			$toggle.on("toggle", e => $label.text(e.detail ? "On" : "Off"));
		}, "Define once with `customElements.define()`, then use it anywhere via `el(\"tag-name\")`. They are global — not scoped to this directory.");

		md("Next: [Forms](/alex/styles/forms/) — the classes on top of that reset.");
	},
});
