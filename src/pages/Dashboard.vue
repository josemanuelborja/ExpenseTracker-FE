<script setup>
import { onMounted, ref } from 'vue';
import { getDashboard } from '../services/dashboard';
import { formatDate, formatPeso, getErrorMessage } from '../utils/format';

const data = ref(null);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  loadDashboard();
});

async function loadDashboard() {
  loading.value = true;
  error.value = '';

  try {
    data.value = await getDashboard();
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not load the dashboard.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>Dashboard</h1>
        <p class="page-subtitle">A quick look at your expenses and repayments.</p>
      </div>
      <div class="heading-actions">
        <RouterLink to="/expenses" class="btn btn-secondary">View expenses</RouterLink>
        <RouterLink to="/loans" class="btn btn-secondary">Loans &amp; Debts</RouterLink>
      </div>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <p v-if="loading" class="loading-text">Loading dashboard...</p>
    <template v-else-if="data">
      <div class="summary-grid">
        <article class="stat-card">
          <span class="stat-label">Total Expenses</span>
          <strong class="stat-value">{{ formatPeso(data.totalExpenses) }}</strong>
          <span class="stat-note">All recorded expenses</span>
        </article>

        <article class="stat-card">
          <span class="stat-label">Expenses This Month</span>
          <strong class="stat-value">{{ formatPeso(data.monthlyExpenses) }}</strong>
          <span class="stat-note">Current month</span>
        </article>

        <article class="stat-card">
          <span class="stat-label">Total Loans &amp; Debts</span>
          <strong class="stat-value">{{ formatPeso(data.totalLoansDebts) }}</strong>
          <span class="stat-note">Original loan amounts</span>
        </article>

        <article class="stat-card">
          <span class="stat-label">Total Paid Installments</span>
          <strong class="stat-value text-success">{{ formatPeso(data.totalPaidInstallments) }}</strong>
          <span class="stat-note">{{ data.paidInstallmentCount }} paid installment(s)</span>
        </article>

        <article class="stat-card">
          <span class="stat-label">Total Unpaid Installments</span>
          <strong class="stat-value text-warning">{{ formatPeso(data.totalUnpaidInstallments) }}</strong>
          <span class="stat-note">{{ data.unpaidInstallmentCount }} unpaid installment(s)</span>
        </article>
      </div>

      <div class="dashboard-grid">
        <section class="card">
          <div class="card-heading">
            <h2>Recent Expenses</h2>
            <RouterLink to="/expenses">View all</RouterLink>
          </div>

          <p v-if="data.recentExpenses.length === 0" class="empty-state">
            No expenses yet. Add your first expense to get started.
          </p>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in data.recentExpenses" :key="expense._id">
                  <td>{{ expense.title }}</td>
                  <td>{{ expense.category }}</td>
                  <td>{{ formatDate(expense.date) }}</td>
                  <td class="amount-cell">{{ formatPeso(expense.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <div class="card-heading">
            <h2>Loans &amp; Debts</h2>
            <RouterLink to="/loans">View all</RouterLink>
          </div>

          <p v-if="data.loans.length === 0" class="empty-state">No loans or debts recorded.</p>
          <div v-else class="loan-list">
            <div v-for="loan in data.loans" :key="loan._id" class="loan-list-row">
              <div>
                <strong>{{ loan.title }}</strong>
                <span>Remaining: {{ formatPeso(loan.unpaidAmount) }}</span>
              </div>
              <span class="loan-list-amount">{{ formatPeso(loan.originalAmount) }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
