import { RssJSON } from './core/Format';
import { XMLParser } from 'fast-xml-parser';
import Turndown from 'turndown';

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
      <title>Hypixel Player Council Applications [OPEN]</title>
      <pubDate>Tue, 31 Jul 2018 18:53:07 +0000</pubDate>
      <link>https://hypixel.net/threads/hypixel-player-council-applications-open.1772358/</link>
      <guid isPermaLink="false">1772358</guid>
      <author>invalid@example.com (Hypixel Player Council)</author>
      <category domain="https://hypixel.net/forums/moderation-information-and-changes.164/"><![CDATA[Moderation Information and Changes]]></category>
      <dc:creator>Hypixel Player Council</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper"><i>This thread contains all the information you need to apply for the Hypixel Player Council. Please read through the entire post carefully before applying.</i><br />
<br />
----<br />
<br />
<b><span style="font-size: 22px">What is the Hypixel Player Council?</span></b><br />
<br />
The Player Council is a group of experienced Hypixel players who assist our development team in game testing, balancing, and filing bug reports. Members receive no in-game benefits, but are essential to help improve the experience of playing on Hypixel. Please note that the HPC...<br />
<br />
<a href="https://hypixel.net/threads/hypixel-player-council-applications-open.1772358/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>0</slash:comments>
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
    items: [] as RssJSON['items'],
};

let items = channel.item || channel.entry;
if (items && !Array.isArray(items)) items = [items];


for (let i = 0; i < items.length; i += 1) {
    const val = items[i];

    const obj = {
        id: String(
            val.guid && val.guid.$text
                ? val.guid.$text
                : val.guid,
        ),
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
        edited: false,
        category: val.category ?? [],
        comments: val['slash:comments'] ?? 0,
        content: val.content && val.content.$text
            ? val.content.$text
            : val['content:encoded'],
        attachments: [] as string[],
    } as RssJSON['items'][number];

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
    .replace(/^!\[\S*?\]\(.+\)/, '') //Remove the first image at the beginning, if any
    .replaceAll(/\n!\[\S*?\]/gm, '[Image]') //Replace image hyperlink text with [Image]
    .replaceAll(/ "\S+\.(png|jpg)"/gm, '') //Replace image descriptions at the end of hyperlinks
    .replaceAll('  \n', '\n') //Remove weird newlines
    .replace(/\n{3,}/gm, '\n\n') //Remove extra newlines
    .replace(/(^\n+|(\n+)+$)/g, '') //Remove newlines at the end and start
    .replace(/\*\*\n\n•/gm, '**\n•') //Remove weird newlines with lists
    .replace(/\n\n\[Read more\]\(.+\)/m, ''); //Remove "Read More" text

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