<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/auth';
import { getErrorMessage, isValidEmail } from '../utils/format';

const router = useRouter();
const form = reactive({ name: '', email: '', password: '', confirmPassword: '' });
const submitted = ref(false);
const loading = ref(false);
const error = ref('');

async function submit() {
  submitted.value = true;
  error.value = '';

  if (
    form.name.length < 2 ||
    !isValidEmail(form.email) ||
    form.password.length < 6 ||
    !form.confirmPassword
  ) {
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    await register(form.name, form.email, form.password);
    router.push('/expenses');
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not create your account.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Expense Tracker</div>
      <h1 class="auth-title">Create an account</h1>
      <p class="auth-subtitle">Start tracking your daily expenses.</p>

      <div v-if="error" class="alert">{{ error }}</div>

      <form @submit.prevent="submit()">
        <div class="field">
          <label for="name">Full name</label>
          <input id="name" v-model.trim="form.name" type="text" autocomplete="name" />
          <span v-if="submitted && form.name.length < 2" class="field-error">
            Please enter your name.
          </span>
        </div>

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

        <div class="form-grid">
          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
            />
            <span v-if="submitted && form.password.length < 6" class="field-error">
              At least 6 characters.
            </span>
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
            />
            <span v-if="submitted && !form.confirmPassword" class="field-error">
              Please confirm your password.
            </span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>

        <div class="auth-footer">
          <span class="text-muted">Already have an account?</span>
          <RouterLink to="/login">Log in</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
