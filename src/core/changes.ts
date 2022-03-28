import type { rssJSON } from './format';
import { Collection } from 'discord.js';

export class CoreChanges {
    category: Collection<string, string[]>;

    constructor() {
        this.category = new Collection();
    }

    get(data: rssJSON) {
        return this.category.ensure(data.title, () => []);
    }

    set(data: rssJSON, links: string[]) {
        this.category.set(data.title, links);
    }

    check(data: rssJSON): rssJSON {
        const potentialNew = data.items.filter(item => item.comments < 50);

        const base = Object.assign(data, { items: [] });

        if (potentialNew.length === 0) return base;

        const knownLinks = this.get(data);

        const newItems = [];

        for (const item of potentialNew) {
            if (!knownLinks.includes(item.link)) {
                newItems.push(item);
            }
        }

        if (newItems.length === 0) return base;

        const newLinks = newItems.map(item => item.link);

        this.set(data, [...knownLinks, ...newLinks]);

        return Object.assign(base, { items: newItems });
    }
}