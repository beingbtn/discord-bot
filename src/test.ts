import { XMLParser } from 'fast-xml-parser';
import Turndown from 'turndown';
import { rssJSON } from './core/format';

const xml = `
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>SkyBlock Patch Notes</title>
    <description>All SkyBlock Patch Notes can be found here! You can click the Watch button in this section to be alerted when new Patch Notes are released!</description>
    <pubDate>Fri, 01 Apr 2022 16:17:18 +0000</pubDate>
    <lastBuildDate>Fri, 01 Apr 2022 16:17:18 +0000</lastBuildDate>
    <generator>Hypixel - Minecraft Server and Maps</generator>
    <link>https://hypixel.net/</link>
    <atom:link rel="self" type="application/rss+xml" href="https://hypixel.net/forums/skyblock-patch-notes.158/index.rss"/>
    <item>
      <title>[May 11] Sunshade Patch</title>
      <pubDate>Wed, 11 May 2022 23:45:50 +0000</pubDate>
      <link>https://hypixel.net/threads/may-11-sunshade-patch.4944569/</link>
      <guid isPermaLink="false">4944569</guid>
      <author>invalid@example.com (Minikloon)</author>
      <category domain="https://hypixel.net/forums/skyblock-patch-notes.158/"><![CDATA[SkyBlock Patch Notes]]></category>
      <dc:creator>Minikloon</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper">Hello!<br />
It's small update!<br />
Sunshade, cause it's hot <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="smilie smilie--sprite smilie--sprite33" alt=":hypixel_cool:" title="Hypixel Cool    :hypixel_cool:" loading="lazy" data-shortname=":hypixel_cool:" /> outside! <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="smilie smilie--sprite smilie--sprite33" alt=":hypixel_cool:" title="Hypixel Cool    :hypixel_cool:" loading="lazy" data-shortname=":hypixel_cool:" /><br />
<br />
<b>Items</b><br />
<ul>
<li data-xf-list-type="ul">New Netherrack-Looking Sunshade dropping from blazes in the Smoldering Tombs</li>
</ul><div style="text-align: center"><img src="https://hypixel.net/attachments/1652285032387-png.2983007/"
			class="bbImage "
			style=""
			alt="1652285032387.png"
			title="1652285032387.png"
			width="390" height="121" loading="lazy" />&#8203;</div><ul>
<li data-xf-list-type="ul">Spaced out the crimson isle armor sets lore to be more readable</li>
</ul><div style="text-align: center"><img src="https://hypixel.net/attachments/1652284733108-png.2983001/"
			class="bbImage "
			style=""
			alt="1652284733108.png"
			title="1652284733108.png"
			width="357" height="528" loading="lazy" /><br />
Spacing!&#8203;</div><ul>
<li data-xf-list-type="ul">Added stacks from crimson isle set bonuses in the action bar</li>
</ul><div style="text-align: center"><img src="https://hypixel.net/attachments/1652284780401-png.2983003/"
			class="bbImage "
			style=""
			alt="1652284780401.png"
			title="1652284780401.png"
			width="574" height="53" loading="lazy" /><br />
5 Hydra Strike stacks!&#8203;</div><br />
<b>Features</b><br />
<ul>
<li data-xf-list-type="ul">Added Grandma Wolf pet to Rusty</li>
<li data-xf-list-type="ul">Made the...</li>
</ul><br />
<a href="https://hypixel.net/threads/may-11-sunshade-patch.4944569/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>122</slash:comments>
    </item>
  </channel>
</rss>
`;

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
    } as rssJSON['items'][0];

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
        .replace(/\n\n\[Read more\]\(.+\)/m, ''); //Remove read more text

    //Icon/Emoji Handling
    const icons = [...obj.content.matchAll(/!\[(\S+)\]\(.*?\)/gm)];

    obj.content = icons.reduce(
        (acc, current) =>
            acc.replace(current[0], current[1]),
        obj.content,
    );

    rss.items.push(obj);
}

console.log(JSON.stringify(rss));