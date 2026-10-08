import client, { apiData } from './axiosClient';

export const getDailySummary = async (date) =>
  apiData(await client.get('/meals/daily', { params: { date } }));
export const createMeal = async (payload) => {
  const isFormData = payload instanceof FormData;
  return apiData(await client.post('/meals', payload, {
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' }
  }));
};
export const updateMealItem = async (id, amount_gram) =>
  apiData(await client.put(`/meals/items/${id}`, { amount_gram }));
export const deleteMealItem = async (id) => apiData(await client.delete(`/meals/items/${id}`));
export const deleteMeal = async (id) => apiData(await client.delete(`/meals/${id}`));