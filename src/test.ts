import { Normalize } from './core/Normalize';
import { Parser } from './core/Parser';

const xml = `
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>News and Announcements</title>
    <description>Important announcements regarding the network are posted in this forum.

If you click the "Watch" button in this forum you can be alerted whenever a new announcement is posted!</description>
    <pubDate>Wed, 22 Jun 2022 19:32:03 +0000</pubDate>
    <lastBuildDate>Wed, 22 Jun 2022 19:32:03 +0000</lastBuildDate>
    <generator>Hypixel - Minecraft Server and Maps</generator>
    <link>https://hypixel.net/</link>
    <atom:link rel="self" type="application/rss+xml" href="https://hypixel.net/forums/news-and-announcements.4/index.rss"/>
    <item>
      <title>Hypixel now supports Minecraft 1.19</title>
      <pubDate>Wed, 22 Jun 2022 19:23:20 +0000</pubDate>
      <link>https://hypixel.net/threads/hypixel-now-supports-minecraft-1-19.4976618/</link>
      <guid isPermaLink="false">4976618</guid>
      <author>invalid@example.com (Donpireso)</author>
      <category domain="https://hypixel.net/forums/news-and-announcements.4/"><![CDATA[News and Announcements]]></category>
      <dc:creator>Donpireso</dc:creator>
      <content:encoded><![CDATA[<div class="bbWrapper"><img src="https://hypixel.net/attachments/version-support-updates-forums-png.3004667/"
			class="bbImage "
			style=""
			alt="version-support-updates-forums.png"
			title="version-support-updates-forums.png"
			width="1048" height="400" loading="lazy" /><br />
<br />
Hey everyone!<br />
<br />
Minecraft 1.19 is out! The Hypixel Server has now been updated to support the new version.<br />
<br />
As such, at this time, we do support the following versions:<br />
<b>1.8, 1.12, 1.14, 1.15, 1.16, 1.17, 1.18, and 1.19!</b><br />
<br />
If you come across any sort of exploits, bugs, issues, or anything else, please report it to our <a href="https://hypixel.net/forums/server-bug-reports.35/" class="link link--internal">bug report section</a>.<br />
<br />
Finally, as always, I'd like to remind everyone that Hypixel <a href="https://hypixel.net/threads/hypixel-optimised-for-1-8-9-best-version-of-minecraft-for-hypixel.1731620/" class="link link--internal">is better played on the 1.8.9 version of Minecraft</a> if you tend...<br />
<br />
<a href="https://hypixel.net/threads/hypixel-now-supports-minecraft-1-19.4976618/" class="link link--internal">Read more</a></div>]]></content:encoded>
      <slash:comments>206</slash:comments>
    </item>
  </channel>
</rss>
`;

const rss = new Parser().parse(xml);
const output = new Normalize().normalize(rss);

console.log(JSON.stringify(output));