#!/bin/bash

# Test field mapping in submit-lead API endpoint
# Tests that MultiStepLeadForm field names are correctly transformed

echo "Testing submit-lead API field mapping..."

# Test 1: MultiStepLeadForm field names (camelCase)
echo -e "\n=== Test 1: camelCase form fields from MultiStepLeadForm ==="
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant LLC",
    "contactName": "John Doe",
    "email": "john@testrestaurant.com",
    "phone": "555-1234",
    "productInterests": ["disposables", "proteins"],
    "location_count": 3,
    "purchase_timeline": "1-3mo",
    "current_distributor": "Sysco"
  }' \
  2>/dev/null | jq .

# Test 2: Single name (edge case)
echo -e "\n=== Test 2: Single name edge case ==="
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "food_truck",
    "businessName": "Taco Stand",
    "contactName": "Madonna",
    "email": "madonna@taco.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' \
  2>/dev/null | jq .

# Test 3: Multi-part name
echo -e "\n=== Test 3: Multi-part name (van der Berg) ==="
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "caterer",
    "businessName": "Fine Catering Co",
    "contactName": "John van der Berg",
    "email": "john@finecatering.com",
    "productInterests": ["custom_print"],
    "location_count": 2
  }' \
  2>/dev/null | jq .

# Test 4: Already-transformed fields (should still work)
echo -e "\n=== Test 4: Already-transformed snake_case fields ==="
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "institution",
    "company_name": "School District",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@school.edu",
    "primary_interest": ["disposables"],
    "location_count": 5
  }' \
  2>/dev/null | jq .

echo -e "\n=== Tests complete ==="
