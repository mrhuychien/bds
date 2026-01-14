# BatDongSan.Digital - Tier 1 Test Checklist

> Run these tests before any release. All must PASS.

## Test Environment Setup
- [ ] Fresh browser (clear cache/cookies)
- [ ] Mobile viewport (375px width)
- [ ] Supabase project running
- [ ] .env.local configured

---

## Authentication Tests

### AUTH-01: Register New Account
```
Steps:
1. Navigate to /register
2. Fill: Name, Phone, Email, Password
3. Submit form

Expected:
- Redirects to /inventory
- Profile created in database
```
Status: [ ] PASS  [ ] FAIL

### AUTH-02: Login Success
```
Steps:
1. Navigate to /login
2. Enter valid credentials
3. Submit

Expected:
- Redirects to /inventory
- Session cookie set
```
Status: [ ] PASS  [ ] FAIL

### AUTH-03: Login Failure
```
Steps:
1. Navigate to /login
2. Enter wrong password
3. Submit

Expected:
- Error message displayed
- Stays on login page
```
Status: [ ] PASS  [ ] FAIL

### AUTH-04: Protected Routes
```
Steps:
1. Log out (clear session)
2. Try to access /inventory

Expected:
- Redirects to /login
```
Status: [ ] PASS  [ ] FAIL

### AUTH-05: Logout
```
Steps:
1. While logged in, click logout
2. Try to access /inventory

Expected:
- Session cleared
- Redirects to login
```
Status: [ ] PASS  [ ] FAIL

---

## Property (Kho Hàng) Tests

### PROP-01: View Property List
```
Steps:
1. Navigate to /inventory

Expected:
- Shows list of user's properties
- Or empty state if none
```
Status: [ ] PASS  [ ] FAIL

### PROP-02: Add New Property
```
Steps:
1. Click "+ Thêm mới"
2. Fill required fields (Title, Type, Price)
3. Submit

Expected:
- Property created
- Redirects to inventory list
- New property visible
```
Status: [ ] PASS  [ ] FAIL

### PROP-03: View Property Detail
```
Steps:
1. Click on a property card

Expected:
- Detail page loads
- All info displays correctly
```
Status: [ ] PASS  [ ] FAIL

### PROP-04: Edit Property
```
Steps:
1. Go to property detail
2. Click edit button
3. Change title
4. Save

Expected:
- Changes saved
- Detail page shows updated title
```
Status: [ ] PASS  [ ] FAIL

### PROP-05: Price Format
```
Steps:
1. Create property with price 5000000000

Expected:
- Displays as "5 tỷ"
```
Status: [ ] PASS  [ ] FAIL

### PROP-06: Property Type Label
```
Steps:
1. Create property type "nha_pho"

Expected:
- Displays as "Nhà phố"
```
Status: [ ] PASS  [ ] FAIL

---

## Customer (Khách Hàng) Tests

### CUST-01: View Customer List
```
Steps:
1. Navigate to /customers

Expected:
- Shows list or empty state
```
Status: [ ] PASS  [ ] FAIL

### CUST-02: Add New Customer
```
Steps:
1. Click "+ Thêm mới"
2. Fill Name, Phone
3. Submit

Expected:
- Customer created
- Redirects to list
```
Status: [ ] PASS  [ ] FAIL

### CUST-03: View Customer Detail
```
Steps:
1. Click customer card

Expected:
- Detail page loads
- Contact buttons work
```
Status: [ ] PASS  [ ] FAIL

### CUST-04: Customer Priority Badge
```
Steps:
1. Create customer with priority "hot"

Expected:
- Red "Nóng" badge displayed
```
Status: [ ] PASS  [ ] FAIL

### CUST-05: Phone Format
```
Steps:
1. View customer with phone "0901234567"

Expected:
- Displays as "0901.234.567"
```
Status: [ ] PASS  [ ] FAIL

---

## Watermark Tool Tests

### WM-01: Upload Image
```
Steps:
1. Go to /tools/watermark
2. Click upload or drag image

Expected:
- Image preview shows
```
Status: [ ] PASS  [ ] FAIL

### WM-02: Process Watermark
```
Steps:
1. Upload image
2. Click "Xử lý"

Expected:
- Loading state
- Watermarked preview shows
```
Status: [ ] PASS  [ ] FAIL

### WM-03: Download Result
```
Steps:
1. After processing, click download

Expected:
- File downloads with watermark
```
Status: [ ] PASS  [ ] FAIL

---

## Microsite Tests

### MICRO-01: Public Property View
```
Steps:
1. Make property is_public = true
2. Visit /p/[slug]

Expected:
- Property info displays
- Agent contact shows
```
Status: [ ] PASS  [ ] FAIL

### MICRO-02: Private Property 404
```
Steps:
1. Ensure is_public = false
2. Visit /p/[slug]

Expected:
- 404 page displayed
```
Status: [ ] PASS  [ ] FAIL

---

## Navigation Tests

### NAV-01: Bottom Nav
```
Steps:
1. View on mobile viewport

Expected:
- Bottom nav visible
- 4 tabs: Kho hàng, Khách hàng, Công cụ, Cài đặt
```
Status: [ ] PASS  [ ] FAIL

### NAV-02: Page Transitions
```
Steps:
1. Navigate between tabs

Expected:
- No errors
- Pages load correctly
```
Status: [ ] PASS  [ ] FAIL

---

## Test Summary

| Category | Tests | Pass | Fail |
|----------|-------|------|------|
| Auth     | 5     |      |      |
| Property | 6     |      |      |
| Customer | 5     |      |      |
| Watermark| 3     |      |      |
| Microsite| 2     |      |      |
| Nav      | 2     |      |      |
| **Total**| **23**|      |      |

### Release Decision
- [ ] All Tier 1 tests PASS → Ready for release
- [ ] Any FAIL → Fix and retest

---

*Checklist Version: 1.0*
*Created: 2026-01-14*
