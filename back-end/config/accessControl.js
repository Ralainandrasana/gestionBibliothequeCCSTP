const ROLES = Object.freeze({
	ADMIN: 'admin',
	USER: 'user',
	INVITER: 'inviter'
});

const ROLE_ALIASES = Object.freeze({
	administrator: ROLES.ADMIN,
	administrateur: ROLES.ADMIN,
	admin: ROLES.ADMIN,
	user: ROLES.USER,
	utilisateur: ROLES.USER,
	inviter: ROLES.INVITER,
	invite: ROLES.INVITER,
	'invité': ROLES.INVITER,
	guest: ROLES.INVITER
});

const normalizeRole = (role) => {
	const normalized = String(role || '').trim().toLowerCase();
	return ROLE_ALIASES[normalized] || normalized;
};

module.exports = {
	ROLES,
	normalizeRole,
	ALL_ROLES: Object.freeze([ROLES.ADMIN, ROLES.USER, ROLES.INVITER]),
	STAFF_ROLES: Object.freeze([ROLES.ADMIN, ROLES.USER])
};
