"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreChanges = void 0;
const database_1 = require("../utility/database");
class CoreChanges {
    static async get(data) {
        const links = (await new database_1.Database().instance
            .collection('posts')
            .find({})
            .project({
            [data.title]: 1,
            _id: 0,
        })
            .toArray())[0][data.title];
        return links;
    }
    static async set(data, links) {
        await new database_1.Database().instance
            .collection('posts')
            .updateOne({
            [data.title]: { $exists: true },
        }, {
            $set: {
                [data.title]: links,
            },
        });
    }
    static async check(data) {
        const maxComments = JSON.parse(process.env.ANNOUNCEMENTS)[data.title].maxComments;
        const knownLinks = await CoreChanges.get(data);
        const potentialNew = data.items.filter(item => !knownLinks.includes(item.link));
        const base = Object.assign(data, { items: [] });
        if (potentialNew.length === 0)
            return base;
        await CoreChanges.set(data, [...knownLinks, ...potentialNew.map(item => item.link)]);
        const newItems = potentialNew.filter(item => item.comments < maxComments);
        if (newItems.length === 0)
            return base;
        return Object.assign(base, { items: newItems });
    }
}
exports.CoreChanges = CoreChanges;
