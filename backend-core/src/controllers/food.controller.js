const foodRepository = require('../repositories/food.repository');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class FoodController {
  // GET /api/v1/foods
  async getFoods(req, res, next) {
    try {
      const { search, limit, page } = req.query;
      const parsedLimit = parseInt(limit) || 20;
      const parsedPage = parseInt(page) || 1;
      const offset = (parsedPage - 1) * parsedLimit;
      const userId = req.user ? req.user.id : null; // Lấy userId từ auth middleware

      const foods = await foodRepository.findAll({ search, limit: parsedLimit, offset, userId });
      return successResponse(res, foods, 'Lấy danh sách thực phẩm thành công');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/foods/:id
  async getFoodById(req, res, next) {
    try {
      const food = await foodRepository.findById(req.params.id);
      if (!food) {
        return errorResponse(res, 'Không tìm thấy thực phẩm', 404);
      }
      return successResponse(res, food, 'Lấy chi tiết thực phẩm thành công');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/foods
  async createFood(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const foodData = {
        ...req.body,
        created_by: userId,
        is_custom: userId ? 1 : 0,
      };

      const newFoodId = await foodRepository.create(foodData);
      const newFood = await foodRepository.findById(newFoodId);

      return successResponse(res, newFood, 'Tạo thực phẩm thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/foods/:id
  async updateFood(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await foodRepository.update(id, req.body);
      
      if (!updated) {
        return errorResponse(res, 'Không thể cập nhật hoặc không tìm thấy món ăn', 400);
      }

      const food = await foodRepository.findById(id);
      return successResponse(res, food, 'Cập nhật thực phẩm thành công');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/foods/:id
  async deleteFood(req, res, next) {
    try {
      const deleted = await foodRepository.delete(req.params.id);
      if (!deleted) {
        return errorResponse(res, 'Không tìm thấy món ăn để xóa', 404);
      }
      return successResponse(res, null, 'Xóa thực phẩm thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FoodController();