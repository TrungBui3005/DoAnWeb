const PERMISSIONS = Object.freeze({
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_ASSIGN_ROLE: 'users:assign-role',
  ROLES_READ: 'roles:read',
  PERMISSIONS_READ: 'permissions:read',
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',
  FOODS_MANAGE: 'foods:manage',
  MEALS_CREATE: 'meals:create',
  MEALS_READ: 'meals:read',
  MEALS_UPDATE: 'meals:update',
  MEALS_DELETE: 'meals:delete',
  ACTIVITIES_CREATE: 'activities:create',
  ACTIVITIES_READ: 'activities:read',
  ACTIVITIES_DELETE: 'activities:delete',
  REPORTS_READ: 'reports:read',
  AI_USE: 'ai:use'
});

const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user'
});

const DEFAULT_ROLE = ROLES.USER;

const ROLE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 1,
    name: 'Quản trị viên',
    slug: ROLES.ADMIN,
    description: 'Quản trị hệ thống và quản lý người dùng',
    is_system: true,
    permissions: Object.freeze(Object.values(PERMISSIONS))
  }),
  Object.freeze({
    id: 2,
    name: 'Người dùng',
    slug: ROLES.USER,
    description: 'Quyền mặc định cho người dùng',
    is_system: true,
    permissions: Object.freeze([
      PERMISSIONS.PROFILE_READ,
      PERMISSIONS.PROFILE_UPDATE,
      PERMISSIONS.MEALS_CREATE,
      PERMISSIONS.MEALS_READ,
      PERMISSIONS.MEALS_UPDATE,
      PERMISSIONS.MEALS_DELETE,
      PERMISSIONS.ACTIVITIES_CREATE,
      PERMISSIONS.ACTIVITIES_READ,
      PERMISSIONS.ACTIVITIES_DELETE,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.AI_USE
    ])
  })
]);

const PERMISSION_DEFINITIONS = Object.freeze([
  ['Xem người dùng', PERMISSIONS.USERS_READ, 'Xem danh sách và thông tin người dùng'],
  ['Tạo người dùng', PERMISSIONS.USERS_CREATE, 'Tạo tài khoản và hồ sơ thể trạng mới'],
  ['Gán role cho người dùng', PERMISSIONS.USERS_ASSIGN_ROLE, 'Thay đổi role của người dùng'],
  ['Xem role', PERMISSIONS.ROLES_READ, 'Xem danh sách và thông tin role'],
  ['Xem permission', PERMISSIONS.PERMISSIONS_READ, 'Xem danh sách quyền'],
  ['Xem hồ sơ', PERMISSIONS.PROFILE_READ, 'Xem hồ sơ cá nhân'],
  ['Cập nhật hồ sơ', PERMISSIONS.PROFILE_UPDATE, 'Cập nhật hồ sơ cá nhân'],
  ['Quản lý thực phẩm', PERMISSIONS.FOODS_MANAGE, 'Tạo, sửa, xóa thực phẩm'],
  ['Tạo bữa ăn', PERMISSIONS.MEALS_CREATE, 'Ghi nhận bữa ăn'],
  ['Xem bữa ăn', PERMISSIONS.MEALS_READ, 'Xem nhật ký bữa ăn'],
  ['Cập nhật bữa ăn', PERMISSIONS.MEALS_UPDATE, 'Cập nhật món trong bữa ăn'],
  ['Xóa bữa ăn', PERMISSIONS.MEALS_DELETE, 'Xóa món hoặc bữa ăn'],
  ['Ghi nhận vận động', PERMISSIONS.ACTIVITIES_CREATE, 'Tạo nhật ký vận động cá nhân'],
  ['Xem vận động', PERMISSIONS.ACTIVITIES_READ, 'Xem nhật ký vận động cá nhân'],
  ['Xóa vận động', PERMISSIONS.ACTIVITIES_DELETE, 'Xóa mục nhật ký vận động cá nhân'],
  ['Xem báo cáo cá nhân', PERMISSIONS.REPORTS_READ, 'Xem thống kê dinh dưỡng và vận động cá nhân'],
  ['Sử dụng AI', PERMISSIONS.AI_USE, 'Sử dụng các API AI']
].map(([name, slug, description], index) =>
  Object.freeze({ id: index + 1, name, slug, description, is_system: true })
));

const SYSTEM_ROLE_SLUGS = Object.freeze(ROLE_DEFINITIONS.map((role) => role.slug));

const findRoleById = (id) =>
  ROLE_DEFINITIONS.find((role) => role.id === Number(id)) || null;

const findRoleBySlug = (slug) =>
  ROLE_DEFINITIONS.find((role) => role.slug === slug) || null;

module.exports = {
  ROLES,
  DEFAULT_ROLE,
  SYSTEM_ROLE_SLUGS,
  ROLE_DEFINITIONS,
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
  findRoleById,
  findRoleBySlug
};
