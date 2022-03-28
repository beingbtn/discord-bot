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
      <title>Wool Wars v0.2 - Layout Editor, New Maps, Balance Changes + more!</title>
      <pubDate>Sun, 27 Mar 2022 19:09:14 +0000</pubDate>
      <link>https://hypixel.net/threads/wool-wars-v0-2-layout-editor-new-maps-balance-changes-more.4876717/</link>
      <guid isPermaLink="false">4876717</guid>
      <author>invalid@example.com (ConnorLinfoot)</author>
      <category domain="https://hypixel.net/forums/news-and-announcements.4/"><![CDATA[News and Announcements]]></category>
      <dc:creator>ConnorLinfoot</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper"><img src="https://hypixel.net/attachments/wool-war-patch-post-png.2939498/"
			class="bbImage "
			style=""
			alt="wool-war-patch-post.png"
			title="wool-war-patch-post.png"
			width="1040" height="400" loading="lazy" /><br />
<br />
Hey everyone!<br />
<br />
Today we're releasing the 0.2 update for Wool Wars! This update brings a layout editor, new maps, balance changes, and more!<br />
<br />
<b><span style="color: rgb(0, 0, 0)">►</span> </b><span style="color: rgb(243, 121, 52)"><b><span style="font-size: 22px">Layout Editor</span></b></span><br />
You can now customize your layout for different classes at the NPC in the lobby!<br />
<br />
<div style="text-align: center"><img src="https://hypixel.net/attachments/1648044248684-png.2939389/"
			class="bbImage "
			style=""
			alt="1648044248684.png"
			title="1648044248684.png"
			width="497" height="428" loading="lazy" />&#8203;</div><br />
<b><span style="color: rgb(0, 0, 0)">►</span> </b><span style="color: rgb(243, 121, 52)"><b><span style="font-size: 22px">New Maps</span></b></span><br />
We've added back a revamped Anubis as well as two new maps in this update, both with a new map mechanic, Portals!<br />
<img src="https://hypixel.net/attachments/1648048323150-png.2939438/"
			class="bbImage "
			style=""
			alt="1648048323150.png"
			title="1648048323150.png"
			width="1567" height="1270" loading="lazy" /><br />
<br />
We...<br />
<br />
<a href="https://hypixel.net/threads/wool-wars-v0-2-layout-editor-new-maps-balance-changes-more.4876717/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>77</slash:comments>
    </item>
  </channel>
</rss>`;

const turndownService = new Turndown({
    codeBlockStyle: 'fenced',
}).addRule('image', {
    filter: [
        'img',
        'hr',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
    ],
    replacement: () => '',
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
        .replaceAll('  \n', '\n');

    //@ts-expect-error stuff
    rss.items.push(obj);
}

console.log(JSON.stringify(rss));