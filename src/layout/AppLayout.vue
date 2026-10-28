<script setup>
import { useRouter } from 'vue-router';
import { currentUser, logout as clearSession } from '../services/auth';

const router = useRouter();

function logout() {
  clearSession();
  router.push('/login');
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">Expense Tracker</div>

      <nav class="sidebar-nav" aria-label="Main navigation">
        <RouterLink to="/expenses" active-class="active">Expenses</RouterLink>
        <RouterLink to="/dashboard" active-class="active">Dashboard</RouterLink>
        <RouterLink to="/loans" active-class="active">Loans &amp; Debts</RouterLink>
        <RouterLink to="/account" active-class="active">Account Settings</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-box">
          <span class="user-name">{{ currentUser?.name }}</span>
          <span class="user-email">{{ currentUser?.email }}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click="logout()">Log out</button>
      </div>
    </aside>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
