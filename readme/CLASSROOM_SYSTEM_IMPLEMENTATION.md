# 🏫 Classroom/Division-Based System Implementation

## Overview
Implemented a classroom/division-based isolation system where:
- **Super Admin** creates multiple admins, each for a different classroom
- Each **Admin** can only see/manage users in their own classroom
- Admins at the same level cannot see each other's data
- Secret keys are classroom-specific
- Users registered with a key are automatically assigned to that classroom

## 🎯 System Architecture

### Hierarchy with Classroom Isolation

```
Super Admin (No classroom restriction)
    ↓
Admin-1 (Classroom: "Classroom-A")
    ├── Manager-1 (Classroom: "Classroom-A")
    ├── HR-1 (Classroom: "Classroom-A")
    └── Employees (Classroom: "Classroom-A")

Admin-2 (Classroom: "Classroom-B")
    ├── Manager-2 (Classroom: "Classroom-B")
    ├── HR-2 (Classroom: "Classroom-B")
    └── Employees (Classroom: "Classroom-B")
```

**Key Points:**
- Admin-1 **cannot** see Admin-2's users
- Admin-1 **cannot** see Classroom-B data
- Each admin operates in complete isolation
- Super Admin can see everything

## 📋 What Was Implemented

### Backend Changes

#### 1. User Model (`backend/models/User.js`)
- Added `classroom` field to User schema
- Indexed for efficient classroom-based queries

#### 2. SecretKey Model (`backend/models/SecretKey.js`)
- Added `classroom` field - stores which classroom the key belongs to
- Added `generatedByClassroom` - tracks generator's classroom
- Keys are now classroom-specific

#### 3. Secret Key Generation (`backend/routes/secretKeys.js`)
- Super Admin can specify classroom when generating admin keys
- Other roles inherit their classroom automatically
- Keys are tagged with classroom information

#### 4. Registration (`backend/routes/auth.js`)
- Users registered with a key inherit the key's classroom
- Classroom assignment is automatic based on key

#### 5. Admin Routes (`backend/routes/admin.js`)
- **Get Users:** Filtered by classroom for same-level admins
- **Get Attendance:** Classroom-based filtering
- **Create/Update Attendance:** Classroom access check
- **Update User:** Classroom management (super admin only)

#### 6. Attendance Routes (`backend/routes/attendance.js`)
- Classroom-based access control
- Users can only view attendance in their classroom

#### 7. RBAC Middleware (`backend/middleware/rbac.js`)
- Updated `canManageUser` to check classroom access
- Admins can only manage users in their classroom

### Frontend Changes

#### 1. Secret Key Generator (`frontend/src/pages/SecretKeyGeneratorPage/SecretKeyGenerator.jsx`)
- Super Admin can enter classroom name when generating admin keys
- Other roles see their classroom (read-only)
- Shows classroom in key list
- Classroom displayed in generated key info

#### 2. Super Admin Dashboard
- Shows classroom column in user table
- Can edit classroom for any user
- Full visibility across all classrooms

#### 3. Admin Dashboard
- Shows classroom tags for users
- Only sees users in their classroom
- Cannot see other admins' users

#### 4. Manager Dashboard
- Shows classroom in header
- Only sees department users in their classroom

#### 5. HR Dashboard
- Shows classroom in header
- Only manages users in their classroom

## 🔐 Access Control Rules

### Super Admin
- ✅ Can see all users (all classrooms)
- ✅ Can create admins for any classroom
- ✅ Can assign/change classrooms
- ✅ Full system access

### Admin (Classroom-Specific)
- ✅ Can only see users in their classroom
- ✅ Can only manage users in their classroom
- ✅ Can only see attendance in their classroom
- ❌ Cannot see other admins
- ❌ Cannot see other classrooms

### Manager
- ✅ Can see users in their classroom + department
- ✅ Can manage attendance in their classroom
- ❌ Cannot see other classrooms

### HR
- ✅ Can see users in their classroom
- ✅ Can manage attendance in their classroom
- ❌ Cannot see other classrooms

### Employee
- ✅ Can only see their own data
- ❌ Cannot see other users

## 🔑 Secret Key Flow

