// worker/can.js — identity.md ruling 4's six rows, nothing more. The ROUTER
// calls this before every handler (index.js), so there is no call site to
// forget. A ban is NOT one of these rows — identity.md ruling 2 makes the room
// itself refuse a banned user instantly (see worker/room.js); can() only ever
// answers "what does this role permit".
//
// action is "read" or "write" — everything this harness's one surface (a room)
// needs. Rows 3 and 4 (topic founder / moderator) are path-scoped in production
// via data.md's topic ownership, which this harness does not model; they
// collapse here to "same as member, plus moderate" — noted, not solved.

export function can(user, action) {
    if (!user) return action === "read";              // 6 · anonymous: read, never write
    switch (user.role) {
        case "owner":     return true;                  // 1 · everything
        case "admin":     return true;                  // 2 · every moderation action (no billing/roles here to withhold)
        case "founder":   return true;                  // 3 · every moderation action, scoped to their topic in production
        case "moderator": return true;                  // 4 · same as founder minus appointing moderators (no such action here)
        case "member":    return action === "read" || action === "write"; // 5 · create + edit/delete own
        default:          return false;
    }
}
