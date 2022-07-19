import { type RSS } from '../@types/RSS';
import { Base } from '../structures/Base';

export class Changes extends Base {
    public async check(data: RSS): Promise<RSS> {
        const { maxComments } = this.container.announcements.find(
            (announcement) => announcement.category === data.title,
        )!;

        const knownThreads = await this.get(data);

        const knownIDs = knownThreads.map((thread) => thread.id);

        const potentiallyNewThreads = data.items.filter(
            (item) => knownIDs.includes(item.id) === false,
        );

        const newThreads = potentiallyNewThreads.filter(
            (item) => item.comments < maxComments,
        );

        if (potentiallyNewThreads > newThreads) {
            const potentiallyNewIDs = potentiallyNewThreads.map(
                (thread) => thread.id,
            ).join(', ');

            const newIDs = potentiallyNewThreads.map(
                (thread) => thread.id,
            ).join(', ');

            this.container.logger.debug(
                `${this.constructor.name}:`,
                `The potential new threads ${potentiallyNewIDs} were found.`,
                `${newIDs} remain after the comment count filter.`,
            );
        }

        await Promise.all(
            potentiallyNewThreads.map(
                (thread) => this.insert(data, thread),
            ),
        );

        // Can optimize by filtering out new threads
        const editedThreads = data.items.filter(
            (item) => typeof knownThreads.find(
                (thread) => thread.id === item.id
                    && thread.message
                    && (
                        thread.content !== item.content
                        || thread.title !== item.title
                    ),
            ) !== 'undefined',
        );

        editedThreads.forEach((editedThread) => {
            Object.assign(editedThread, {
                edited: true,
            });
        });

        await Promise.all(
            editedThreads.map(
                (thread) => this.update(data, thread),
            ),
        );

        return Object.assign(data, {
            items: [
                ...newThreads,
                ...editedThreads,
            ],
        });
    }

    private async get(data: RSS) {
        const ids = data.items.map((item) => item.id);

        return this.container.database.announcements.findMany({
            select: {
                id: true,
                title: true,
                content: true,
                message: true,
            },
            where: {
                category: data.title,
                AND: [
                    {
                        id: {
                            in: ids,
                        },
                    },
                ],
            },
        });
    }

    private async insert(data: RSS, item: RSS['items'][number]) {
        await this.container.database.announcements.create({
            data: {
                category: data.title,
                id: item.id,
                title: item.title,
                content: item.content,
            },
        });
    }

    private async update(data: RSS, item: RSS['items'][number]) {
        await this.container.database.announcements.update({
            data: {
                title: item.title,
                content: item.content,
            },
            where: {
                category_id: {
                    category: data.title,
                    id: item.id,
                },
            },
        });
    }
}