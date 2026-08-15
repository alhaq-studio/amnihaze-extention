# Monetization and Backend Setup Guide for AmnGaze

To fully own the extension's ecosystem and payments, you need to replace the original developer's backend services with your own. 

This guide details the three core areas you need to set up: **Google OAuth**, **Payment Platform (Polar.sh / Stripe)**, and your **Backend Server (Cloudflare Worker or Node.js)**.

---

## 1. Set Up Google Authentication (Google OAuth)

The extension uses Google Sign-In for user accounts. The current Client ID belongs to the original author's Google Developer Console.

### Step-by-Step Setup:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project named `AmnGaze`.
3. Navigate to **APIs & Services** > **OAuth consent screen**.
   - Select **External** (unless you want it locked to a Google Workspace).
   - Fill in app information (App name: `AmnGaze`, Support email, Developer contact).
   - Under Scopes, add `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
4. Navigate to **APIs & Services** > **Credentials**.
5. Click **Create Credentials** > **OAuth client ID**.
6. Select **Chrome extension** as the Application type.
7. Fill in:
   - **Name**: `AmnGaze Extension`
   - **Item ID**: Your Chrome Web Store extension ID (you will get this when you upload the extension to the Chrome Web Store Dashboard).
8. Copy the generated **Client ID**.
9. Update `client_id` in your `manifest.json`:
   ```json
   "oauth2": {
      "client_id": "YOUR_NEW_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "scopes": [
         "https://www.googleapis.com/auth/userinfo.email",
         "https://www.googleapis.com/auth/userinfo.profile"
      ]
   }
   ```

---

## 2. Set Up the Payments Platform (Stripe or Polar.sh)

The original codebase had integration with **Polar.sh** (which is built on Stripe and is very developer-friendly for open-source projects). You can stick with Polar.sh or use raw Stripe.

### Option A: Using Polar.sh (Recommended - Easiest)
1. Sign up at [Polar.sh](https://polar.sh/).
2. Create a Store/Organization named `AmnGaze`.
3. Create your subscription products/tiers (e.g., Free, Pro Monthly, Pro Yearly).
4. Get your Polar API key and store client credentials.

### Option B: Using Stripe Directly
1. Sign up at [Stripe.com](https://stripe.com/).
2. Create subscription products.
3. Configure the Stripe Customer Portal for billing management.

---

## 3. Deploy Your Own Backend API

You need a lightweight backend API to bridge the extension, Google Sign-In, and Stripe/Polar. The current extension points to a Cloudflare Worker: `https://amngaze-api.alhaq-studio.workers.dev`.

### What your backend needs to do:
1. **Verify Google Sign-In Token**: 
   When a user signs in, the extension sends their Google identity token to your backend. The backend calls Google's token verification API to ensure it is authentic.
2. **Handle Webhooks**: 
   Listen to webhooks from Stripe/Polar. When a customer subscribes, Stripe/Polar sends a request to your backend. Your backend should record in a database (like Firebase or Supabase) that the user `user_email` is now a Premium customer.
3. **Validate Subscription Status**:
   Expose an endpoint `/api/auth/validate` that the extension can query. It should check the database and return:
   ```json
   {
     "valid": true,
     "token": "signed-jwt-token",
     "expiresIn": 3600
   }
   ```

---

## 4. Re-Enable Real Premium Check in Extension Code

Currently, the extension code has premium checks hardcoded to `true` to keep Pro features unlocked. When you have your backend ready, you should restore the network validation:

In `dist/background.js` (and popup scripts), replace:
```javascript
static async isPremiumUser(e=!0){return true;}
```
with actual database checks or API requests:
```javascript
static async isPremiumUser(e=!0){
   // Query your backend API
   const response = await this.makeRequest('/api/auth/validate');
   return response.isPremium === true;
}
```

And update the API base URL at the top of your background/popup files:
```javascript
var V = "https://your-amngaze-api.workers.dev";
```
