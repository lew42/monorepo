// worker/can.js: identity.md ruling 4's six rows, nothing more. The ROUTER calls this before every handler (index.js), so there is no
// call site to forget. A ban is NOT one of these rows: the room refuses a banned user itself (worker/room.js) and the router refuses a
// banned user's writes; can() only answers "what does this role permit".
//
// action is "read", "write" or "admin". Rows 3 and 4 (topic founder / moderator) are path-scoped in production via data.md's topic
// ownership, which is not modelled here; they collapse to "same as member, plus moderate". "admin" (the users list) is rows 1 and 2.

export function can(user, action) {
    if (!user) return action === "read";              // 6 · anonymous: read, never write
    if (action === "admin") return user.role === "owner" || user.role === "admin";
    switch (user.role) {
        case "owner":     return true;                  // 1 · everything
        case "admin":     return true;                  // 2 · every moderation action
        case "founder":   return true;                  // 3 · every moderation action, scoped to their topic in production
        case "moderator": return true;                  // 4 · same as founder minus appointing moderators
        case "member":    return action === "read" || action === "write"; // 5 · create + edit/delete own
        default:          return false;
    }
}
