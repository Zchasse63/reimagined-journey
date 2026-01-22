#!/bin/bash
# Test submit-lead API endpoint

ENDPOINT="http://localhost:4321/api/submit-lead"

echo "=== Test 1: Valid MultiStepLeadForm submission ==="
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant",
    "contactName": "John Doe",
    "email": "john.doe@test.com",
    "phone": "555-1234",
    "productInterests": ["disposables", "proteins"],
    "estimatedSpend": "5000-10000",
    "location_count": 2,
    "city": "Atlanta",
    "state": "Georgia"
  }' 2>&1 | head -20

echo ""
echo "=== Test 2: Single name (contactName edge case) ==="
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Solo",
    "contactName": "Jo",
    "email": "jo@test.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1 | head -20

echo ""
echo "=== Test 3: Honeypot detection ==="
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Bot Company",
    "contactName": "Bot User",
    "email": "bot@test.com",
    "productInterests": ["disposables"],
    "website": "http://spam.com",
    "location_count": 1
  }' 2>&1 | head -20

echo ""
echo "=== Test 4: Invalid data (empty contactName) ==="
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test",
    "contactName": "",
    "email": "test@test.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1 | head -20
