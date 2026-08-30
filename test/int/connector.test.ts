import axios from "axios";
import { IHTTPClient, AxiosClientFactory, ICbsClient, logger, coreConnectorServiceFactory } from "@mojaloop/core-connector-lib";
import { blueBankConfig } from "../../src/config";
import { BlueBankCBSClient } from "../../src/CBSClient";
import { ConnectorError } from "../../src/errors";

export type TBlueBankConfig = {
    BLUE_BANK_URL: string;
    BLUE_BANK_AUTH_KEY: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


if (!blueBankConfig.cbs) {
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts", "0", 0);
}

const cbsClient: ICbsClient = new BlueBankCBSClient (blueBankConfig.cbs, httpClient, logger);
const coreConnector = coreConnectorServiceFactory({ cbsClient: cbsClient, config: blueBankConfig });

const SDK_URL = "http://localhost:3003";

const IDVALUE = "260970000000";
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
            const res = await axios.get(`${SDK_URL}/parties/${IDTYPE}/${IDVALUE}`);

            expect(res.status).toBe(200);
            expect(res.data.party.partyIdInfo.partyIdentifier).toBe(IDVALUE);
        });

        test("Get Parties - not found", async () => {
            await expect(
                axios.get(`${SDK_URL}/parties/${IDTYPE}/00000000000`)
            ).rejects.toMatchObject({ response: { status: 404 } });
        });

        let quoteId: string;

        test("Quote Requests", async () => {
            quoteId = `q-${Date.now()}`;

            const res = await axios.post(`${SDK_URL}/quoterequests`, {
                quoteId,
                transactionId: `t-${Date.now()}`,
                payee: { partyIdInfo: { partyIdType: IDTYPE, partyIdentifier: IDVALUE } },
                amount: { amount: "100", currency: "ZMW" },
                transactionType: { scenario: "TRANSFER", initiator: "PAYER", initiatorType: "CONSUMER" },
            });

            expect(res.status).toBe(200);
            expect(res.data.transferAmount).toBeDefined();
        });

        let transferId: string;

        test("Transfers Reserve", async () => {
            transferId = `tr-${Date.now()}`;

            const res = await axios.post(`${SDK_URL}/transfers`, {
                transferId,
                quoteId,
                payeeFsp: "bluebank",
                payerFsp: "greenbank",
                amount: { amount: "100", currency: "ZMW" },
                ilpPacket: "test-packet",
                condition: "test-condition",
                expiration: new Date(Date.now() + 60_000).toISOString(),
            });

            expect(res.status).toBe(200);
            expect(res.data.transferState).toBe("RESERVED");
        });

        test("Transfers Commit", async () => {
            const res = await axios.put(`${SDK_URL}/transfers/${transferId}`, {
                transferState: "COMMITTED",
                fulfilment: "test-fulfilment",
                completedTimestamp: new Date().toISOString(),
            });

            expect(res.status).toBe(200);
        });
    });
});