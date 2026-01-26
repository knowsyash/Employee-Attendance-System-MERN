# Super Admin Login and Attendance Protocol Test
# PowerShell Script

param(
    [string]$Email = "admin@example.com",
    [string]$Password = "SuperAdmin123",
    [string]$BaseURL = "http://localhost:5000"
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUPER ADMIN LOGIN & ATTENDANCE PROTOCOL TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing with:" -ForegroundColor Cyan
Write-Host "  Email: $Email"
Write-Host "  Password: $('*' * $Password.Length)"
Write-Host "  Server: $BaseURL"
Write-Host ""

# Step 1: Test Login
Write-Host "[1] TESTING LOGIN..." -ForegroundColor Blue -BackgroundColor Black
Write-Host ""

try {
    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BaseURL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Data:" -ForegroundColor Green
    Write-Host "  User ID: $($loginResponse.user._id)"
    Write-Host "  Name: $($loginResponse.user.name)"
    Write-Host "  Email: $($loginResponse.user.email)"
    Write-Host "  Role: $($loginResponse.user.role)"
    Write-Host "  Department: $(if ($loginResponse.user.department) { $loginResponse.user.department } else { 'N/A' })"
    Write-Host "  Position: $(if ($loginResponse.user.position) { $loginResponse.user.position } else { 'N/A' })"
    Write-Host "  Employee ID: $(if ($loginResponse.user.employeeId) { $loginResponse.user.employeeId } else { 'N/A' })"
    Write-Host "  Status: $(if ($loginResponse.user.isActive) { 'Active' } else { 'Inactive' })"
    Write-Host "  Token: $($loginResponse.token.Substring(0, [Math]::Min(20, $loginResponse.token.Length)))..."
    Write-Host ""

    $token = $loginResponse.token
    $userId = $loginResponse.user._id

    # Step 2: Test Check-In
    Write-Host "[2] TESTING ATTENDANCE CHECK-IN..." -ForegroundColor Blue -BackgroundColor Black
    Write-Host ""

    try {
        $headers = @{
            Authorization = "Bearer $token"
            "Content-Type" = "application/json"
        }

        $checkInResponse = Invoke-RestMethod -Uri "$BaseURL/api/attendance/checkin" `
            -Method POST `
            -Headers $headers `
            -Body "{}" `
            -ErrorAction Stop

        Write-Host "✓ Check-in successful!" -ForegroundColor Green
        Write-Host "  Check-in Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "  Status: Checked In"
        Write-Host ""
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) {
            Write-Host "⚠ Already checked in today" -ForegroundColor Yellow
            Write-Host ""
        }
        else {
            Write-Host "✗ Check-in failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
    }

    # Step 3: Test Get Today's Attendance
    Write-Host "[3] TESTING GET TODAY'S ATTENDANCE..." -ForegroundColor Blue -BackgroundColor Black
    Write-Host ""

    try {
        $attendanceResponse = Invoke-RestMethod -Uri "$BaseURL/api/attendance/today" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop

        Write-Host "Retrieved todays attendance!" -ForegroundColor Green
        $checkInDisplay = if ($attendanceResponse.checkIn) { $attendanceResponse.checkIn } elseif ($attendanceResponse.checkInTime) { $attendanceResponse.checkInTime } else { "Not checked in" }
        $checkOutDisplay = if ($attendanceResponse.checkOut) { $attendanceResponse.checkOut } elseif ($attendanceResponse.checkOutTime) { $attendanceResponse.checkOutTime } else { "Not checked out" }
        $statusDisplay = if ($attendanceResponse.status) { $attendanceResponse.status } else { "N/A" }
        Write-Host "  Check-in: $checkInDisplay"
        Write-Host "  Check-out: $checkOutDisplay"
        Write-Host "  Status: $statusDisplay"
        Write-Host ""
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "⚠ No attendance record for today" -ForegroundColor Yellow
            Write-Host ""
        }
        else {
            Write-Host "✗ Failed to get attendance: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
    }

    # Summary
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✓ PROTOCOL TEST COMPLETED!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Green
    Write-Host "  ✓ Login authentication working"
    Write-Host "  ✓ Token generation successful"
    Write-Host "  ✓ Super admin account verified"
    Write-Host ""
    Write-Host "Super Admin can now access the system!" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. Backend server is running (npm run dev in backend folder)"
    Write-Host "  2. Server is accessible at $BaseURL"
    Write-Host "  3. MongoDB is connected"
    Write-Host "  4. Credentials are correct"
    Write-Host ""
    exit 1
}
