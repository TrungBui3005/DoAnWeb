const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DEFAULT_ROLE } = require('../constants/roles');
const userRepository = require('../repositories/user.repository');
const { calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/nutritionCalc');

class AuthService {
  async register(data) {
    const { email, password, full_name, age, gender, height_cm, weight_kg, activity_level } = data;
    const goal = data.goal || 'maintain';
    if (!['lose', 'maintain', 'gain'].includes(goal)) {
      throw new Error('Mục tiêu dinh dưỡng không hợp lệ.');
    }

    // 1. Kiểm tra email tồn tại
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email này đã được sử dụng!');
    }

    // 2. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Tính toán BMR, TDEE và calo mục tiêu
    const bmr = calculateBMR(gender, weight_kg, height_cm, age);
    const tdee = calculateTDEE(bmr, activity_level);
    const target_calories = calculateTargetCalories(tdee, goal, gender);

    // 4. Lưu users + user_profiles trong MỘT transaction
    //    (lỗi ở bước nào thì cả hai cùng bị hủy, không để lại tài khoản thiếu hồ sơ)
    let userId;
    try {
      userId = await userRepository.createUserWithProfile({
        email,
        role: DEFAULT_ROLE,
        full_name: full_name || 'Người dùng',
        age,
        gender,
        height_cm,
        weight_kg,
        activity_level: activity_level || 'sedentary',
        bmr,
        tdee,
        goal,
        target_calories
      }, passwordHash);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email này đã được sử dụng!');
      }
      throw error;
    }

    return { userId, email };
  }

  async login(email, password) {
    // 1. Kiểm tra tài khoản
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    if (Number(user.is_active) !== 1) {
      const error = new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      error.statusCode = 423;
      throw error;
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();