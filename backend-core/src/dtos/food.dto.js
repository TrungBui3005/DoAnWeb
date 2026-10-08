const Joi = require('joi');

const foodFields = {
  name: Joi.string().trim().min(1).max(150),
  calories: Joi.number().min(0).max(99999.99),
  protein: Joi.number().min(0).max(9999.99),
  carbs: Joi.number().min(0).max(9999.99),
  fat: Joi.number().min(0).max(9999.99),
  serving_unit: Joi.string().trim().min(1).max(50),
  image_url: Joi.string().trim().max(255).allow(''),
};

const createFoodDto = Joi.object({
  name: foodFields.name.required().messages({
    'string.empty': 'Tên thực phẩm không được để trống',
  }),
  calories: foodFields.calories.default(0),
  protein: foodFields.protein.default(0),
  carbs: foodFields.carbs.default(0),
  fat: foodFields.fat.default(0),
  serving_unit: foodFields.serving_unit.default('100g'),
  image_url: foodFields.image_url.default(''),
  is_custom: Joi.boolean().default(false),
});

const updateFoodDto = Joi.object({
  ...foodFields,
}).min(1);

module.exports = {
  createFoodDto,
  updateFoodDto,
};