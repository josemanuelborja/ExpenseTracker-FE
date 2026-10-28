<script setup>
import { onMounted, reactive, ref } from 'vue';
import {
  EXPENSE_CATEGORIES,
  formatDate,
  formatPeso,
  getErrorMessage,
  today
} from '../utils/format';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense
} from '../services/expenses';

const expenses = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref('');
const success = ref('');

const categories = EXPENSE_CATEGORIES;
const filters = reactive({ category: '', from: '', to: '' });

const showForm = ref(false);
const editingId = ref(null);
const submitted = ref(false);
const saving = ref(false);
const formError = ref('');
const form = reactive({
  title: '',
  amount: '',
  category: 'Food',
  date: '',
  description: ''
});

onMounted(() => {
  loadExpenses();
});

async function loadExpenses() {
  loading.value = true;
  error.value = '';

  try {
    const data = await getExpenses(filters);
    expenses.value = data;
    total.value = data.reduce((sum, expense) => sum + Number(expense.amount), 0);
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not load expenses.');
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  loadExpenses();
}

function clearFilters() {
  filters.category = '';
  filters.from = '';
  filters.to = '';
  loadExpenses();
}

function openAdd() {
  editingId.value = null;
  submitted.value = false;
  formError.value = '';
  form.title = '';
  form.amount = '';
  form.category = 'Food';
  form.date = today();
  form.description = '';
  showForm.value = true;
}

function openEdit(expense) {
  editingId.value = expense._id;
  submitted.value = false;
  formError.value = '';
  form.title = expense.title;
  form.amount = expense.amount;
  form.category = expense.category;
  form.date = String(expense.date).slice(0, 10);
  form.description = expense.description || '';
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingId.value = null;
  formError.value = '';
}

function formIsValid() {
  return (
    form.title.trim().length > 0 &&
    form.title.length <= 80 &&
    Number(form.amount) > 0 &&
    form.date !== '' &&
    String(form.description || '').length <= 300
  );
}

async function saveExpense() {
  submitted.value = true;
  formError.value = '';

  if (!formIsValid()) {
    return;
  }

  const expense = {
    title: form.title.trim(),
    amount: Number(form.amount),
    category: form.category,
    date: form.date,
    description: String(form.description || '').trim()
  };
  const isEditing = Boolean(editingId.value);

  saving.value = true;

  try {
    if (isEditing) {
      await updateExpense(editingId.value, expense);
    } else {
      await createExpense(expense);
    }

    success.value = isEditing ? 'Expense updated.' : 'Expense added.';
    closeForm();
    loadExpenses();
  } catch (requestError) {
    formError.value = getErrorMessage(requestError, 'Could not save the expense.');
  } finally {
    saving.value = false;
  }
}

async function removeExpense(expense) {
  const confirmed = window.confirm(`Delete "${expense.title}"? This cannot be undone.`);

  if (!confirmed) {
    return;
  }

  success.value = '';

  try {
    await deleteExpense(expense._id);
    success.value = 'Expense deleted.';
    loadExpenses();
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not delete the expense.');
  }
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>Expenses</h1>
        <p class="page-subtitle">Record and review your personal spending.</p>
      </div>
      <div class="heading-actions">
        <button type="button" class="btn btn-primary" @click="openAdd()">Add Expense</button>
      </div>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <form class="filter-bar" @submit.prevent="applyFilters()">
      <div class="filter-field">
        <label for="filterCategory">Category</label>
        <select id="filterCategory" v-model="filters.category">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="filterFrom">From date</label>
        <input id="filterFrom" v-model="filters.from" type="date" />
      </div>

      <div class="filter-field">
        <label for="filterTo">To date</label>
        <input id="filterTo" v-model="filters.to" type="date" />
      </div>

      <div class="filter-actions">
        <button type="button" class="btn btn-secondary" @click="clearFilters()">Clear</button>
        <button type="submit" class="btn btn-primary">Apply filters</button>
      </div>
    </form>

    <section class="card">
      <div class="card-heading">
        <h2>Expense List</h2>
        <div class="toolbar-total">
          <span>Total shown</span>
          <strong>{{ formatPeso(total) }}</strong>
        </div>
      </div>

      <p v-if="loading" class="loading-text">Loading expenses...</p>
      <p v-else-if="expenses.length === 0" class="empty-state">
        No expenses found. Add an expense or change your filters.
      </p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenses" :key="expense._id">
              <td>{{ expense.title }}</td>
              <td>{{ expense.category }}</td>
              <td>{{ formatDate(expense.date) }}</td>
              <td class="description-cell">{{ expense.description || '-' }}</td>
              <td class="amount-cell">{{ formatPeso(expense.amount) }}</td>
              <td>
                <div class="table-actions">
                  <button type="button" class="btn-link" @click="openEdit(expense)">Edit</button>
                  <button type="button" class="btn-link danger" @click="removeExpense(expense)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm()">
      <div class="modal">
        <h2>{{ editingId ? 'Edit Expense' : 'Add Expense' }}</h2>

        <div v-if="formError" class="alert">{{ formError }}</div>

        <form @submit.prevent="saveExpense()">
          <div class="field">
            <label for="expenseTitle">Title</label>
            <input
              id="expenseTitle"
              v-model="form.title"
              type="text"
              placeholder="Food, transportation, internet..."
            />
            <span v-if="submitted && !form.title.trim()" class="field-error">
              Please enter an expense title.
            </span>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="expenseAmount">Amount (₱)</label>
              <input
                id="expenseAmount"
                v-model.number="form.amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
              <span v-if="submitted && !(Number(form.amount) > 0)" class="field-error">
                Enter an amount greater than zero.
              </span>
            </div>

            <div class="field">
              <label for="expenseCategory">Category</label>
              <select id="expenseCategory" v-model="form.category">
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div class="field">
            <label for="expenseDate">Expense date</label>
            <input id="expenseDate" v-model="form.date" type="date" />
            <span v-if="submitted && !form.date" class="field-error">
              Please choose the expense date.
            </span>
          </div>

          <div class="field">
            <label for="expenseDescription">Description (optional)</label>
            <textarea
              id="expenseDescription"
              v-model="form.description"
              placeholder="Add a short note"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm()">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Expense' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
