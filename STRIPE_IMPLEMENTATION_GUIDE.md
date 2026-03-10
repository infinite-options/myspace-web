# Stripe Implementation Guide - Step by Step

This guide provides a complete step-by-step process to implement Stripe payments in your web application, based on the working implementation in this codebase.

## Table of Contents

1. [Install Dependencies](#1-install-dependencies)
2. [Backend API Endpoints Required](#2-backend-api-endpoints-required)
3. [Stripe Payment Component](#3-stripe-payment-component)
4. [Payment Selection Component Integration](#4-payment-selection-component-integration)
5. [Stripe Fees Dialog Component](#5-stripe-fees-dialog-component)
6. [Payment Failure Component](#6-payment-failure-component)
7. [Complete Flow Overview](#7-complete-flow-overview)

---

## 1. Install Dependencies

First, install the required Stripe packages:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Or with yarn:

```bash
yarn add @stripe/stripe-js @stripe/react-stripe-js
```

---

## 2. Backend API Endpoints Required

Your backend needs to provide these endpoints. Below are the exact specifications with working examples using the actual endpoints from this codebase.

---

### 2.1 Get Stripe Public Key

**Endpoint:** `POST /api/v2/getCorrectKeys/{environment}`

**Full URL Examples:**

- Test: `https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST`
- Production: `https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PM`

**Request:**

```http
POST /api/v2/getCorrectKeys/PMTEST HTTP/1.1
Host: huo8rhh76i.execute-api.us-west-1.amazonaws.com
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "publicKey": "pk_test...."
}
```

**cURL Example:**

```bash
curl -X POST "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST" \
  -H "Content-Type: application/json"
```

**Node.js/Express Implementation:**

```javascript
// POST /api/v2/getCorrectKeys/:env
app.post("/api/v2/getCorrectKeys/:env", async (req, res) => {
  try {
    const { env } = req.params; // 'PM' or 'PMTEST' - comes from URL path parameter

    // Determine which Stripe key to use based on environment
    // Note: If using REACT_APP_ prefixed variables, backend may need to map them
    let publicKey;
    if (env === "PMTEST") {
      publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    } else if (env === "PM") {
      publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY_LIVE;
    } else {
      return res.status(400).json({ error: "Invalid environment" });
    }

    if (!publicKey) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    res.json({ publicKey });
  } catch (error) {
    console.error("Error fetching Stripe key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

**Important Notes:**

1. **PM vs PMTEST is determined by the URL path parameter**, not from the `.env` file. The `:env` parameter in the route (`/getCorrectKeys/:env`) receives either "PM" or "PMTEST" from the frontend.

2. **Frontend determines which to use** based on `paymentData.business_code`:
   - If `business_code === "PMTEST"` → calls `/getCorrectKeys/PMTEST`
   - Otherwise → calls `/getCorrectKeys/PM`

3. **The `.env` file only needs the Stripe keys**, not the PM/PMTEST value.

**Environment Variables (.env):**

**Required Variables:**

```env
# Stripe Public Keys (used by frontend - React requires REACT_APP_ prefix)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_STRIPE_PUBLIC_KEY_LIVE=pk_live_...

# Stripe Private/Secret Keys (used by backend only - NEVER expose in frontend)
REACT_APP_STRIPE_PRIVATE_KEY=sk_test_...
REACT_APP_STRIPE_PRIVATE_KEY_LIVE=sk_live_...
```

**Note:** The `REACT_APP_` prefix is required for React applications to access environment variables. If your backend is a separate Node.js/Express server, you may need to either:

1. Use the same variable names in your backend's `.env` file, or
2. Map the `REACT_APP_` prefixed variables to non-prefixed names in your backend code

**How PM/PMTEST is Determined:**

1. **Frontend Side:**
   - The frontend receives `paymentData.business_code` which can be either `"PMTEST"` or `"PM"`
   - This value is typically set based on your application's configuration or user selection
   - The frontend then constructs the URL: `/getCorrectKeys/${business_code}`

2. **Backend Side:**
   - The backend receives the environment as a URL path parameter (`:env`)
   - It reads the corresponding environment variable:
     - `PMTEST` → uses `REACT_APP_STRIPE_PUBLIC_KEY` (or `STRIPE_PUBLIC_KEY_TEST`)
     - `PM` → uses `REACT_APP_STRIPE_PUBLIC_KEY_LIVE` (or `STRIPE_PUBLIC_KEY_LIVE`)

3. **Example Flow:**

   ```javascript
   // Frontend
   const business_code = "PMTEST"; // or "PM"
   const url = `https://your-api.com/api/v2/getCorrectKeys/${business_code}`;
   // Results in: /getCorrectKeys/PMTEST or /getCorrectKeys/PM

   // Backend receives: req.params.env = "PMTEST" or "PM"
   // Then uses: process.env.REACT_APP_STRIPE_PUBLIC_KEY or REACT_APP_STRIPE_PUBLIC_KEY_LIVE
   ```

**Variable Naming Convention:**

The environment variables use the `REACT_APP_` prefix because React applications require this prefix to access environment variables. The variable names are:

- `REACT_APP_STRIPE_PUBLIC_KEY` - Test public key (used when `business_code === "PMTEST"`)
- `REACT_APP_STRIPE_PRIVATE_KEY` - Test secret/private key (used when `business_code === "PMTEST"`)
- `REACT_APP_STRIPE_PUBLIC_KEY_LIVE` - Live public key (used when `business_code === "PM"`)
- `REACT_APP_STRIPE_PRIVATE_KEY_LIVE` - Live secret/private key (used when `business_code === "PM"`)

**Checking Your .env File:**

Since `.env` files are typically gitignored, you'll need to create or verify it exists in your project root. The file should contain all four Stripe keys above. You can get these keys from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

- Test keys: Use when `business_code === "PMTEST"`
- Live keys: Use when `business_code === "PM"`

**Note for Backend Implementation:**

If your backend is a separate Node.js/Express server, the code examples in this guide include fallback logic (using `||`) to support both naming conventions. You can either:

1. Use the same `REACT_APP_` prefixed variables in your backend's `.env` file, or
2. Use non-prefixed variable names (`STRIPE_PUBLIC_KEY_TEST`, etc.) in your backend's `.env` file

---

### 2.2 Create Payment Intent (Credit Card)

**Endpoint:** `POST /api/v2/createPaymentIntent`

**Note:** This endpoint is specifically for Credit Card payments. For Bank Transfer (ACH) payments, use the `createEasyACHPaymentIntent` endpoint (see section 2.2b below).

**Full URL Example:**

- `https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent`

**Request:**

```http
POST /api/v2/createPaymentIntent HTTP/1.1
Host: huo8rhh76i.execute-api.us-west-1.amazonaws.com
Content-Type: application/json

{
  "customer_uid": "user_12345",
  "business_code": "PMTEST",
  "payment_summary": {
    "total": 100.50
  }
}
```

**Request Body Schema:**

```json
{
  "customer_uid": "string (required) - User/customer identifier",
  "business_code": "string (required) - 'PM' for production, 'PMTEST' for test",
  "payment_summary": {
    "total": "number (required) - Payment amount in dollars (e.g., 100.50)"
  }
}
```

**Response (200 OK):**

```
pi_3AbCdEfGhIjKlMnOpQrStUvWxYz_secret_1234567890abcdefghijklmnopqrstuvwxyz
```

**Note:** The response is a plain text string (the client secret), NOT a JSON object.

**Error Response (400 Bad Request):**

```json
{
  "error": "Invalid payment amount"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Failed to create payment intent"
}
```

**cURL Example:**

```bash
curl -X POST "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_uid": "user_12345",
    "business_code": "PMTEST",
    "payment_summary": {
      "total": 100.50
    }
  }'
```

**Node.js/Express Implementation:**

```javascript
const stripe = require("stripe");

// POST /api/v2/createPaymentIntent
app.post("/api/v2/createPaymentIntent", async (req, res) => {
  try {
    const { customer_uid, business_code, payment_summary } = req.body;

    // Validate input
    if (!customer_uid || !business_code || !payment_summary || !payment_summary.total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (payment_summary.total <= 0) {
      return res.status(400).json({ error: "Payment amount must be greater than 0" });
    }

    // Determine which Stripe secret key to use
    // Note: Backend should use REACT_APP_STRIPE_PRIVATE_KEY variables from .env
    const secretKey =
      business_code === "PMTEST" ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

    if (!secretKey) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    // Initialize Stripe with the appropriate key
    const stripeInstance = stripe(secretKey);

    // Convert dollars to cents (Stripe requires amounts in cents)
    const amountInCents = Math.round(payment_summary.total * 100);

    // Create payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        customer_uid: customer_uid,
        business_code: business_code,
      },
      // Optional: Link to existing Stripe customer if you have one
      // customer: stripe_customer_id,
    });

    // Return only the client secret (as plain text, not JSON)
    res.send(paymentIntent.client_secret);
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // Handle Stripe-specific errors
    if (error.type === "StripeCardError") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to create payment intent" });
  }
});
```

**Alternative: Using Express with proper error handling:**

```javascript
app.post("/api/v2/createPaymentIntent", async (req, res) => {
  try {
    const { customer_uid, business_code, payment_summary } = req.body;

    // Validation
    const errors = [];
    if (!customer_uid) errors.push("customer_uid is required");
    if (!business_code) errors.push("business_code is required");
    if (!payment_summary?.total) errors.push("payment_summary.total is required");

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Get Stripe instance
    const secretKey =
      business_code === "PMTEST" ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

    const stripeInstance = stripe(secretKey);

    // Create payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(payment_summary.total * 100),
      currency: "usd",
      metadata: {
        customer_uid,
        business_code,
      },
    });

    // Return client secret as plain text
    res.type("text").send(paymentIntent.client_secret);
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});
```

---

### 2.2b Create Payment Intent (Bank Transfer / ACH)

**Endpoint:** `POST /api/v2/createEasyACHPaymentIntent`

**Full URL Example:**

- `https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent`

**Request:**

```http
POST /api/v2/createEasyACHPaymentIntent HTTP/1.1
Host: huo8rhh76i.execute-api.us-west-1.amazonaws.com
Content-Type: application/json

{
  "customer_uid": "user_12345",
  "business_code": "PMTEST",
  "payment_summary": {
    "total": 100.50
  },
  "site": "LOCAL_PM"
}
```

**Request Body Schema:**

```json
{
  "customer_uid": "string (required) - User/customer identifier",
  "business_code": "string (required) - 'PM' for production, 'PMTEST' for test",
  "payment_summary": {
    "total": "number (required) - Payment amount in dollars (e.g., 100.50)"
  },
  "site": "string (optional) - 'LOCAL_PM' for localhost, 'PM' for production",
  "purchase_uids": "array (optional) - Array of purchase identifiers"
}
```

**Response (200 OK):**

```json
{
  "id": "seti_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/xxxxx"
}
```

**Note:** The response contains a checkout URL that the user should be redirected to complete the ACH payment.

**cURL Example:**

```bash
curl -X POST "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_uid": "user_12345",
    "business_code": "PMTEST",
    "payment_summary": {
      "total": 100.50
    },
    "site": "PM"
  }'
```

**Node.js/Express Implementation:**

```javascript
// POST /api/v2/createEasyACHPaymentIntent
app.post("/api/v2/createEasyACHPaymentIntent", async (req, res) => {
  try {
    const { customer_uid, business_code, payment_summary, site } = req.body;

    // Validate input
    if (!customer_uid || !business_code || !payment_summary || !payment_summary.total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (payment_summary.total <= 0) {
      return res.status(400).json({ error: "Payment amount must be greater than 0" });
    }

    // Determine which Stripe secret key to use
    // Note: Backend should use REACT_APP_STRIPE_PRIVATE_KEY variables from .env
    const secretKey =
      business_code === "PMTEST" ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

    if (!secretKey) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    // Initialize Stripe with the appropriate key
    const stripeInstance = stripe(secretKey);

    // Convert dollars to cents
    const amountInCents = Math.round(payment_summary.total * 100);

    // Create checkout session for ACH payment
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["us_bank_account"],
      mode: "payment",
      amount: amountInCents,
      currency: "usd",
      customer: customer_uid,
      success_url: `${req.headers.origin}/payment-success`,
      cancel_url: `${req.headers.origin}/payment-cancel`,
      metadata: {
        customer_uid: customer_uid,
        business_code: business_code,
      },
    });

    // Return session URL
    res.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating ACH payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});
```

---

### 2.3 Record Payment (After Stripe Success)

**Endpoint:** `POST /makePayment`

**Full URL Example:**

- `https://your-api.com/makePayment`

**Request:**

```http
POST /makePayment HTTP/1.1
Host: your-api.com
Content-Type: application/json
Authorization: Bearer your-auth-token (if required)

{
  "pay_purchase_id": [
    {
      "purchase_uid": "purchase_12345"
    },
    {
      "purchase_uid": "purchase_67890"
    }
  ],
  "pay_fee": 3.00,
  "pay_total": 100.00,
  "cashflow_total": 100.00,
  "payment_notes": "PM",
  "pay_charge_id": "stripe transaction key",
  "payment_type": "Credit Card",
  "payment_verify": "Unverified",
  "paid_by": "user_12345",
  "payment_intent": "pi_3AbCdEfGhIjKlMnOpQrStUvWxYz",
  "payment_method": "pm_1AbCdEfGhIjKlMnOpQrStUvWxYz"
}
```

**Request Body Schema:**

```json
{
  "pay_purchase_id": [
    {
      "purchase_uid": "string (required) - Purchase/order identifier"
    }
  ],
  "pay_fee": "number (required) - Convenience fee amount",
  "pay_total": "number (required) - Total payment amount (excluding fee)",
  "cashflow_total": "number (optional) - Total cashflow amount",
  "payment_notes": "string (required) - Business code ('PM' or 'PMTEST')",
  "pay_charge_id": "string (optional) - Stripe charge ID",
  "payment_type": "string (required) - Payment method type (e.g., 'Credit Card', 'Zelle')",
  "payment_verify": "string (required) - Verification status (e.g., 'Unverified', 'Verified')",
  "paid_by": "string (required) - User ID who made the payment",
  "payment_intent": "string (required) - Stripe payment intent ID (e.g., 'pi_xxxxx')",
  "payment_method": "string (required) - Stripe payment method ID (e.g., 'pm_xxxxx') or method name for non-Stripe"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment_id": "payment_12345"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Invalid payment data",
  "details": ["pay_purchase_id is required", "pay_total must be greater than 0"]
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Failed to record payment"
}
```

**cURL Example:**

```bash
curl -X POST "https://your-api.com/makePayment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-token" \
  -d '{
    "pay_purchase_id": [
      {"purchase_uid": "purchase_12345"}
    ],
    "pay_fee": 3.00,
    "pay_total": 100.00,
    "cashflow_total": 100.00,
    "payment_notes": "PM",
    "pay_charge_id": "stripe transaction key",
    "payment_type": "Credit Card",
    "payment_verify": "Unverified",
    "paid_by": "user_12345",
    "payment_intent": "pi_3AbCdEfGhIjKlMnOpQrStUvWxYz",
    "payment_method": "pm_1AbCdEfGhIjKlMnOpQrStUvWxYz"
  }'
```

**Node.js/Express Implementation:**

```javascript
// POST /makePayment
app.post("/makePayment", async (req, res) => {
  try {
    const { pay_purchase_id, pay_fee, pay_total, cashflow_total, payment_notes, pay_charge_id, payment_type, payment_verify, paid_by, payment_intent, payment_method } = req.body;

    // Validate required fields
    const errors = [];
    if (!pay_purchase_id || !Array.isArray(pay_purchase_id) || pay_purchase_id.length === 0) {
      errors.push("pay_purchase_id is required and must be a non-empty array");
    }
    if (pay_fee === undefined || pay_fee < 0) {
      errors.push("pay_fee is required and must be >= 0");
    }
    if (!pay_total || pay_total <= 0) {
      errors.push("pay_total is required and must be > 0");
    }
    if (!payment_notes) errors.push("payment_notes is required");
    if (!payment_type) errors.push("payment_type is required");
    if (!payment_verify) errors.push("payment_verify is required");
    if (!paid_by) errors.push("paid_by is required");
    if (!payment_intent) errors.push("payment_intent is required");
    if (!payment_method) errors.push("payment_method is required");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // Optional: Verify payment with Stripe if it's a Stripe payment
    if (payment_type === "Credit Card" && payment_intent.startsWith("pi_")) {
      try {
        const secretKey =
          payment_notes === "PMTEST"
            ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST
            : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

        const stripeInstance = stripe(secretKey);
        const paymentIntent = await stripeInstance.paymentIntents.retrieve(payment_intent);

        // Verify payment was successful
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({
            error: "Payment not completed",
            status: paymentIntent.status,
          });
        }

        // Verify amount matches
        const expectedAmount = Math.round((pay_total + pay_fee) * 100);
        if (paymentIntent.amount !== expectedAmount) {
          return res.status(400).json({
            error: "Payment amount mismatch",
            expected: expectedAmount,
            received: paymentIntent.amount,
          });
        }
      } catch (stripeError) {
        console.error("Stripe verification error:", stripeError);
        return res.status(400).json({ error: "Failed to verify payment with Stripe" });
      }
    }

    // Extract purchase UIDs from the array
    const purchaseUids = pay_purchase_id.map((item) => (typeof item === "string" ? item : item.purchase_uid));

    // Save payment to database
    const paymentRecord = {
      purchase_uids: purchaseUids,
      fee: pay_fee,
      total: pay_total,
      cashflow_total: cashflow_total || pay_total,
      payment_notes: payment_notes,
      charge_id: pay_charge_id,
      payment_type: payment_type,
      payment_verify: payment_verify,
      paid_by: paid_by,
      payment_intent: payment_intent,
      payment_method: payment_method,
      created_at: new Date(),
      status: "completed",
    };

    // Example: Save to database (adjust to your database)
    // const savedPayment = await db.payments.create(paymentRecord);
    // OR
    // const savedPayment = await PaymentModel.create(paymentRecord);

    // Update purchase statuses
    // await db.purchases.updateMany(
    //   { purchase_uid: { $in: purchaseUids } },
    //   { status: 'paid', payment_id: savedPayment.id }
    // );

    // Return success response
    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment_id: paymentRecord.payment_intent, // or savedPayment.id
      data: paymentRecord,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      error: "Failed to record payment",
      message: error.message,
    });
  }
});
```

**Alternative: Using async/await with database transaction:**

```javascript
app.post("/makePayment", async (req, res) => {
  const transaction = await db.transaction(); // Adjust for your DB

  try {
    const paymentData = req.body;

    // Validate and process payment data
    // ... validation code ...

    // Save payment in transaction
    const payment = await db.payments.create(
      {
        // ... payment fields ...
      },
      { transaction },
    );

    // Update purchases
    await db.purchases.update({ purchase_uid: { $in: purchaseUids } }, { status: "paid", payment_id: payment.id }, { transaction });

    // Commit transaction
    await transaction.commit();

    res.json({ success: true, payment_id: payment.id });
  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    console.error("Payment error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});
```

---

## 3. Stripe Payment Component

Create `StripePayment.js`:

```javascript
import React, { useState } from "react";
import { Button, Modal, Typography, IconButton, Box, CircularProgress } from "@mui/material";
import { useElements, useStripe, CardElement, Elements } from "@stripe/react-stripe-js";
import Payment_Failure from "./Payment_Failure";
import CloseIcon from "@mui/icons-material/Close";

function StripePayment(props) {
  const { message, amount, paidBy, show, setShow, submit } = props;
  const [showSpinner, setShowSpinner] = useState(false);
  const [showError, setShowError] = useState(false);
  const elements = useElements();
  const stripe = useStripe();

  const handleClose = () => {
    setShow(false);
  };

  const submitPayment = async () => {
    console.log("In StripePayment");

    // Step 1: Create payment intent on backend
    const paymentData = {
      customer_uid: paidBy,
      business_code: message === "PMTEST" ? message : "PM",
      payment_summary: {
        total: parseFloat(amount),
      },
    };

    // Use the exact payment intent endpoint
    const createPaymentIntentURL = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent";

    const response = await fetch(createPaymentIntentURL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.statusText}`);
    }

    const clientSecret = await response.json();

    // Step 2: Get card element and create payment method
    const cardElement = await elements.getElement(CardElement);
    const stripeResponse = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: "Customer Name", // Replace with actual customer name
      },
    });

    const paymentMethodID = stripeResponse.paymentMethod.id;

    // Step 3: Confirm the payment
    const confirmedCardPayment = await stripe.confirmCardPayment(clientSecret, {
      payment_method: stripeResponse.paymentMethod.id,
      setup_future_usage: "off_session",
    });

    const paymentIntentID = confirmedCardPayment.paymentIntent.id;

    // Step 4: Call submit callback with payment details
    await submit(paymentIntentID, paymentMethodID);
  };

  return (
    <Modal open={show} onClose={handleClose} aria-labelledby='payment-modal-title' aria-describedby='payment-modal-description'>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          border: "1px solid black",
          borderRadius: "10px",
          padding: "20px",
          width: "500px",
        }}
      >
        <IconButton
          edge='end'
          color='inherit'
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
          aria-label='close'
        >
          <CloseIcon />
        </IconButton>

        <Payment_Failure showError={showError} setShowError={setShowError} />

        <Box sx={{ paddingTop: "50px", paddingBottom: "50px" }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </Box>

        <div className='text-center mt-2'>
          {showSpinner ? (
            <div className='w-100 d-flex flex-column justify-content-center align-items-center'>
              <Typography variant='body2'>Processing...</Typography>
              <CircularProgress size={30} />
            </div>
          ) : null}

          <Button
            variant='contained'
            onClick={async () => {
              try {
                setShowSpinner(true);
                await submitPayment();
                setShowSpinner(false);
              } catch (err) {
                console.error("Payment error:", err);
                setShowSpinner(false);
                setShowError(true);
              }
            }}
            sx={{
              background: "#3D5CAC",
              color: "white",
              width: "100%",
              borderRadius: "10px",
              marginTop: "10px",
            }}
          >
            Pay Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default StripePayment;
```

---

## 4. Payment Selection Component Integration

In your payment selection component (e.g., `SelectPayment.jsx`), add the following:

### 4.1 Imports

```javascript
// Stripe Imports
import StripeFeesDialog from "./StripeFeesDialog";
import StripePayment from "./StripePayment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
```

### 4.2 State Variables

```javascript
const [stripePayment, setStripePayment] = useState(false);
const [stripeDialogShow, setStripeDialogShow] = useState(false);
const [stripePromise, setStripePromise] = useState(null);
```

### 4.3 Function to Load Stripe Public Key

```javascript
const toggleKeys = async () => {
  setShowSpinner(true);

  // Determine if test or production and use the exact endpoint
  const environment = paymentData.business_code === "PMTEST" ? "PMTEST" : "PM";
  const url = `https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/${environment}`;

  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Stripe key: ${response.statusText}`);
  }

  const responseData = await response.json();

  // Load Stripe with public key
  const stripePromise = loadStripe(responseData.publicKey);
  setStripePromise(stripePromise);

  setShowSpinner(false);
};
```

### 4.4 Submit Handler

```javascript
const submit = async (paymentIntent, paymentMethod) => {
  setShowSpinner(true);

  let payment_request_payload = {
    pay_purchase_id: paymentData.purchase_uids,
    pay_fee: convenience_fee,
    pay_total: balance,
    cashflow_total: cashFlowTotal,
    payment_notes: paymentData.business_code,
    pay_charge_id: "stripe transaction key",
    payment_type: selectedMethod,
    payment_verify: "Unverified",
    paid_by: getProfileId(),
    payment_intent: paymentIntent,
    payment_method: paymentMethod,
  };

  // For non-Stripe methods, use confirmation number
  if (paymentMethod === "Zelle" || paymentMethod === "Paypal" || paymentMethod === "Venmo" || paymentMethod === "ApplePay") {
    payment_request_payload.payment_intent = confirmationNumber;
  }

  const response = await fetch(`${YOUR_API_BASE_URL}/makePayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if required
      // "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify(payment_request_payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Payment recording failed");
  }

  const result = await response.json();
  console.log("Payment recorded:", result);

  setShowSpinner(false);
  // Navigate to success page or dashboard
};
```

### 4.5 Handle Credit Card Selection

```javascript
const handleSubmit = async (e) => {
  if (selectedMethod === "Credit Card") {
    // Show fee dialog first
    setStripeDialogShow(true);
  } else if (selectedMethod === "zelle") {
    // Handle other payment methods...
  }
};
```

### 4.6 Render Stripe Components

```javascript
return (
  <>
    {/* Your payment method selection UI */}

    {/* Stripe Fees Dialog */}
    <StripeFeesDialog stripeDialogShow={stripeDialogShow} setStripeDialogShow={setStripeDialogShow} toggleKeys={toggleKeys} setStripePayment={setStripePayment} />

    {/* Wrap StripePayment in Elements provider */}
    {stripePromise && (
      <Elements stripe={stripePromise}>
        <StripePayment submit={submit} message={paymentData.business_code} amount={totalBalance} paidBy={paymentData.customer_uid} show={stripePayment} setShow={setStripePayment} />
      </Elements>
    )}
  </>
);
```

---

## 5. Stripe Fees Dialog Component

Create `StripeFeesDialog.js`:

```javascript
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogActions } from "@material-ui/core";
import { Button } from "react-bootstrap";

