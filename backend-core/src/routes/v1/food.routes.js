const express = require('express');
const router = express.Router();
const foodController = require('../../controllers/food.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { createFoodDto, updateFoodDto } = require('../../dtos/food.dto');
const { singleImage } = require('../../middlewares/image-upload.middleware');
const Joi = require('joi');

const foodIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Middleware hỗ trợ đọc Token nếu có (Không bắt buộc 401 nếu chưa đăng nhập)
const optionalVerifyToken = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  req.user = null;
  next();
};

// Routes đọc danh sách món ăn (Sử dụng optionalVerifyToken để lấy req.user.id)
router.get('/', optionalVerifyToken, foodController.getFoods);
router.get('/:id', optionalVerifyToken, foodController.getFoodById);

// Protected routes (Bắt buộc quyền Quản lý thực phẩm / Admin)
router.post(
  '/',
  verifyToken,
  requirePermission('foods:manage'),
  singleImage('image'),
  validateMiddleware(createFoodDto),
  foodController.createFood
);
router.put(
  '/:id',
  verifyToken,
  requirePermission('foods:manage'),
  singleImage('image'),
  validateMiddleware(foodIdParams, 'params'),
  validateMiddleware(updateFoodDto),
  foodController.updateFood
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission('foods:manage'),
  validateMiddleware(foodIdParams, 'params'),
  foodController.deleteFood
);

module.exports = router;