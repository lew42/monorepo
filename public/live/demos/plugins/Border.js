// A plugin: draws a border on the host's box.
export class Border {
	static attach(inst){ inst.el.style.border = "3px solid var(--prime, #6366f1)"; inst.el.style.borderRadius = "8px"; }
	static detach(inst){ inst.el.style.border = ""; inst.el.style.borderRadius = ""; }
}

export default Border;
