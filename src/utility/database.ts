import { Pool } from 'pg';
import { Log } from './Log';

const pool = new Pool();

pool.on('error', error => {
    Log.error(`PostgreSQL Pool Error | Total Clients: ${pool.totalCount} Idle CLients: ${pool.idleCount}`, error.stack);
});

export class Database {
    static async query(input: string, values?: unknown[]) {
        const client = await pool.connect();

        try {
            const query = await client.query(input, values);

            return query;
        } catch (error) {
            client.release();
            throw error;
        }
    }

    static async close() {
        await pool.end();
    }
}