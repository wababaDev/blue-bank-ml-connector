import axios from "axios";
import { IHTTPClient, AxiosClientFactory, ICbsClient, logger, coreConnectorServiceFactory } from "@mojaloop/core-connector-lib";
import { blueBankConfig } from "../../src/config";
import { BlueBankCBSClient } from "../../src/CBSClient";
import { ConnectorError } from "../../src/errors";
import { quoteRequestDTO, reserveTransferDTO, transferNotificationDTO } from "test/fixtures";

export type TBlueBankConfig = {
    BLUE_BANK_URL: string;
    BLUE_BANK_AUTH_KEY: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


if (!blueBankConfig.cbs) {
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts", "0", 0);
}

const cbsClient: ICbsClient = new BlueBankCBSClient(blueBankConfig.cbs, httpClient, logger);
const coreConnector = coreConnectorServiceFactory({ cbsClient: cbsClient, config: blueBankConfig });

const SDK_URL = "http://localhost:3003";

const MERCY_IDVALUE = "260970000000";
const FAITH_IDVALUE = "260970000001";
const IDTYPE = "MSISDN";



describe("Core Connector Tests", () => {
    beforeAll(async () => {
        await coreConnector.start();
    });

    afterAll(async () => {
        await coreConnector.stop();
    });

    describe("Incoming Payments", () => {
        test("Get Parties", async () => {
            const res = await axios.get(`${SDK_URL}/parties/${IDTYPE}/${MERCY_IDVALUE}`);

            expect(res.status).toBe(200);
            expect(res.data.idValue).toBe(MERCY_IDVALUE);
            expect(res.data.displayName).toBeDefined();
            expect(res.data.type).toBe("PERSON");
        });

        test("Get Parties - not found", async () => {
            await expect(
                axios.get(`${SDK_URL}/parties/${IDTYPE}/00000000000`)
            ).rejects.toMatchObject({ response: { status: 404 } });
        });

        let realQuoteId: string;
        let realTransactionId: string;
        let realTransferAmount: string;
        let realTransferId: string;

        test("Quote Requests", async () => {
            const payload = quoteRequestDTO(MERCY_IDVALUE);
            const res = await axios.post(`${SDK_URL}/quoterequests`, payload);

            expect(res.status).toBe(200);

            // capture the REAL values from the response, to actually use downstream
            realQuoteId = res.data.quoteId;
            realTransactionId = res.data.transactionId;
            realTransferAmount = res.data.transferAmount;
        });

        test("Quote Requests - account not found", async () => {
            const payload = quoteRequestDTO("00000000000");

            await expect(
                axios.post(`${SDK_URL}/quoterequests`, payload)
            ).rejects.toMatchObject({ response: { status: expect.any(Number) } });
        });

        test("Transfers Reserve", async () => {
            const fee = "3";
            const commission = "0";
            const receiveAmount = (Number(realTransferAmount) - Number(fee) - Number(commission)).toString();

            const payload = reserveTransferDTO(realTransferAmount);
            realTransferId = payload.transferId;
            payload.quote.quoteId = realQuoteId;
            payload.quote.transactionId = realTransactionId;
            payload.quote.transferAmount = realTransferAmount;
            payload.quote.payeeFspFeeAmount = fee;
            payload.quote.payeeFspCommissionAmount = commission;
            payload.quote.payeeReceiveAmount = receiveAmount;
            payload.ilpPacket.data.quoteId = realQuoteId;
            payload.ilpPacket.data.transactionId = realTransactionId;

            try {
                const res = await axios.post(`${SDK_URL}/transfers`, payload);
                expect(res.status).toBe(200);
                expect(res.data.transferState).toBe("RESERVED");
            } catch (err: any) {
                console.log("Validation error response:", JSON.stringify(err.response?.data, null, 2));
                throw err;
            }
        });
        test("Transfers Commit", async () => {


            const payload = transferNotificationDTO({
                transferId: realTransferId,
                quoteId: realQuoteId,
                transactionId: realTransactionId,
                transferAmount: realTransferAmount,
                payeeIdValue: MERCY_IDVALUE,
                payerIdValue: "777123456",
            });
            try {
                const res = await axios.put(`${SDK_URL}/transfers/${realTransferId}`, payload);

                console.log(JSON.stringify(res.data, null, 2));
                expect(res.status).toBe(200);
            } catch (err: any) {
                console.log("Validation error response:", JSON.stringify(err.response?.data, null, 2));
                throw err;
            }
        });
        test("Transfers Commit - aborted transfer triggers unreserve, not commit", async () => {
            const abortTransferId = crypto.randomUUID();

            const reservePayload = reserveTransferDTO(realTransferAmount);
            reservePayload.transferId = abortTransferId;
            reservePayload.to.idValue = FAITH_IDVALUE;
            reservePayload.quote.quoteId = realQuoteId;
            reservePayload.quote.transactionId = realTransactionId;
            reservePayload.quote.transferAmount = realTransferAmount;
            reservePayload.quote.payeeReceiveAmount = (Number(realTransferAmount) - Number(reservePayload.quote.payeeFspFeeAmount)).toString();

            try {
                await axios.post(`${SDK_URL}/transfers`, reservePayload);
            } catch (err: any) {
                console.log("Reserve validation error:", JSON.stringify(err.response?.data, null, 2));
                throw err;
            }

            const notifyPayload = transferNotificationDTO({
                transferId: abortTransferId,
                quoteId: realQuoteId,
                transactionId: realTransactionId,
                transferAmount: realTransferAmount,
                payeeIdValue: FAITH_IDVALUE,
                payerIdValue: "777123456",
            });
            notifyPayload.currentState = "ERROR_OCCURRED";
            notifyPayload.lastError = notifyPayload.lastError ?? {};
            notifyPayload.lastError.httpStatusCode = 500;

            await expect(
                axios.put(`${SDK_URL}/transfers/${abortTransferId}`, notifyPayload)
            ).rejects.toMatchObject({
                response: {
                    data: {
                        status: "5000",
                        message: "Transfer Not Completed Error",
                    },
                },
            });
        });
    });
});