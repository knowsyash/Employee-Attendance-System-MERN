# 🔐 Hierarchical Secret Key Generation System

## Overview
Implemented a hierarchical secret key generation system where each role can generate secret keys for roles below them in the hierarchy. This provides controlled, role-based access to registration keys.

## Role Hierarchy & Key Generation Permissions

### Super Admin (Level 5)
**Can generate keys for:**
- ✅ Admin
- ✅ Manager
- ✅ HR
- ✅ Employee

### Admin (Level 4)
**Can generate keys for:**
- ✅ Manager
- ✅ HR
- ✅ Employee

### Manager (Level 3)
**Can generate keys for:**
- ✅ HR
- ✅ Employee

### HR (Level 2)
**Can generate keys for:**
- ✅ Employee

### Employee (Level 1)
**Cannot generate keys:**
- ❌ No key generation access

## How It Works

### 1. Key Generation
- Each role can access the Secret Key Generator page
- Select a role from their allowed list
- Set expiration (optional)
- Generate secure random key
- Key is stored in database with metadata

### 2. Key Usage
- Generated keys can be used during registration
- Keys are validated against database
- Keys can be expired (time-based)
- Keys can be deactivated manually
- Keys track who used them

### 3. Key Management
- View all keys you've generated
- See which keys have been used
- Deactivate keys when needed
- Track expiration dates

## API Endpoints

### Generate Secret Key
```
POST /api/secret-keys/generate
Body: { role, expiresInDays }
Response: { secretKey, role, expiresAt, createdAt }
```

### Get My Generated Keys
```
GET /api/secret-keys/my-keys
Response: Array of key objects
```

### Get All Keys (Admin Only)
```
GET /api/secret-keys/all?role=admin&isActive=true
Response: Array of all keys
```

### Deactivate Key
```
PUT /api/secret-keys/:id/deactivate
Response: { message, key }
```

### Get Generatable Roles
```
GET /api/secret-keys/generatable-roles
Response: { roles: [...] }
```

## Frontend Features

### Secret Key Generator Page
- **Location:** `/secret-keys`
- **Access:** HR, Manager, Admin, Super Admin
- **Features:**
  - Generate keys for allowed roles
  - Set expiration dates
  - View all generated keys
  - Deactivate keys
  - Copy keys to clipboard
  - Track key usage

### Navigation
- Added "Secret Keys" link to navbar (for non-employees)
- Accessible from all role dashboards

## Database Schema

### SecretKey Model
```javascript
{
  key: String (unique, required),
  role: String (enum: roles),
  generatedBy: ObjectId (ref: User),
  generatedByRole: String,
  isActive: Boolean,
  usedBy: ObjectId (ref: User),
  usedAt: Date,
  expiresAt: Date,
  createdAt: Date
}
```

## Registration Flow

1. **User selects elevated role** (admin, manager, hr)
2. **Secret key field appears**
3. **User enters secret key**
4. **Backend validates:**
   - Checks database for active key matching role
   - Falls back to environment variable (backward compatibility)
   - Checks expiration
   - Marks key as used
   - Links key to new user

## Security Features

✅ **Hierarchical Permissions**
- Each role can only generate keys for lower roles
- Cannot generate keys for same or higher level

✅ **Key Tracking**
- All keys tracked in database
- Know who generated each key
- Know who used each key
- Track expiration

✅ **Key Management**
- Deactivate keys when compromised
- Set expiration dates
- One-time use tracking

✅ **Database Validation**
- Keys validated against database
- Environment variable fallback for compatibility
- Expiration checking

## Usage Examples

### Super Admin Generates Admin Key
1. Super Admin goes to Secret Keys page
2. Selects "Admin" role
3. Sets expiration to 30 days
4. Generates key
5. Shares key with person who needs to register as Admin
6. Person uses key during registration

### Manager Generates Employee Key
1. Manager goes to Secret Keys page
2. Selects "Employee" role
3. Generates key (no expiration)
4. Shares with new employee
5. Employee registers using the key

## Key Features

- **Role-based generation:** Each role can only generate for lower roles
- **Expiration support:** Optional expiration dates
- **Usage tracking:** Track who used each key
- **Deactivation:** Manually deactivate keys
- **History:** View all generated keys
- **Secure:** Cryptographically secure random keys

## Access Control

- **Employees:** Cannot access secret key generator
- **HR:** Can generate employee keys
- **Manager:** Can generate HR and employee keys
- **Admin:** Can generate manager, HR, and employee keys
- **Super Admin:** Can generate all lower role keys

## Important Notes

⚠️ **Key Security:**
- Keys are shown only once after generation
- Copy keys immediately
- Share keys securely
- Deactivate compromised keys

⚠️ **Key Expiration:**
- Expired keys cannot be used
- Generate new keys when needed
- Set appropriate expiration dates

⚠️ **Key Usage:**
- Keys are tracked when used
- One key can register one user
- Keys can be deactivated before use

---

**This system provides complete control over who can register with elevated roles!** 🔐

