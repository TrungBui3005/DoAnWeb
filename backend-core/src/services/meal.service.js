const pool = require('../config/database');
const mealRepository = require('../repositories/meal.repository');
const foodRepository = require('../repositories/food.repository');

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const round = (value) => Number(Number(value).toFixed(2));

const calculateNutrition = (food, amountGram) => {
  const scale = amountGram / 100;
  return {
    foodName: food.name,
    amountGram,
    calories: round(Number(food.calories) * scale),
    protein: round(Number(food.protein) * scale),
    carbs: round(Number(food.carbs) * scale),
    fat: round(Number(food.fat) * scale)
  };
};

const validateDate = (date) => {
  if (date === undefined) {
    return new Date().toISOString().slice(0, 10);
  }

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }

  return date;
};

const validateAmount = (amountGram) => {
  const amount = Number(amountGram);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999.99) {
    throw createError(400, 'amount_gram phải lớn hơn 0 và không quá 9999.99.');
  }
  return round(amount);
};

const validateMealType = (mealType) => {
  if (!mealTypes.includes(mealType)) {
    throw createError(400, 'meal_type không hợp lệ.');
  }
};

const recalculateMeal = async (mealId, connection) => {
  await mealRepository.updateMealTotals(mealId, connection);
};

class MealService {
  async logMeal(userId, data) {
    const {
      meal_type: mealType,
      meal_date: requestedDate,
      items
    } = data;
    validateMealType(mealType);
    const mealDate = validateDate(requestedDate);

    // Hứng ảnh scan được upload từ Root Payload
    const rootImageUrl = data.image_url || data.imageUrl || data.image || null;

    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, 'items phải có ít nhất một món ăn.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const mealId = await mealRepository.createMeal(
        userId,
        mealType,
        mealDate,
        connection
      );
      const savedItems = [];

      for (const item of items) {
        let foodId = item.food_id === null || item.food_id === undefined
          ? null
          : Number(item.food_id);
        const foodName = String(item.food_name || item.name || '').trim();
        
        // Bắt link ảnh từ từng item hoặc dùng ảnh scan chung
        const uploadedScanImage = item.image_url || item.imageUrl || item.image || rootImageUrl;
        let finalImageUrl = uploadedScanImage;
        let nutrition;

        if (foodId !== null && Number.isInteger(foodId) && foodId > 0) {
          // 1. Món ăn đã có sẵn trong CSDL
          const food = await mealRepository.findFoodById(foodId, connection);
          if (!food) {
            throw createError(404, `Không tìm thấy thực phẩm có id ${foodId}.`);
          }

          // Ưu tiên ảnh từ DB nếu có, nếu chưa có -> Dùng ảnh vừa scan
          finalImageUrl = food.image_url || uploadedScanImage;

          // Cập nhật ảnh vào danh mục món ăn (foods) nếu món đó chưa có ảnh
          if (!food.image_url && uploadedScanImage) {
            await foodRepository.update(foodId, { image_url: uploadedScanImage });
          }

          nutrition = calculateNutrition(
            food,
            validateAmount(item.amount_gram)
          );
        } else {
          // 2. Món ăn mới do AI Scan hoặc tạo thủ công
          if (!foodName) {
            throw createError(400, 'food_name không được để trống.');
          }

          const amountGram = validateAmount(item.amount_gram || item.amount || 100);
          
          // Kiểm tra xem món này đã có trong CSDL theo tên chưa
          const existingFood = await foodRepository.findByNameAndUser(foodName, userId);

          if (existingFood) {
            foodId = existingFood.id;
            finalImageUrl = existingFood.image_url || uploadedScanImage;
            
            // Cập nhật ảnh cho món ăn nếu món đó trước đây chưa có ảnh
            if (!existingFood.image_url && uploadedScanImage) {
              await foodRepository.update(foodId, { image_url: uploadedScanImage });
            }
          } else {
            // Quy đổi dinh dưỡng về chuẩn 100g
            const ratio = 100 / amountGram;
            const caloriesPer100g = round(Number(item.calories || 0) * ratio);
            const proteinPer100g = round(Number(item.protein || 0) * ratio);
            const carbsPer100g = round(Number(item.carbs || 0) * ratio);
            const fatPer100g = round(Number(item.fat || 0) * ratio);

            // Lưu món ăn vào DB kèm theo link ảnh scan
            foodId = await foodRepository.create({
              name: foodName,
              calories: caloriesPer100g,
              protein: proteinPer100g,
              carbs: carbsPer100g,
              fat: fatPer100g,
              serving_unit: '100g',
              image_url: uploadedScanImage,
              is_custom: 1,
              created_by: userId
            });
          }

          nutrition = {
            foodName,
            amountGram,
            calories: round(item.calories || 0),
            protein: round(item.protein || 0),
            carbs: round(item.carbs || 0),
            fat: round(item.fat || 0)
          };
        }

        // Đảm bảo chi tiết món ăn lưu vào nhật ký luôn gắn ảnh chuẩn
        const detail = { ...nutrition, imageUrl: finalImageUrl };
        const detailId = await mealRepository.addMealDetail(
          mealId,
          detail,
          connection
        );
        savedItems.push({ id: detailId, ...detail });
      }

