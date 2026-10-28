# ExpenseTracker-FE

The Vue.js frontend for the Expense Tracker application. It connects to the existing Express and MongoDB API and keeps the same pages, styling, and features as the original Angular version.

## Features

- Register, log in, log out, forgot password, and reset password
- Protected pages with a login guard
- Add, edit, delete, filter, and total expenses
- Loans and debts with editable repayment schedules
- Mark installments as Paid or Unpaid
- Dashboard with expense and installment totals
- Account profile settings
- Philippine peso formatting with two decimal places, for example `₱1,250.75`
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Axios

## Project Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── layout/
│   │   └── AppLayout.vue
│   ├── pages/
│   │   ├── Account.vue
│   │   ├── Dashboard.vue
│   │   ├── Expenses.vue
│   │   ├── ForgotPassword.vue
│   │   ├── Loans.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── ResetPassword.vue
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── expenses.js
│   │   └── loans.js
│   ├── utils/
│   │   └── format.js
│   ├── App.vue
│   ├── main.js
│   ├── router.js
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## Requirements

- Node.js 20 or newer
- npm
- The backend API running at `http://localhost:5000`

## Install

```powershell
npm install
```

## Run in Development

```powershell
npm start
```

Or:

```powershell
npm run dev
```

Open `http://localhost:4200` in your browser.

The Vite development server proxies `/api` requests to `http://localhost:5000`, so the browser does not make cross-origin requests during local development.

## Build for Production

```powershell
npm run build
```

The production files are written to `dist/`.

To preview the production build locally:

```powershell
npm run preview
```

## Connect to the Backend

The API base URL is set in `src/services/api.js`:

```js
baseURL: import.meta.env.VITE_API_URL || '/api'
```

To point the app at a different API URL, create a `.env` file in this folder:

```text
VITE_API_URL=https://your-api-url.example.com/api
```

When using Vite's `/api` proxy, no extra configuration is needed.

## Notes

- The login token is stored in `localStorage` under `expense_tracker_token`.
- The logged-in user is stored under `expense_tracker_user`.
- A `401` response clears the saved session and returns the user to the login page.
