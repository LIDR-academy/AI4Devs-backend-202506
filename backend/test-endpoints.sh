#!/bin/bash

echo "=== TESTING KANBAN ENDPOINTS ==="
echo ""

# Test GET /positions/:id/candidates
echo "1. Testing GET /positions/1/candidates"
echo "Expected: List of candidates for position 1 with their stages and scores"
echo ""
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
echo ""
echo "-----------------------------------"
echo ""

# Test invalid position ID
echo "2. Testing GET /positions/999/candidates (invalid ID)"
echo "Expected: 404 Not Found"
echo ""
curl -X GET "http://localhost:3010/positions/999/candidates" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
echo ""
echo "-----------------------------------"
echo ""

# Test PUT /candidates/:id/stage (move candidate to next stage)
echo "3. Testing PUT /candidates/1/stage"
echo "Expected: Success message updating candidate stage"
echo ""
curl -X PUT "http://localhost:3010/positions/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{"newStageId": 2}' \
  | python3 -m json.tool
echo ""
echo "-----------------------------------"
echo ""

# Verify the stage change
echo "4. Verifying stage change - GET /positions/1/candidates again"
echo "Expected: Candidate 1 should now be in stage 2"
echo ""
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
echo ""
echo "-----------------------------------"
echo ""

# Test invalid candidate ID for stage update
echo "5. Testing PUT /candidates/999/stage (invalid candidate ID)"
echo "Expected: 404 Not Found"
echo ""
curl -X PUT "http://localhost:3010/positions/candidates/999/stage" \
  -H "Content-Type: application/json" \
  -d '{"newStageId": 1}' \
  | python3 -m json.tool
echo ""
echo "-----------------------------------"
echo ""

# Test invalid stage ID
echo "6. Testing PUT /candidates/1/stage with invalid stage ID"
echo "Expected: 404 Not Found (invalid stage)"
echo ""
curl -X PUT "http://localhost:3010/positions/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{"newStageId": 999}' \
  | python3 -m json.tool
echo ""

echo "=== TEST COMPLETED ==="
