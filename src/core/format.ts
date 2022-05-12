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
        comments: number,
        attachments: string[];
    }[];
}

export class CoreFormat {
    static parse(xml: string) {
        //Parsing taken and modified from https://github.com/nasa8x/rss-to-json under the MIT License

        const turndownService = new Turndown({
            codeBlockStyle: 'fenced',
        })
        .addRule('horizontal', {
            filter: [
                'hr',
            ],
            replacement: () => '',
        })
        .addRule('header', {
            filter: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
            ],
            replacement: content => `**${content}**`,
        })
        .addRule('list', {
            filter: [
                'li',
            ],
            replacement: content => `• ${content.replaceAll('\n', '')}\n`,
        });

        const parser = new XMLParser({
            attributeNamePrefix: '',
            //attrNodeName: "attr", //default is 'false'
            textNodeName: '$text',
            ignoreAttributes: false,
        });

        //&#8203; seems to add a lot of random new lines
        const result = parser.parse(xml.replaceAll('&#8203;', ''));

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
            items: [] as rssJSON['items'],
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
                category: val.category ?? [],
                comments: val['slash:comments'] ?? 0,
                content: val.content && val.content.$text
                    ? val.content.$text
                    : val['content:encoded'],
                attachments: [] as string[],
            } as rssJSON['items'][number];

            obj.attachments = [
                ...obj.content.matchAll(
                    /https:\/\/staticassets\.hypixel\.net\/(\S)*\.(png|jpg)/gm,
                ),
                ...obj.content.matchAll(
                    /https:\/\/i\.imgur\.com\/(\S)*\.(png|jpg)/gm,
                ),
                ...obj.content.matchAll(
                    /https:\/\/hypixel\.net\/attachments\/(\S)*\//gm,
                ),
            ]
            .sort((primary, secondary) => primary.index! - secondary.index!)
            .map(array => array?.[0]);

            obj.content = turndownService.turndown(obj.content)
                .replace(/^!\[\S+\.(png|jpg)\]\(.+\)/, '') //Remove the first image at the beginning, if any
                .replaceAll(/\n!\[\S+\.(png|jpg)]/gm, '[Image]') //Replace image hyperlink text with [Image]
                .replaceAll(/ "\S+\.(png|jpg)"/gm, '') //Replace image descriptions at the end of hyperlinks
                .replaceAll('  \n', '\n') //Remove weird newlines
                .replace(/\n{3,}/gm, '\n\n') //Remove extra newlines
                .replace(/(^\n+|(\n+)+$)/g, '') //Remove newlines at the end and start
                .replace(/\*\*\n\n•/gm, '**\n•') //Remove weird newlines with lists
                .replace(/\n\n\[Read more\]\(.+\)/m, ''); //Remove "Read More" text

            //Icon/Emoji handling
            obj.content = [
                ...obj.content.matchAll(/!\[(\S+)\]\(.*?\)/gm),
            ].reduce(
                (acc, current) =>
                    acc.replace(current[0], current[1]),
                obj.content,
            );

            rss.items.push(obj);
        }


        return rss as rssJSON;
    }
}