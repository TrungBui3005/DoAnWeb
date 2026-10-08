const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const { singleImage } = require('../../middlewares/image-upload.middleware');

router.get(
  '/profile',
  verifyToken,
  requirePermission('profile:read'),
  userController.getProfile
);
router.put(
  '/profile',
  verifyToken,
  requirePermission('profile:update'),
  userController.updateProfile
);
router.post(
  '/profile/avatar',
  verifyToken,
  requirePermission('profile:update'),
  singleImage('image'),
  userController.updateAvatar
);

module.exports = router;