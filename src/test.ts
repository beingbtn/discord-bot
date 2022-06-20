import { Format } from './core/Format';

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

const rss = new Format().parse(xml);

console.log(JSON.stringify(rss));