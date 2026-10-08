const db = require('../config/database');

class MealRepository {
  // Hàm bổ trợ biến path/object thành String URL chuẩn
  formatImageUrl(rawUrl) {
  if (!rawUrl) return null;

  let url = rawUrl;

  // 1. Giải nén nếu rawUrl là Object thật
  if (typeof rawUrl === 'object' && rawUrl !== null) {
    url = rawUrl.url || rawUrl.path || rawUrl.secure_url || rawUrl.location || null;
  }

  // 2. Chuyển thành chuỗi và loại bỏ giá trị rác "[object Object]"
  if (!url || typeof url !== 'string' || url === '[object Object]' || url.includes('[object')) {
    return null;
  }

  url = url.trim();

  // 3. Nếu đã là link HTTP đầy đủ hoặc base64 thì giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) {
    return url;
  }

  // 4. Nếu là đường dẫn tương đối thì nối domain Backend
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/${url.replace(/^\/+/, '')}`;
 }

  async createMeal(userId, mealType, mealDate, connection) {
    const conn = connection || db;
    const [result] = await conn.query(
      `INSERT INTO meals (user_id, meal_type, meal_date, total_calories, total_protein, total_carbs, total_fat)
       VALUES (?, ?, ?, 0, 0, 0, 0)`,
      [userId, mealType, mealDate]
    );
    return result.insertId;
  }

  async findFoodById(foodId, connection) {
    const conn = connection || db;
    const [rows] = await conn.query('SELECT * FROM foods WHERE id = ?', [foodId]);
    return rows[0] || null;
  }

  async addMealDetail(mealId, detail, connection) {
    const conn = connection || db;
    const formattedImage = this.formatImageUrl(detail.imageUrl);

    const [result] = await conn.query(
      `INSERT INTO meal_details (meal_id, food_name, amount_gram, calories, protein, carbs, fat, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mealId,
        detail.foodName,
        detail.amountGram,
        detail.calories,
        detail.protein,
        detail.carbs,
        detail.fat,
        formattedImage
      ]
    );
    return result.insertId;
  }

  async getMealsByDate(userId, mealDate) {
    const [rows] = await db.query(
      `SELECT 
        m.id AS meal_id,
        m.meal_type,
        m.meal_date,
        m.total_calories,
        m.total_protein,
        m.total_carbs,
        m.total_fat,
        d.id AS detail_id,
        d.food_name,
        d.amount_gram,
        d.calories,
        d.protein,
        d.carbs,
        d.fat,
        d.image_url
      FROM meals m
      LEFT JOIN meal_details d ON m.id = d.meal_id
      WHERE m.user_id = ? AND m.meal_date = ?
      ORDER BY m.id ASC, d.id ASC`,
      [userId, mealDate]
    );

    return rows.map((row) => ({
      ...row,
      image_url: this.formatImageUrl(row.image_url)
    }));
  }

  async updateMealTotals(mealId, connection) {
    const conn = connection || db;
    await conn.query(
      `UPDATE meals m
       SET 
        total_calories = COALESCE((SELECT SUM(calories) FROM meal_details WHERE meal_id = m.id), 0),
        total_protein  = COALESCE((SELECT SUM(protein) FROM meal_details WHERE meal_id = m.id), 0),
        total_carbs    = COALESCE((SELECT SUM(carbs) FROM meal_details WHERE meal_id = m.id), 0),
        total_fat      = COALESCE((SELECT SUM(fat) FROM meal_details WHERE meal_id = m.id), 0)
       WHERE m.id = ?`,
      [mealId]
    );
  }

  async findMealDetail(detailId, userId, connection) {
    const conn = connection || db;
    const [rows] = await conn.query(
      `SELECT d.*, m.user_id 
       FROM meal_details d
       JOIN meals m ON d.meal_id = m.id
       WHERE d.id = ? AND m.user_id = ?`,
      [detailId, userId]
    );
    return rows[0] || null;
  }

  async updateMealDetail(detailId, detail, connection) {
    const conn = connection || db;
    const formattedImage = this.formatImageUrl(detail.imageUrl);

    await conn.query(
      `UPDATE meal_details 
       SET amount_gram = ?, calories = ?, protein = ?, carbs = ?, fat = ?
       ${formattedImage ? ', image_url = ?' : ''}
       WHERE id = ?`,
      formattedImage
        ? [detail.amountGram, detail.calories, detail.protein, detail.carbs, detail.fat, formattedImage, detailId]
        : [detail.amountGram, detail.calories, detail.protein, detail.carbs, detail.fat, detailId]
    );
  }

  async deleteMealDetail(detailId, connection) {
    const conn = connection || db;
    await conn.query('DELETE FROM meal_details WHERE id = ?', [detailId]);
  }

  async deleteMeal(mealId, userId) {
    const [result] = await db.query(
      'DELETE FROM meals WHERE id = ? AND user_id = ?',
      [mealId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new MealRepository();