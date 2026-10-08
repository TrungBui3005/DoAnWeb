const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const mealService = require('../services/meal.service');

const uploadDirectory = path.join(__dirname, '../../uploads/meal-images');

const saveMealImage = async (file) => {
  if (!file) return null;

  await fs.mkdir(uploadDirectory, { recursive: true });
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(uploadDirectory, filename), file.buffer);
  
  // Lấy domain Backend từ environment hoặc mặc định localhost:5000
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/meal-images/${filename}`;
};

exports.logMeal = async (req, res, next) => {
  try {
    const imageUrl = await saveMealImage(req.file);
    const items = typeof req.body.items === 'string'
      ? JSON.parse(req.body.items)
      : req.body.items;
    const result = await mealService.logMeal(req.user.id, {
      ...req.body,
      items,
      image_url: imageUrl
    });
    res.status(201).json({
      status: 'success',
      message: 'Ghi nhận bữa ăn thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await mealService.getDailySummary(req.user.id, date);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMealItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { amount_gram: amountGram } = req.body;
    const result = await mealService.updateMealItemQuantity(
      req.user.id,
      itemId,
      amountGram
    );
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMealItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const result = await mealService.deleteMealItem(req.user.id, itemId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const result = await mealService.deleteMeal(req.user.id, mealId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};