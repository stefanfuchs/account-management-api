

export interface AccountRequest {
  account_number: string
}

export interface BalanceRequest {
  accountNumber: string
}

export interface Account {
  id: string
  /** Monetary values are always integers that represent cents. e.g. R$1000,00 is represented as 100000 */
  balance: number
}

export interface Deposit {
  ammount: number
}

export interface DepositRequestParams {
  accountNumber: string
}

export interface DepositRequestBody {
  ammount: number
}

export interface Transfer {
  ammount: number
  from: string
  to: string
}
