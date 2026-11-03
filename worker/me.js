// worker/me.js — GET /api/me. `user` is whatever index.js already verified
// (session.js) and resolved from D1; this file only shapes the response.

export function me(user) {
    if (!user) return { anonymous: true };
    return { handle: user.handle, roles: [user.role] };
}
