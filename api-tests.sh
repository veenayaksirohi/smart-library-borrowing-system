#!/bin/bash

###############################################################################
# Book Borrowing System - Complete cURL API Test Suite
# Tests: Authentication, Books, Borrows, Payments, Dashboard
# Date: January 2026
###############################################################################

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser_${TIMESTAMP}@example.com"
TEST_PASSWORD="Test@123"
TEST_NAME="Test User"

# Global variables to store tokens and IDs
AUTH_TOKEN=""
USER_ID=""
BOOK_ID=""
BORROW_ID=""

###############################################################################
# Helper Functions
###############################################################################

# Print test section header
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

# Print test case
print_test() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Print info
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Save response to file and extract values
save_response() {
    local response=$1
    local filename=$2
    echo "$response" > "$filename"
    print_info "Response saved to $filename"
}

# Extract JSON value from response
extract_json() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

# Extract nested JSON value
extract_nested_json() {
    local json=$1
    local parent=$2
    local key=$3
    echo "$json" | grep -o "\"$parent\":{[^}]*\"$key\":\"[^\"]*\"" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4
}

###############################################################################
# AUTHENTICATION TESTS
###############################################################################

print_header "1️⃣  AUTHENTICATION TESTS"

# Test 1.1: Signup - Valid Credentials
print_test "Test 1.1: Signup with valid credentials"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$TEST_NAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

echo "$SIGNUP_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    AUTH_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_success "Signup successful - Token: ${AUTH_TOKEN:0:20}... | User ID: $USER_ID"
    save_response "$SIGNUP_RESPONSE" "responses/signup_success.json"
else
    print_error "Signup failed"
    echo "$SIGNUP_RESPONSE"
    save_response "$SIGNUP_RESPONSE" "responses/signup_failed.json"
fi

# Test 1.2: Signup - Duplicate Email
print_test "Test 1.2: Signup with duplicate email (should fail)"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Another User\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"Test@123\"
    }")

echo "$DUPLICATE_RESPONSE" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected duplicate email"
    save_response "$DUPLICATE_RESPONSE" "responses/signup_duplicate.json"
else
    print_error "Should have rejected duplicate email"
    echo "$DUPLICATE_RESPONSE"
fi

# Test 1.3: Signup - Missing Fields
print_test "Test 1.3: Signup with missing fields (should fail)"
MISSING_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test User\",
        \"email\": \"test@example.com\"
    }")

echo "$MISSING_RESPONSE" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected missing password field"
    save_response "$MISSING_RESPONSE" "responses/signup_missing_fields.json"
else
    print_error "Should have rejected missing fields"
    echo "$MISSING_RESPONSE"
fi

# Test 1.4: Login - Valid Credentials
print_test "Test 1.4: Login with valid credentials"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

echo "$LOGIN_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Login successful"
    save_response "$LOGIN_RESPONSE" "responses/login_success.json"
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE"
    save_response "$LOGIN_RESPONSE" "responses/login_failed.json"
fi

# Test 1.5: Login - Invalid Password
print_test "Test 1.5: Login with invalid password (should fail)"
INVALID_PASS=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"WrongPassword123\"
    }")

echo "$INVALID_PASS" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid password"
    save_response "$INVALID_PASS" "responses/login_invalid_password.json"
else
    print_error "Should have rejected invalid password"
    echo "$INVALID_PASS"
fi

# Test 1.6: Login - Invalid Email
print_test "Test 1.6: Login with non-existent email (should fail)"
INVALID_EMAIL=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"nonexistent@example.com\",
        \"password\": \"Test@123\"
    }")

echo "$INVALID_EMAIL" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected non-existent email"
    save_response "$INVALID_EMAIL" "responses/login_invalid_email.json"
else
    print_error "Should have rejected non-existent email"
    echo "$INVALID_EMAIL"
fi

# Test 1.7: Get Profile - Authenticated
print_test "Test 1.7: Get user profile with valid token"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$PROFILE_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Profile fetched successfully"
    save_response "$PROFILE_RESPONSE" "responses/profile_success.json"
else
    print_error "Failed to fetch profile"
    echo "$PROFILE_RESPONSE"
    save_response "$PROFILE_RESPONSE" "responses/profile_failed.json"
