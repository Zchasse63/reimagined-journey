#!/bin/bash
# Live API endpoint test for submit-lead
# Tests field mapping from MultiStepLeadForm to database schema

set -e

BASE_URL="http://localhost:4321"

echo "Testing submit-lead API with MultiStepLeadForm field names..."

# Test 1: Valid submission with MultiStepLeadForm field names (AC1)
echo -e "\n=== Test 1: Valid submission with camelCase field names ==="
curl -X POST "$BASE_URL/api/submit-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John Doe",
    "email": "test@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' \
  -s -w "\nHTTP Status: %{http_code}\n"

# Test 2: Single name (AC3)
echo -e "\n=== Test 2: Single name contactName ==="
curl -X POST "$BASE_URL/api/submit-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Single Name",
    "contactName": "John",
    "email": "john@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' \
  -s -w "\nHTTP Status: %{http_code}\n"

# Test 3: Multi-part name (AC3)
echo -e "\n=== Test 3: Multi-part name contactName ==="
curl -X POST "$BASE_URL/api/submit-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Multi Name",
    "contactName": "John van der Berg",
    "email": "john.van@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' \
  -s -w "\nHTTP Status: %{http_code}\n"

# Test 4: Honeypot detection (should return success but not save)
echo -e "\n=== Test 4: Honeypot detection ==="
curl -X POST "$BASE_URL/api/submit-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Bot Company",
    "contactName": "Bot User",
    "email": "bot@example.com",
    "productInterests": ["disposables"],
    "location_count": 1,
    "website": "http://spam.com"
  }' \
  -s -w "\nHTTP Status: %{http_code}\n"

echo -e "\n=== Test 5: Invalid email (validation test) ==="
curl -X POST "$BASE_URL/api/submit-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John Doe",
    "email": "invalid-email",
    "productInterests": ["disposables"],
    "location_count": 1
  }' \
  -s -w "\nHTTP Status: %{http_code}\n"

echo -e "\n✅ All tests completed"
