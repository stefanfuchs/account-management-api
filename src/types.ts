

export interface Account {
  id: string
  /** Monetary values are always integers that represent cents. e.g. R$1000,00 is represented as 100000 */
  balance: number
}

export interface Deposit {
  ammount: number
}

export interface Transfer {
  ammount: number
  from: string
  to: string
}
