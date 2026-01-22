#!/bin/bash

# Test 1: MultiStepLeadForm field names (businessType, businessName, contactName, productInterests)
echo "Test 1: MultiStepLeadForm field names"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant",
    "contactName": "John Doe",
    "email": "test@example.com",
    "productInterests": ["disposables", "proteins"],
    "location_count": 1
  }' 2>&1

echo -e "\n\nTest 2: contactName with single word"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John",
    "email": "test2@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1

echo -e "\n\nTest 3: contactName with multiple words"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Co",
    "contactName": "John van der Berg",
    "email": "test3@example.com",
    "productInterests": ["disposables"],
    "location_count": 1
  }' 2>&1

echo -e "\n\nTest 4: Honeypot detection"
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Bot Company",
    "contactName": "Bot Name",
    "email": "bot@example.com",
    "productInterests": ["disposables"],
    "location_count": 1,
    "website": "http://spam.com"
  }' 2>&1
