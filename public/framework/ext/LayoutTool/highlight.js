import { View, div, span } from "/app.js";
import { locate } from "./address.js";

View.stylesheet(import.meta, "LayoutTool.css");

/* Where the finding is. `aim($view, find)` makes any view point at an element:
   hover rings it, a click keeps the ring and scrolls it into view, a second click
   lets go. The report says what is wrong; this is the only thing that says where.

   ⚠ An overlay box, never a style on the element itself. The page under a ring is
   the page being measured, and anything written onto it is one more thing the next
   analysis reads back. */
export function aim($view, find, label){
	return $view.ac("lt-aim")
		.on("pointerenter", () => point(find(), label))
		.on("pointerleave", () => point(null))
		.on("click", () => hold($view, find(), label));
}

export { locate };

let $spot, $tag, $held, held, over, frame;

const point = (el, label) => { over = el; draw(label); };

function hold($view, el, label){
	const same = $held === $view;
	$held?.rc("lt-aimed");
	$held = same ? null : $view.ac("lt-aimed");
	held = same ? null : el;

	if (held) held.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
	draw(label);
}

export function clear(){
	$held?.rc("lt-aimed");
	$held = held = over = null;
	draw();
}

/* One box, tracked per frame — so it follows a smooth scroll, a drag of the rail and
   a panel resize with no listener for any of them, and lets go by itself the moment
   its element leaves the document. */
function draw(label){
	cancelAnimationFrame(frame);

	const el = held ?? over;
	if (!el) return void $spot?.rc("on");

	spot().ac("on");
	$tag.text(label ?? "");

	frame = requestAnimationFrame(function follow(){
		if (!el.isConnected) return clear();

		const box = el.getBoundingClientRect();
		const s = $spot.el.style;
		s.left = `${box.left}px`;
		s.top = `${box.top}px`;
		s.width = `${box.width}px`;
		s.height = `${box.height}px`;

		frame = requestAnimationFrame(follow);
	});
}

/* ⚠ On <body> and marked ignorable: mounted inside `.app` it would be measured by
   the very analysis it is reporting on. */
const spot = () => $spot ??= div.c("lt-spot")
	.attr("data-layout-ignore", "")
	.append(() => { $tag = span.c("lt-spot-tag"); })
	.append_to(View.body());

export default aim;
