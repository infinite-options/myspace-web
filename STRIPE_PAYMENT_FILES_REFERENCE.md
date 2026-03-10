# Stripe Payment Processing Files Reference

This document lists all the files used for Stripe payment processing in this codebase. These files can be used as reference for implementing Stripe payments in another application.

## Core Stripe Payment Files

### 1. **StripePayment.js** (Main Payment Component)

**Location:** `src/components/Settings/StripePayment.js`

**Purpose:** Core component that handles the Stripe payment flow:

- Creates payment intent via API
- Collects card details using Stripe Elements
- Confirms payment with Stripe
- Handles payment success/failure

**Key Features:**

- Uses `@stripe/react-stripe-js` hooks (`useStripe`, `useElements`)
- Implements `CardElement` for card input
- Calls `createPaymentIntent` API endpoint
- Calls `confirmCardPayment` to process payment
- Integrates with `Payment_Failure` component for error handling

---

### 2. **SelectPayment.jsx** (Payment Method Selection)

**Location:** `src/components/Settings/SelectPayment.jsx`

**Purpose:** Main payment selection component that integrates Stripe:

- Displays payment method options (Credit Card, Bank Transfer, Zelle, etc.)
- Handles Stripe public key loading
- Manages Stripe payment flow initiation
- Wraps `StripePayment` component with `Elements` provider

**Key Features:**

- Loads Stripe public key from `/getCorrectKeys/{env}` endpoint
- Uses `loadStripe()` to initialize Stripe
- Wraps `StripePayment` in `<Elements>` provider
- Handles fee calculation for credit card payments
- Manages payment submission flow

---

### 3. **MakePayment.jsx** (Alternative Payment Component)

**Location:** `src/components/Cashflow/MakePayment.jsx`

**Purpose:** Alternative payment component for cashflow payments:

- Similar functionality to `SelectPayment.jsx`
- Used in cashflow/transaction contexts
- Integrates Stripe payment processing

**Key Features:**

- Same Stripe integration pattern as `SelectPayment.jsx`
- Uses `StripePayment` and `StripeFeesDialog` components
- Handles payment for cashflow transactions

---

### 4. **StripeFeesDialog.js** (Fee Confirmation Dialog)

**Location:** `src/components/Settings/StripeFeesDialog.js`

**Purpose:** Dialog component that shows credit card processing fees:

- Displays 3% convenience fee information
- Allows user to confirm or cancel before proceeding
- Triggers Stripe key loading and payment modal

**Key Features:**

- Material-UI Dialog component
- Confirmation flow before opening Stripe payment modal
- Calls `toggleKeys()` to load Stripe public key

---

### 5. **Payment_Failure.jsx** (Error Handling)

**Location:** `src/components/Settings/Payment_Failure.jsx`

**Purpose:** Error dialog for failed payments:

- Displays payment failure message
- Provides option to navigate to dashboard
- Used by `StripePayment` component

**Key Features:**

- Material-UI Dialog for error display
- Navigation handling after failure
- User-friendly error messaging

---

## Supporting Files

### 6. **APIConfig.jsx** (API Configuration)

**Location:** `src/utils/APIConfig.jsx`

**Purpose:** Centralized API endpoint configuration:

- Defines base URLs for API calls
- Handles debug/production environment switching
- Used by payment components for API calls

**Key Content:**

```javascript
baseURL: {
  dev: encryptionON ? "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev" : "https://qn4agnb0v9.execute-api.us-west-1.amazonaws.com/production";
}
```

---

### 7. **httpMiddleware.js** (HTTP Request Handler)

**Location:** `src/utils/httpMiddleware.js`

**Purpose:** Middleware for API requests:

- Handles authentication
- Manages request/response processing
- Used by payment components for API calls

---

## Package Dependencies

### Required npm packages (from `package.json`):

```json
{
  "@stripe/react-stripe-js": "^2.3.1",
  "@stripe/stripe-js": "^2.1.10"
}
```

---

## File Structure Summary

```
src/
├── components/
│   ├── Settings/
│   │   ├── StripePayment.js          ⭐ Core payment component
│   │   ├── SelectPayment.jsx         ⭐ Payment selection & integration
│   │   ├── StripeFeesDialog.js       ⭐ Fee confirmation dialog
│   │   └── Payment_Failure.jsx       ⭐ Error handling
│   └── Cashflow/
│       └── MakePayment.jsx           ⭐ Alternative payment component
└── utils/
    ├── APIConfig.jsx                 ⚙️ API configuration
    └── httpMiddleware.js              ⚙️ HTTP request middleware
```

---

## Payment Flow

1. **User selects payment method** → `SelectPayment.jsx` or `MakePayment.jsx`
2. **User selects "Credit Card"** → `StripeFeesDialog.js` shows fee information
3. **User confirms** → Loads Stripe public key from API
4. **Stripe modal opens** → `StripePayment.js` component
5. **User enters card details** → Stripe Elements `CardElement`
6. **Payment processing** → Creates payment intent, confirms payment
7. **Success/Failure** → `Payment_Failure.jsx` handles errors

---

## Key API Endpoints Used

1. **Get Stripe Public Key:**
   - `POST /api/v2/getCorrectKeys/PMTEST` (test)
   - `POST /api/v2/getCorrectKeys/PM` (production)

2. **Create Payment Intent:**
   - `POST /api/v2/createPaymentIntent`

3. **Record Payment:**
   - `POST /makePayment`

---

## Implementation Notes

### For Frontend:

- All Stripe components must be wrapped in `<Elements>` provider
- Stripe public key must be loaded before rendering `StripePayment`
- Use `loadStripe()` to initialize Stripe instance
- Use `useStripe()` and `useElements()` hooks inside `Elements` provider

### For Backend:

- See `STRIPE_IMPLEMENTATION_GUIDE.md` for complete backend implementation
- Requires three endpoints: getCorrectKeys, createPaymentIntent, makePayment
- Environment variables needed: `REACT_APP_STRIPE_PUBLIC_KEY`, `REACT_APP_STRIPE_PRIVATE_KEY`, etc.

---

## Quick Reference Checklist

When implementing Stripe in another application, you'll need:

- [ ] `StripePayment.js` - Core payment component
- [ ] `StripeFeesDialog.js` - Fee confirmation (optional but recommended)
- [ ] `Payment_Failure.jsx` - Error handling
- [ ] Payment selection component (like `SelectPayment.jsx` or `MakePayment.jsx`)
- [ ] Stripe dependencies installed (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- [ ] Backend endpoints implemented (see guide)
- [ ] Environment variables configured

---

## Additional Resources

- **Complete Implementation Guide:** See `STRIPE_IMPLEMENTATION_GUIDE.md`
- **Stripe Documentation:** https://stripe.com/docs/stripe-js/react
- **Stripe Elements:** https://stripe.com/docs/stripe-js/react#elements

---

**Last Updated:** Based on current codebase structure
**Stripe Library Version:** @stripe/react-stripe-js v2.3.1, @stripe/stripe-js v2.1.10
