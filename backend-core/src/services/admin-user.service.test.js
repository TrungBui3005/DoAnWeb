const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildProfileData,
  validateAdminUserInput
} = require('./admin-user.service');

test('buildProfileData calculates nutrition targets from the supplied profile', () => {
  const profile = buildProfileData({
    full_name: 'Nguyễn Văn A',
    age: 30,
    gender: 'male',
    height_cm: 170,
    weight_kg: 70,
    activity_level: 'moderately_active',
    goal: 'maintain'
  });

  assert.equal(profile.full_name, 'Nguyễn Văn A');
  assert.equal(profile.bmr, 1617.5);
  assert.equal(profile.tdee, 2507.1);
  assert.equal(profile.target_calories, 2507);
  assert.equal(profile.goal, 'maintain');
});

test('validateAdminUserInput rejects invalid account information', () => {
  const invalidCases = [
    ['email', { email: 'not-an-email' }],
    ['password', { password: 'short' }],
    ['full_name', { full_name: '' }],
    ['age', { age: 12 }],
    ['gender', { gender: 'unknown' }],
    ['height_cm', { height_cm: 10 }],
    ['weight_kg', { weight_kg: 0 }],
    ['activity_level', { activity_level: 'unknown' }],
    ['role', { role: 'super-admin' }]
  ];

  for (const [field, overrides] of invalidCases) {
    const data = {
      email: 'admin@example.com',
      password: 'StrongPass123!',
      full_name: 'Nguyễn Văn A',
      age: 30,
      gender: 'male',
      height_cm: 170,
      weight_kg: 70,
      activity_level: 'moderately_active',
      role: 'user',
      ...overrides
    };

    const expectedMessage = {
      password: 'mật khẩu',
      full_name: 'tên đầy đủ',
      age: 'tuổi',
      gender: 'giới',
      height_cm: 'chiều cao',
      weight_kg: 'cân nặng',
      activity_level: 'mức độ vận động',
      role: 'vai trò',
      email: 'email'
    }[field];

    assert.throws(
      () => validateAdminUserInput(data),
      new RegExp(expectedMessage),
      `Should reject invalid ${field}`
    );
  }
});

test('validateAdminUserInput normalizes valid account information', () => {
  const input = validateAdminUserInput({
    email: '  admin@example.com ',
    password: 'StrongPass123!',
    full_name: '  Nguyễn Văn A ',
    age: 30,
    gender: 'male',
    height_cm: 170,
    weight_kg: 70,
    activity_level: 'moderately_active',
    role: 'user'
  });

  assert.deepEqual(input, {
    email: 'admin@example.com',
    password: 'StrongPass123!',
    full_name: 'Nguyễn Văn A',
    age: 30,
    gender: 'male',
    height_cm: 170,
    weight_kg: 70,
    activity_level: 'moderately_active',
    goal: 'maintain',
    role: 'user'
  });
});
