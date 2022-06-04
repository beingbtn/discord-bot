import type { rssJSON } from './CoreFormat';
import { Database } from '../utility/Database';

export class CoreChanges {
    public async check(data: rssJSON): Promise<rssJSON> {
        const maxComments = JSON.parse(
            process.env.ANNOUNCEMENTS!,
        )[data.title].maxComments;

        const knownThreads = await this.get(data);

        const knownIDs = knownThreads.map(thread => thread.id);

        const potentiallyNewThreads = data.items.filter(item =>
            knownIDs.includes(item.id) === false,
        );

        const newThreads = potentiallyNewThreads.filter(item =>
            item.comments < maxComments,
        );

        await Promise.all(
            potentiallyNewThreads.map(
                thread => this.insert(data, thread),
            ),
        );

        //Can optimize by filtering out new threads
        const editedThreads = data.items.filter(item =>
            typeof knownThreads.find(thread =>
                thread.id === item.id &&
                thread.message &&
                (
                    thread.content !== item.content ||
                    thread.title !== item.title
                ),
            ) !== 'undefined',
        );

        for (const editedThread of editedThreads) {
            editedThread.edited = true;
        }

        await Promise.all(
            editedThreads.map(
                thread => this.update(data, thread),
            ),
        );

        return Object.assign(data, {
            items: [
                ...newThreads,
                ...editedThreads,
            ],
        });
    }

    private async get(data: rssJSON): Promise<{
        id: string,
        title: string,
        content: string,
        message: string | null,
    }[]> {
        const ids = data.items.map(item => `'${item.id}'`).join(', ');

        const links = await Database.query(
            `SELECT id, title, content, message FROM "${
                data.title
            }" WHERE id IN (${
                ids
            })`,
        );

        return links.rows;
    }

    private async insert(data: rssJSON, item: rssJSON['items'][number]) {
        await Database.query(
            `INSERT INTO "${
                data.title
            }" (id, title, content) VALUES ($1, $2, $3)`,
            [item.id, item.title, item.content],
        );
    }

    private async update(data: rssJSON, item: rssJSON['items'][number]) {
        await Database.query(
            `UPDATE "${
                data.title
            }" SET title = $1, content = $2 WHERE id = $3`,
            [item.title, item.content, item.id],
        );
    }
}