# Subscription Feature Testing Guide

This guide outlines how to test the new subscription flow, which now only supports the "Free" and "Pro" tiers.

---

## 1. Testing at Account Creation

- **What should happen:**  
  When a new user (with the "talent" role) registers, they should automatically be assigned the "free" subscription tier.
- **How to test:**
  1. Register a new user as a "talent" via your registration form.
  2. Log in as this user.
  3. Go to the Subscription Dashboard.
  4. You should see the "Free" plan, with 3 leads/month and the correct features.
  5. Try applying to events—after 3 applications, you should be prompted to upgrade to "Pro".

---

## 2. Testing After Account Creation (Upgrading/Downgrading)

- **What should happen:**  
  Existing users should only see "Free" or "Pro" as options. Upgrading should switch their tier and unlock all "Pro" features.

- **How to test:**
  1. Log in as an existing "talent" user.
  2. Go to the Subscription Dashboard.
  3. You should see either "Free" or "Pro" as your current plan.
  4. If on "Free", you should see an option/recommendation to upgrade to "Pro".
  
  5. If you upgrade (simulate this if payment is not implemented), your plan should change to "Pro" and all "Pro" features should be visible.
  6. If you downgrade (if this is supported), you should return to "Free" and see the 3 leads/month limit.

---

## 3. Testing the Seeder (for Dev/QA)

- **What should happen:**  
  The seeder should only create "Free" and "Pro" subscriptions for test users.
- **How to test:**
  1. Run the database seeder (`node backend/seedDatabase.js` or your usual command).
  2. Check the database (e.g., with MongoDB Compass or CLI) and confirm that only "free" and "pro" tiers exist in the `subscriptions` collection.

---

## 4. Testing the Application Limit

- **What should happen:**  
  "Free" users can only apply to 3 events per month. "Pro" users have no limit.
- **How to test:**
  1. As a "Free" user, apply to 3 events.
  2. On the 4th attempt, you should receive a message that you've reached your monthly limit and need to upgrade.
  3. As a "Pro" user, you should be able to apply to unlimited events.

---

## 5. Testing the UI

- **What should happen:**  
  Only "Free" and "Pro" should be visible anywhere in the UI (dashboard, recommendations, upgrade buttons, etc.).
- **How to test:**
  1. Browse all subscription-related pages and modals.
  2. Confirm that no old tiers (like "pro-tier", "location-pro", etc.) are visible.

---

## 6. Testing Recommendations

- **What should happen:**  
  Upgrade recommendations should only suggest "Pro" (never any other tier).
- **How to test:**
  1. As a "Free" user, apply to several events.
  2. Check the recommendations section in the Subscription Dashboard.
  3. Only "Pro" should be recommended.

---

## Summary Table

| Test Scenario                | Expected Result                                 |
|------------------------------|------------------------------------------------|
| New user registration        | Assigned "Free" tier, 3 leads/month            |
| Free user applies to events  | Limit at 3, prompt to upgrade to "Pro"         |
| Pro user applies to events   | No limit, all features visible                 |
| Seeder run                   | Only "Free" and "Pro" in DB                    |
| UI/Recommendations           | Only "Free" and "Pro" shown everywhere         | 