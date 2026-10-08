const express = require('express');
const multer = require('multer');
const router = express.Router();
const mealController = require('../../controllers/meal.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const mealDto = require('../../dtos/meal.dto');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const parseMealItems = (req, res, next) => {
  if (typeof req.body.items === 'string') {
    try {
      req.body.items = JSON.parse(req.body.items);
    } catch (error) {
      return next(createError(400, 'items phải là JSON hợp lệ.'));
    }
  }
  return next();
};

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

router.use(verifyToken);

router.post(
  '/',
  requirePermission('meals:create'),
  upload.single('image'),
  parseMealItems,
  validate(mealDto.createMeal),
  mealController.logMeal
);
router.get(
  '/daily',
  requirePermission('meals:read'),
  validate(mealDto.dailySummary, 'query'),
  mealController.getDailySummary
);
router.put(
  '/items/:itemId',
  requirePermission('meals:update'),
  validate(mealDto.itemParams, 'params'),
  validate(mealDto.updateMealItem),
  mealController.updateMealItem
);
router.delete(
  '/items/:itemId',
  requirePermission('meals:delete'),
  validate(mealDto.itemParams, 'params'),
  mealController.deleteMealItem
);
router.delete(
  '/:mealId',
  requirePermission('meals:delete'),
  validate(mealDto.mealParams, 'params'),
  mealController.deleteMeal
);

module.exports = router;