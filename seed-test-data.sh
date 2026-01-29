anilla JavaScript + HTML/CSS#!/bin/bash

###############################################################################
# Smart Library - Test Data Seeding Script
# This script populates the database with test books and creates some borrows/payments
# Date: January 2026
###############################################################################

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="seeduser_${TIMESTAMP}@example.com"
TEST_PASSWORD="Test@123"

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

print_test() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

###############################################################################
# STEP 1: Create Test User & Get Token
###############################################################################

print_header "🔐 STEP 1: Create Test User & Authenticate"

print_test "Signing up test user: $TEST_EMAIL"
SIGNUP=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Seed User\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

AUTH_TOKEN=$(echo "$SIGNUP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
USER_ID=$(echo "$SIGNUP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$AUTH_TOKEN" ]; then
    print_success "User created - ID: $USER_ID, Token: ${AUTH_TOKEN:0:20}..."
else
    print_error "Failed to create user"
    exit 1
fi

###############################################################################
# STEP 2: Get Available Books
###############################################################################

print_header "📚 STEP 2: Fetch Available Books"

print_test "Getting list of books..."
BOOKS=$(curl -s -X GET "$BASE_URL/books?page=1&limit=50" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

BOOK_IDS=$(echo "$BOOKS" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -5)

if [ ! -z "$BOOK_IDS" ]; then
    COUNT=$(echo "$BOOK_IDS" | wc -l)
    print_success "Found $COUNT books available"
else
    print_error "No books found in database"
    echo "Please run seeding from app.js first!"
    exit 1
fi

###############################################################################
# STEP 3: Create Borrow Records
###############################################################################

print_header "📖 STEP 3: Create Test Borrow Records"

COUNTER=1
for BOOK_ID in $BOOK_IDS; do
    if [ $COUNTER -gt 3 ]; then break; fi
    
    DAYS=$((COUNTER + 6))  # 7, 8, 9 days
    print_test "Borrowing Book #$BOOK_ID for $DAYS days..."
    
    BORROW=$(curl -s -X POST "$BASE_URL/borrow" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{ \"bookId\": $BOOK_ID, \"daysToKeep\": $DAYS }")
    
    BORROW_ID=$(echo "$BORROW" | grep -o '"borrowId":[0-9]*' | cut -d':' -f2)
    COST=$(echo "$BORROW" | grep -o '"totalCost":[0-9.]*' | cut -d':' -f2)
    
    if [ ! -z "$BORROW_ID" ]; then
        print_success "Borrow created - ID: $BORROW_ID, Cost: ₹$COST"
    else
        print_error "Failed to create borrow for book $BOOK_ID"
        echo "$BORROW"
    fi
    
    COUNTER=$((COUNTER + 1))
done

###############################################################################
# STEP 4: Check Database State
###############################################################################

print_header "📊 STEP 4: Verify Database State"

# Count records
print_test "Checking database records..."

# Note: We need to use psql for this (requires password)
# For now, just show what should be there via API

ACTIVE=$(curl -s -X GET "$BASE_URL/borrow/active" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

ACTIVE_COUNT=$(echo "$ACTIVE" | grep -o '"id":[0-9]*' | wc -l)
print_success "Active borrows: $ACTIVE_COUNT"

HISTORY=$(curl -s -X GET "$BASE_URL/borrow/history?page=1&limit=50" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

HISTORY_COUNT=$(echo "$HISTORY" | grep -o '"id":[0-9]*' | wc -l)
print_success "Total borrow history: $HISTORY_COUNT"

PAYMENTS=$(curl -s -X GET "$BASE_URL/payments/history" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

PAYMENT_COUNT=$(echo "$PAYMENTS" | grep -o '"id":[0-9]*' | wc -l)
print_success "Payment records: $PAYMENT_COUNT"

###############################################################################
# STEP 5: Summary
###############################################################################

print_header "✅ SEEDING COMPLETE"

echo "Test user credentials:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  Token: ${AUTH_TOKEN:0:30}..."
echo ""
echo "Database state:"
echo "  Active borrows: $ACTIVE_COUNT"
echo "  Borrow history: $HISTORY_COUNT"
echo "  Payment records: $PAYMENT_COUNT"
echo ""
echo "You can now:"
echo "  1. Run the full API tests: ./api-tests.sh"
echo "  2. Check database directly: psql -U postgres -d smart_library"
echo "  3. View payment table: SELECT * FROM payments;"
echo "  4. View borrow table: SELECT * FROM borrows;"

print_success "Test data seeding successful!"
