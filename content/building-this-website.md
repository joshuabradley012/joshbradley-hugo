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

This website is insanely fast. The homepage is only 9KB and it loads in 50ms after being cached. To put that in perspective Google Analytics is 17.7KB, this {{< externallink "PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses for their heart animation is 10KB, and blinking takes 100-400ms.

There were sacrifices to achieving such extreme minification, but it embodies what websites could be in stark contrast with what they have become.

## Why fast sites matter

Speed is the most important factor of user experience.

Reality has no latency. Things <em>feel</em> wrong when there is delay between our actions and their response.

But as computers have become more powerful, they haven't gotten faster. Instead we add more to our computers and get less out of them.

In a {{< externallink "magnificent rant" "https://tonsky.me/blog/disenchantment/" >}} Nikkita Tonsky wrote:

> Windows 95 was 30MB. Today we have web pages heavier than that! Windows 10 is 4GB, which is 133 times as big. But is it 133 times as superior?

Frameworks like React address speed by controlling the dom, but it comes at the cost of 100KB of Javascript, wasted CPU cycles, and complexity that is difficult to maintain.

As Jeff Huang put it in his {{< externallink "Manifesto for Preserving Web Content" "https://jeffhuang.com/designed_to_last/" >}}:

> I think we should consider both 1) the casual web content "maintainer", someone who doesn't constantly stay up to date with the latest web technologies, which means the website needs to have low maintenance needs; 2) and the crawlers who preserve the content and personal archivers, the "archiver", which means the website should be easy to save and interpret.

While I think his stance is extreme, he has a point. The cacophony of the internet produces {{< externallink "gems" "http://www.galactanet.com/oneoff/theegg_mod.html" >}} worth preserving.

So with that, let's build something.

## The stack

1. <a href="#hugo">Hugo</a>
2. Custom SCSS
3. Minimal Javascript
4. A service worker
5. AWS hosting

Check out the {{< externallink "repo" "https://github.com/joshuabradley012/joshbradley-hugo" >}} (I think I'll turn it into a theme at some point).

<h3 id="hugo">Hugo</h3>

Hugo is magnificent. You can see the care and experience that went into building it. Roadblocks that are common in other generators (like limiting your ability to edit the `<head>`) were instead features for full control.

With it's near-instant build process and shallow learning curve, I was able to complete the base of this website in one week.

My favorite feature has to be the ability to build any asset with it's templating language, and minify it! In this case I used it to build an array of cacheable pages for my service worker.

###### Cache array in service worker

{{< highlight javascript >}}
const pagesToCache = [
  {{ with .Site.Pages }}
    {{ range  (where . "Type" "page") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Kind" "taxonomyTerm") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Kind" "taxonomy") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Type" "post") }}
      '{{ .RelPermalink }}',
    {{ end }}
  {{ end }}
];
{{< / highlight >}}

It comes packed with a built-in post-processer for SCSS.

###### SCSS in baseof.html

{{< highlight html >}}
{{ $toCssOptions := (dict "targetPath" "style.css" "outputStyle" "compressed") }}
{{ $style := resources.Get "scss/main.scss" | toCSS $toCssOptions | resources.PostCSS}}
<link rel="stylesheet" href="{{ $style.RelPermalink }}">
{{< / highlight >}}

The templating language is sufficiently powerful and can handle relatively complex tasks, such as dynamic partial rendering.

###### Template

{{< highlight html >}}
{{ partial "meta/meta.html" (dict "context" . "data" (slice "time" "category-link")) }}
{{< / highlight >}}

###### Partial

{{< highlight html >}}
<small class="meta {{ delimit .data " " }}"
  {{ if (and (eq (len .data) 1) (in .data "tags")) }}itemprop="keywords"{{ end }}>
  {{ range $index, $data := .data -}}
    {{- partial (printf "meta/%s" .) $.context -}}
  {{- end }}
</small>
{{< / highlight >}}

###### Output
{{< highlight html >}}
<small class="meta time category-link">
  <time itemprop="datePublished" datetime="2020-01-27T22:26:31-08:00">Jan 27, 2020</time>
  <a rel="bookmark" href="/categories/web-development/"><span>Web Development</span></a>
</small>
{{< / highlight >}}