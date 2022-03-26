import 'dotenv/config';
import { Db, MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.mongoUser}:${process.env.mongoPassword}@cluster0.qww1b.mongodb.net/hypixelAnnouncements?retryWrites=true&w=majority`;

console.log(uri);

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
}

/**
 * Database.init().then(d => d.instance.collection('posts').insertOne({
    id: 'urls',
    urls: [],
})).then(console.log);
 */

(async () => {
    const db = await Database.init();
    const stuff = db.instance.collection('posts').find({
        'links.0': { $exists: true },
    });
    const more = await stuff.limit(1).toArray();
    console.log(more);
})();