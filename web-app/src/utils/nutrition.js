export const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getProgress = (consumed, target) => {
  const safeConsumed = Math.max(toNumber(consumed), 0);
  const safeTarget = Math.max(toNumber(target), 0);
  return safeTarget > 0 ? Math.min((safeConsumed / safeTarget) * 100, 100) : 0;
};

export const getRemainingCalories = (consumed, target) =>
  Math.max(toNumber(target) - Math.max(toNumber(consumed), 0), 0);

export const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCalories = (value) =>
  Math.round(toNumber(value)).toLocaleString('vi-VN');

const normalizeFoodName = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const findFoodMatch = (foods, foodName) => {
  const normalizedInput = normalizeFoodName(foodName);
  if (!normalizedInput) return null;

  const exactMatch = foods.find((food) => normalizeFoodName(food.name) === normalizedInput);
  if (exactMatch) return exactMatch;

  return foods.find((food) => normalizeFoodName(food.name).includes(normalizedInput)) ||
    foods.find((food) => normalizedInput.includes(normalizeFoodName(food.name))) || null;
};
