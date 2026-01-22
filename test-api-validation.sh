#!/bin/bash
set -e

echo "=== Testing Field Mapping ==="
echo ""

# Test 1: MultiStepLeadForm format (businessType, businessName, contactName)
echo "Test 1: MultiStepLeadForm format with camelCase fields"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant",
    "contactName": "John Doe",
    "email": "test@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>/dev/null | jq .

echo ""
echo "Test 2: Single name edge case (contactName='John')"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John",
    "email": "test2@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>/dev/null | jq .

echo ""
echo "Test 3: Multiple name parts (contactName='John van der Berg')"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John van der Berg",
    "email": "test3@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>/dev/null | jq .

echo ""
echo "Test 4: Schema format with snake_case fields (should also work)"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "restaurant",
    "company_name": "Test Co",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "test4@example.com",
    "primary_interest": ["disposables"],
    "location_count": 1
  }' 2>/dev/null | jq .
