import 'dotenv/config';
import '@sentry/tracing';
import { Client } from './client';
import { Database } from './utility/Database';
import { ErrorHandler } from './errors/ErrorHandler';
import { ExtraErrorData } from '@sentry/integrations';
import { Log } from './utility/Log';
import * as Sentry from '@sentry/node';
import process from 'node:process';

Sentry.init({
    dsn: process.env.DSN,
    environment: process.env.ENVIRONMENT,
    integrations: [new ExtraErrorData()],
    tracesSampleRate: 1.0,
});

process.on('exit', code => {
    Log.log(code);
    Database.close();
});

process.on('unhandledRejection', error => {
    new ErrorHandler(
        error,
        'unhandledRejection',
    ).init(Sentry.Severity.Fatal);

    process.exit(1);
});

process.on('uncaughtException', error => {
    new ErrorHandler(
        error,
        'uncaughtException',
    ).init(Sentry.Severity.Fatal);

    process.exit(1);
});

new Client().init();