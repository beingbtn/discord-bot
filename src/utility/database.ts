import {
    Db,
    MongoClient,
    ServerApiVersion,
} from 'mongodb';
import process from 'node:process';
import { Config } from '../@types/client';

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s4uzo.mongodb.net/hypixelNews?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1,
});

export class Database {
    instance: Db;

    constructor(table?: string | undefined) {
        this.instance = client.db(table);
    }

    static async init() {
        await client.connect();
        return new Database();
    }

    static async close() {
        await client.close();
    }

    async getConfig() {
        return (
            await this.instance
                .collection('config')
                .find({ })
                .project<Config>({
                    _id: 0,
                })
                .toArray()
        )[0];
    }

    async setConfig(key: string, value: boolean | number) {
        await this.instance
            .collection('config')
            .updateOne(
                {
                    [key]: { $exists: true },
                },
                {
                    $set: {
                        [key]: value,
                    },
                },
            );
    }
}