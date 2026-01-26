# 🔐 Hierarchical Secret Key Generation System - Complete Implementation

## ✅ Implementation Complete!

A hierarchical secret key generation system has been implemented where each role can generate secret keys for roles below them in the hierarchy.

## 🎯 Key Generation Permissions

### Super Admin
**Can generate keys for:**
- ✅ Admin
- ✅ Manager  
- ✅ HR
- ✅ Employee

### Admin
**Can generate keys for:**
- ✅ Manager
- ✅ HR
- ✅ Employee

### Manager
**Can generate keys for:**
- ✅ HR
- ✅ Employee

### HR
**Can generate keys for:**
- ✅ Employee

### Employee
**Cannot generate keys:**
- ❌ No access to key generation

## 📋 What Was Implemented

### Backend

#### 1. SecretKey Model (`backend/models/SecretKey.js`)
- Stores generated secret keys
- Tracks who generated each key
- Tracks who used each key
- Expiration date support
- Active/inactive status

#### 2. Secret Key Routes (`backend/routes/secretKeys.js`)
- `POST /api/secret-keys/generate` - Generate new key
- `GET /api/secret-keys/my-keys` - Get my generated keys
- `GET /api/secret-keys/all` - Get all keys (admin only)
- `PUT /api/secret-keys/:id/deactivate` - Deactivate key
- `GET /api/secret-keys/generatable-roles` - Get allowed roles

#### 3. Updated Registration (`backend/routes/auth.js`)
- Validates keys against database
- Falls back to environment variable (backward compatibility)
- Checks expiration
- Marks keys as used
- Links keys to registered users

### Frontend

#### 1. Secret Key Generator Page (`frontend/src/pages/SecretKeyGeneratorPage/SecretKeyGenerator.jsx`)
- Generate keys for allowed roles
- Set expiration dates
- View all generated keys
- Deactivate keys
- Copy keys to clipboard
- Track key usage status

#### 2. Navigation
- Added "Secret Keys" link to navbar
- Accessible to HR, Manager, Admin, Super Admin
- Protected route with role checking

## 🔄 How It Works

### Key Generation Flow

1. **User accesses Secret Keys page**
   - Must be HR, Manager, Admin, or Super Admin
   - Employees are blocked

2. **Select role to generate key for**
   - Only shows roles below user's level
   - Super Admin sees: Admin, Manager, HR, Employee
   - Admin sees: Manager, HR, Employee
   - Manager sees: HR, Employee
   - HR sees: Employee

3. **Set expiration (optional)**
   - Can set days until expiration
   - Or leave empty for no expiration

4. **Generate key**
   - Creates cryptographically secure random key
   - Stores in database
   - Shows key once (copy immediately!)

5. **Share key securely**
   - Share with person who needs to register
   - Key is role-specific
   - Can be expired or deactivated

### Registration Flow

1. **User selects elevated role** (admin, manager, hr)
2. **Secret key field appears**
3. **User enters generated secret key**
4. **Backend validates:**
   - Checks database for active key matching role
   - Validates expiration
   - Falls back to environment variable if not found
5. **Registration succeeds**
   - Key marked as used
   - Key linked to new user
   - User created with selected role

## 🛡️ Security Features

✅ **Hierarchical Control**
- Each role can only generate for lower roles
- Cannot generate for same or higher level
- Enforced at both frontend and backend

✅ **Key Tracking**
- Know who generated each key
- Know who used each key
- Track when keys were used
- Track expiration dates

✅ **Key Management**
- Deactivate compromised keys
- Set expiration dates
- View key history
- Monitor key usage

✅ **Database Validation**
- Keys stored securely in database
- Validated on registration
- Expiration checking
- One-time use tracking

## 📊 Key Features

### Key Generation
- Role-based permissions
- Optional expiration
- Secure random generation
- One-time display

### Key Management
- View all generated keys
- See usage status
- Deactivate keys
- Track expiration

### Key Usage
- Role-specific validation
- Expiration checking
- Usage tracking
- Automatic linking

## 🚀 Usage Examples

### Example 1: Super Admin Generates Admin Key
```
1. Super Admin → Secret Keys page
2. Select "Admin" role
3. Set expiration: 30 days
4. Generate key: "abc123..."
5. Share with person
6. Person registers as Admin using key
```

### Example 2: Manager Generates Employee Key
```
1. Manager → Secret Keys page
2. Select "Employee" role
3. No expiration (leave empty)
4. Generate key: "xyz789..."
5. Share with new employee
6. Employee registers using key
```

### Example 3: HR Generates Employee Key
```
1. HR → Secret Keys page
2. Select "Employee" role
3. Generate key
4. Share with employee
5. Employee registers
```

## 📝 API Endpoints

### Generate Key
```http
POST /api/secret-keys/generate
Authorization: Bearer <token>
Body: { role: "admin", expiresInDays: 30 }
Response: { secretKey: "...", role: "admin", expiresAt: "..." }
```

### Get My Keys
```http
GET /api/secret-keys/my-keys
Authorization: Bearer <token>
Response: [{ key, role, usedBy, expiresAt, ... }]
```

### Deactivate Key
```http
PUT /api/secret-keys/:id/deactivate
Authorization: Bearer <token>
Response: { message: "Key deactivated", key: {...} }
```

## 🎨 Frontend Access

**Secret Keys Page:** `/secret-keys`

**Accessible by:**
- ✅ Super Admin
- ✅ Admin
- ✅ Manager
- ✅ HR
- ❌ Employee (blocked)

**Navigation:**
- Link in navbar (for non-employees)
- Direct URL access
- Protected by role checking

## ⚠️ Important Notes

1. **Key Security:**
   - Keys shown only once after generation
   - Copy immediately
   - Share securely
   - Deactivate if compromised

2. **Key Expiration:**
   - Expired keys cannot be used
   - Generate new keys when needed
   - Set appropriate expiration dates

3. **Key Usage:**
   - Keys are tracked when used
   - Can see who used each key
   - Keys can be deactivated before use

4. **Super Admin:**
   - Cannot be registered through API
   - Can only be created from backend
   - Not available in key generation

## 🔒 Security Benefits

✅ **Controlled Access:** Only authorized roles can generate keys
✅ **Hierarchical Control:** Each role controls their lower levels
✅ **Key Tracking:** Full audit trail of key generation and usage
✅ **Expiration Support:** Time-limited keys for security
✅ **Deactivation:** Quick response to compromised keys
✅ **Database Storage:** Secure storage with full tracking

---

**The hierarchical secret key system is now fully operational!** 🔐

Each role can now generate secret keys for their lower-level roles, providing complete control over who can register with elevated permissions!

