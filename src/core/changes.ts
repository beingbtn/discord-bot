import type { rssJSON } from './format';
import { Database } from '../utility/database';

export class CoreChanges {
    static async get(data: rssJSON): Promise<string[]> {
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

        const threadIDRegex = /https:\/\/hypixel\.net\/threads\/.*?\.(\d*?)\//;

        const knownThreads = await CoreChanges.get(data);

        const knownThreadIDs = knownThreads.map(link =>
            Number(link.match(threadIDRegex)![1]!),
        );

        const potentialNewThreads = data.items.filter(
            item => {
                const threadID = Number(
                    item.link.match(threadIDRegex)![1]!,
                );

                return knownThreadIDs.includes(threadID) === false;
            },
        );

        const base = Object.assign(data, { items: [] });

        if (potentialNewThreads.length === 0) return base;

        await CoreChanges.set(
            data,
            [
                ...knownThreads,
                ...potentialNewThreads.map(item => item.link),
            ],
        );

        const newThreads = potentialNewThreads.filter(
            item => item.comments < maxComments,
        );

        if (newThreads.length === 0) return base;

        return Object.assign(base, { items: newThreads });
    }
}