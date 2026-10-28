<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn, login } from '../services/auth';
import { getErrorMessage, isValidEmail } from '../utils/format';

const router = useRouter();
const form = reactive({ email: '', password: '' });
const submitted = ref(false);
const loading = ref(false);
const error = ref('');

onMounted(() => {
  if (isLoggedIn()) {
    router.replace('/expenses');
  }
});

async function submit() {
  submitted.value = true;
  error.value = '';

  if (!isValidEmail(form.email) || form.password.length < 6) {
    return;
  }

  loading.value = true;

  try {
    await login(form.email, form.password);
    router.push('/expenses');
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not log in. Please try again.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Expense Tracker</div>
      <h1 class="auth-title">Log in</h1>
      <p class="auth-subtitle">Sign in to manage your expenses and repayments.</p>

      <div v-if="error" class="alert">{{ error }}</div>

      <form @submit.prevent="submit()">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
          <span v-if="submitted && !isValidEmail(form.email)" class="field-error">
            Enter a valid email address.
          </span>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Your password"
          />
          <span v-if="submitted && form.password.length < 6" class="field-error">
            Password must be at least 6 characters.
          </span>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>

        <div class="auth-footer">
          <RouterLink to="/forgot-password">Forgot password?</RouterLink>
          <RouterLink to="/register">Create an account</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
