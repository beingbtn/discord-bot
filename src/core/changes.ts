import type { rssJSON } from './format';
import { Database } from '../utility/database';

export class CoreChanges {
    links: string[];

    constructor() {
        this.links = [];
    }

    async init() {
        const links = await new Database().instance
            .collection('posts')
            .find({
                'links.0': { $exists: true },
            })
            .limit(1)
            .toArray();

        this.links = links as unknown as string[];
    }

    async check(data: rssJSON) {
        const newItems: rssJSON['items'] = [];

        for (const item of data.items) {
            if (this.links.includes(item.link)) {
                newItems.push(item);
            }
        }

        if (newItems.length > 0) {
            await new Database().instance
                .collection('posts')
                .updateOne(
                    { id: 'links' },
                    {
                        $set: {
                            links: this.links,
                        },
                    },
                );
        }

        return Object.assign(data, newItems);
    }
}