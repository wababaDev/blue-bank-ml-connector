import { AxiosClientFactory, ICbsClient, IHTTPClient, logger, Party, TQuoteResponse, TtransferResponse } from "@mojaloop/core-connector-lib";
import { BlueBankCBSClient } from "../../src/CBSClient";
import { blueBankConfig } from "../../src/config";
import { ConnectorError } from "../../src/errors";
import { confirmSendMoneyDTO, quoteRequestDTO, reserveTransferDTO, transferNotificationDTO } from "../fixtures";

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


if(!blueBankConfig.cbs){
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts","0",0);
}

const cbsClient: ICbsClient = new BlueBankCBSClient(blueBankConfig.cbs,httpClient,logger);
const IDVALUE = "256781666410";
const AMOUNT = "1";

describe("CBS Client Tests", ()=>{
    test("Get Account",async ()=>{
        const party: Party = await cbsClient.getAccountInfo({accountId:IDVALUE});
        expect(party.displayName).toBeDefined();
    });

    test("Get Quote", async ()=>{
        const quote : TQuoteResponse = await cbsClient.getQuote(quoteRequestDTO(IDVALUE));
        expect(quote.payeeFspFeeAmount).toBeDefined();
    });

    test("Transfers Reserve", async ()=>{
        const reserveRes: TtransferResponse = await cbsClient.reserveFunds(reserveTransferDTO(AMOUNT));
        expect(reserveRes.transferState).toEqual("RESERVED");
    });

    test("Transfers Commit", async ()=>{
        const commitRes = cbsClient.commitReservedFunds(transferNotificationDTO());
        await expect(commitRes).resolves;
    });
});