import { XMLParser } from 'fast-xml-parser';
import Turndown from 'turndown';

export type rssJSON = {
    title: string;
    description: string;
    link: string;
    image: string;
    category: unknown;
    items: {
        id: unknown,
        title: string,
        description: string | undefined,
        link: string,
        author: string,
        published: number,
        created: number,
        content: string,
        attachments: string[];
    }[];
}

export class CoreFormat {
    static parse(xml: string) {
        //Parsing taken and modified from https://github.com/nasa8x/rss-to-json under the MIT License

        const parser = new XMLParser({
            attributeNamePrefix: '',
            //attrNodeName: "attr", //default is 'false'
            textNodeName: '$text',
            ignoreAttributes: false,
        });

        const result = parser.parse(xml);

        let channel = result.rss && result.rss.channel
            ? result.rss.channel
            : result.feed;

        if (Array.isArray(channel)) channel = channel[0];

        const rss = {
            title: channel.title ?? '',
            description: channel.description ?? '',
            link: channel.link && channel.link.href
                ? channel.link.href
                : channel.link,
            image: channel.image
                ? channel.image.url
                : channel['itunes:image']
                ? channel['itunes:image'].href
                : '',
            category: channel.category || [],
            items: [] as {
                id: unknown,
                title: string,
                description: string | undefined,
                link: string,
                author: string,
                published: number,
                created: number,
                content: string,
                attachments: string[];
            }[],
        };

        let items = channel.item || channel.entry;
        if (items && !Array.isArray(items)) items = [items];


        for (let i = 0; i < items.length; i += 1) {
            const val = items[i];

            const obj = {
                id: val.guid && val.guid.$t
                    ? val.guid.$t
                    : val.id,
                title: val.title && val.title.$text
                    ? val.title.$text
                    : val.title,
                description: val.summary && val.summary.$text
                    ? val.summary.$text
                    : val.description,
                link: val.link && val.link.href
                    ? val.link.href
                    : val.link,
                author: val.author && val.author.name
                    ? val.author.name
                    : val['dc:creator'],
                published: val.created
                    ? Date.parse(val.created)
                    : val.pubDate
                    ? Date.parse(val.pubDate)
                    : Date.now(),
                created: val.updated
                    ? Date.parse(val.updated)
                    : val.pubDate
                    ? Date.parse(val.pubDate)
                    : val.created
                    ? Date.parse(val.created)
                    : Date.now(),
                category: val.category || [],
                content: val.content && val.content.$text
                    ? val.content.$text
                    : val['content:encoded'],
                attachments: [] as string[],
            };

            obj.attachments = [
                ...obj.content.matchAll(
                    /https:\/\/hypixel\.net\/attachments\/(\S)*\//gm,
                ),
            ].map(array => array?.[0]);

            const turndownService = new Turndown({
                codeBlockStyle: 'fenced',
                linkReferenceStyle: 'collapsed',
            });

            obj.content = turndownService.turndown(obj.content)
                .replaceAll('  \n', '\n');

            rss.items.push(obj);
        }


        return rss as rssJSON;
    }
}