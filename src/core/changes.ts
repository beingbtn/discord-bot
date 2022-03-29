import type { rssJSON } from './format';
import { Database } from '../utility/database';
import { Log } from '../utility/Log';

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

        return links;
    }

    static async set(data: rssJSON, links: string[]) {
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
        const minComments = JSON.parse(
            process.env.announcements!,
        )[data.title].minComments;

        const potentialNew = data.items.filter(
            item => item.comments < minComments,
        );

        const base = Object.assign(data, { items: [] });

        if (potentialNew.length === 0) return base;

        const knownLinks = await CoreChanges.get(data);

        const newItems = [];

        for (const item of potentialNew) {
            if (!knownLinks.includes(item.link)) {
                Log.log(`New link found: ${item.link}`);
                newItems.push(item);
            }
        }

        if (newItems.length === 0) return base;

        const newLinks = newItems.map(item => item.link);

        await CoreChanges.set(data, [...knownLinks, ...newLinks]);

        return Object.assign(base, { items: newItems });
    }
}