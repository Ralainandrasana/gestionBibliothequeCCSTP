export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  INVITER: 'inviter',
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
  guest: ROLES.INVITER,
});

export const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[normalized] || normalized;
};

export const getUserRoles = (user) =>
  String(user?.roles || '')
    .split(',')
    .map(normalizeRole)
    .filter(Boolean);

export const hasAnyRole = (user, allowedRoles = []) => {
  if (allowedRoles.length === 0) return true;
  const userRoles = getUserRoles(user);
  return allowedRoles.map(normalizeRole).some((role) => userRoles.includes(role));
};

export const ALL_ROLES = Object.freeze([ROLES.ADMIN, ROLES.USER, ROLES.INVITER]);
export const STAFF_ROLES = Object.freeze([ROLES.ADMIN, ROLES.USER]);
export const CATALOGUE_ROLES = Object.freeze([ROLES.ADMIN, ROLES.INVITER]);
