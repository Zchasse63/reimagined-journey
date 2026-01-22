#!/bin/bash
# Test submit-lead.ts field mapping transformations

API_URL="http://localhost:4321/api/submit-lead"

echo "=== Testing Field Mapping Transformations ==="
echo ""

# Test 1: MultiStepLeadForm field names (camelCase)
echo "Test 1: MultiStepLeadForm field names (camelCase)"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant Co",
    "contactName": "John Doe",
    "email": "test1@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1 | jq .
echo ""

# Test 2: Single name edge case
echo "Test 2: Single name edge case (contactName: 'John')"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant 2",
    "contactName": "John",
    "email": "test2@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1 | jq .
echo ""

# Test 3: Multi-part last name
echo "Test 3: Multi-part last name (contactName: 'John van der Berg')"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant 3",
    "contactName": "John van der Berg",
    "email": "test3@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1 | jq .
echo ""

echo "=== All field mapping tests complete ==="
