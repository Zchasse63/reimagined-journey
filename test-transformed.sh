#!/bin/bash

# Add PUBLIC_SITE_URL as environment variable
export PUBLIC_SITE_URL="http://localhost:4321"

# Test with MultiStepLeadForm field names - includes all required fields
echo "Testing MultiStepLeadForm field names transformation..."

curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4321" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant LLC",
    "contactName": "John Doe",
    "email": "john.transformed@test.com",
    "phone": "+14045551234",
    "productInterests": ["disposables", "proteins"],
    "location_count": 3,
    "website": ""
  }' -v 2>&1 | grep -E "(HTTP|success|error|leadId)"

echo ""
