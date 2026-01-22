#!/bin/bash

# Test with schema-compliant field names
echo "Testing with schema-compliant field names..."

curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "restaurant",
    "company_name": "Test Restaurant LLC",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@testemail.com",
    "phone": "+14045551234",
    "primary_interest": ["disposables", "proteins"],
    "location_count": 3
  }'

echo ""
