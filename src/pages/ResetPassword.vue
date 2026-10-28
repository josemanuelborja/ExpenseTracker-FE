<script setup>
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { resetPassword } from '../services/auth';
import { getErrorMessage } from '../utils/format';

const route = useRoute();
const token = ref(String(route.query.token || ''));
const form = reactive({ password: '', confirmPassword: '' });
const submitted = ref(false);
const loading = ref(false);
const done = ref(false);
const error = ref('');
const message = ref('');

async function submit() {
  submitted.value = true;
  error.value = '';

  if (form.password.length < 6 || !form.confirmPassword) {
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    const data = await resetPassword(token.value, form.password);
    done.value = true;
    message.value = data.message;
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not reset your password.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Expense Tracker</div>
      <h1 class="auth-title">Reset password</h1>

      <template v-if="!token">
        <p class="auth-subtitle">This password reset link is missing its token.</p>
        <div class="alert">Please request a new password reset link.</div>
        <RouterLink to="/forgot-password">Request a new link</RouterLink>
      </template>

      <template v-else-if="done">
        <p class="auth-subtitle">{{ message }}</p>
        <div class="alert alert-success">Your password has been changed.</div>
        <RouterLink to="/login">Go to login</RouterLink>
      </template>

      <template v-else>
        <p class="auth-subtitle">Choose a new password for your account.</p>

        <div v-if="error" class="alert">{{ error }}</div>

        <form @submit.prevent="submit()">
          <div class="field">
            <label for="password">New password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
            />
            <span v-if="submitted && form.password.length < 6" class="field-error">
              Password must be at least 6 characters.
            </span>
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
            />
            <span v-if="submitted && !form.confirmPassword" class="field-error">
              Please confirm your new password.
            </span>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save new password' }}
          </button>

          <div class="auth-footer">
            <RouterLink to="/login">Back to login</RouterLink>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>
