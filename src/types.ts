// Blue Bank Configuration Type

export type TBlueBankConfig = {
    BLUE_BANK_URL: string;
    BLUE_BANK_AUTH_KEY: string;
};

type TBlueBankResponse<T> = {
    success: boolean,
    data: T
}
// Get Account Info

export type TAccountInfoResponseData = {
    accountId: string;
    name: string;
    currency: string;
    isActive: boolean;
}

export type TAccountInfoResponse = TBlueBankResponse<TAccountInfoResponseData>


// Quotes

export type TBBQuoteRequest = {
    account_id: string;
    amount: number;
    currency: string;
}

type TBBQuoteResponseData = {
    amount: number;
    fee: number;
    currency: string;
}

export type TBBQuoteResponse = TBlueBankResponse<TBBQuoteResponseData>


// Reserve Funds Request


export type TReserveFundsRequest = {
    account_id: string;
    amount: number;
    currency: string;
    transfer_id: string;
}


// Unreserve Funds Request

export type TUnreserveFundsData = {
    reserve_id: string;
    reason: string;
}


// Commit Funds Request
export type TCommitReservedFunds ={
  reserve_id: string;
}

// Reserve, Unreserve and Commit Funds Response
type TFundsReservationResult = {
    reserveId: string;
    status: string;
}

export type TReserveFundsResponse = TBlueBankResponse<TFundsReservationResult>


// Payer Side

export type TRefundRequest = {
  home_transaction_id: string;
  reason: string;
}

type TRefundResponseData = {
    debitId: string;
    homeTransactionId: string;
    status: string;
  }

export type TRefundResponse = TBlueBankResponse<TRefundResponseData>
