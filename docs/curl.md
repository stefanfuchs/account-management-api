curl -i \
  -d '{"account_number":"A"}' \
  -X POST \
  -H "Content-Type: application/json" \
  http://localhost:3000/accounts


curl -i \
  -d '{"from":"A", "to": "B", "ammount": 100000}' \
  -X POST \
  -H "Content-Type: application/json" \
  http://localhost:3000/accounts/transfer



