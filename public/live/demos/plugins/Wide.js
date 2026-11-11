// A plugin: makes the host's box full width. Known but off by default (DemoPage.available(Wide)).
export class Wide {
	static attach(inst){ inst.el.style.width = "100%"; }
	static detach(inst){ inst.el.style.width = ""; }
}

export default Wide;
