const Joi = require('joi');

const date = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      return helpers.error('date.invalid');
    }
    return value;
  })
  .messages({
    'string.pattern.base': 'Ngày phải đúng định dạng YYYY-MM-DD.',
    'date.invalid': 'Ngày không phải ngày hợp lệ.'
  });

const mealType = Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack');
const amountGram = Joi.number().positive().max(9999.99);

const itemSchema = Joi.object({
  food_id: Joi.number().integer().positive().allow(null, '').optional(),
  food_name: Joi.string().trim().min(1).max(150).optional(),
  name: Joi.string().trim().min(1).max(150).optional(), // Bắt thêm key 'name' nếu frontend gửi
  amount_gram: amountGram.optional().default(100),
  amount: amountGram.optional(), // Bắt thêm key 'amount' nếu frontend gửi
  calories: Joi.number().min(0).max(99999.99).optional().default(0),
  protein: Joi.number().min(0).max(9999.99).optional().default(0),
  carbs: Joi.number().min(0).max(9999.99).optional().default(0),
  fat: Joi.number().min(0).max(9999.99).optional().default(0),
  image_url: Joi.string().allow('', null).optional(),
  imageUrl: Joi.string().allow('', null).optional()
})
.or('food_id', 'food_name', 'name') // Chỉ cần có 1 trong 3 trường này
.unknown(true); // Cho phép các key phụ khác mà không làm crash validation

module.exports = {
  createMeal: Joi.object({
    meal_type: mealType.required().messages({
      'any.required': 'Bữa ăn (meal_type) là bắt buộc.',
      'any.only': 'Bữa ăn phải là breakfast, lunch, dinner hoặc snack.'
    }),
    meal_date: date.optional(),
    image: Joi.any().optional(),
    image_url: Joi.string().allow('', null).optional(),
    imageUrl: Joi.string().allow('', null).optional(),
    items: Joi.array().items(itemSchema).min(1).required().messages({
      'array.min': 'Danh sách món ăn phải có ít nhất 1 món.',
      'any.required': 'Danh sách món ăn (items) là bắt buộc.'
    })
  }).unknown(true),

  updateMealItem: Joi.object({
    amount_gram: amountGram.required()
  }),

  itemParams: Joi.object({
    itemId: Joi.number().integer().positive().required()
  }),

  mealParams: Joi.object({
    mealId: Joi.number().integer().positive().required()
  }),

  dailySummary: Joi.object({
    date: date.optional()
  })
};