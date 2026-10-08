const bcrypt = require('bcryptjs');
const { DEFAULT_ROLE } = require('../constants/roles');
const { calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/nutritionCalc');

const VALID_GENDERS = new Set(['male', 'female']);
const VALID_ACTIVITY_LEVELS = new Set([
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active'
]);
const VALID_ROLES = new Set([DEFAULT_ROLE, 'admin']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateAdminUserInput = (data) => {
  const errors = [];
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const fullName = typeof data.full_name === 'string' ? data.full_name.trim() : '';
  const age = Number(data.age);
  const gender = data.gender;
  const heightCm = Number(data.height_cm);
  const weightKg = Number(data.weight_kg);
  const activityLevel = data.activity_level;
  const role = data.role || DEFAULT_ROLE;

  if (!EMAIL_PATTERN.test(email)) errors.push('email không hợp lệ.');
  if (!PASSWORD_PATTERN.test(password)) errors.push('mật khẩu phải có 8-128 ký tự và chứa chữ hoa, chữ thường, số và ký tự đặc biệt.');
  if (!fullName) errors.push('tên đầy đủ không được để trống.');
  if (!Number.isInteger(age) || age < 13 || age > 100) errors.push('tuổi phải là số nguyên từ 13 đến 100.');
  if (!VALID_GENDERS.has(gender)) errors.push('giới phải là male hoặc female.');
  if (!Number.isFinite(heightCm) || heightCm < 40 || heightCm > 300) errors.push('chiều cao phải nằm trong khoảng 40-300 cm.');
  if (!Number.isFinite(weightKg) || weightKg < 1 || weightKg > 300) errors.push('cân nặng phải nằm trong khoảng 1-300 kg.');
  if (!VALID_ACTIVITY_LEVELS.has(activityLevel)) errors.push('mức độ vận động không hợp lệ.');
  if (!VALID_ROLES.has(role)) errors.push('vai trò phải là user hoặc admin.');

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    email,
    password,
    full_name: fullName,
    age,
    gender,
    height_cm: heightCm,
    weight_kg: weightKg,
    activity_level: activityLevel,
    goal: 'maintain',
    role
  };
};

const buildProfileData = (data) => {
  const bmr = calculateBMR(data.gender, data.weight_kg, data.height_cm, data.age);
  const tdee = calculateTDEE(bmr, data.activity_level);
  return {
    full_name: data.full_name,
    age: data.age,
    gender: data.gender,
    height_cm: data.height_cm,
    weight_kg: data.weight_kg,
    activity_level: data.activity_level,
    bmr: Number(bmr.toFixed(1)),
    tdee: Number(tdee.toFixed(1)),
    goal: data.goal || 'maintain',
    target_calories: Number(calculateTargetCalories(tdee, data.goal || 'maintain', data.gender).toFixed(1))
  };
};

class AdminUserService {
  async createUser(data) {
    const userRepository = require('../repositories/user.repository');
    const input = validateAdminUserInput(data);
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) throw createError(409, 'Email này đã được sử dụng.');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const profile = buildProfileData(input);
    const userId = await userRepository.createUserWithProfile(
      { ...input, ...profile },
      passwordHash
    );
    return {
      id: userId,
      email: input.email,
      role: input.role,
      full_name: input.full_name
    };
  }
}

module.exports = {
  AdminUserService,
  buildProfileData,
  validateAdminUserInput
};
