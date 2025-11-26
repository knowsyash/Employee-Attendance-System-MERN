# 🔐 Secret Key Registration Implementation

## Overview
Added a secret key requirement for registering users with elevated roles (roles higher than employee). This prevents unauthorized users from registering as admin, manager, HR, or super admin.

## Implementation Details

### Backend Changes

#### 1. Registration Route (`backend/routes/auth.js`)
- Added `secretKey` parameter to registration request
- Checks if user is trying to register with an elevated role:
  - `super_admin`
  - `admin`
  - `manager`
  - `hr`
- If elevated role is selected:
  - Requires secret key to be provided
  - Validates secret key against `REGISTRATION_SECRET_KEY` environment variable
  - Returns 403 error if secret key is invalid
  - Returns 400 error if secret key is missing

#### 2. Environment Variable (`backend/.env.local`)
- Added `REGISTRATION_SECRET_KEY=ADMIN_REGISTRATION_KEY_2024_SECURE`
- This key must be kept secret and secure
- **Important:** Change this key in production!

### Frontend Changes

#### 1. Register Page (`frontend/src/pages/RegisterPage/Register.jsx`)
- Added `secretKey` state variable
- Detects when elevated role is selected
- Shows secret key input field conditionally:
  - Only appears when role is `super_admin`, `admin`, `manager`, or `hr`
  - Hidden for `employee` role
- Clears secret key when role changes
- Validates secret key before submission
- Sends secret key in registration request only when required

## How It Works

### For Employee Registration
1. User selects "Employee" role
2. No secret key field appears
3. Registration proceeds normally
4. No secret key validation required

### For Elevated Role Registration
1. User selects elevated role (admin, manager, hr, super_admin)
2. Secret key input field appears
3. User must enter the correct secret key
4. Backend validates secret key against environment variable
5. Registration succeeds only if secret key matches
6. Registration fails with error if secret key is invalid or missing

## Security Features

✅ **Role-based Secret Key Requirement**
- Only elevated roles require secret key
- Employee registration remains open (no secret key needed)

✅ **Server-side Validation**
- Secret key is validated on the backend
- Cannot be bypassed by frontend manipulation

✅ **Environment Variable Storage**
- Secret key stored in `.env.local` (not in code)
- Should be kept secure and not committed to version control

✅ **Clear Error Messages**
- User-friendly error messages
- Indicates when secret key is required
- Shows when secret key is invalid

## Current Secret Key

**Development Key:** `ADMIN_REGISTRATION_KEY_2024_SECURE`

⚠️ **IMPORTANT:** 
- Change this key in production!
- Use a strong, random secret key
- Keep it secure and don't share it publicly
- Consider using different keys for different environments

## Usage Example

### Registering as Employee (No Secret Key)
```
Role: Employee
Secret Key Field: Hidden
Result: Registration succeeds
```

### Registering as Admin (Secret Key Required)
```
Role: Admin
Secret Key Field: Visible
Secret Key: ADMIN_REGISTRATION_KEY_2024_SECURE
Result: Registration succeeds

Role: Admin
Secret Key Field: Visible
Secret Key: wrong_key
Result: Registration fails with "Invalid secret key" error
```

## Testing

1. **Test Employee Registration:**
   - Select "Employee" role
   - No secret key field should appear
   - Registration should succeed

2. **Test Admin Registration with Valid Key:**
   - Select "Admin" role
   - Secret key field should appear
   - Enter correct secret key
   - Registration should succeed

3. **Test Admin Registration with Invalid Key:**
   - Select "Admin" role
   - Secret key field should appear
   - Enter wrong secret key
   - Registration should fail with error

4. **Test Admin Registration without Key:**
   - Select "Admin" role
   - Don't enter secret key
   - Registration should fail with error

## Future Enhancements

- [ ] Different secret keys for different roles
- [ ] Secret key rotation mechanism
- [ ] Rate limiting for failed secret key attempts
- [ ] Audit logging for elevated role registrations
- [ ] Email notification when elevated role is registered

## Security Best Practices

1. **Change Default Key:** Always change the default secret key
2. **Use Strong Keys:** Use long, random, complex secret keys
3. **Environment Separation:** Use different keys for dev/staging/production
4. **Key Rotation:** Rotate secret keys periodically
5. **Access Control:** Limit who knows the secret key
6. **Monitoring:** Monitor failed registration attempts

