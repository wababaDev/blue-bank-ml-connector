import {
    ICbsClient,
    IHTTPClient,
    ILogger,
    Party,
    TCBSConfig,
    TCBSUpdateSendMoneyRequest,
    TGetKycArgs,
    TPayeeExtensionListEntry,
    TQuoteRequest,
    TQuoteResponse,
    TtransferErrorResponse,
    TtransferPatchNotificationRequest,
    TtransferRequest,
    TtransferResponse,
} from '@mojaloop/core-connector-lib';
import { ConnectorError } from './errors';
import { TAccountInfoResponse, TBBQuoteRequest, TBlueBankConfig, TBBQuoteResponse, TAccountInfoResponseData, TReserveFundsResponse, TReserveFundsRequest } from './types';

export class BlueBankCBSClient implements ICbsClient {
    cbsConfig: TCBSConfig<TBlueBankConfig>;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(cbsConfig: TCBSConfig<TBlueBankConfig>, httpClient: IHTTPClient, logger: ILogger) {
        this.cbsConfig = cbsConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    private getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.cbsConfig.config.BLUE_BANK_AUTH_KEY}`,
        };
    }

    // Helper function for get account info and do checks
    private async getAccount(accountId: string): Promise<TAccountInfoResponseData> {
        let res;
        try {
            res = await this.httpClient.get<TAccountInfoResponse>(
                `${this.cbsConfig.config.BLUE_BANK_URL}/accounts/${accountId}`,
                { headers: this.getAuthHeaders() }
            );
        } catch (err: any) {
            if (err?.response?.status === 404) {
                throw ConnectorError.cbsConfigUndefined('Party Not Found', '2000', 404);
            }
            throw ConnectorError.cbsConfigUndefined('Failed to fetch account info from Blue Bank', '2001', 500);
        }

        if (!res.data.success) {
            throw ConnectorError.cbsConfigUndefined('Blue Bank returned an unsuccessful response', '2001', 500);
        }

        return res.data.data;
    }

    async getAccountInfo(deps: TGetKycArgs): Promise<Party> {
        this.logger.info(`Getting party account information`, deps);

        const account = await this.getAccount(deps.accountId);

        const party: Party = {
            displayName: account.name,
            firstName: account.name.split(' ')[0],
            lastName: account.name.split(' ').slice(1).join(' ') || account.name,
            fspId: this.cbsConfig.FSP_ID,
            idSubValue: deps.subId,
            idType: 'MSISDN',
            idValue: account.accountId,
            type: 'PERSON',
            supportedCurrencies: account.currency,
            kycInformation: account.isActive ? 'Active account' : 'Inactive account',
            middleName: account.name.split(' ')[0]
        };
        this.logger.debug('Party', party);
        return party;
    }

    getAccountDiscoveryExtensionLists(): TPayeeExtensionListEntry[] {
        return [
            {
                key: 'Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI',
                value: '01HTZ7V7JEMZ6NR90YKE6XK2X3',
            },
        ];
    }

    async getQuote(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Processing quoteRequest`, quoteRequest);

        await this.getAccount(quoteRequest.from.idValue);

        let quoteBlueBankRequest: TBBQuoteRequest = {
            account_id: quoteRequest.from.idValue,
            amount: Number(quoteRequest.amount),
            currency: quoteRequest.currency
        }

        const quoteReq = await this.httpClient.post<TBBQuoteRequest, TBBQuoteResponse>(`${this.cbsConfig.config.BLUE_BANK_URL}/quotes`, quoteBlueBankRequest, { headers: this.getAuthHeaders() })

        const bbQuote = quoteReq.data.data;


        return Promise.resolve({
            payeeFspCommissionAmountCurrency: this.cbsConfig.CURRENCY,
            payeeFspFeeAmount: bbQuote.fee.toString(),
            payeeFspFeeAmountCurrency: this.cbsConfig.CURRENCY,
            payeeReceiveAmount: (bbQuote.amount - bbQuote.fee).toString(),
            payeeReceiveAmountCurrency: this.cbsConfig.CURRENCY,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: bbQuote.amount.toString(),
            transferAmountCurrency: this.cbsConfig.CURRENCY,
        });
    }

    async reserveFunds(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Reserving funds for transfer request`, transfer);
        await this.getAccount(transfer.to.idValue); // confirms the payee exists before reserving

        const reservationRequest: TReserveFundsRequest = {
            account_id: transfer.to.idValue,
            amount: Number(transfer.amount),
            currency: transfer.currency,
        }

        const reserveReq = await this.httpClient.post<TReserveFundsRequest, TReserveFundsResponse>(
            `${this.cbsConfig.config.BLUE_BANK_URL}/funds/reserve`,
            reservationRequest,
            { headers: this.getAuthHeaders() }
        );

        if (!reserveReq.data.success) {
            throw ConnectorError.cbsConfigUndefined('Blue Bank rejected the reservation', '2003', 500);
        }
        const reserveId = reserveReq.data.data.reserveId;
        return {
            homeTransactionId: reserveId,
            transferState: 'RESERVED',
        };
    }

    async unreserveFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void> {
        this.logger.info(`Unreserving funds for request `, transferUpdate);
        return Promise.resolve();
    }

    async commitReservedFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void> {
        this.logger.info(`Committing funds for request `, transferUpdate);
        return Promise.resolve();
    }

    async handleRefund(
        updateSendMoneyDeps: TCBSUpdateSendMoneyRequest,
        transferId: string,
        transferRes: TtransferErrorResponse,
    ): Promise<void> {
        this.logger.info(`Processing refund for req ${updateSendMoneyDeps} and transferId ${transferId}`);
    }
}
