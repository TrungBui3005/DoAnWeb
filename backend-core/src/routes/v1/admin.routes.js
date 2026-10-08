const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const dto = require('../../dtos/admin.dto');

router.use(verifyToken);

router.post(
  '/users',
  requirePermission('users:create'),
  validate(dto.createUserBody),
  adminController.createUser
);
router.get(
  '/users',
  requirePermission('users:read'),
  validate(dto.listUsersQuery, 'query'),
  adminController.listUsers
);
router.get(
  '/reports/summary',
  requirePermission('users:read'),
  adminController.getSystemReport
);
router.get(
  '/users/:id',
  requirePermission('users:read'),
  validate(dto.idParams, 'params'),
  adminController.getUser
);
router.patch(
  '/users/:id/role',
  requirePermission('users:assign-role'),
  validate(dto.idParams, 'params'),
  validate(dto.assignRoleBody),
  adminController.updateUserRole
);
router.patch(
  '/users/:id/status',
  requirePermission('users:assign-role'),
  validate(dto.idParams, 'params'),
  validate(dto.userStatusBody),
  adminController.setUserActiveStatus
);

router.get('/roles', requirePermission('roles:read'), adminController.listRoles);
router.get(
  '/roles/:id',
  requirePermission('roles:read'),
  validate(dto.idParams, 'params'),
  adminController.getRole
);

router.get(
  '/permissions',
  requirePermission('permissions:read'),
  adminController.listPermissions
);
router.get(
  '/permissions/:id',
  requirePermission('permissions:read'),
  validate(dto.idParams, 'params'),
  adminController.getPermission
);

module.exports = router;