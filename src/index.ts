

import express from 'express';
import BetterSqlite3, { SqliteError } from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import { Account, AccountRequest, BalanceRequest, DepositRequestBody, DepositRequestParams, Transfer } from './types';

const app = express();
const db = new BetterSqlite3('data.db');

//
// Monetary values are always integers that represent cents. e.g. R$1000,00 is represented as 100000.
//

const createTable = db.prepare(`
CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(30) PRIMARY KEY NOT NULL,
  balance INTEGER NOT NULL DEFAULT (0)
);`);

createTable.run();


const printAllAccounts = () => {
  const selectData = db.prepare(`SELECT * FROM account;`);
  const res = selectData.all();
  console.log(res);
}


app.use(express.json());

app.post('/accounts', (req, res) => {
  const body: AccountRequest = req.body;
  const accountNumber = body.account_number || createId();
  const insertData = db.prepare(`INSERT INTO account (id) VALUES (?);`);

  try {
    insertData.run(accountNumber);
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      // duplicate account id was specified
      res.status(409).send();
      return;
    }

    console.log('Error in /accounts: ', e);
    res.status(400).send();
    return;
  }

  printAllAccounts()

  res.status(201).send({ account_number: accountNumber });
});


app.post('/accounts/transfer', (req, res) => {
  const body: Transfer = req.body;
  const { ammount, from, to } = body || {};

  if (typeof ammount !== 'number' || ammount <= 0 ||
    typeof from !== 'string' ||
    typeof to !== 'string'
  ) {
    res.status(400).send();
    return;
  }

  const queryAccount = db.prepare(`SELECT id, balance FROM account WHERE id = ?;`);
  const subtractFromAccount = db.prepare(`UPDATE account SET balance = balance - ? WHERE id = ?;`);
  const addToAccount = db.prepare(`UPDATE account SET balance = balance + ? WHERE id = ?;`);

  try {
    db.transaction(() => {
      const fromAccount: Account = queryAccount.get(from);
      // console.log({ fromAccount });

      if (fromAccount.balance - ammount < 0) {
        throw new Error('INSUFICIENT_BALANCE_ERROR');
      }

      subtractFromAccount.run(ammount, from)
      addToAccount.run(ammount, to)
    })();

  } catch (e: any) {
    if (e.message === 'INSUFICIENT_BALANCE_ERROR') {
      res.status(409).send();
      return;
    }

    console.log('Error in /accounts/transfer: ', e);
    res.status(400).send();
    return;
  }

  printAllAccounts()

  res.status(200).send();
});


app.get('/accounts/:accountNumber/balance', (req, res) => {
  const params: BalanceRequest = req.params;
  const { accountNumber } = params || {};

  if (!accountNumber || typeof accountNumber !== 'string') {
    res.status(400).send();
    return;
  }

  const queryAccount = db.prepare(`SELECT id, balance FROM account WHERE id = ?;`);

  try {
    const account: Account = queryAccount.get(accountNumber);
    if (!account) {
      res.status(404).send();
      return;
    }

    res.status(200).send({ ammount: account.balance });
    return;

  } catch (e: any) {
    console.log('Error in /accounts/:accountNumber/balance: ', e);
    res.status(400).send();
    return;
  }
});


app.post('/accounts/:accountNumber/deposit', (req, res) => {
  const params: DepositRequestParams = req.params;
  const body: DepositRequestBody = req.body;
  const { accountNumber } = params || {};
  const { ammount } = body || {};

  if (!accountNumber || typeof accountNumber !== 'string' ||
    typeof ammount !== 'number' || ammount <= 0
  ) {
    res.status(400).send();
    return;
  }

  const addToAccount = db.prepare(`UPDATE account SET balance = balance + ? WHERE id = ?;`);

  try {
    const updateResult = addToAccount.run(ammount, accountNumber);
    if (updateResult.changes < 1) {
      // no such account exists
      res.status(404).send();
      return;
    }

    res.status(200).send();
    printAllAccounts()
    return;

  } catch (e: any) {
    console.log('Error in /accounts/:accountNumber/deposit: ', e);
    res.status(400).send();
    return;
  }

});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

