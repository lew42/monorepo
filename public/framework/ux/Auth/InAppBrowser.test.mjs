// InAppBrowser: real user-agent strings from the apps and the browsers; no DOM needed.
// Node: `node public/framework/ux/Auth/InAppBrowser.test.mjs`
import { test } from "../../core/Test/Test.js";
import { InAppBrowser } from "./InAppBrowser.js";

const UA = {
	instagram_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 345.0.0.28.109 (iPhone15,2; iOS 17_5; en_US; en; scale=3.00; 1170x2532; 640990340)",
	instagram_android: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UD1A.230803.041; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 Instagram 345.0.0.34.101 Android (34/14; 420dpi; 1080x2400; Google/google; Pixel 8; shiba; shiba; en_US; 640990340)",
	facebook_android: "Mozilla/5.0 (Linux; Android 13; SM-S918B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/460.0.0.43.109;]",
	tiktok_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_34.1.0 BytedanceWebview/d8a21c6",
	snapchat_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.90.0.38 (like Safari/8617.2.4.10.8)",
	linkedin_android: "Mozilla/5.0 (Linux; Android 12; Pixel 6 Build/SD1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 LinkedInApp/9.30.1042",
	webview_android: "Mozilla/5.0 (Linux; Android 11; moto g(9) play Build/RPXS31.Q4-15-26; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36",
	webview_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90",
	safari_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	chrome_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
	chrome_android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36",
	chrome_desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
};

test("the in-app browsers are named", t => {
	const app = key => new InAppBrowser(UA[key]).app;
	t.eq(app("instagram_ios"), "instagram", "Instagram on iPhone");
	t.eq(app("instagram_android"), "instagram", "Instagram wins over the Android webview marker");
	t.eq(app("facebook_android"), "facebook", "Facebook on Android");
	t.eq(app("tiktok_ios"), "tiktok", "TikTok on iPhone");
	t.eq(app("snapchat_ios"), "snapchat", "Snapchat on iPhone");
	t.eq(app("linkedin_android"), "linkedin", "LinkedIn on Android");
	t.eq(app("webview_android"), "android-webview", "an unnamed Android webview");
	t.eq(app("webview_ios"), "ios-webview", "an iPhone app with no Safari/ in its user agent");
});

test("real browsers are not in-app, and platform is read", t => {
	for (const key of ["safari_ios", "chrome_ios", "chrome_android", "chrome_desktop"]) t.eq(new InAppBrowser(UA[key]).in_app, false, key + " is a real browser");
	t.ok(new InAppBrowser(UA.safari_ios).ios && !new InAppBrowser(UA.safari_ios).android, "iPhone is ios, not android");
	t.ok(new InAppBrowser(UA.chrome_android).android, "Pixel is android");
	t.ok(!new InAppBrowser(UA.chrome_desktop).ios && !new InAppBrowser(UA.chrome_desktop).android, "a desktop is neither");
});

test("intent_url asks Chrome to open the same page", t => {
	const url = new InAppBrowser(UA.instagram_android).intent_url("https://staging.lew42.com/join/?x=1");
	t.eq(url, "intent://staging.lew42.com/join/?x=1#Intent;scheme=https;package=com.android.chrome;end", "host, path and query kept; scheme and package named");
});
