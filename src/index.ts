

import express from 'express';
import BetterSqlite3 from 'better-sqlite3';

const app = express();
const db = new BetterSqlite3('data.db');

//
// Monetary values are always integers that represent cents. e.g. R$1000,00 is represented as 100000.
//

const createTable = db.prepare(`
CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(30) PRIMARY KEY DEFAULT (uuid()),
  balance INTEGER NOT NULL DEFAULT (0)
);`);

createTable.run();

app.use(express.json());

app.post('/data', (req, res) => {
  const insertData = db.prepare(`INSERT INTO data (data) VALUES (?);`);
  insertData.run(req.body.data);

  res.status(201).send({ message: 'Data added successfully' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

