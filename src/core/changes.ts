import type { rssJSON } from './format';
import { Database } from '../utility/database';

export class CoreChanges {
    static async get(data: rssJSON) {
        const links = (
            await new Database().instance
                .collection('posts')
                .find({ })
                .project({
                    [data.title]: 1,
                    _id: 0,
                })
                .toArray()
        )[0][data.title] as unknown as string[];

        console.log('1', links, data.title);

        return links;
    }

    static async set(data: rssJSON, links: string[]) {
        console.log('2', links, data.title);

        await new Database().instance
            .collection('posts')
            .updateOne(
                {
                    [data.title]: { $exists: true },
                },
                {
                    $set: {
                        [data.title]: links,
                    },
                },
            );
    }

    static async check(data: rssJSON): Promise<rssJSON> {
        console.log('start');

        const minComments = JSON.parse(
            process.env.announcements!,
        )[data.title].minComments;

        console.log('0', minComments, data.title);

        const potentialNew = data.items.filter(
            item => item.comments < minComments,
        );

        const base = Object.assign(data, { items: [] });

        if (potentialNew.length === 0) return base;

        const knownLinks = await CoreChanges.get(data);

        const newItems = [];

        for (const item of potentialNew) {
            if (!knownLinks.includes(item.link)) {
                newItems.push(item);
            }
        }

        if (newItems.length === 0) return base;

        const newLinks = newItems.map(item => item.link);

        await CoreChanges.set(data, [...knownLinks, ...newLinks]);

        return Object.assign(base, { items: newItems });
    }
}