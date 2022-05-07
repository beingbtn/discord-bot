import { Pool } from 'pg';
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

    static async close() {
        await pool.end();
    }
}