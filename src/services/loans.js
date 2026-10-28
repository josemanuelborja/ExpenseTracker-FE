import { api } from './api';

export async function getLoans() {
  const { data } = await api.get('/loans');
  return data;
}

export async function createLoan(loan) {
  const { data } = await api.post('/loans', loan);
  return data;
}

export async function updateLoan(id, loan) {
  const { data } = await api.put(`/loans/${id}`, loan);
  return data;
}

export async function deleteLoan(id) {
  const { data } = await api.delete(`/loans/${id}`);
  return data;
}

export async function saveSchedule(id, installments) {
  const { data } = await api.put(`/loans/${id}/schedule`, { installments });
  return data;
}

export async function updateInstallmentStatus(loanId, installmentId, status) {
  const { data } = await api.patch(`/loans/${loanId}/installments/${installmentId}`, { status });
  return data;
}
