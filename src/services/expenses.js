import { api } from './api';

export async function getExpenses(filters) {
  const { data } = await api.get('/expenses', { params: filters });
  return data;
}

export async function createExpense(expense) {
  const { data } = await api.post('/expenses', expense);
  return data;
}

export async function updateExpense(id, expense) {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}
