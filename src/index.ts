

import express from 'express';
import BetterSqlite3, { SqliteError } from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import { Account } from './types';

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
  console.log(res)
}


app.use(express.json());

app.post('/accounts', (req, res) => {

  const accountNumber = req.body.account_number || createId();
  const insertData = db.prepare(`INSERT INTO account (id) VALUES (?);`);

  try {
    insertData.run(accountNumber);
  } catch (e: any) {
    const error = e as SqliteError

    if (e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      // duplicate account id was specified
      res.status(409).send();
      return
    }

    console.log(e)
    res.status(400).send();
    return;
  }

  printAllAccounts()

  // console.log()

  res.status(201).send({ account_number: accountNumber });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

