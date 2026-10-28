<script setup>
import { onMounted, reactive, ref } from 'vue';
import { getProfile, updateProfile } from '../services/auth';
import { formatDate, getErrorMessage, isValidEmail } from '../utils/format';

const user = ref(null);
const loading = ref(true);
const saving = ref(false);
const submitted = ref(false);
const error = ref('');
const success = ref('');
const form = reactive({ name: '', email: '' });

onMounted(() => {
  loadProfile();
});

async function loadProfile() {
  loading.value = true;
  error.value = '';

  try {
    const data = await getProfile();
    user.value = data;
    form.name = data.name;
    form.email = data.email;
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not load your profile.');
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  submitted.value = true;
  error.value = '';
  success.value = '';

  if (form.name.trim().length < 2 || !isValidEmail(form.email)) {
    return;
  }

  saving.value = true;

  try {
    user.value = await updateProfile(form.name.trim(), form.email.trim());
    success.value = 'Account details updated.';
  } catch (requestError) {
    error.value = getErrorMessage(requestError, 'Could not update your account.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>Account Settings</h1>
        <p class="page-subtitle">Update the name and email address on your account.</p>
      </div>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <section class="card">
      <p v-if="loading" class="loading-text">Loading profile...</p>
      <template v-else>
        <div class="card-heading">
          <h2>Profile</h2>
          <span v-if="user?.createdAt" class="text-muted">
            Member since {{ formatDate(user.createdAt) }}
          </span>
        </div>

        <form @submit.prevent="saveProfile()">
          <div class="form-grid">
            <div class="field">
              <label for="accountName">Full name</label>
              <input id="accountName" v-model="form.name" type="text" autocomplete="name" />
              <span v-if="submitted && form.name.trim().length < 2" class="field-error">
                Please enter your name.
              </span>
            </div>

            <div class="field">
              <label for="accountEmail">Email</label>
              <input
                id="accountEmail"
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
              />
              <span v-if="submitted && !isValidEmail(form.email)" class="field-error">
                Enter a valid email address.
              </span>
            </div>
          </div>

          <p class="field-hint">Your email is used for login and password reset requests.</p>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </template>
    </section>
  </div>
</template>
