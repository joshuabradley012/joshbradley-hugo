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

This website is insanely fast. he homepage is only 9KB and it loads in 50-400ms. To put that in perspective:
* {{< externallink "Google Analytics" "https://www.google-analytics.com/analytics.js" >}} is 17.7KB
* {{< externallink "This PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses for their heart animation is 10KB
* A normal blink takes 100-400ms

There were sacrifices made to achieve such extreme minification, but it embodies what websites could be in stark contrast with what they have become.

Javascript libraries are beautiful for enterprise applications, but they are not the end all for web development. Much like the <abbr title="Linux Apache MySQL PHP">LAMP</abbr> stack of yesterday, it is a solution to get you running quickly. Not a solution to last.

Jeff Huang laid it out nicely in his {{< externallink "Manifesto for Preserving Web Content" "https://jeffhuang.com/designed_to_last/" >}}:

> I think we should consider both 1) the casual web content "maintainer", someone who doesn't constantly stay up to date with the latest web technologies, which means the website needs to have low maintenance needs; 2) and the crawlers who preserve the content and personal archivers, the "archiver", which means the website should be easy to save and interpret.

While I disagree with some of the points he lays out, his core argument rings true. The weirdly beautiful cacophony of blogger and wordpress sites that occasionally produce {{< externallink "gems" "http://www.galactanet.com/oneoff/theegg_mod.html" >}} worth preserving.

Enough philosophy, here is how I built this website.

1. Hugo site generator
2. Custom SCSS
3. Minimal Javascript
4. A service worker
5. Hosted on AWS
