'use strict';

import {
    IHTTPClient,
    AxiosClientFactory,
    ICbsClient,
    logger,
    coreConnectorServiceFactory,
} from '@mojaloop/core-connector-lib';
import { blueBankConfig } from './config';
import { BlueBankCBSClient} from './CBSClient';
import { ConnectorError } from './errors';
import { TBlueBankConfig } from './types';

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


// makes sure dfsp config is configured
if (!blueBankConfig.cbs) {
    throw ConnectorError.cbsConfigUndefined(
        'CBS Config Not defined. Please fix the configuration in config.ts',
        '0',
        0,
    );
}

const blueBankCbs: ICbsClient = new BlueBankCBSClient<TBlueBankConfig>(blueBankConfig.cbs, httpClient, logger);
const coreConnector = coreConnectorServiceFactory({ cbsClient: blueBankCbs, config: blueBankConfig });

// Start Core Connector
coreConnector.start();

async function _handle_int_and_term_signals(signal: NodeJS.Signals): Promise<void> {
    logger.warn(`Service - ${signal} received - cleaning up...`);
    let clean_exit = false;
    setTimeout(() => {
        clean_exit || process.abort();
    }, 5000);

    // call graceful stop routine
    await coreConnector.stop();

    clean_exit = true;
    process.exit();
}

//catches ctrl+c event
process.on('SIGINT', _handle_int_and_term_signals.bind(this));
//catches program termination event
process.on('SIGTERM', _handle_int_and_term_signals.bind(this));

//do something when app is closing
process.on('exit', async () => {
    logger.info('Service - exiting...');
});

process.on('uncaughtException', (err: Error) => {
    logger.error(`UncaughtException: ${err?.message}`, err);
    process.exit(999);
});
