#!/bin/bash

# Test submit-lead API with MultiStepLeadForm field names
echo "Testing /api/submit-lead with MultiStepLeadForm field names..."

curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant LLC",
    "contactName": "John Doe",
    "email": "john.doe@testemail.com",
    "phone": "+14045551234",
    "productInterests": ["disposables", "proteins"],
    "location_count": 3
  }'

echo ""