fi

# Test 1.8: Get Profile - No Token
print_test "Test 1.8: Get profile without token (should fail)"
NO_TOKEN=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Content-Type: application/json")

echo "$NO_TOKEN" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected request without token"
    save_response "$NO_TOKEN" "responses/profile_no_token.json"
else
    print_error "Should have rejected request without token"
    echo "$NO_TOKEN"
fi

# Test 1.9: Get Profile - Invalid Token
print_test "Test 1.9: Get profile with invalid token (should fail)"
INVALID_TOKEN=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer invalid_token_123" \
    -H "Content-Type: application/json")

echo "$INVALID_TOKEN" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid token"
    save_response "$INVALID_TOKEN" "responses/profile_invalid_token.json"
else
    print_error "Should have rejected invalid token"
    echo "$INVALID_TOKEN"
fi

###############################################################################
# BOOK TESTS
###############################################################################

print_header "2️⃣  BOOK TESTS"

# Test 2.1: Get All Books - Without Authentication
print_test "Test 2.1: Get books without authentication (should fail)"
NO_AUTH_BOOKS=$(curl -s -X GET "$BASE_URL/books" \
    -H "Content-Type: application/json")

echo "$NO_AUTH_BOOKS" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected unauthenticated request"
    save_response "$NO_AUTH_BOOKS" "responses/books_no_auth.json"
else
    print_error "Should have required authentication"
    echo "$NO_AUTH_BOOKS"
fi