export default function StripeFeesDialog(props) {
  const { stripeDialogShow, setStripeDialogShow, toggleKeys, setStripePayment } = props;

  return (
    <Dialog open={stripeDialogShow} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
      <DialogTitle id='alert-dialog-title'>Payment Processing Fees</DialogTitle>
      <DialogContent>
        <h5>An additional 3% will be charged as credit card fees</h5>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setStripeDialogShow(false)}
          style={{
            backgroundColor: "#3D5CAC",
            color: "white",
            width: "100%",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            toggleKeys(); // Load Stripe public key
            setStripePayment(true); // Show Stripe payment modal
            setStripeDialogShow(false); // Close fee dialog
          }}
          style={{
            backgroundColor: "#3D5CAC",
            color: "white",
            width: "100%",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 6. Payment Failure Component

Create `Payment_Failure.jsx`:

```javascript
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogActions } from "@material-ui/core";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Payment_Failure(props) {
  const navigate = useNavigate();
  const { showError, setShowError } = props;

  return (
    <Dialog open={showError} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
      <DialogTitle id='alert-dialog-title'></DialogTitle>
      <DialogContent>
        <div className='d-flex justify-content-center align-items-center m-5'>
          <h5>The payment was unsuccessful. Would you like to go to your dashboard?</h5>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowError(false)}>Cancel</Button>
        <Button
          onClick={() => {
            setShowError(false);
            navigate("/dashboard"); // Adjust to your dashboard route
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 7. Complete Flow Overview

### Payment Flow Sequence:

1. **User selects "Credit Card" payment method**
   - `handleSubmit()` is called
   - `setStripeDialogShow(true)` shows fee dialog

2. **User confirms fee dialog**
   - `toggleKeys()` is called to fetch Stripe public key from backend
   - `loadStripe(publicKey)` initializes Stripe
   - `setStripePayment(true)` opens Stripe payment modal

3. **User enters card details and clicks "Pay Now"**
   - `submitPayment()` in `StripePayment.js` is called:
     - Creates payment intent on backend
     - Gets client secret
     - Creates payment method from card element
     - Confirms payment with Stripe
     - Gets `paymentIntentID` and `paymentMethodID`

4. **Payment success**
   - `submit(paymentIntentID, paymentMethodID)` is called
   - Payment details are sent to backend `/makePayment` endpoint
   - User is redirected to success page/dashboard

5. **Payment failure**
   - Error is caught
   - `Payment_Failure` dialog is shown
   - User can retry or go to dashboard

---

## Important Notes

1. **Environment Variables**: Replace `YOUR_BACKEND_URL` and `YOUR_API_BASE_URL` with your actual backend URLs.

2. **Error Handling**: Make sure to handle all potential errors:
   - Network failures
   - Invalid card details
   - Payment declines
   - Backend errors

3. **Security**:
   - Never expose your Stripe secret key in frontend code
   - Always use public keys in the frontend
   - Create payment intents on the backend
   - Validate all payment data on the backend

4. **Testing**:
   - Use Stripe test mode (`PMTEST`) during development
   - Use test card numbers: `4242 4242 4242 4242`
   - Use any future expiry date and any 3-digit CVC

5. **Dependencies**: Make sure you have Material-UI and React Bootstrap installed if you're using the exact code above, or adjust the imports to match your UI library.

---

## Quick Checklist

- [ ] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
- [ ] Create backend endpoint to return Stripe public key
- [ ] Create backend endpoint to create payment intents
- [ ] Create backend endpoint to record completed payments
- [ ] Create `StripePayment.js` component
- [ ] Create `StripeFeesDialog.js` component
- [ ] Create `Payment_Failure.jsx` component
- [ ] Integrate Stripe into your payment selection component
- [ ] Wrap `StripePayment` with `Elements` provider
- [ ] Test with Stripe test mode
- [ ] Handle errors appropriately
- [ ] Update URLs to match your backend

---

## 8. Testing the Implementation

### 8.1 Testing Endpoints with cURL

#### Test 1: Get Stripe Public Key (Test Mode)

```bash
curl -X POST "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "publicKey": "pk_test_..."
}
```

#### Test 2: Create Payment Intent

```bash
curl -X POST "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_uid": "test_user_123",
    "business_code": "PMTEST",
    "payment_summary": {
      "total": 50.00
    }
  }'
```

**Expected Response:**

```
pi_3AbCdEfGhIjKlMnOpQrStUvWxYz_secret_1234567890abcdefghijklmnopqrstuvwxyz
```

#### Test 3: Record Payment

```bash
curl -X POST "http://localhost:3000/makePayment" \
  -H "Content-Type: application/json" \
  -d '{
    "pay_purchase_id": [{"purchase_uid": "test_purchase_123"}],
    "pay_fee": 1.50,
    "pay_total": 50.00,
    "cashflow_total": 50.00,
    "payment_notes": "PMTEST",
    "pay_charge_id": "stripe transaction key",
    "payment_type": "Credit Card",
    "payment_verify": "Unverified",
    "paid_by": "test_user_123",
    "payment_intent": "pi_3AbCdEfGhIjKlMnOpQrStUvWxYz",
    "payment_method": "pm_1AbCdEfGhIjKlMnOpQrStUvWxYz"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment_id": "pi_3AbCdEfGhIjKlMnOpQrStUvWxYz"
}
```

### 8.2 Testing with Stripe Test Cards

When testing in the frontend, use these Stripe test card numbers:

| Card Number           | Description                                |
| --------------------- | ------------------------------------------ |
| `4242 4242 4242 4242` | Visa - Success                             |
| `4000 0000 0000 0002` | Visa - Card declined                       |
| `4000 0000 0000 9995` | Visa - Insufficient funds                  |
| `4000 0025 0000 3155` | Visa - Requires authentication (3D Secure) |

**For all test cards:**

- **Expiry Date:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### 8.3 Frontend Testing Checklist

1. **Test Public Key Loading:**

   ```javascript
   // In browser console or component
   const testKeyFetch = async () => {
     const response = await fetch("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
     });
     const data = await response.json();
     console.log("Public Key:", data.publicKey);
   };
   ```

2. **Test Payment Intent Creation:**

   ```javascript
   const testPaymentIntent = async () => {
     const response = await fetch("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         customer_uid: "test_user",
         business_code: "PMTEST",
         payment_summary: { total: 100.0 },
       }),
     });
     const clientSecret = await response.text();
     console.log("Client Secret:", clientSecret);
   };
   ```

3. **Test Complete Payment Flow:**
   - Open your payment page
   - Select "Credit Card" payment method
   - Enter test card: `4242 4242 4242 4242`
   - Enter any future expiry and CVC
   - Click "Pay Now"
   - Verify payment succeeds and redirects

### 8.4 Backend Testing Script

Create a test file `test-stripe-endpoints.js`:

```javascript
const axios = require("axios");

