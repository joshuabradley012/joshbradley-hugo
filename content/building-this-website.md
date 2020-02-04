---
title: "Building This Website"
seotitle: "Building a Static Website with Hugo Hosted on AWS S3"
date: 2020-01-27T22:26:31-08:00
draft: true
type: "post"
description: "Hugo is a powerful site generator, here is how I built in schema markup, clean scss, and a service worker."
summary: "This site is tiny and powerful, featuring schema markup and service workers. Here is what I learned while building it."
categories:
- Web Development
tags:
- Hugo
---

This website is insanely fast. The homepage is only 9KB and it loads in 50-400ms. To put that in perspective:

* {{< externallink "Google Analytics" "https://www.google-analytics.com/analytics.js" >}} is 17.7KB
* {{< externallink "This PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses for their heart animation is 10KB
* A normal blink takes 100-400ms

There were sacrifices to achieving such extreme minification, but it embodies what websites could be in stark contrast with what they have become.

Feature packed frameworks have bloated everything. In a {{< externallink "magnificent rant" "https://tonsky.me/blog/disenchantment/" >}} Nikkita Tonsky wrote:

> Windows 95 was 30MB. Today we have web pages heavier than that! Windows 10 is 4GB, which is 133 times as big. But is it 133 times as superior?

It's not.

Nor is the <abbr title="Javascript APIs Markup">JAM</abbr> stack a solution for fast, accessible websites built to last. It is a tool for transient enterprise applications.

As Jeff Huang put it in his {{< externallink "Manifesto for Preserving Web Content" "https://jeffhuang.com/designed_to_last/" >}}:

> Even simple technology stacks like static site generators (e.g., Jekyll) require a workflow and will stop working at some point. You fall into npm dependency hell, and forget the command to package a release.
>
>...
>
>But I think we should consider both 1) the casual web content "maintainer", someone who doesn't constantly stay up to date with the latest web technologies, which means the website needs to have low maintenance needs; 2) and the crawlers who preserve the content and personal archivers, the "archiver", which means the website should be easy to save and interpret.

While I think his stance is extreme, he makes a point. The cacophony that is the internet often produces {{< externallink "gems" "http://www.galactanet.com/oneoff/theegg_mod.html" >}} worth preserving.

So with that, here is how I built this website to be fast, modern, and built to last.

## The stack

1. Hugo (a static site generator)
2. Custom SCSS
3. Minimal Javascript
4. A service worker
5. AWS hosting
