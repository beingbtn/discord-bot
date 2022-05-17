import { Pool, PoolClient } from 'pg';
import { Log } from './Log';

const pool = new Pool({
    idleTimeoutMillis: 300_000,
});

pool.on('error', error => {
    Log.error(`PostgreSQL Pool Error | Total Clients: ${pool.totalCount} Idle Clients: ${pool.idleCount} Waiting Clients: ${pool.waitingCount}`, error.stack);
});

export class Database {
    static async query(input: string, values?: unknown[]) {
        const client = await pool.connect();

        try {
            const query = await client.query(input, values);

            return query;
        } finally {
            client.release();
        }
    }

    // eslint-disable-next-line no-unused-vars
    static async transaction(func: (client: PoolClient) => Promise<void>) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await func(client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async close() {
        await pool.end();
    }
}