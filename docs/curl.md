
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

curl -i \
  http://localhost:3000/accounts/A/deposit \
  -d '{"ammount": 100000}' \
  -X POST \
  -H "Content-Type: application/json" 


curl -i http://localhost:3000/accounts/A/balance



