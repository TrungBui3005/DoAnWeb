const pool = require('../config/database');
const { DEFAULT_ROLE } = require('../constants/roles');

class UserRepository {
  // Tìm người dùng theo Email
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // Tìm người dùng theo ID
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role,
              p.full_name, p.age, p.gender,
              p.height_cm, p.weight_kg, p.activity_level, p.bmr, p.tdee,
              p.goal, p.target_calories
       FROM users u 
       LEFT JOIN user_profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  async isActive(id) {
    const [rows] = await pool.query(
      'SELECT is_active FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0 && Number(rows[0].is_active) === 1;
  }

  // Tạo tài khoản mới
  async createUser(email, passwordHash, role = DEFAULT_ROLE) {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, role]
    );
    return result.insertId;
  }

  async createUserWithProfile(input, passwordHash) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
        [input.email, passwordHash, input.role]
      );
      await connection.query(
        `INSERT INTO user_profiles (
          user_id, full_name, age, gender, height_cm, weight_kg,
          activity_level, bmr, tdee, goal, target_calories
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.insertId,
          input.full_name,
          input.age,
          input.gender,
          input.height_cm,
          input.weight_kg,
          input.activity_level,
          input.bmr,
          input.tdee,
          input.goal,
          input.target_calories
        ]
      );
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Tạo hồ sơ thể trạng người dùng
  async createProfile(profileData) {
    const { user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories } = profileData;
    await pool.query(
      `INSERT INTO user_profiles 
       (user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories]
    );
  }

  // Cập nhật hồ sơ thể trạng
  async updateProfile(userId, profileData) {
    const { full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories } = profileData;
    // Upsert: chưa có hồ sơ thì tạo mới, có rồi thì cập nhật (user_id là UNIQUE)
    await pool.query(
      `INSERT INTO user_profiles
         (user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name), age = VALUES(age), gender = VALUES(gender),
         height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg),
         activity_level = VALUES(activity_level), bmr = VALUES(bmr), tdee = VALUES(tdee),
         goal = VALUES(goal), target_calories = VALUES(target_calories)`,
      [userId, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, goal, target_calories]
    );
  }
}

module.exports = new UserRepository();