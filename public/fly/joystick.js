import { div } from "/framework/core/View/View.js";

/**
 * The stick writes roll, pitch and (on touch) boost onto the control object it
 * is handed — so the caller can see, at the call site, exactly what this owns.
 */
export default function joystick(control){
	const $knob = div.c("stick-knob");
	const $stick = div.c("stick", $knob);

	let startX = 0, startY = 0, range = 150, touching = false;

	$knob.on("pointerdown", e => {
		startX = e.clientX;
		startY = e.clientY;
		touching = e.pointerType === "touch";

		// The ring is sized in vh, so full deflection is its radius, not a constant.
		range = $stick.el.offsetWidth / 2;

		if (touching) control.boost = true;

		document.body.classList.add("dragging");
		document.addEventListener("pointermove", move);
		document.addEventListener("pointerup", up);
		document.addEventListener("pointercancel", up);
	});

	// ⚠ Listeners on the DOCUMENT, not the knob — a fast drag outruns a 100px
	// circle and the knob would stop receiving moves halfway through the gesture.
	function move(e){
		let dx = e.clientX - startX;
		let dy = e.clientY - startY;
		const distance = Math.hypot(dx, dy);

		if (distance > range){
			const angle = Math.atan2(dy, dx);
			dx = Math.cos(angle) * range;
			dy = Math.sin(angle) * range;
		}

		$knob.style("transform", `translate(${dx}px, ${dy}px)`);

		control.roll = ease(dx / range);
		control.pitch = ease(dy / range);
	}

	function up(){
		if (touching) control.boost = false;

		control.roll = control.pitch = 0;

		document.body.classList.remove("dragging");
		document.removeEventListener("pointermove", move);
		document.removeEventListener("pointerup", up);
		document.removeEventListener("pointercancel", up);

		$knob.style("transform", "");
	}

	return $stick;
}

// Smoothstep: a nudge near centre is gentle, the rim is full deflection.
function ease(t){
	const x = Math.min(Math.abs(t), 1);

	return Math.sign(t) * x * x * (3 - 2 * x);
}
