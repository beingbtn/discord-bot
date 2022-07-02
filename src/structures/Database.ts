import { container } from '@sapphire/framework';
import {
    Pool,
    PoolClient,
} from 'pg';
import { Base } from './Base';
import { Options } from '../utility/Options';
import { Sentry } from './Sentry';

const pool = new Pool({
    idleTimeoutMillis: Options.postgresqlIdleTimeoutMillis,
});

export class Database extends Base {
    public async query(input: string, values?: unknown[]) {
        const poolClient = await pool.connect();

        try {
            const query = await poolClient.query(input, values);

            return query;
        } finally {
            poolClient.release();
        }
    }

    // eslint-disable-next-line no-unused-vars
    public async transaction(func: (poolClient: PoolClient) => Promise<void>) {
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

    async close() {
        await pool.end();
    }
}

pool.on('error', (error) => {
    new Sentry()
        .setSeverity('warning')
        .databaseContext(pool)
        .captureException(error);

    container.logger.debug(
        Database.constructor.name,
        `${pool.totalCount} clients total.`,
        `${pool.idleCount} clients idle.`,
        `${pool.waitingCount} clients waiting.`,
        error.stack,
    );
});