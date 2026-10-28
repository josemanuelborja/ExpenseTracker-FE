<script setup>
import { reactive, ref } from 'vue';
import { forgotPassword } from '../services/auth';
import { getErrorMessage, isValidEmail } from '../utils/format';

const form = reactive({ email: '' });
const submitted = ref(false);
const loading = ref(false);
const error = ref('');
const message = ref('');
const resetUrl = ref('');

async function submit() {
  submitted.value = true;
  error.value = '';
  message.value = '';
  resetUrl.value = '';

  if (!isValidEmail(form.email)) {
    return;
  }

  loading.value = true;

  try {
    const data = await forgotPassword(form.email);
    message.value = data.message;
    resetUrl.value = data.resetUrl || '';
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not process the request.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">Expense Tracker</div>
      <h1 class="auth-title">Forgot password</h1>
      <p class="auth-subtitle">
        Enter the email address you used to register. We will send a password reset link.
      </p>

      <div v-if="error" class="alert">{{ error }}</div>

      <div v-if="message" class="alert alert-success">{{ message }}</div>

      <div v-if="resetUrl" class="dev-reset-link">
        <strong>Local development reset link</strong>
        <p class="text-muted">Email delivery is not configured, so use this link to reset your password.</p>
        <a :href="resetUrl">Open reset password page</a>
      </div>

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

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </button>

        <div class="auth-footer">
          <RouterLink to="/login">Back to login</RouterLink>
          <RouterLink to="/register">Create an account</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
