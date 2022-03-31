"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongodb_1 = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s4uzo.mongodb.net/hypixelAnnouncements?retryWrites=true&w=majority`;
const client = new mongodb_1.MongoClient(uri, {
    serverApi: mongodb_1.ServerApiVersion.v1,
});
class Database {
    constructor(table) {
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
exports.Database = Database;
