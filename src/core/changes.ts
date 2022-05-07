import type { rssJSON } from './format';
import { Database } from '../utility/database';
import process from 'node:process';

export class CoreChanges {
    static async get(data: rssJSON) {
        const links = await Database.query(
            'SELECT posts FROM posts WHERE type = $1',
            [data.title],
        );

        return links.rows[0].posts;
    }

    static async set(data: rssJSON, links: string[]) {
        await Database.query(
            'UPDATE posts SET posts = $1 WHERE type = $2',
            [links, data.title],
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