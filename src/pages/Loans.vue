<script setup>
import { onMounted, reactive, ref } from 'vue';
import { formatDate, formatPeso, getErrorMessage, toInputDate } from '../utils/format';
import {
  createLoan,
  deleteLoan,
  getLoans,
  saveSchedule,
  updateInstallmentStatus,
  updateLoan
} from '../services/loans';

const loans = ref([]);
const loading = ref(true);
const error = ref('');
const success = ref('');

const showForm = ref(false);
const editingLoanId = ref(null);
const submitted = ref(false);
const saving = ref(false);
const formError = ref('');
const savingScheduleId = ref('');
const statusSavingId = ref('');
const form = reactive({ title: '', originalAmount: '', description: '' });

onMounted(() => {
  loadLoans();
});

async function loadLoans() {
  loading.value = true;
  error.value = '';

  try {
    const data = await getLoans();
    loans.value = data.map(prepareLoan);
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not load loans and debts.');
  } finally {
    loading.value = false;
  }
}

function prepareLoan(loan) {
  return {
    ...loan,
    installments: loan.installments.map((installment) => ({
      ...installment,
      date: toInputDate(installment.date),
      amount: Number(installment.amount)
    }))
  };
}

function openAdd() {
  editingLoanId.value = null;
  submitted.value = false;
  formError.value = '';
  form.title = '';
  form.originalAmount = '';
  form.description = '';
  showForm.value = true;
}

function openEdit(loan) {
  editingLoanId.value = loan._id;
  submitted.value = false;
  formError.value = '';
  form.title = loan.title;
  form.originalAmount = loan.originalAmount;
  form.description = loan.description || '';
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingLoanId.value = null;
  formError.value = '';
}

function formIsValid() {
  return (
    form.title.trim().length > 0 &&
    form.title.length <= 80 &&
    Number(form.originalAmount) > 0 &&
    String(form.description || '').length <= 300
  );
}

async function saveLoan() {
  submitted.value = true;
  formError.value = '';

  if (!formIsValid()) {
    return;
  }

  const loan = {
    title: form.title.trim(),
    originalAmount: Number(form.originalAmount),
    description: String(form.description || '').trim()
  };
  const isEditing = Boolean(editingLoanId.value);

  saving.value = true;

  try {
    if (isEditing) {
      await updateLoan(editingLoanId.value, loan);
    } else {
      await createLoan(loan);
    }

    success.value = isEditing
      ? 'Loan or debt updated.'
      : 'Loan or debt added with three unpaid installments.';
    closeForm();
    loadLoans();
  } catch (requestError) {
    formError.value = getErrorMessage(requestError, 'Could not save the loan or debt.');
  } finally {
    saving.value = false;
  }
}

