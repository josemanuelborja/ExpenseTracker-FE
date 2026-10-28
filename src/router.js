import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from './services/auth';
import AppLayout from './layout/AppLayout.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';
import ForgotPassword from './pages/ForgotPassword.vue';
import ResetPassword from './pages/ResetPassword.vue';
import Dashboard from './pages/Dashboard.vue';
import Expenses from './pages/Expenses.vue';
import Loans from './pages/Loans.vue';
import Account from './pages/Account.vue';

const routes = [
  { path: '/login', component: Login, meta: { title: 'Login - Expense Tracker' } },
  { path: '/register', component: Register, meta: { title: 'Register - Expense Tracker' } },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    meta: { title: 'Forgot Password - Expense Tracker' }
  },
  {
    path: '/reset-password',
    component: ResetPassword,
    meta: { title: 'Reset Password - Expense Tracker' }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/expenses' },
      { path: 'expenses', component: Expenses, meta: { title: 'Expenses - Expense Tracker' } },
      { path: 'dashboard', component: Dashboard, meta: { title: 'Dashboard - Expense Tracker' } },
      { path: 'loans', component: Loans, meta: { title: 'Loans & Debts - Expense Tracker' } },
      { path: 'account', component: Account, meta: { title: 'Account Settings - Expense Tracker' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/expenses' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title || 'Expense Tracker';
});

export default router;
