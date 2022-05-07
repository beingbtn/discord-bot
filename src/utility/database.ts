import { Pool } from 'pg';

const pool = new Pool();

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