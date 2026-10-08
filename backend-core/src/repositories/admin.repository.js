const pool = require('../config/database');
const {
  ROLES,
  findRoleById,
  findRoleBySlug
} = require('../constants/roles');

class AdminRepository {
  async listUsers({ search, roleId, limit, offset }) {
    let conditions = '1 = 1';
    const parameters = [];
    if (search) {
      conditions += ' AND (u.email LIKE ? OR p.full_name LIKE ?)';
      parameters.push(`%${search}%`, `%${search}%`);
    }
    if (roleId) {
      const role = findRoleById(roleId);
      if (!role) return [];
      conditions += ' AND u.role = ?';
      parameters.push(role.slug);
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.created_at, u.updated_at,
              u.role, u.is_active,
              p.full_name, p.age, p.gender, p.height_cm, p.weight_kg,
              p.activity_level, p.bmr, p.tdee, p.goal, p.target_calories
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE ${conditions}
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [...parameters, limit, offset]
    );
    return rows.map((row) => this.addRoleDetails(row));
  }

  async countUsers({ search, roleId }) {
    let conditions = '1 = 1';
    const parameters = [];
    if (search) {
      conditions += ' AND (u.email LIKE ? OR p.full_name LIKE ?)';
      parameters.push(`%${search}%`, `%${search}%`);
    }
    if (roleId) {
      const role = findRoleById(roleId);
      if (!role) return 0;
      conditions += ' AND u.role = ?';
      parameters.push(role.slug);
    }
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE ${conditions}`,
      parameters
    );
    return Number(rows[0].total);
  }

  async findUserById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.updated_at,
              p.full_name, p.age, p.gender, p.height_cm, p.weight_kg,
              p.activity_level, p.bmr, p.tdee, p.goal, p.target_calories
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] ? this.addRoleDetails(rows[0]) : null;
  }

  addRoleDetails(user) {
    const role = findRoleBySlug(user.role);
    return {
      ...user,
      role_id: role ? role.id : null,
      role_name: role ? role.name : user.role
    };
  }

  async assignUserRole(userId, roleSlug) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [adminUsers] = await connection.query(
        'SELECT id FROM users WHERE role = ? AND is_active = 1 ORDER BY id FOR UPDATE',
        [ROLES.ADMIN]
      );
      const [users] = await connection.query(
        'SELECT id, role, is_active FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );
      if (users.length === 0) {
        await connection.rollback();
        return false;
      }

      if (
        users[0].role === ROLES.ADMIN &&
        Number(users[0].is_active) === 1 &&
        roleSlug !== ROLES.ADMIN &&
        adminUsers.length <= 1
      ) {
        const error = new Error('Không thể hạ quyền của quản trị viên cuối cùng.');
        error.statusCode = 409;
        throw error;
      }

      await connection.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [roleSlug, userId]
      );
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async setUserActiveStatus(userId, isActive) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [activeAdmins] = await connection.query(
        'SELECT id FROM users WHERE role = ? AND is_active = 1 ORDER BY id FOR UPDATE',
        [ROLES.ADMIN]
      );
      const [users] = await connection.query(
        'SELECT id, role, is_active FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );
      if (users.length === 0) {
        await connection.rollback();
        return false;
      }

      if (
        !isActive &&
        users[0].role === ROLES.ADMIN &&
        Number(users[0].is_active) === 1 &&
        activeAdmins.length <= 1
      ) {
        const error = new Error('Không thể khóa quản trị viên đang hoạt động cuối cùng.');
        error.statusCode = 409;
        throw error;
      }

      await connection.query(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive ? 1 : 0, userId]
      );
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getSystemReport() {
    const [
      [userRows],
      [foodRows],
      [activityRows],
      [exerciseRows],
      [dailyRows]
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total_users,
                COALESCE(SUM(is_active = 1), 0) AS active_users,
                COALESCE(SUM(is_active = 0), 0) AS blocked_users
         FROM users`
      ),
      pool.query('SELECT COUNT(*) AS total_foods FROM foods'),
      pool.query(
        `SELECT COUNT(*) AS meals_7d,
                COALESCE(SUM(total_calories), 0) AS calories_7d
         FROM meals
         WHERE meal_date >= CURRENT_DATE - INTERVAL 6 DAY
           AND meal_date < CURRENT_DATE + INTERVAL 1 DAY`
      ),
      pool.query(
        `SELECT COALESCE(SUM(calories_burned), 0) AS calories_burned_7d
         FROM activity_logs
         WHERE activity_date >= CURRENT_DATE - INTERVAL 6 DAY
           AND activity_date < CURRENT_DATE + INTERVAL 1 DAY`
      ),
      pool.query(
        `SELECT DATE_FORMAT(meal_date, '%Y-%m-%d') AS date,
                COALESCE(SUM(total_calories), 0) AS calories
         FROM meals
         WHERE meal_date >= CURRENT_DATE - INTERVAL 6 DAY
           AND meal_date < CURRENT_DATE + INTERVAL 1 DAY
         GROUP BY meal_date
         ORDER BY meal_date`
      )
    ]);
    const users = userRows[0];
    const activity = activityRows[0];
    return {
      users: {
        total: Number(users.total_users),
        active: Number(users.active_users),
        blocked: Number(users.blocked_users)
      },
      foods: Number(foodRows[0].total_foods),
      meals_7d: Number(activity.meals_7d),
      calories_7d: Number(activity.calories_7d),
      calories_burned_7d: Number(exerciseRows[0].calories_burned_7d),
      daily_calories_7d: dailyRows.map((row) => ({
        date: row.date,
        calories: Number(row.calories)
      }))
    };
  }

}

module.exports = new AdminRepository();
