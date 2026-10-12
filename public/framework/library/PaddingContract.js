// Docs: doc/decisions.md §7. An item that says `needs_parent_padding` must not touch an unpadded parent edge.
export default class PaddingContract {

	static SELECTOR = "[data-needs-parent-padding]";
	static SIDES = ["Top", "Right", "Bottom", "Left"];

	// Marks every offender under `root` with `.padding-misuse` and logs one console.error each; returns them.
	static check(root = document){
		const found = [];

		root.querySelectorAll(this.SELECTOR).forEach(el => {
			el.classList.remove("padding-misuse");
			if (this.misused(el)){
				el.classList.add("padding-misuse");
				found.push(el);
				console.error(`[padding] ${el.dataset.needsParentPadding || el.className || el.tagName}: needs_parent_padding inside an unpadded box — add padding to the parent or a background to the item`);
			}
		});

		return found;
	}

	// True when the element sits against a parent edge whose padding there is 0.
	static misused(el){
		const parent = el.parentElement;
		if (!parent) return false;

		const own = el.getBoundingClientRect(), box = parent.getBoundingClientRect();
		if (!own.width && !own.height) return false;

		const style = getComputedStyle(parent);
		const gap = {
			Top: own.top - box.top, Left: own.left - box.left,
			Bottom: box.bottom - own.bottom, Right: box.right - own.right,
		};

		return this.SIDES.some(side => {
			const border = parseFloat(style[`border${side}Width`]) || 0;
			return gap[side] - border < 1 && !parseFloat(style[`padding${side}`]);
		});
	}
}
