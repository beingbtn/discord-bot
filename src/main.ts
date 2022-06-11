import 'dotenv/config';
import '@sentry/tracing';
import '@sapphire/plugin-logger/register';
import { Client } from './structures/Client';
import { container } from '@sapphire/framework';
import { Database } from './structures/Database';
import { ErrorHandler } from './errors/ErrorHandler';
import { ExtraErrorData } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import process from 'node:process';

Sentry.init({
    dsn: process.env.DSN,
    environment: process.env.ENVIRONMENT,
    integrations: [new ExtraErrorData()],
    tracesSampleRate: 1.0,
});

process.on('exit', code => {
    container.logger.info(code);
    Database.close();
});

process.on('unhandledRejection', error => {
    new ErrorHandler(
        error,
        'unhandledRejection',
    ).init('fatal');

    process.exit(1);
});

process.on('uncaughtException', error => {
    new ErrorHandler(
        error,
        'uncaughtException',
    ).init('fatal');

    process.exit(1);
});

new Client().init();