### Super Admin Creates Admin for Classroom-A

1. **Super Admin** → Secret Keys page
2. Select role: **Admin**
3. Enter classroom: **"Classroom-A"**
4. Generate key: `abc123...`
5. Share key with person
6. Person registers as **Admin** using key
7. **Admin automatically assigned to "Classroom-A"**

### Admin Creates Manager for Classroom-A

1. **Admin (Classroom-A)** → Secret Keys page
2. Select role: **Manager**
3. Classroom: **"Classroom-A"** (auto-filled, read-only)
4. Generate key: `xyz789...`
5. Share key with person
6. Person registers as **Manager** using key
7. **Manager automatically assigned to "Classroom-A"**

### Result
- Admin-1 (Classroom-A) can see Manager-1
- Admin-1 (Classroom-A) **cannot** see Admin-2 (Classroom-B)
- Complete isolation between classrooms

## 📊 Data Isolation Examples

### Example 1: Two Admins, Different Classrooms

**Admin-1 (Classroom-A):**
- Sees: Users in Classroom-A only
- Can manage: Classroom-A users only
- Cannot see: Admin-2, Classroom-B users

**Admin-2 (Classroom-B):**
- Sees: Users in Classroom-B only
- Can manage: Classroom-B users only
- Cannot see: Admin-1, Classroom-A users

### Example 2: Attendance Access

**Admin-1 (Classroom-A):**
- Can view: Attendance for Classroom-A users
- Cannot view: Attendance for Classroom-B users

**Manager-1 (Classroom-A):**
- Can view: Attendance for Classroom-A users in their department
- Cannot view: Attendance for Classroom-B users

## 🎨 UI Features

### Secret Key Generator
- **Super Admin:** Can enter classroom name for admin keys
- **Other Roles:** See their classroom (read-only)
- **Key Display:** Shows classroom in key information
- **Key List:** Shows classroom column

### Dashboards
- **Super Admin:** Shows all classrooms, can edit
- **Admin:** Shows classroom in header, only sees their classroom
- **Manager:** Shows classroom, filtered by classroom
- **HR:** Shows classroom, filtered by classroom

## 🔒 Security Features

✅ **Complete Isolation**
- Admins cannot see each other
- Classroom data is completely separated
- No cross-classroom access

✅ **Automatic Assignment**
- Users inherit classroom from secret key
- No manual classroom assignment needed
- Prevents classroom mismatches

✅ **Hierarchical Control**
- Super Admin controls all classrooms
- Each admin controls their classroom
- Managers/HR work within their classroom

✅ **Key Tracking**
- Keys are classroom-specific
- Know which classroom each key belongs to
- Track classroom assignment

## 📝 Usage Workflow

### Setting Up Multiple Classrooms

1. **Super Admin creates Admin-1:**
   ```
   Secret Keys → Generate Admin Key
   Classroom: "Classroom-A"
   Share key → Person registers → Admin-1 (Classroom-A)
   ```

2. **Super Admin creates Admin-2:**
   ```
   Secret Keys → Generate Admin Key
   Classroom: "Classroom-B"
   Share key → Person registers → Admin-2 (Classroom-B)
   ```

3. **Admin-1 creates users:**
   ```
   Admin-1 generates keys for Manager, HR, Employee
   All users automatically assigned to "Classroom-A"
   Admin-1 can see all Classroom-A users
   ```

4. **Admin-2 creates users:**
   ```
   Admin-2 generates keys for Manager, HR, Employee
   All users automatically assigned to "Classroom-B"
   Admin-2 can see all Classroom-B users
   ```

### Result
- **Admin-1** sees only Classroom-A
- **Admin-2** sees only Classroom-B
- **Complete isolation** between classrooms
- **Super Admin** sees everything

## 🎯 Key Features

- **Classroom Isolation:** Complete data separation
- **Automatic Assignment:** Users inherit classroom from key
- **Role-Based Access:** Each role respects classroom boundaries
- **Key Management:** Classroom-specific key generation
- **Super Admin Control:** Full visibility and control

---

**The classroom-based system is now fully operational!** 🏫

Each admin operates in complete isolation within their classroom, while Super Admin maintains full system oversight!

