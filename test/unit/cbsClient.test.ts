import { IHTTPClient, ILogger,Party, TQuoteResponse, TtransferResponse } from "@mojaloop/core-connector-lib";
import { BlueBankCBSClient } from "../../src/CBSClient";
import { blueBankConfig } from "../../src/config";

const mockHttpClient: jest.Mocked<IHTTPClient> = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    send: jest.fn(),
};

const mockLogger: ILogger = {
    error: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
    info: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    silly: jest.fn(),
    child: jest.fn().mockReturnThis(),
};

describe("BlueBankCBSClient", () => {
    let cbsClient: BlueBankCBSClient;

    beforeEach(() => {
        jest.clearAllMocks();
        if (!blueBankConfig.cbs) {
            throw new Error("Test config missing cbs — check config.ts / .env used for tests");
        }
        cbsClient = new BlueBankCBSClient(blueBankConfig.cbs, mockHttpClient, mockLogger);
    });

    describe("getAccountInfo", () => {
        test("maps a successful response into a Party", async () => {
            mockHttpClient.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    success: true,
                    data: { accountId: "260970000000", name: "Mercy Uzumaki", currency: "ZMW", isActive: true },
                },
            } as any);

            const party: Party = await cbsClient.getAccountInfo({ accountId: "260970000000" } as any);

            expect(party.displayName).toBe("Mercy Uzumaki");
            expect(party.idValue).toBe("260970000000");
            expect(party.kycInformation).toBe("Active account");
            expect(mockHttpClient.get).toHaveBeenCalledWith(
                expect.stringContaining("/accounts/260970000000"),
                expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }) })
            );
        });

        test("throws when the account is not found (404)", async () => {
            mockHttpClient.get.mockRejectedValueOnce({ response: { status: 404 } });

            await expect(cbsClient.getAccountInfo({ accountId: "00000000000" } as any)).rejects.toThrow();
        });

        test("throws when Blue Bank returns success: false", async () => {
            mockHttpClient.get.mockResolvedValueOnce({ data: { success: false, data: null } } as any);

            await expect(cbsClient.getAccountInfo({ accountId: "260970000000" } as any)).rejects.toThrow();
        });
    });

    describe("getQuote", () => {
        test("returns a mapped quote on success", async () => {
            mockHttpClient.get.mockResolvedValueOnce({
                data: { success: true, data: { accountId: "260970000000", name: "Mercy Uzumaki", currency: "ZMW", isActive: true } },
            } as any);
            mockHttpClient.post.mockResolvedValueOnce({
                data: { success: true, data: { amount: 100, fee: 1, currency: "ZMW" } },
            } as any);

            const quote: TQuoteResponse = await cbsClient.getQuote({
                from: { idValue: "260970000000" },
                amount: "100",
                currency: "ZMW",
                quoteId: "q1",
                transactionId: "t1",
            } as any);

            expect(quote.payeeFspFeeAmount).toBe("1");
            expect(quote.transferAmount).toBe("100");
        });

        test("throws before ever calling /quotes if the account doesn't exist", async () => {
            mockHttpClient.get.mockRejectedValueOnce({ response: { status: 404 } });

            await expect(
                cbsClient.getQuote({ from: { idValue: "00000000000" }, amount: "100", currency: "ZMW" } as any)
            ).rejects.toThrow();

            expect(mockHttpClient.post).not.toHaveBeenCalled();
        });

        test("throws when the quote response itself is unsuccessful", async () => {
            mockHttpClient.get.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: false, data: null } } as any);

            await expect(
                cbsClient.getQuote({ from: { idValue: "260970000000" }, amount: "100", currency: "ZMW" } as any)
            ).rejects.toThrow();
        });
    });

    describe("reserveFunds", () => {
        test("returns RESERVED with the reserveId as homeTransactionId", async () => {
            mockHttpClient.get.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);
            mockHttpClient.post.mockResolvedValueOnce({
                data: { success: true, data: { reserveId: "abc-123", status: "RESERVED" } },
            } as any);

            const res: TtransferResponse = await cbsClient.reserveFunds({
                to: { idValue: "260970000000" },
                amount: "50",
                currency: "ZMW",
            } as any);

            expect(res.transferState).toBe("RESERVED");
            expect(res.homeTransactionId).toBe("abc-123");
        });

        test("throws when Blue Bank rejects the reservation", async () => {
            mockHttpClient.get.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: false, data: null } } as any);

            await expect(
                cbsClient.reserveFunds({ to: { idValue: "260970000000" }, amount: "50", currency: "ZMW" } as any)
            ).rejects.toThrow();
        });
    });

    describe("commitReservedFunds", () => {
        test("resolves without error on success", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);

            await expect(
                cbsClient.commitReservedFunds({ homeTransactionId: "abc-123" } as any)
            ).resolves.toBeUndefined();
        });

        test("throws when Blue Bank rejects the commit", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: false, data: null } } as any);

            await expect(
                cbsClient.commitReservedFunds({ homeTransactionId: "abc-123" } as any)
            ).rejects.toThrow();
        });
    });

    describe("unreserveFunds", () => {
        test("throws if lastError.httpStatusCode is missing", async () => {
            await expect(
                cbsClient.unreserveFunds({ homeTransactionId: "abc-123", lastError: {} } as any)
            ).rejects.toThrow(/Missing last error/);

            expect(mockHttpClient.post).not.toHaveBeenCalled();
        });

        test("resolves on success, with the status code in the reason", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);

            await expect(
                cbsClient.unreserveFunds({
                    homeTransactionId: "abc-123",
                    lastError: { httpStatusCode: 500 },
                } as any)
            ).resolves.toBeUndefined();

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                expect.stringContaining("/funds/unreserve"),
                expect.objectContaining({ reason: expect.stringContaining("500") }),
                expect.anything()
            );
        });
    });

    describe("handleRefund", () => {
        test("uses the real error message when present", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);

            await cbsClient.handleRefund(
                { acceptQuote: true, homeTransactionId: "abc-123" },
                "transfer-1",
                { message: "Payee FSP rejected the transfer" } as any
            );

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                expect.stringContaining("/debits/refund"),
                expect.objectContaining({ reason: "Payee FSP rejected the transfer" }),
                expect.anything()
            );
        });

        test("falls back to a generic reason when no message is given", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: true, data: {} } } as any);

            await cbsClient.handleRefund(
                { acceptQuote: true, homeTransactionId: "abc-123" },
                "transfer-1",
                {} as any
            );

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ reason: expect.stringContaining("unspecified reason") }),
                expect.anything()
            );
        });

        test("throws when Blue Bank's refund call is unsuccessful", async () => {
            mockHttpClient.post.mockResolvedValueOnce({ data: { success: false, data: null } } as any);

            await expect(
                cbsClient.handleRefund(
                    { acceptQuote: true, homeTransactionId: "abc-123" },
                    "transfer-1",
                    { message: "failed" } as any
                )
            ).rejects.toThrow();
        });
    });
});