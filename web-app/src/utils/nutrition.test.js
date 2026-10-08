import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findFoodMatch,
  formatCalories,
  getLocalDate,
  getProgress,
  getRemainingCalories,
  toNumber,
} from './nutrition.js';

test('toNumber ignores invalid and missing values', () => {
  assert.equal(toNumber(''), 0);
  assert.equal(toNumber('not-a-number'), 0);
  assert.equal(toNumber('1200.5'), 1200.5);
});

test('progress is capped at 100 percent', () => {
  assert.equal(getProgress(500, 2000), 25);
  assert.equal(getProgress(3000, 2000), 100);
  assert.equal(getProgress(1000, 0), 0);
});

test('remaining calories never becomes negative', () => {
  assert.equal(getRemainingCalories(2500, 2000), 0);
  assert.equal(getRemainingCalories(1000, 2000), 1000);
});

test('local date is stable and zero-padded', () => {
  assert.equal(getLocalDate(new Date(2026, 9, 7)), '2026-10-07');
});

test('calorie formatting uses Vietnamese locale', () => {
  assert.equal(formatCalories(1234.6), '1.235');
});

test('findFoodMatch prefers normalized names and exact candidates', () => {
  const foods = [
    { id: 2, name: 'Cơm trắng' },
    { id: 3, name: 'Yến mạch' },
    { id: 4, name: 'Bánh xèo' },
  ];

  assert.equal(findFoodMatch(foods, 'Cơm trắng').id, 2);
  assert.equal(findFoodMatch(foods, 'YẾN MẠCH').id, 3);
  assert.equal(findFoodMatch(foods, 'Bánh xèo').id, 4);
  assert.equal(findFoodMatch(foods, 'Mì tôm'), null);
});
