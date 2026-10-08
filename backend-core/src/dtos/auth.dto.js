class RegisterDto {
  constructor(data) {
    this.email = data.email?.trim().toLowerCase();
    this.password = data.password;
    this.full_name = data.full_name?.trim() || 'Người dùng';
    this.age = Number(data.age);
    this.gender = data.gender; // 'male' hoặc 'female'
    this.height_cm = Number(data.height_cm);
    this.weight_kg = Number(data.weight_kg);
    this.activity_level = data.activity_level || 'sedentary';
    this.goal = data.goal || 'maintain'; // 'lose' | 'maintain' | 'gain'
  }
}

class LoginDto {
  constructor(data) {
    this.email = data.email?.trim().toLowerCase();
    this.password = data.password;
  }
}

module.exports = {
  RegisterDto,
  LoginDto
};