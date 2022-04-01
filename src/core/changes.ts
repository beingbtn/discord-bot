import type { rssJSON } from './format';
import { Database } from '../utility/database';
import process from 'node:process';

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
        const maxComments = JSON.parse(
            process.env.ANNOUNCEMENTS!,
        )[data.title].maxComments;

        const knownLinks = await CoreChanges.get(data);

        const potentialNew = data.items.filter(
            item => !knownLinks.includes(item.link),
        );

        const base = Object.assign(data, { items: [] });

        if (potentialNew.length === 0) return base;

        await CoreChanges.set(
            data,
            [...knownLinks, ...potentialNew.map(item => item.link)],
        );

        const newItems = potentialNew.filter(
            item => item.comments < maxComments,
        );

        if (newItems.length === 0) return base;

        return Object.assign(base, { items: newItems });
    }
}