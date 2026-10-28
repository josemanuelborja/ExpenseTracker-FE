export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Utilities',
  'Internet',
  'School Supplies',
  'Rent',
  'Health',
  'Shopping',
  'Other'
];

export function formatPeso(value) {
  const amount = Number(value || 0);

  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function toInputDate(value) {
  return String(value || '').slice(0, 10);
}

export function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
