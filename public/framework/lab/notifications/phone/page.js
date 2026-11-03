import { Page, md, div, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Phone checklist",
	description: "Five steps to get notifications working on an Android phone, one screen.",
	icon: "smartphone",
	content(){
		md("Do these in order, on the phone. The PC must stay on, on the same Wi-Fi.");
		div.c("card pad flow", () => {
			md("**1. Find the PC's address.** On the PC run `ipconfig` and read the IPv4 Address (like `10.0.0.135`). The site's port is the one `node server.js` prints (or ask Servex `list_servers`). On this PC the site has a fixed port, 3104, so today the address is `http://10.0.0.135:3104` (the IP can change).");
			md("**2. Allow plain http as secure, once.** In Android Chrome open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`. Type the exact address from step 1 (with `http://` and the port), set the flag to **Enabled**, tap **Relaunch**. Redo this if the port changes.");
			md("**3. Open the demo.** Go to `http://<address>:<port>/framework/lab/notifications/` in a normal Chrome tab.");
			md("**4. Check the first card.** The Worker card must say `isSecureContext: true`. If it says false the flag did not take: see the fallback below.");
			md("**5. Press the buttons.** Press **1. Start**, tap **Allow**. Then press any demo button; the notification should appear in the shade. Watch the log at the bottom.");
		});
		md("## If isSecureContext stays false\nThe flag was typed wrong (it must match the address bar exactly) or Chrome was not relaunched. If it is true but the worker errors, the flag is not enough on your phone: the fallback is **mkcert**, giving the PC a trusted `https://` address: [mobile page](/framework/dev/mobile/), [https-lan](/framework/ux/Dictate/doc/https-lan.md).");
		md("[Back to the demo](../) · [Report](../report/)");
	},
});
