/* eslint-disable no-tabs */
import { XMLParser } from 'fast-xml-parser';
import Turndown from 'turndown';

const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>Hypixel Server Discussion</title>
    <description>Here you can discuss any general topics relating to the Hypixel Network! You can also find some useful information in the pinned threads, which we encourage you to read through.</description>
    <pubDate>Mon, 28 Mar 2022 02:34:21 +0000</pubDate>
    <lastBuildDate>Mon, 28 Mar 2022 02:34:21 +0000</lastBuildDate>
    <generator>Hypixel - Minecraft Server and Maps</generator>
    <link>https://hypixel.net/</link>
    <atom:link rel="self" type="application/rss+xml" href="https://hypixel.net/forums/official-hypixel-minecraft-server/index.rss"/>
    <item>
      <title>[January 13] Armadillo, Double Jump, and more fixes!</title>
      <pubDate>Sun, 30 Jan 2022 05:53:03 +0000</pubDate>
      <link>https://hypixel.net/threads/january-13-armadillo-double-jump-and-more-fixes.4750477/</link>
      <guid isPermaLink="false">4750477</guid>
      <author>invalid@example.com (TheMGRF)</author>
      <category domain="https://hypixel.net/forums/skyblock-patch-notes.158/"><![CDATA[SkyBlock Patch Notes]]></category>
      <dc:creator>TheMGRF</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper">Hi all!<br />
<br />
Welcome to our first set of patch notes for 2022! Over the past few weeks we've been working to fix a bunch of issues that cropped up over the holiday period, so here is a nice break down of what we have done so far.<br />
<br />
<h3>Fixes&#8203;</h3><ul>
<li data-xf-list-type="ul"><h4>Armadillo Pet&#8203;</h4><ul>
<li data-xf-list-type="ul">Fixed the pet not consuming energy when moving in some directions.</li>
<li data-xf-list-type="ul">Fixed instant breaking of Gemstones regardless of item Breaking Power.</li>
<li data-xf-list-type="ul">Fixed the Tunneler ability breaking string from traps in Crystal Hollows...</li>
</ul></li>
</ul><br />
<a href="https://hypixel.net/threads/january-13-armadillo-double-jump-and-more-fixes.4750477/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>191</slash:comments>
    </item>
  </channel>
</rss>`;

const turndownService = new Turndown({
    codeBlockStyle: 'fenced',
}).addRule('image', {
    filter: [
        'img',
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
    replacement: content => `• ${content}\n`,
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
    items: [],
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
        comments: channel['slash:comments'] ?? 0,
        content: val.content && val.content.$text
            ? val.content.$text
            : val['content:encoded'],
        attachments: [] as string[],
    };

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
    .sort((primary, secondary) => primary.index - secondary.index)
    .map(array => array?.[0]);

    obj.content = turndownService.turndown(obj.content)
        .replaceAll('  \n', '\n') //Remove weird newlines
        .replace(/\n{3,}/gm, '\n') //Remove extra newlines
        .replace(/(^\n+|(\n+)+$)/g, ''); //Remove newlines at the end and start

    //@ts-expect-error stuff
    rss.items.push(obj);
}

console.log(JSON.stringify(rss));