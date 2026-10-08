const adminService = require('../services/admin.service');
const rbacService = require('../services/rbac.service');
const { AdminUserService } = require('../services/admin-user.service');
const requestMetrics = require('../middlewares/request-metrics.middleware');
const { findRoleById } = require('../constants/roles');

const adminUserService = new AdminUserService();

const handle = (action, statusCode = 200) => async (req, res, next) => {
  try {
    const result = await action(req);
    return res.status(statusCode).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const createUser = handle(async (req) => {
  const input = {
    ...req.body,
    role: req.body.role || 'user'
  };
  return adminUserService.createUser(input);
}, 201);

const assignUserRole = handle((req) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    const error = new Error('Không thể tự thay đổi quyền của chính mình.');
    error.statusCode = 400;
    throw error;
  }

  const roleSlug =
    req.body.role || findRoleById(req.body.role_id)?.slug;
  return adminService.assignUserRole(req.params.id, roleSlug);
});

const setUserActiveStatus = handle((req) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    const error = new Error('Không thể khóa hoặc mở khóa tài khoản của chính mình.');
    error.statusCode = 400;
    throw error;
  }
  return adminService.setUserActiveStatus(req.params.id, req.body.is_active);
});

const adminController = {
  listUsers: handle((req) => adminService.listUsers(req.query)),
  getUser: handle((req) => adminService.getUser(req.params.id)),
  createUser,
  getSystemReport: handle(async () => ({
    ...(await adminService.getSystemReport()),
    performance: requestMetrics.getSnapshot()
  })),
  assignUserRole,
  updateUserRole: assignUserRole,
  setUserActiveStatus,
  listRoles: handle(() => rbacService.listRoles()),
  getRole: handle((req) => rbacService.getRole(req.params.id)),
  listPermissions: handle(() => rbacService.listPermissions()),
  getPermission: handle((req) => rbacService.getPermission(req.params.id))
};

module.exports = adminController;