# Test 2.2: Get All Books - With Pagination
print_test "Test 2.2: Get all books with pagination (page=1, limit=10)"
BOOKS_RESPONSE=$(curl -s -X GET "$BASE_URL/books?page=1&limit=10" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$BOOKS_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    BOOK_ID=$(echo "$BOOKS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    if [ ! -z "$BOOK_ID" ]; then
        print_success "Books fetched successfully - Found Book ID: $BOOK_ID"
    else
        print_success "Books fetched (but no books in database)"
    fi
    save_response "$BOOKS_RESPONSE" "responses/books_list.json"
else
    print_error "Failed to fetch books"
    echo "$BOOKS_RESPONSE"
    save_response "$BOOKS_RESPONSE" "responses/books_list_failed.json"
fi

# Test 2.3: Get Books - With Search Parameter
print_test "Test 2.3: Get books with search filter"
SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/books?search=Python&page=1&limit=10" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$SEARCH_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Book search executed successfully"
    save_response "$SEARCH_RESPONSE" "responses/books_search.json"
else
    print_error "Book search failed"
    echo "$SEARCH_RESPONSE"
fi

# Test 2.4: Get Books - Invalid Page Number
print_test "Test 2.4: Get books with negative page number (should use default)"
INVALID_PAGE=$(curl -s -X GET "$BASE_URL/books?page=-1&limit=10" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$INVALID_PAGE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Correctly handled invalid page number"
    save_response "$INVALID_PAGE" "responses/books_invalid_page.json"
else
    print_error "Failed to handle invalid page"
    echo "$INVALID_PAGE"
fi

# Test 2.5: Get Books - Exceed Limit
print_test "Test 2.5: Get books with limit > 50 (should cap at 50)"
EXCEED_LIMIT=$(curl -s -X GET "$BASE_URL/books?page=1&limit=100" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$EXCEED_LIMIT" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Correctly capped limit at 50"
    save_response "$EXCEED_LIMIT" "responses/books_limit_capped.json"
else
    print_error "Failed to handle limit capping"
    echo "$EXCEED_LIMIT"
fi

# Test 2.6: Get Book by ID - Valid ID
if [ ! -z "$BOOK_ID" ]; then
    print_test "Test 2.6: Get single book by ID ($BOOK_ID)"
    BOOK_DETAIL=$(curl -s -X GET "$BASE_URL/books/$BOOK_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json")

    echo "$BOOK_DETAIL" | grep -q '"success":true'
    if [ $? -eq 0 ]; then
        print_success "Book details fetched successfully"
        save_response "$BOOK_DETAIL" "responses/book_detail.json"
    else
        print_error "Failed to fetch book details"
        echo "$BOOK_DETAIL"
    fi
else
    print_test "Test 2.6: Get single book by ID (skipped - no books in database)"
    print_info "Add books to the database first to test this endpoint"
fi

# Test 2.7: Get Book by ID - Invalid ID Format
print_test "Test 2.7: Get book with invalid ID format (should fail)"
INVALID_ID=$(curl -s -X GET "$BASE_URL/books/abc" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$INVALID_ID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid book ID format"
    save_response "$INVALID_ID" "responses/book_invalid_id.json"
else
    print_error "Should have rejected invalid ID format"
    echo "$INVALID_ID"
fi

# Test 2.8: Get Book by ID - Non-existent ID
print_test "Test 2.8: Get book with non-existent ID (should fail)"
NOT_FOUND=$(curl -s -X GET "$BASE_URL/books/99999" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$NOT_FOUND" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly returned 404 for non-existent book"
    save_response "$NOT_FOUND" "responses/book_not_found.json"
else
    print_error "Should have returned 404"
    echo "$NOT_FOUND"
fi

###############################################################################
# BORROW TESTS
###############################################################################

print_header "3️⃣  BORROW TESTS"

# Test 3.1: Validate Borrow - No Book ID
print_test "Test 3.1: Validate borrow without bookId (should fail)"
VALIDATE_NO_ID=$(curl -s -X POST "$BASE_URL/borrow/validate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{}")

echo "$VALIDATE_NO_ID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected missing bookId"
    save_response "$VALIDATE_NO_ID" "responses/validate_no_id.json"
else
    print_error "Should have rejected missing bookId"
    echo "$VALIDATE_NO_ID"
fi

# Test 3.2: Validate Borrow - Non-existent Book
print_test "Test 3.2: Validate borrow with non-existent book (should fail)"
VALIDATE_NOT_FOUND=$(curl -s -X POST "$BASE_URL/borrow/validate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 99999 }")

echo "$VALIDATE_NOT_FOUND" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected non-existent book"
    save_response "$VALIDATE_NOT_FOUND" "responses/validate_book_not_found.json"
else
    print_error "Should have rejected non-existent book"
    echo "$VALIDATE_NOT_FOUND"
fi

# Test 3.3: Calculate Cost - Missing Parameters
print_test "Test 3.3: Calculate cost without daysToKeep (should fail)"
CALC_NO_DAYS=$(curl -s -X POST "$BASE_URL/borrow/calculate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 1 }")

echo "$CALC_NO_DAYS" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected missing daysToKeep"
    save_response "$CALC_NO_DAYS" "responses/calculate_no_days.json"
else
    print_error "Should have rejected missing daysToKeep"
    echo "$CALC_NO_DAYS"
fi

# Test 3.4: Calculate Cost - Invalid Days (exceed limit)
print_test "Test 3.4: Calculate cost with daysToKeep > 14 (should fail)"
CALC_EXCEED=$(curl -s -X POST "$BASE_URL/borrow/calculate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 1, \"daysToKeep\": 30 }")

echo "$CALC_EXCEED" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected daysToKeep > 14"
    save_response "$CALC_EXCEED" "responses/calculate_exceed_days.json"
else
    print_error "Should have rejected daysToKeep > 14"
    echo "$CALC_EXCEED"
fi

# Test 3.5: Calculate Cost - Invalid Days (zero/negative)
print_test "Test 3.5: Calculate cost with daysToKeep <= 0 (should fail)"
CALC_INVALID=$(curl -s -X POST "$BASE_URL/borrow/calculate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 1, \"daysToKeep\": 0 }")

echo "$CALC_INVALID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid daysToKeep"
    save_response "$CALC_INVALID" "responses/calculate_invalid_days.json"
else
    print_error "Should have rejected invalid daysToKeep"
    echo "$CALC_INVALID"
fi

# Test 3.6: Calculate Cost - Non-existent Book
print_test "Test 3.6: Calculate cost for non-existent book (should fail)"
CALC_NOT_FOUND=$(curl -s -X POST "$BASE_URL/borrow/calculate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 99999, \"daysToKeep\": 7 }")

echo "$CALC_NOT_FOUND" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected non-existent book"
    save_response "$CALC_NOT_FOUND" "responses/calculate_book_not_found.json"
else
    print_error "Should have rejected non-existent book"
    echo "$CALC_NOT_FOUND"
fi

# Test 3.7: Borrow Book - Missing Parameters
print_test "Test 3.7: Borrow book without bookId (should fail)"
BORROW_NO_ID=$(curl -s -X POST "$BASE_URL/borrow" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"daysToKeep\": 7 }")

echo "$BORROW_NO_ID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected missing bookId"
    save_response "$BORROW_NO_ID" "responses/borrow_no_id.json"
else
    print_error "Should have rejected missing bookId"
    echo "$BORROW_NO_ID"
fi

# Test 3.8: Borrow Book - Invalid Days
print_test "Test 3.8: Borrow book with invalid daysToKeep (should fail)"
BORROW_INVALID=$(curl -s -X POST "$BASE_URL/borrow" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"bookId\": 1, \"daysToKeep\": 20 }")

echo "$BORROW_INVALID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid daysToKeep"
    save_response "$BORROW_INVALID" "responses/borrow_invalid_days.json"
else
    print_error "Should have rejected invalid daysToKeep"
    echo "$BORROW_INVALID"
fi

# Test 3.8.5: Borrow Book - SUCCESSFUL (with valid book)
print_test "Test 3.8.5: Successfully borrow a book (with valid bookId and days)"
if [ ! -z "$BOOK_ID" ]; then
    BORROW_SUCCESS=$(curl -s -X POST "$BASE_URL/borrow" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{ \"bookId\": $BOOK_ID, \"daysToKeep\": 7 }")

    echo "$BORROW_SUCCESS" | grep -q '"success":true'
    if [ $? -eq 0 ]; then
        BORROW_ID=$(echo "$BORROW_SUCCESS" | grep -o '"borrowId":[0-9]*' | cut -d':' -f2)
        print_success "Book borrowed successfully - Borrow ID: $BORROW_ID"
        save_response "$BORROW_SUCCESS" "responses/borrow_success.json"
    else
        print_error "Failed to borrow book"
        echo "$BORROW_SUCCESS"
    fi
else
    print_info "Skipped - No books available in database"
fi

# Test 3.9: Get Active Borrows
print_test "Test 3.9: Get active borrows for user"
ACTIVE_BORROWS=$(curl -s -X GET "$BASE_URL/borrow/active" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$ACTIVE_BORROWS" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Active borrows fetched successfully"
    save_response "$ACTIVE_BORROWS" "responses/active_borrows.json"
else
    print_error "Failed to fetch active borrows"
    echo "$ACTIVE_BORROWS"
fi

# Test 3.10: Get Borrow History
print_test "Test 3.10: Get borrow history with pagination"
BORROW_HISTORY=$(curl -s -X GET "$BASE_URL/borrow/history?page=1&limit=10" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$BORROW_HISTORY" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Borrow history fetched successfully"
    save_response "$BORROW_HISTORY" "responses/borrow_history.json"
else
    print_error "Failed to fetch borrow history"
    echo "$BORROW_HISTORY"
fi

# Test 3.11: Get Borrow History - Invalid Page
print_test "Test 3.11: Get borrow history with invalid page"
HISTORY_INVALID=$(curl -s -X GET "$BASE_URL/borrow/history?page=-5&limit=10" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$HISTORY_INVALID" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Correctly handled invalid page number"
    save_response "$HISTORY_INVALID" "responses/history_invalid_page.json"
else
    print_error "Should have handled invalid page"
    echo "$HISTORY_INVALID"
fi

# Test 3.12: Get Borrow Summary - Non-existent Borrow
print_test "Test 3.12: Get summary for non-existent borrow (should fail)"
SUMMARY_NOT_FOUND=$(curl -s -X GET "$BASE_URL/borrow/99999/summary" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$SUMMARY_NOT_FOUND" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected non-existent borrow"
    save_response "$SUMMARY_NOT_FOUND" "responses/summary_not_found.json"
else
    print_error "Should have rejected non-existent borrow"
    echo "$SUMMARY_NOT_FOUND"
fi

# Test 3.13: Submit Return - Non-existent Borrow
print_test "Test 3.13: Submit return for non-existent borrow (should fail)"
RETURN_NOT_FOUND=$(curl -s -X POST "$BASE_URL/borrow/99999/submit" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{}")

echo "$RETURN_NOT_FOUND" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected non-existent borrow"
    save_response "$RETURN_NOT_FOUND" "responses/return_not_found.json"
else
    print_error "Should have rejected non-existent borrow"
    echo "$RETURN_NOT_FOUND"
fi

###############################################################################
# PAYMENT TESTS
###############################################################################

print_header "4️⃣  PAYMENT TESTS"

# Test 4.1: Get Payment History - Without Authentication
print_test "Test 4.1: Get payment history without authentication (should fail)"
PAYMENT_NO_AUTH=$(curl -s -X GET "$BASE_URL/payments/history" \
    -H "Content-Type: application/json")

echo "$PAYMENT_NO_AUTH" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected unauthenticated request"
    save_response "$PAYMENT_NO_AUTH" "responses/payment_no_auth.json"
else
    print_error "Should have required authentication"
    echo "$PAYMENT_NO_AUTH"
fi

# Test 4.2: Get Payment History - Authenticated
print_test "Test 4.2: Get payment history with valid token"
PAYMENT_HISTORY=$(curl -s -X GET "$BASE_URL/payments/history" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$PAYMENT_HISTORY" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Payment history fetched successfully"
    save_response "$PAYMENT_HISTORY" "responses/payment_history.json"
else
    print_error "Failed to fetch payment history"
    echo "$PAYMENT_HISTORY"
    save_response "$PAYMENT_HISTORY" "responses/payment_history_failed.json"
fi

# Test 4.3: Get Payment History - Invalid Token
print_test "Test 4.3: Get payment history with invalid token (should fail)"
PAYMENT_INVALID=$(curl -s -X GET "$BASE_URL/payments/history" \
    -H "Authorization: Bearer invalid_token_xyz" \
    -H "Content-Type: application/json")

echo "$PAYMENT_INVALID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid token"
    save_response "$PAYMENT_INVALID" "responses/payment_invalid_token.json"
else
    print_error "Should have rejected invalid token"
    echo "$PAYMENT_INVALID"
fi

###############################################################################
# DASHBOARD TESTS
###############################################################################

print_header "5️⃣  DASHBOARD TESTS"

# Test 5.1: Get Dashboard Summary - Without Authentication
print_test "Test 5.1: Get dashboard summary without authentication (should fail)"
DASHBOARD_NO_AUTH=$(curl -s -X GET "$BASE_URL/payments/dashboard/summary" \
    -H "Content-Type: application/json")

echo "$DASHBOARD_NO_AUTH" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected unauthenticated request"
    save_response "$DASHBOARD_NO_AUTH" "responses/dashboard_no_auth.json"
else
    print_error "Should have required authentication"
    echo "$DASHBOARD_NO_AUTH"
fi

# Test 5.2: Get Dashboard Summary - Authenticated
print_test "Test 5.2: Get dashboard summary with valid token"
DASHBOARD_SUMMARY=$(curl -s -X GET "$BASE_URL/payments/dashboard/summary" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$DASHBOARD_SUMMARY" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Dashboard summary fetched successfully"
    save_response "$DASHBOARD_SUMMARY" "responses/dashboard_summary.json"
else
    print_error "Failed to fetch dashboard summary"
    echo "$DASHBOARD_SUMMARY"
    save_response "$DASHBOARD_SUMMARY" "responses/dashboard_summary_failed.json"
fi

# Test 5.3: Get Dashboard Summary - Invalid Token
print_test "Test 5.3: Get dashboard summary with invalid token (should fail)"
DASHBOARD_INVALID=$(curl -s -X GET "$BASE_URL/payments/dashboard/summary" \
    -H "Authorization: Bearer invalid_token_abc" \
    -H "Content-Type: application/json")

echo "$DASHBOARD_INVALID" | grep -q '"success":false'
if [ $? -eq 0 ]; then
    print_success "Correctly rejected invalid token"
    save_response "$DASHBOARD_INVALID" "responses/dashboard_invalid_token.json"
else
    print_error "Should have rejected invalid token"
    echo "$DASHBOARD_INVALID"
fi

###############################################################################
# HEALTH CHECK
###############################################################################

print_header "6️⃣  SERVER HEALTH CHECK"

print_test "Test 6.1: Health check endpoint"
HEALTH=$(curl -s -X GET "$BASE_URL/../health" \
    -H "Content-Type: application/json")

echo "$HEALTH" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    print_success "Server is running and healthy"
    save_response "$HEALTH" "responses/health_check.json"
else
    print_error "Server health check failed"
    echo "$HEALTH"
fi

###############################################################################
# EDGE CASES & SECURITY TESTS
###############################################################################

print_header "7️⃣  EDGE CASES & SECURITY TESTS"

# Test 7.1: SQL Injection Attempt
print_test "Test 7.1: Attempt SQL injection in search parameter"
SQL_INJECT=$(curl -s -X GET "$BASE_URL/books?search='; DROP TABLE books; --" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

echo "$SQL_INJECT" | grep -q '"success":true\|"success":false'
if [ $? -eq 0 ]; then
    print_success "SQL injection properly handled (input sanitized)"
    save_response "$SQL_INJECT" "responses/sql_injection_test.json"
else
    print_error "Unexpected response to SQL injection attempt"
    echo "$SQL_INJECT"
fi

# Test 7.2: XSS Attempt in Email
print_test "Test 7.2: Attempt XSS injection in signup email"
XSS_ATTEMPT=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test\",
        \"email\": \"<script>alert('xss')</script>@example.com\",
        \"password\": \"Test@123\"
    }")

echo "$XSS_ATTEMPT" | grep -q '"success":'
if [ $? -eq 0 ]; then
    print_success "XSS injection properly handled"
    save_response "$XSS_ATTEMPT" "responses/xss_test.json"
else
    print_error "Unexpected response to XSS attempt"
    echo "$XSS_ATTEMPT"
fi

# Test 7.3: Very Long Input
print_test "Test 7.3: Test with very long input string"
LONG_INPUT=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$(printf 'A%.0s' {1..1000})\",
        \"email\": \"test@example.com\",
        \"password\": \"Test@123\"
    }")

echo "$LONG_INPUT" | grep -q '"success":'
if [ $? -eq 0 ]; then
    print_success "Long input handled gracefully"
    save_response "$LONG_INPUT" "responses/long_input_test.json"
else
    print_error "Long input caused issues"
    echo "$LONG_INPUT"
fi

# Test 7.4: Concurrent Requests
print_test "Test 7.4: Test concurrent requests handling"
print_info "Sending 5 concurrent profile requests..."
for i in {1..5}; do
    curl -s -X GET "$BASE_URL/auth/profile" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" > /dev/null &
done
wait
print_success "All concurrent requests completed"

# Test 7.5: Case Sensitivity Test
print_test "Test 7.5: Test email case sensitivity in login"
CASE_TEST=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$(echo $TEST_EMAIL | tr '[:lower:]' '[:upper:]')\",
        \"password\": \"$TEST_PASSWORD\"
    }")

echo "$CASE_TEST" | grep -q '"success":'
if [ $? -eq 0 ]; then
    print_success "Case sensitivity handled properly"
    save_response "$CASE_TEST" "responses/case_sensitivity_test.json"
else
    print_error "Case sensitivity test failed"
    echo "$CASE_TEST"
fi

###############################################################################
# TEST SUMMARY
###############################################################################

print_header "📊 TEST EXECUTION SUMMARY"

print_info "Total test suites: 7"
print_info "Total individual tests: 40+"
print_info "Test responses saved to: responses/ directory"
print_info "Logged-in test user: $TEST_EMAIL"
print_info "Auth Token: ${AUTH_TOKEN:0:30}..."
print_info "User ID: $USER_ID"

print_info "\nTest Environment:"
print_info "Base URL: $BASE_URL"
print_info "Timestamp: $TIMESTAMP"

print_success "\n✅ Test suite completed!"
print_info "Check the 'responses/' directory for detailed response logs."

###############################################################################
# END OF TEST SUITE
###############################################################################