const BASE_URL = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev";

async function testStripeEndpoints() {
  try {
    // Test 1: Get public key
    console.log("Test 1: Getting Stripe public key...");
    const keyResponse = await axios.post("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST");
    console.log("✓ Public Key:", keyResponse.data.publicKey);

    // Test 2: Create payment intent
    console.log("\nTest 2: Creating payment intent...");
    const intentResponse = await axios.post("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent", {
      customer_uid: "test_user_123",
      business_code: "PMTEST",
      payment_summary: { total: 100.0 },
    });
    const clientSecret = intentResponse.data;
    console.log("✓ Client Secret:", clientSecret);

    // Extract payment intent ID from client secret
    const paymentIntentId = clientSecret.split("_secret_")[0];

    // Test 3: Record payment
    console.log("\nTest 3: Recording payment...");
    // Note: Replace with your actual makePayment endpoint URL
    const paymentResponse = await axios.post(`${YOUR_API_BASE_URL}/makePayment`, {
      pay_purchase_id: [{ purchase_uid: "test_purchase_123" }],
      pay_fee: 3.0,
      pay_total: 100.0,
      cashflow_total: 100.0,
      payment_notes: "PMTEST",
      pay_charge_id: "stripe transaction key",
      payment_type: "Credit Card",
      payment_verify: "Unverified",
      paid_by: "test_user_123",
      payment_intent: paymentIntentId,
      payment_method: "pm_test_1234567890",
    });
    console.log("✓ Payment Recorded:", paymentResponse.data);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testStripeEndpoints();
```

Run with: `node test-stripe-endpoints.js`

### 8.5 Common Issues and Solutions

**Issue: "Failed to create payment intent"**

- Check Stripe secret key is set correctly
- Verify amount is > 0
- Check Stripe dashboard for API errors

**Issue: "Payment not completed"**

- Verify payment intent status in Stripe dashboard
- Check if 3D Secure authentication is required
- Ensure card details are correct

**Issue: "Failed to verify payment with Stripe"**

- Check payment intent ID is correct
- Verify you're using the correct Stripe key (test vs live)
- Ensure payment intent status is 'succeeded'

**Issue: "CORS errors"**

- Add CORS middleware to your Express server:
  ```javascript
  const cors = require("cors");
  app.use(cors());
  ```

---

## 9. Complete Backend Setup Example

Here's a complete Express.js server setup with all three endpoints:

```javascript
const express = require("express");
const cors = require("cors");
const stripe = require("stripe");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Get Stripe public key
// Note: This endpoint should match: POST /api/v2/getCorrectKeys/:env
app.post("/api/v2/getCorrectKeys/:env", async (req, res) => {
  try {
    const { env } = req.params;
    let publicKey;

    if (env === "PMTEST") {
      publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY_TEST;
    } else if (env === "PM") {
      publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY_LIVE || process.env.STRIPE_PUBLIC_KEY_LIVE;
    } else {
      return res.status(400).json({ error: "Invalid environment" });
    }

    if (!publicKey) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    res.json({ publicKey });
  } catch (error) {
    console.error("Error fetching Stripe key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create payment intent
// Note: This endpoint should be available at: POST /api/v2/createPaymentIntent
// Full URL: https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent
app.post("/api/v2/createPaymentIntent", async (req, res) => {
  try {
    const { customer_uid, business_code, payment_summary } = req.body;

    if (!customer_uid || !business_code || !payment_summary?.total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const secretKey =
      business_code === "PMTEST" ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

    if (!secretKey) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    const stripeInstance = stripe(secretKey);
    const amountInCents = Math.round(payment_summary.total * 100);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        customer_uid,
        business_code,
      },
    });

    res.type("text").send(paymentIntent.client_secret);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Record payment
app.post("/makePayment", async (req, res) => {
  try {
    const { pay_purchase_id, pay_fee, pay_total, cashflow_total, payment_notes, pay_charge_id, payment_type, payment_verify, paid_by, payment_intent, payment_method } = req.body;

    // Validate required fields
    if (!pay_purchase_id || !Array.isArray(pay_purchase_id) || pay_purchase_id.length === 0) {
      return res.status(400).json({ error: "pay_purchase_id is required" });
    }
    if (pay_total <= 0) {
      return res.status(400).json({ error: "pay_total must be greater than 0" });
    }
    if (!payment_intent || !payment_method) {
      return res.status(400).json({ error: "payment_intent and payment_method are required" });
    }

    // Verify payment with Stripe if it's a Stripe payment
    if (payment_type === "Credit Card" && payment_intent.startsWith("pi_")) {
      const secretKey =
        payment_notes === "PMTEST"
          ? process.env.REACT_APP_STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY_TEST
          : process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE || process.env.STRIPE_SECRET_KEY_LIVE;

      const stripeInstance = stripe(secretKey);
      const verifiedIntent = await stripeInstance.paymentIntents.retrieve(payment_intent);

      if (verifiedIntent.status !== "succeeded") {
        return res.status(400).json({
          error: "Payment not completed",
          status: verifiedIntent.status,
        });
      }
    }

    // Save payment to database (implement your database logic here)
    const purchaseUids = pay_purchase_id.map((item) => (typeof item === "string" ? item : item.purchase_uid));

    // TODO: Save to database
    // const payment = await db.payments.create({ ... });
    // await db.purchases.update({ ... });

    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment_id: payment_intent,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**package.json dependencies:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^14.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

---

This guide should give you everything you need to implement Stripe payments in your application. Adjust the code to match your specific backend API structure and UI framework.