      await recalculateMeal(mealId, connection);
      await connection.commit();
      return {
        id: mealId,
        meal_type: mealType,
        meal_date: mealDate,
        items: savedItems
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getDailySummary(userId, requestedDate) {
    const date = validateDate(requestedDate);
    const rows = await mealRepository.getMealsByDate(userId, date);
    const meals = new Map();
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const row of rows) {
      let meal = meals.get(row.meal_id);
      if (!meal) {
        meal = {
          id: row.meal_id,
          meal_type: row.meal_type,
          meal_date: row.meal_date,
          totals: {
            calories: Number(row.total_calories) || 0,
            protein: Number(row.total_protein) || 0,
            carbs: Number(row.total_carbs) || 0,
            fat: Number(row.total_fat) || 0
          },
          items: []
        };
        meals.set(row.meal_id, meal);
      }

      if (row.detail_id !== null) {
        const item = {
          id: row.detail_id,
          food_name: row.food_name,
          amount_gram: Number(row.amount_gram),
          calories: Number(row.calories),
          protein: Number(row.protein),
          carbs: Number(row.carbs),
          fat: Number(row.fat),
          image_url: row.image_url
        };
        meal.items.push(item);
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
      }
    }

    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    for (const meal of meals.values()) {
      mealsByType[meal.meal_type].push(meal);
    }

    return {
      date,
      totals: Object.fromEntries(
        Object.entries(totals).map(([key, value]) => [key, round(value)])
      ),
      meals: Array.from(meals.values()),
      meals_by_type: mealsByType
    };
  }

  async updateMealItemQuantity(userId, detailId, requestedAmount) {
    const amountGram = validateAmount(requestedAmount);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const detail = await mealRepository.findMealDetail(
        detailId,
        userId,
        connection
      );
      if (!detail) {
        throw createError(404, 'Không tìm thấy món ăn trong nhật ký của bạn.');
      }

      const nutrition = calculateNutrition(
        {
          name: detail.food_name,
          calories: Number(detail.calories) / Number(detail.amount_gram) * 100,
          protein: Number(detail.protein) / Number(detail.amount_gram) * 100,
          carbs: Number(detail.carbs) / Number(detail.amount_gram) * 100,
          fat: Number(detail.fat) / Number(detail.amount_gram) * 100
        },
        amountGram
      );
      await mealRepository.updateMealDetail(detailId, nutrition, connection);
      await recalculateMeal(detail.meal_id, connection);
      await connection.commit();

      return { id: Number(detailId), ...nutrition };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteMealItem(userId, detailId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const detail = await mealRepository.findMealDetail(
        detailId,
        userId,
        connection
      );
      if (!detail) {
        throw createError(404, 'Không tìm thấy món ăn trong nhật ký của bạn.');
      }

      await mealRepository.deleteMealDetail(detailId, connection);
      await recalculateMeal(detail.meal_id, connection);
      await connection.commit();
      return { message: 'Đã xóa món ăn khỏi bữa ăn.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteMeal(userId, mealId) {
    const deleted = await mealRepository.deleteMeal(mealId, userId);
    if (!deleted) {
      throw createError(404, 'Không tìm thấy bữa ăn trong nhật ký của bạn.');
    }
    return { message: 'Đã xóa bữa ăn.' };
  }
}

module.exports = new MealService();