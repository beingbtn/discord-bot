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
      <title>Easter Event on Hypixel</title>
      <pubDate>Tue, 12 Apr 2022 23:37:59 +0000</pubDate>
      <link>https://hypixel.net/threads/easter-event-on-hypixel.4903080/</link>
      <guid isPermaLink="false">4903080</guid>
      <author>invalid@example.com (Sylent)</author>
      <category domain="https://hypixel.net/forums/news-and-announcements.4/"><![CDATA[News and Announcements]]></category>
      <dc:creator>Sylent</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper"><img src="https://hypixel.net/attachments/easter-newspost-png.2957680/"
			class="bbImage "
			style=""
			alt="easter-newspost.png"
			title="easter-newspost.png"
			width="1048" height="400" loading="lazy" /><br />
<br />
Hey everyone!<br />
<br />
Spring has just arrived! With it, we've got an Easter event with more spring-themed content for everyone on the server! We've got new maps, new cosmetics, and more!<br />
<ul>
<li data-xf-list-type="ul"><b>Easter Sale - Up to 85% off!</b></li>
<li data-xf-list-type="ul">Easter Simulator returns!</li>
<li data-xf-list-type="ul">Updated Easter Loot Chests for SkyWars, Bed Wars, and Murder Mystery!</li>
<li data-xf-list-type="ul">Return of <b>Easter Mystery Boxes</b></li>
<li data-xf-list-type="ul">New Main Lobby reskin &amp; returning SkyWars and Bed Wars lobbies!</li>
<li data-xf-list-type="ul">Refreshed SkyBlock Easter Cosmetics for Ranked...</li>
</ul><br />
<a href="https://hypixel.net/threads/easter-event-on-hypixel.4903080/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>21</slash:comments>
    </item>
    <item>
    <title>[April 1] Tool Reforges Patch</title>
    <pubDate>Fri, 01 Apr 2022 16:14:47 +0000</pubDate>
    <link>https://hypixel.net/threads/april-1-tool-reforges-patch.4887972/</link>
    <guid isPermaLink="false">4887972</guid>
    <author>invalid@example.com (Minikloon)</author>
    <category domain="https://hypixel.net/forums/skyblock-patch-notes.158/"><![CDATA[SkyBlock Patch Notes]]></category>
    <dc:creator>Minikloon</dc:creator>
    <content:encoded><![CDATA[<div class="bbWrapper">Hey all.<br />
<br />
This update is unrelated to April Fool's I swear.<br />
<br />
<div style="text-align: center"><img src="https://hypixel.net/attachments/1648805723526-png.2947167/"
          class="bbImage "
          style=""
          alt="1648805723526.png"
          title="1648805723526.png"
          width="280" height="248" loading="lazy" /><br />
Proof this isn't April's Fool<br />&#8203;</div>All jokes asides it really isn't.<br />
<br />
<b>Features</b><br />
<ul>
<li data-xf-list-type="ul"><div style="text-align: left">Added a new set of Tools Reforges available in the Blacksmith.&#8203;</div></li>
</ul><br />
<div style="text-align: center"><img src="https://hypixel.net/attachments/1648805901473-png.2947169/"
          class="bbImage "
          style=""
          alt="1648805901473.png"
          title="1648805901473.png"
          width="625" height="602" loading="lazy" /><br />
Breakdown of the new reforges&#8203;</div><ul>
<li data-xf-list-type="ul"><div style="text-align: left">Now showing reforges passives on Reforge Stones:&#8203;</div></li>
</ul><div style="text-align: center"><img src="https://hypixel.net/attachments/1648806182544-png.2947174/"
          class="bbImage "
          style=""
          alt="1648806182544.png"
          title="1648806182544.png"
          width="372" height="399" loading="lazy" />&#8203;</div><br />
<b>Small Bugfixes</b><br />
<ul>
<li data-xf-list-type="ul">Fixed /coopadd not checking for co-op invitation settings</li>
<li data-xf-list-type="ul">Prevent...</li>
</ul><br />
<a href="https://hypixel.net/threads/april-1-tool-reforges-patch.4887972/" class="link link--internal">Read more</a></div>]]></content:encoded>
    <slash:comments>94</slash:comments>
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
        .replace(/^!\[\S+\.(png|jpg)\]\(.+\)/, '') //Remove the first image at the beginning, if any
        .replaceAll(/!\[\S+\.(png|jpg)]/gm, '[Image]') //Replace image hyperlink text with [Image]
        .replaceAll(/ "\S+\.(png|jpg)"/gm, '') //Replace image descriptions at the end of hyperlinks
        .replaceAll('  \n', '\n') //Remove weird newlines
        .replace(/\n{3,}/gm, '\n\n') //Remove extra newlines
        .replace(/(^\n+|(\n+)+$)/g, '') //Remove newlines at the end and start
        .replace(/\*\*\n\n•/gm, '**\n•') //Remove weird newlines with lists
        .replace(/\n\n\[Read more\]\(.+\)/m, ''); //Remove read more text

    rss.items.push(obj);
}

console.log(JSON.stringify(rss));