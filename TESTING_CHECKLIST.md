# Testing Checklist

This document provides a comprehensive testing checklist for all pages and buttons in the CampusFlow application.

## Setup Instructions

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**: Open http://localhost:5173

## Test Credentials

- **Student**: student@gmu.edu / student123
- **Staff**: staff@gmu.edu / staff123

## Testing Checklist

### Login Page (`/login`)

- [ ] **Test 1**: Enter valid student credentials and click "Sign In"
  - Should redirect to `/student`
- [ ] **Test 2**: Enter valid staff credentials and click "Sign In"
  - Should redirect to `/staff`
- [ ] **Test 3**: Enter invalid credentials
  - Should show error message
- [ ] **Test 4**: Toggle password visibility button
  - Should show/hide password
- [ ] **Test 5**: Click "Sign In" with empty fields
  - Should show validation error

### Student Dashboard (`/student`)

- [ ] **Test 1**: Click "+ New Request" button
  - Should show create request form
- [ ] **Test 2**: Click "Cancel" button in form
  - Should hide form
- [ ] **Test 3**: Fill form and click "Submit Request"
  - Should create request and refresh list
- [ ] **Test 4**: Click "Refresh" button
  - Should reload requests
- [ ] **Test 5**: Enter search query
  - Should filter requests by title/description/category
- [ ] **Test 6**: Select status filter
  - Should filter requests by status
- [ ] **Test 7**: Click "Export CSV" button
  - Should download CSV file
- [ ] **Test 8**: Click "Print" button
  - Should open print dialog
- [ ] **Test 9**: Click "Copy" button
  - Should copy requests to clipboard
- [ ] **Test 10**: Click "View →" link on a request
  - Should navigate to request detail page
- [ ] **Test 11**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Staff Dashboard (`/staff`)

- [ ] **Test 1**: View all requests in queue
  - Should display all requests
- [ ] **Test 2**: Select status filter
  - Should filter by status
- [ ] **Test 3**: Select category filter
  - Should filter by category
- [ ] **Test 4**: Enter search query
  - Should filter by search term
- [ ] **Test 5**: Click checkbox on a request
  - Should select request
- [ ] **Test 6**: Click "Select All" checkbox
  - Should select/deselect all requests
- [ ] **Test 7**: Select multiple requests and choose bulk action
  - Should show bulk actions bar
- [ ] **Test 8**: Apply bulk status update
  - Should update all selected requests
- [ ] **Test 9**: Click "Clear Selection" button
  - Should deselect all requests
- [ ] **Test 10**: Click "Refresh" button
  - Should reload requests
- [ ] **Test 11**: Click "Export CSV" button
  - Should download CSV file
- [ ] **Test 12**: Click "Print" button
  - Should open print dialog
- [ ] **Test 13**: Click "Copy" button
  - Should copy requests to clipboard
- [ ] **Test 14**: Click "View →" link on a request
  - Should navigate to request detail page
- [ ] **Test 15**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Request Detail Page (`/requests/:id`)

- [ ] **Test 1**: View request details
  - Should show all request information
- [ ] **Test 2**: Click "Back" button
  - Should navigate back
- [ ] **Test 3**: Click "Refresh" button
  - Should reload request data
- [ ] **Test 4**: Click "Export" button
  - Should download text file
- [ ] **Test 5**: Click "Print" button
  - Should open print dialog
- [ ] **Test 6**: Click "Copy Link" button
  - Should copy URL to clipboard
- [ ] **Test 7**: Click "Share" button
  - Should open share dialog or copy link
- [ ] **Test 8**: Change status (Staff only)
  - Should update request status
- [ ] **Test 9**: Add a comment
  - Should post comment and refresh
- [ ] **Test 10**: Click "Clear" button in comment form
  - Should clear comment text
- [ ] **Test 11**: View audit log
  - Should display activity timeline
- [ ] **Test 12**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Metrics Page (`/metrics`) - Staff Only

- [ ] **Test 1**: View metrics dashboard
  - Should display all metrics
- [ ] **Test 2**: Click "Refresh" button
  - Should reload metrics
- [ ] **Test 3**: Click "Export CSV" button
  - Should download CSV file
- [ ] **Test 4**: Click "Print" button
  - Should open print dialog
- [ ] **Test 5**: Verify metrics are accurate
  - Check totals, averages, counts
- [ ] **Test 6**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Profile Page (`/profile`)

- [ ] **Test 1**: View profile information
  - Should display user details
- [ ] **Test 2**: Click "Edit Profile" button
  - Should show edit form
- [ ] **Test 3**: Modify name and email, click "Save Changes"
  - Should save changes (demo mode)
- [ ] **Test 4**: Click "Cancel" button
  - Should discard changes
- [ ] **Test 5**: Click "Change Password" button
  - Should show alert (feature coming soon)
- [ ] **Test 6**: Click "Notification Preferences" button
  - Should show alert (feature coming soon)
- [ ] **Test 7**: Click "Delete Account" button
  - Should show confirmation dialog
- [ ] **Test 8**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Settings Page (`/settings`)

- [ ] **Test 1**: View settings page
  - Should display all settings
- [ ] **Test 2**: Toggle "Email Notifications"
  - Should toggle setting
- [ ] **Test 3**: Toggle "Push Notifications"
  - Should toggle setting
- [ ] **Test 4**: Toggle "Weekly Digest"
  - Should toggle setting
- [ ] **Test 5**: Toggle "Dark Mode"
  - Should toggle setting
- [ ] **Test 6**: Change language dropdown
  - Should update language setting
- [ ] **Test 7**: Change timezone dropdown
  - Should update timezone setting
- [ ] **Test 8**: Click "Save Settings" button
  - Should save settings
- [ ] **Test 9**: Click "Reset to Default" button
  - Should reset all settings
- [ ] **Test 10**: Test all buttons again (second round)
  - Verify all buttons work consistently

### Navigation Bar

- [ ] **Test 1**: Click "CampusFlow" logo
  - Should navigate to home
- [ ] **Test 2**: Click "My Requests" (Student)
  - Should navigate to student dashboard
- [ ] **Test 3**: Click "Request Queue" (Staff)
  - Should navigate to staff dashboard
- [ ] **Test 4**: Click "Metrics" (Staff)
  - Should navigate to metrics page
- [ ] **Test 5**: Click "Profile"
  - Should navigate to profile page
- [ ] **Test 6**: Click "Settings"
  - Should navigate to settings page
- [ ] **Test 7**: Click "Switch to Staff/Student" button
  - Should switch user role
- [ ] **Test 8**: Click "Logout" button
  - Should log out and redirect to login
- [ ] **Test 9**: Test all navigation items again (second round)
  - Verify all navigation works consistently

## Additional Tests

### Cross-Page Functionality

- [ ] **Test 1**: Create request as student, view as staff
  - Should appear in staff queue
- [ ] **Test 2**: Update request status as staff
  - Should reflect in student dashboard
- [ ] **Test 3**: Add comment from both roles
  - Should appear for both users
- [ ] **Test 4**: Export data from multiple pages
  - Should generate correct files
- [ ] **Test 5**: Test all functionality again (second round)
  - Verify consistency across pages

### Error Handling

- [ ] **Test 1**: Disconnect backend, try to load data
  - Should handle error gracefully
- [ ] **Test 2**: Try invalid operations
  - Should show appropriate error messages
- [ ] **Test 3**: Test form validation
  - Should prevent invalid submissions

## Notes

- All buttons should be tested twice as requested
- Check browser console for any errors
- Verify all exports/downloads work correctly
- Test on different screen sizes (responsive design)
- Verify all icons and tooltips display correctly
