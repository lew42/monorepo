import View, { div, button } from "/framework/core/View/View.js";

/* The right rail — one per document, and it PUSHES rather than covers: `--drawer` is the
   inline-end strip `.app` yields (framework.css), declared here on the same element the
   rail inherits its width from, so the reserved strip and the rail are one number.

   Imports View and nothing else. Anything may open it and it knows none of them — which
   is the whole reason it left ext/layout, where it was reachable only by that module's
   own selection. Design record: readme.md.
   css: .drawer, .drawer-head, .drawer-slot, .drawer-body, .drawer-x. */
View.stylesheet(import.meta, "drawer.css");

const WIDE = "19rem";

let $rail, $shell, $slot, $body, fill;

/* Show something in the rail, opening it if it was shut. `fn($slot, $body)` fills the two
   slots with `empty(fn)`; the ✕ beside `$slot` is the rail's own and is never handed over,
   so nothing a caller draws can leave the rail with no way out. Returns the rail. */
export default function drawer(fn){
	build();
	fill = fn;

	$rail.ac("on");
	$shell.style("--drawer", WIDE);
	drawer.refresh();

	return $rail;
}

// The same content again, for a caller whose subject changed under it.
drawer.refresh = () => { if (fill && drawer.showing()) fill($slot, $body); };

/* ⚠ The ONLY thing that shuts the rail (the owner, 2026-08-16). It used to close whenever the
   selection cleared, which took the reader's scroll position and whatever they were
   reading with it every time they clicked the page. Losing a selection is not a reason to
   lose the rail — a caller redraws it saying so instead. */
drawer.close = () => {
	$rail?.rc("on");
	$shell?.style("--drawer", "");
};

drawer.showing = () => !!$rail?.hc("on");

/* ⚠ Inside `.app`, not on `<body>`: colour-scheme is forced there (App/mode.js), so a rail
   on the body renders light while the page around it is dark — and `--drawer` is read on
   `.app` alone, so the push would be lost too. */
function build(){
	if ($rail) return;

	$shell = new View({ el: document.querySelector(".app") || document.body, capture: false });
	$rail = new View({ capture: false }).ac("drawer flex v").append_to($shell);

	// The head is pinned and the body scrolls under it — a rail whose ✕ scrolls away is a
	// rail you cannot shut.
	$rail.append(() => {
		div.c("drawer-head flex v-center split", () => {
			$slot = div.c("drawer-slot flex v-center");
			button.c("drawer-x", "✕").click(drawer.close).attr("title", "Close");
		});

		$body = div.c("drawer-body flex v");
	});
}

export { drawer };