async function removeLoan(loan) {
  const confirmed = window.confirm(
    `Delete "${loan.title}" and its repayment schedule? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  success.value = '';
  error.value = '';

  try {
    await deleteLoan(loan._id);
    success.value = 'Loan or debt deleted.';
    loadLoans();
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not delete the loan or debt.');
  }
}

function addInstallment(loan) {
  const lastInstallment = loan.installments[loan.installments.length - 1];
  const amount = lastInstallment
    ? Number(lastInstallment.amount)
    : Math.round((loan.originalAmount / 3) * 100) / 100;

  loan.installments.push({
    date: nextInstallmentDate(loan),
    amount,
    status: 'Unpaid'
  });
}

function nextInstallmentDate(loan) {
  const lastInstallment = loan.installments[loan.installments.length - 1];
  const date = lastInstallment ? new Date(`${lastInstallment.date}T12:00:00`) : new Date();

  date.setMonth(date.getMonth() + 1);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

async function saveLoanSchedule(loan) {
  error.value = '';
  success.value = '';

  for (const installment of loan.installments) {
    if (!installment.date || !Number(installment.amount) || Number(installment.amount) <= 0) {
      error.value = 'Every installment needs a valid date and an amount greater than zero.';
      return;
    }
  }

  savingScheduleId.value = loan._id;

  try {
    const data = await saveSchedule(
      loan._id,
      loan.installments.map((installment) => ({
        _id: installment._id,
        date: installment.date,
        amount: Number(installment.amount),
        status: installment.status
      }))
    );
    replaceLoan(data);
    success.value = 'Repayment schedule saved.';
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not save the repayment schedule.');
  } finally {
    savingScheduleId.value = '';
  }
}

async function toggleStatus(loan, installment) {
  if (!installment._id) {
    return;
  }

  const newStatus = installment.status === 'Paid' ? 'Unpaid' : 'Paid';
  statusSavingId.value = installment._id;
  error.value = '';

  try {
    const data = await updateInstallmentStatus(loan._id, installment._id, newStatus);
    replaceLoan(data);
    success.value = `Installment marked as ${newStatus}.`;
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not update the installment status.');
  } finally {
    statusSavingId.value = '';
  }
}

function replaceLoan(updatedLoan) {
  const index = loans.value.findIndex((loan) => loan._id === updatedLoan._id);

  if (index !== -1) {
    loans.value[index] = prepareLoan(updatedLoan);
  }
}

function paidAmount(loan) {
  return loan.installments
    .filter((installment) => installment.status === 'Paid')
    .reduce((sum, installment) => sum + Number(installment.amount), 0);
}

function unpaidAmount(loan) {
  return loan.installments
    .filter((installment) => installment.status === 'Unpaid')
    .reduce((sum, installment) => sum + Number(installment.amount), 0);
}

function paidCount(loan) {
  return loan.installments.filter((installment) => installment.status === 'Paid').length;
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>Loans &amp; Debts</h1>
        <p class="page-subtitle">Manage loans, debts, and PayLater installments.</p>
      </div>
      <div class="heading-actions">
        <button type="button" class="btn btn-primary" @click="openAdd()">Add Loan / Debt</button>
      </div>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <p v-if="loading" class="loading-text">Loading loans and debts...</p>
    <section v-else-if="loans.length === 0" class="card">
      <p class="empty-state">No loans or debts yet. Add one to create a repayment schedule.</p>
    </section>
    <template v-else>
      <article v-for="loan in loans" :key="loan._id" class="loan-card">
        <div class="loan-header">
          <div>
            <h2 class="loan-title">{{ loan.title }}</h2>
            <p class="loan-meta">Created {{ formatDate(loan.createdAt) }}</p>
            <p v-if="loan.description" class="loan-description">{{ loan.description }}</p>
          </div>
          <div class="loan-amount">{{ formatPeso(loan.originalAmount) }}</div>
        </div>

        <div class="loan-totals">
          <span>Paid: <strong class="text-success">{{ formatPeso(paidAmount(loan)) }}</strong></span>
          <span>
            Remaining: <strong class="text-warning">{{ formatPeso(unpaidAmount(loan)) }}</strong>
          </span>
          <span>{{ paidCount(loan) }} of {{ loan.installments.length }} installments paid</span>
        </div>

        <p class="schedule-hint">
          Change the dates or amounts, add entries, then click Save Schedule. New installments start as Unpaid.
        </p>

        <div class="table-wrap">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Repayment date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(installment, index) in loan.installments" :key="installment._id || index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input
                    v-model="installment.date"
                    type="date"
                    aria-label="Repayment date"
                  />
                </td>
                <td>
                  <div class="schedule-amount">
                    <span>₱</span>
                    <input
                      v-model.number="installment.amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      aria-label="Repayment amount"
                    />
                  </div>
                  <span class="amount-preview">{{ formatPeso(installment.amount) }}</span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="installment.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'"
                  >
                    {{ installment.status }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="installment._id"
                    type="button"
                    class="btn-link"
                    :disabled="statusSavingId === installment._id"
                    @click="toggleStatus(loan, installment)"
                  >
                    {{ installment.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid' }}
                  </button>
                  <span v-else class="text-muted">Save first</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="loan-actions">
          <div class="loan-actions-left">
            <button type="button" class="btn btn-secondary btn-sm" @click="addInstallment(loan)">
              + Add installment
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="savingScheduleId === loan._id"
              @click="saveLoanSchedule(loan)"
            >
              {{ savingScheduleId === loan._id ? 'Saving...' : 'Save Schedule' }}
            </button>
          </div>

          <div class="loan-edit-actions">
            <button type="button" class="btn-link" @click="openEdit(loan)">Edit</button>
            <button type="button" class="btn-link danger" @click="removeLoan(loan)">Delete</button>
          </div>
        </div>
      </article>
    </template>

    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm()">
      <div class="modal">
        <h2>{{ editingLoanId ? 'Edit Loan / Debt' : 'Add Loan / Debt' }}</h2>

        <div v-if="formError" class="alert">{{ formError }}</div>

        <form @submit.prevent="saveLoan()">
          <div class="field">
            <label for="loanTitle">Title</label>
            <input id="loanTitle" v-model="form.title" type="text" placeholder="Title Loan" />
            <span v-if="submitted && !form.title.trim()" class="field-error">
              Please enter a title.
            </span>
          </div>

          <div class="field">
            <label for="loanAmount">Original amount (₱)</label>
            <input
              id="loanAmount"
              v-model.number="form.originalAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
            />
            <span v-if="submitted && !(Number(form.originalAmount) > 0)" class="field-error">
              Enter an amount greater than zero.
            </span>
          </div>

          <div class="field">
            <label for="loanDescription">Description (optional)</label>
            <textarea
              id="loanDescription"
              v-model="form.description"
              placeholder="Add a short note"
            ></textarea>
          </div>

          <p v-if="!editingLoanId" class="schedule-hint">
            Three monthly installments will be created automatically. All start as Unpaid.
          </p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm()">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
