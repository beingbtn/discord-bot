import { container } from '@sapphire/framework';
import {
    Pool,
    PoolClient,
} from 'pg';
import { Options } from '../utility/Options';
import { Sentry } from './Sentry';

const pool = new Pool({
    idleTimeoutMillis: Options.postgresqlIdleTimeoutMillis,
});

pool.on('error', (error) => {
    new Sentry()
        .setSeverity('warning')
        .databaseContext(pool)
        .captureException(error);

    container.logger.error(
        container.i18n.getMessage(
            'errorsDatabasePool', [
                pool.totalCount,
                pool.idleCount,
                pool.waitingCount,
            ],
        ),
        error.stack,
    );
});

export class Database {
    static async query(input: string, values?: unknown[]) {
        const poolClient = await pool.connect();

        try {
            const query = await poolClient.query(input, values);

            return query;
        } finally {
            poolClient.release();
        }
    }

    // eslint-disable-next-line no-unused-vars
    static async transaction(func: (poolClient: PoolClient) => Promise<void>) {
        const poolClient = await pool.connect();

        try {
            await poolClient.query('BEGIN');
            await func(poolClient);
            await poolClient.query('COMMIT');
        } catch (error) {
            await poolClient.query('ROLLBACK');
            throw error;
        } finally {
            poolClient.release();
        }
    }

    static async close() {
        await pool.end();
    }
}