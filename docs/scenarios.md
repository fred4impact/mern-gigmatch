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

# Platform Functional Scenarios (Current State)

## 7. User Registration
- **What should happen:**
  Any new user (talent or planner) can register. Upon registration, a user profile is created and a free subscription is automatically assigned.
- **How to test:**
  1. Go to the registration page and fill out the form as either a talent or planner.
  2. Submit the form.
  3. Log in and check the dashboard/profile.
  4. Go to the Subscription Dashboard; you should see a Free plan assigned.

## 8. User Login
- **What should happen:**
  Registered users can log in with their email and password. The system authenticates and redirects them to their dashboard (admin users go to admin dashboard).
- **How to test:**
  1. Go to the login page.
  2. Enter valid credentials for a registered user.
  3. Submit and verify you are redirected to the correct dashboard for your role.

## 9. Event Creation (Planners)
- **What should happen:**
  Planners can create new events by filling out the event creation form. The event is saved and appears in the events list.
- **How to test:**
  1. Log in as a planner.
  2. Go to Create Event.
  3. Fill out the event details and submit.
  4. Check that the event appears in the events list and is visible to talents.

## 10. Event Application (Talents)
- **What should happen:**
  Talents can browse open events and apply. Free users are limited to 3 applications/month; Pro users have no limit.
- **How to test:**
  1. Log in as a talent.
  2. Browse events and apply to up to 3 events.
  3. On the 4th attempt, you should be prompted to upgrade your subscription.
  4. Upgrade to Pro (if available) and verify you can apply to more events.

## 11. Subscription Management
- **What should happen:**
  All users have a subscription (Free or Pro). Users can view their plan, see usage, and upgrade if desired. Admins can see all subscriptions.
- **How to test:**
  1. Log in and go to the Subscription Dashboard.
  2. View your current plan and usage.
  3. (If implemented) Upgrade/downgrade your plan and verify changes.
  4. Log in as admin and check the Subscriptions section for all users.

## 12. Admin Dashboard
- **What should happen:**
  Admins can view/manage users, events, bookings, disputes, analytics, and subscriptions. All users (talent and planner) appear in the relevant sections.
- **How to test:**
  1. Log in as an admin.
  2. Navigate through Users, Events, Bookings, Disputes, Analytics, and Subscriptions sections.
  3. Verify all seeded/test users and data are visible and manageable.

## 13. Profile Management
- **What should happen:**
  Users can view and update their profile information, including personal details, skills, and (for talents) categories/subcategories.
- **How to test:**
  1. Log in as any user.
  2. Go to the Profile page.
  3. Edit and save profile details.
  4. Verify changes are reflected in the dashboard and event/application flows.

---

## Summary Table

| Test Scenario                | Expected Result                                 |
|------------------------------|------------------------------------------------|
| New user registration        | Assigned "Free" tier, 3 leads/month            |
| Free user applies to events  | Limit at 3, prompt to upgrade to "Pro"         |
| Pro user applies to events   | No limit, all features visible                 |
| Seeder run                   | Only "Free" and "Pro" in DB                    |
| UI/Recommendations           | Only "Free" and "Pro" shown everywhere         | 

## Summary Table (Platform Functions)

| Scenario                  | Expected Result                                      |
|---------------------------|-----------------------------------------------------|
| User Registration         | Profile + Free subscription for all new users        |
| User Login                | Authenticated, redirected to correct dashboard       |
| Event Creation            | Planners create events, visible to talents           |
| Event Application         | Talents apply (3/month free, unlimited Pro)         |
| Subscription Management   | All users have a plan, admin sees all subscriptions  |
| Admin Dashboard           | Admin manages all users, events, analytics, etc.     |
| Profile Management        | Users update/view profile, info used in flows        | 