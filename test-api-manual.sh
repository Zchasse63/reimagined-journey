#!/bin/bash

# Test the API endpoint with curl to verify field mapping works
echo "Testing submit-lead API with MultiStepLeadForm field format..."
echo ""

# Create test payload
PAYLOAD='{
  "businessType": "restaurant",
  "businessName": "Test Restaurant LLC",
  "contactName": "John Doe",
  "email": "test@example.com",
  "phone": "404-555-1234",
  "productInterests": ["disposables", "proteins"],
  "location_count": 1,
  "source": "test"
}'

echo "Payload: $PAYLOAD"
echo ""
echo "Response:"
echo "$PAYLOAD" | curl -s -X POST http://localhost:8888/api/submit-lead \
  -H "Content-Type: application/json" \
  -d @- | jq .
