/**
 * InAppBrowser: says whether a page is open inside another app's own browser (Instagram, TikTok, ...),
 * where Google refuses sign-in, and builds the ways out.
 *
 *   const b = new InAppBrowser();            // reads navigator.userAgent
 *   b.in_app    // true inside one
 *   b.app       // "instagram" | "facebook" | "tiktok" | "snapchat" | "linkedin" | "google-app" | "android-webview" | "ios-webview" | ""
 *   b.ios, b.android
 *   b.intent_url("https://x.com/join/")      // Android: an intent:// link that asks Chrome to open the page
 *
 * Apps change their user agents, so the patterns live in `InAppBrowser.apps`, in this one file. YouTube's
 * in-app view has no documented user agent: log `navigator.userAgent` from a real tap, then add a row.
 */
export class InAppBrowser {

	constructor(ua = globalThis.navigator?.userAgent ?? ""){
		this.ua = ua;
		this.ios = /iPhone|iPad|iPod/.test(ua);
		this.android = /Android/.test(ua);
		this.app = InAppBrowser.app_of(ua, this.ios, this.android);
		this.in_app = !!this.app;
	}

	static app_of(ua, ios, android){
		for (const [name, re] of InAppBrowser.apps) if (re.test(ua)) return name;
		if (android && /; wv\)/.test(ua)) return "android-webview";
		if (ios && !/Safari\//.test(ua)) return "ios-webview";   // WKWebView apps often leave "Safari/" out
		return "";
	}

	// An intent:// URL: Android Chrome opens the page from inside another app, sometimes. Always keep the written steps visible too.
	intent_url(url){
		const u = new URL(url);
		return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.slice(0, -1)};package=com.android.chrome;end`;
	}

	// The page is running from the home screen (an installed app), on iOS or anywhere else.
	static standalone(){
		return globalThis.matchMedia?.("(display-mode: standalone)").matches || globalThis.navigator?.standalone === true;
	}
}

InAppBrowser.apps = [
	["facebook", /FBAN|FBAV|FB_IAB|FBIOS/],
	["instagram", /Instagram/],
	["tiktok", /musical_ly|BytedanceWebview|TikTok/i],
	["snapchat", /Snapchat/],
	["linkedin", /LinkedInApp/],
	["google-app", /GSA\//],
];

export default InAppBrowser;
