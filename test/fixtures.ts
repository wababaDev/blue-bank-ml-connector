import crypto from 'crypto';


import { TCBSUpdateSendMoneyRequest, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from "@mojaloop/core-connector-lib";

export const quoteRequestDTO = (IdValue: string): TQuoteRequest => ({
  "homeR2PTransactionId": crypto.randomUUID(),
  "amount": "1000",
  "amountType": "SEND",
  "currency": "ZMW",
  "expiration": new Date(Date.now() + 60_000).toISOString(),
  "extensionList": [
    {
      "key": "string",
      "value": "string"
    }
  ],
  "feesAmount": "1000",
  "feesCurrency": "ZMW",
  "from": {
    "dateOfBirth": "1990-05-15",
    "displayName": "string",
    "extensionList": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "firstName": "string",
    "fspId": "string",
    "idSubValue": "string",
    "idType": "MSISDN",
    "idValue": "string",
    "lastName": "string",
    "merchantClassificationCode": "string",
    "middleName": "string",
    "type": "CONSUMER"
  },

  "initiator": "PAYER",
  "initiatorType": "CONSUMER",
  "note": "string",
  "quoteId": crypto.randomUUID(),
  "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
  "to": {
    "dateOfBirth": "1990-05-15",
    "displayName": "string",
    "extensionList": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "firstName": "string",
    "fspId": "string",
    "idSubValue": "string",
    "idType": "MSISDN",
    "idValue": IdValue,
    "lastName": "string",
    "merchantClassificationCode": "string",
    "middleName": "string",
    "type": "CONSUMER"
  },
  "transactionId": crypto.randomUUID(),
  "transactionType": "TRANSFER",
  "transactionRequestId": crypto.randomUUID()
}
);

export const reserveTransferDTO = (amount: string): TtransferRequest => ({
  "transferId": crypto.randomUUID(),
  "amount": amount,
  "amountType": "SEND",
  "currency": "ZMW",
  "from": {
    "idType": "MSISDN",
    "idValue": "777123456"
  },
  "to": {
    "idType": "MSISDN",
    "idValue": "260970000000"
  },
  "ilpPacket": {
    "data": {
      "amount": { "amount": "400", "currency": "ZMW" },
      "payee": {
        "partyIdInfo": { "partyIdType": "MSISDN", "partyIdentifier": "260970000000", "fspId": "bluebank" },
        "merchantClassificationCode": "1234",
        "name": "Payee Name",
        "personalInfo": { "complexName": { "firstName": "PayeeFirstName", "lastName": "PayeeLastName" }, "dateOfBirth": "2001-08-21" },
        "supportedCurrencies": ["ZMW"]
      },
      "payer": {
        "partyIdInfo": { "partyIdType": "MSISDN", "partyIdentifier": "0882997445", "fspId": "greenbank" },
        "merchantClassificationCode": "1234",
        "name": "Payer Name",
        "personalInfo": { "complexName": { "firstName": "PayerFirstName", "lastName": "PayerLastName" }, "dateOfBirth": "2001-08-21" },
        "supportedCurrencies": ["ZMW"]
      },
      "quoteId": crypto.randomUUID(),
      "transactionId": crypto.randomUUID(),
      "transactionType": {
        "initiator": "PAYER",
        "initiatorType": "CONSUMER",
        "scenario": "TRANSFER",
        "subScenario": "LOCALLY_DEFINED_SUBSCENARIO"
      }
    }
  },
  "transactionType": "TRANSFER",
  "quote": {
    "expiration": new Date(Date.now() + 60_000).toISOString(),
    "payeeFspCommissionAmount": "0",
    "payeeFspCommissionAmountCurrency": "ZMW",
    "payeeFspFeeAmount": "3",
    "payeeFspFeeAmountCurrency": "ZMW",
    "payeeReceiveAmount": "100",
    "payeeReceiveAmountCurrency": "ZMW",
    "quoteId": crypto.randomUUID(),
    "transactionId": crypto.randomUUID(),
    "transferAmount": "103",
    "transferAmountCurrency": "ZMW"
  },
  "note": "Transfer Quote Request"
});


// export const transferNotificationDTO = (): TtransferPatchNotificationRequest => ({
//   "currentState": "COMPLETED",
//   "direction": "INBOUND",
//   "finalNotification": {
//     "completedTimestamp": "2024-02-29T23:59:59.123Z",
//     "extensionList": [
//       {
//         "key": "string",
//         "value": "string"
//       }
//     ],
//     "transferState": "RECEIVED"
//   },
//   "initiatedTimestamp": "2024-02-29T23:59:59.123Z",
//   "lastError": {
//     "httpStatusCode": 0,
//     "mojaloopError": {
//       "errorInformation": {
//         "errorCode": "5100",
//         "errorDescription": "string",
//         "extensionList": {
//           "extension": [
//             {
//               "key": "string",
//               "value": "string"
//             }
//           ]
//         }
//       }
//     }
//   },
//   "quote": {
//     "fulfilment": crypto.randomBytes(32).toString('base64url'),
//     "internalRequest": {},
//     "mojaloopResponse": {},
//     "request": {},
//     "response": {}
//   },
//   "quoteRequest": {
//     "body": {
//       "quoteId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
//       "transactionId": "{{$randomUUID}}",
//       "transactionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
//       "payee": {
//         "partyIdInfo": {
//           "partyIdType": "MSISDN",
//           "partyIdentifier": "56733123450",
//           "partySubIdOrType": "string",
//           "fspId": "string",
//           "extensionList": {
//             "extension": [
//               {
//                 "key": "string",
//                 "value": "string"
//               }
//             ]
//           }
//         },
//         "merchantClassificationCode": "string",
//         "name": "string",
//         "personalInfo": {
//           "complexName": {
//             "firstName": "Henrik",
//             "middleName": "Johannes",
//             "lastName": "Karlsson"
//           },
//           "dateOfBirth": "1966-06-16",
//           "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
//         },
//         "supportedCurrencies": [
//           "ZMW"
//         ]
//       },
//       "payer": {
//         "partyIdInfo": {
//           "partyIdType": "MSISDN",
//           "partyIdentifier": "16135551212",
//           "partySubIdOrType": "string",
//           "fspId": "string",
//           "extensionList": {
//             "extension": [
//               {
//                 "key": "string",
//                 "value": "string"
//               }
//             ]
//           }
//         },
//         "merchantClassificationCode": "string",
//         "name": "string",
//         "personalInfo": {
//           "complexName": {
//             "firstName": "Henrik",
//             "middleName": "Johannes",
//             "lastName": "Karlsson"
//           },
//           "dateOfBirth": "1966-06-16",
//           "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
//         },
//         "supportedCurrencies": [
//           "ZMW"
//         ]
//       },
//       "amountType": "RECEIVE",
//       "amount": {
//         "currency": "ZMW",
//         "amount": "5000000"
//       },
//       "fees": {
//         "currency": "ZMW",
//         "amount": "123.45"
//       },
//       "transactionType": {
//         "scenario": "DEPOSIT",
//         "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
//         "initiator": "PAYEE",
//         "initiatorType": "CONSUMER",
//         "refundInfo": {
//           "originalTransactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
//           "refundReason": "Free text indicating reason for the refund."
//         },
//         "balanceOfPayments": "123"
//       },
//       "converter": "PAYER",
//       "currencyConversion": {
//         "sourceAmount": {
//           "currency": "ZMW",
//           "amount": "123.45"
//         },
//         "targetAmount": {
//           "currency": "ZMW",
//           "amount": "123.45"
//         }
//       },
//       "geoCode": {
//         "latitude": "+45.4215",
//         "longitude": "+75.6972"
//       },
//       "note": "School Fees.",
//       "expiration": "2016-05-24T08:38:08.699-04:00",
//       "extensionList": {
//         "extension": [
//           {
//             "key": "string",
//             "value": "string"
//           }
//         ]
//       }
//     },
//     "headers": {}
//   },
//   "quoteResponse": {
//     "body": {},
//     "headers": {}
//   },
//   "transferId": "{{$randomUUID}}"
// });
const fulfilmentBuffer = crypto.randomBytes(32);
const fulfilment = fulfilmentBuffer.toString("base64url");
const condition = crypto.createHash("sha256").update(fulfilmentBuffer).digest("base64url");

export const transferNotificationDTO = (params: {
  transferId: string;
  quoteId: string;
  transactionId: string;
  transferAmount: string;
  payeeIdValue: string;
  payerIdValue: string;
}): TtransferPatchNotificationRequest => {
  const ilpPacketShape = {
    data: {
      amount: { amount: params.transferAmount, currency: "ZMW" },
      payee: {
        partyIdInfo: { partyIdType: "MSISDN", partyIdentifier: params.payeeIdValue, fspId: "bluebank" },
        merchantClassificationCode: "1234",
        name: "Mercy Uzumaki",
        personalInfo: { complexName: { firstName: "Mercy", lastName: "Uzumaki" }, dateOfBirth: "1990-05-15" },
        supportedCurrencies: ["ZMW"],
      },
      payer: {
        partyIdInfo: { partyIdType: "MSISDN", partyIdentifier: params.payerIdValue, fspId: "greenbank" },
        merchantClassificationCode: "1234",
        name: "Alice Payer",
        personalInfo: { complexName: { firstName: "Alice", lastName: "Payer" }, dateOfBirth: "1990-05-15" },
        supportedCurrencies: ["ZMW"],
      },
      quoteId: params.quoteId,
      transactionId: params.transactionId,
      transactionType: {
        initiator: "PAYER",
        initiatorType: "CONSUMER",
        scenario: "TRANSFER",
        subScenario: "LOCALLY_DEFINED_SUBSCENARIO",
      },
    },
  };

  const quoteRequestShape = {
    quoteId: params.quoteId,
    transactionId: params.transactionId,
    to: { idType: "MSISDN", idValue: params.payeeIdValue },
    from: { idType: "MSISDN", idValue: params.payerIdValue },
    amount: params.transferAmount,
    amountType: "SEND",
    currency: "ZMW",
    initiator: "PAYER",
    initiatorType: "CONSUMER",
    transactionType: "TRANSFER",
  };

  const quoteRequestBodyShape = {
    quoteId: params.quoteId,
    transactionId: params.transactionId,
    transactionRequestId: crypto.randomUUID(),
    payee: {
      partyIdInfo: { partyIdType: "MSISDN", partyIdentifier: params.payeeIdValue, fspId: "bluebank" },
      name: "Mercy Uzumaki",
      personalInfo: { complexName: { firstName: "Mercy", lastName: "Uzumaki" }, dateOfBirth: "1990-05-15" },
      supportedCurrencies: ["ZMW"],
    },
    payer: {
      partyIdInfo: { partyIdType: "MSISDN", partyIdentifier: params.payerIdValue, fspId: "greenbank" },
      name: "Alice Payer",
      personalInfo: { complexName: { firstName: "Alice", lastName: "Payer" }, dateOfBirth: "1990-05-15" },
      supportedCurrencies: ["ZMW"],
    },
    amountType: "RECEIVE",
    amount: { currency: "ZMW", amount: params.transferAmount },
    fees: { currency: "ZMW", amount: "3" },
    transactionType: {
      scenario: "DEPOSIT",
      subScenario: "LOCALLY_DEFINED_SUBSCENARIO",
      initiator: "PAYEE",
      initiatorType: "CONSUMER",
    },
    note: "Transfer notification test",
    expiration: new Date(Date.now() + 60_000).toISOString(),
    extensionList: { extension: [{ key: "note", value: "test data" }] },
  };

  const quoteResponseShape = {
    quoteId: params.quoteId,
    transactionId: params.transactionId,
    transferAmount: { amount: params.transferAmount, currency: "ZMW" },
    payeeFspFeeAmount: { amount: "3", currency: "ZMW" },
    payeeFspCommissionAmount: { amount: "0", currency: "ZMW" },
    payeeReceiveAmount: { amount: (Number(params.transferAmount) - 3).toString(), currency: "ZMW" },
    ilpPacket: Buffer.from(JSON.stringify(ilpPacketShape)).toString("base64"),
    condition,
    expiration: new Date(Date.now() + 60_000).toISOString(),
  };

  const quoteResponseFlatShape = {
    quoteId: params.quoteId,
    transactionId: params.transactionId,
    transferAmount: params.transferAmount,
    transferAmountCurrency: "ZMW",
    payeeFspFeeAmount: "3",
    payeeFspFeeAmountCurrency: "ZMW",
    payeeFspCommissionAmount: "0",
    payeeFspCommissionAmountCurrency: "ZMW",
    payeeReceiveAmount: (Number(params.transferAmount) - 3).toString(),
    payeeReceiveAmountCurrency: "ZMW",
    expiration: new Date(Date.now() + 60_000).toISOString(),
};
  return {
    currentState: "COMPLETED",
    direction: "INBOUND",
    finalNotification: {
      completedTimestamp: new Date().toISOString(),
      extensionList: [{ key: "note", value: "test completion" }],
      transferState: "RECEIVED",
    },
    initiatedTimestamp: new Date().toISOString(),
    lastError: {
      httpStatusCode: 0,
      mojaloopError: {
        errorInformation: {
          errorCode: "5100",
          errorDescription: "No error",
          extensionList: { extension: [{ key: "note", value: "test completion" }] },
        },
      },
    },
    quote: {
      fulfilment: crypto.randomBytes(32).toString("base64url"),
      internalRequest: quoteRequestShape,
      mojaloopResponse: quoteResponseShape,
      request: quoteRequestBodyShape,
      response: quoteResponseFlatShape,
    },
    quoteRequest: {
      body:quoteRequestBodyShape,
      headers: {},
    },
    quoteResponse: {
      body: quoteResponseShape,
      headers: {},
    },
    transferId: params.transferId,
  } as unknown as TtransferPatchNotificationRequest;
};

export const confirmSendMoneyDTO = (homeTransactionId: string): TCBSUpdateSendMoneyRequest => ({
  "acceptQuote": true,
  "homeTransactionId": homeTransactionId
});