---
title: "Building This Website"
seotitle: "Build a Lightning Quick Website using Hugo and S3"
date: 2020-01-27T22:26:31-08:00
draft: false
type: "post"
description: "Hugo is a powerful site generator, here is how I built in schema markup, clean scss, and a ServiceWorker."
summary: "This site is tiny and powerful, featuring schema markup and ServiceWorkers. Here is what I learned while building it."
categories:
- Web Development
tags:
- Hugo
---

This website is _fast_. The homepage loads in 50ms and is only 9KB (after GZIP and caching).

Google Analytics is 17.7KB, this {{< externallink "PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses is 10KB, and blinking takes 100-400ms.

There were sacrifices. But it is an example of what websites could be in stark contrast with what they have become.

## Why speed matters

Reality has no latency. Things _feel_ wrong when there is a delay between our actions and their response. Speed is the most important aspect of user experience.

But as computers have become more powerful, they haven't gotten faster. They're bloated.

In a {{< externallink "magnificent rant" "https://tonsky.me/blog/disenchantment/" >}}, Nikkita Tonsky wrote:

> Windows 95 was 30MB. Today we have web pages heavier than that! Windows 10 is 4GB, which is 133 times as big. But is it 133 times as superior?

Frameworks like React address speed by controlling the DOM. At the cost of 100KB of JavaScript, wasted CPU cycles, and complexity.

Static HTML is the soul of the internet. It is ubiquitous, easy to understand, and easy for search engines to crawl. It is the ideal format for any website. Look at {{< externallink "this motherfucking website" "https://motherfuckingwebsite.com/" >}}.

While I wasn't as extreme, this website is pretty close. And I love it.

## Design choices

There are no frameworks, web fonts, or libraries on this website. Everything was handwritten. If it didn't improve the user experience, it wasn't included.

In particular, there aren't any analytics on this page. If I want to know traffic metrics and snoop IP addresses, I can check the server logs. I'm not going to invade your privacy with an inconvenient script. Or feed more data to our Google overlord.

I'm inspired by {{< externallink "Paul Graham" "http://www.paulgraham.com/articles.html" >}} and {{< externallink "John Gruber's" "https://daringfireball.net/" >}} simplicity. I learned typography from {{< externallink "Seth Godin" "https://seths.blog/" >}}, {{< externallink "Butterick's Practical Typography" "https://practicaltypography.com/" >}}, and {{< externallink "The New York Times" "https://www.nytimes.com/" >}}. I hoped to capture their mastery.

This design intends to last.

## The stack

1. [Hugo](#hugo)
2. [Static assets](#static-assets)
3. [Custom SCSS](#custom-scss)
4. [Minimal JavaScript](#minimal-javascript)
5. [A ServiceWorker](#a-serviceworker)
6. [AWS hosting](#aws-hosting)

Check out the {{< externallink "repo" "https://github.com/joshuabradley012/joshbradley-hugo" >}} (I'll turn it into a theme at some point).

### Hugo

I chose Hugo because of the control and productivity it provides. I was able to create a minimal, semantic structure laden with {{< externallink "schema markup" "https://schema.org/" >}}.

Hugo's ability to generate and minify assets in any language removed my need for build tools. Keeping my codebase uniform, simple, and fast.

In this case, I used it to build an array of cacheable pages for a ServiceWorker.

###### Array in ServiceWorker

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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('cacheName').then(function(cache) {
      cache.addAll(pagesToCache);
    })
  );
});
{{< / highlight >}}

With Hugo's power and shallow learning curve, I was able to complete the base of this website in one week.

### Static assets

I mentioned that I didn't use any web fonts. I lied. I created one with {{< externallink "Fontello" "http://fontello.com/" >}} for social media icons. Using `woff2` was only 1KB larger than SVG icons with better extensibility.

Because I handpicked icons, the entire font is only 3.1KB. Compare that to FontAwesome's 161KB. Plus another 70-120KB for every font-weight you include.

The logo is a single path SVG, made on a 16pt grid and minified with one decimal precision. The result is 399B.

I used Georgia for the body, Helvetica for headings and navigation, and Courier for code. These are all {{< externallink "websafe fonts" "https://www.cssfontstack.com/" >}}.

### Custom SCSS

The layout is very simple, two containers one fixed one relative. I didn't need Bootstrap, only a few lines of CSS. I converted my code to SCSS while avoiding nested selector hell.

I gave special attention to the typography. Using many shades of grey to create a subtle balance of contrast. It strives to be easy on the eyes while drawing attention to important sections.

Everything uses `rem` and `em` units for a responsive, accessible design. Vision impaired users can adjust this site without disrupting the typography.

The entire theme is configurable with a few variables.

###### Theme SCSS

{{< highlight scss >}}
$default-color: #333;

$dark-color: #121212;
$darker-color: #000;

$slightly-light-color: #555;
$light-color: #666;
$lighter-color: #777;
$lightest-color: #999;

$nav-active-background: #f7f7f7;
$code-background: #f0f0f0;

$light-border: #ddd;
$dark-border: #ccc;

$white: #fff;

$main-font: Georgia, serif;
$sub-font: Helvetica, Arial, sans-serif;
$mono-font: Courier, monospace;

$offset: 35.5%;
$content-width: 46rem;
{{< / highlight >}}

In total, the CSS is 6.4KB (2.3KB after GZIP).

### Minimal JavaScript

Aside from the ServiceWorker, this is all I used. A simple click listener to toggle the `nav-open` class, and a function to lazyload images.

###### Navigation Toggle

{{< highlight javascript >}}
var navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});
{{< / highlight >}}

###### Lazyload

{{< highlight javascript >}}
window.addEventListener('DOMContentLoaded', lazyload, false);
function lazyload() {
  var imgs = document.getElementsByClassName('lazyload');
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    if (img.nodeName === 'IMG') {
      img.addEventListener('load', function() { this.className += ' loaded' });
      img.dataset.src ? img.src = img.dataset.src : null;
      img.dataset.srcset ? img.srcset = img.dataset.srcset : null;
    } else {
      img.dataset.src ? img.style.backgroundImage = 'url(' + img.dataset.src + ')' : null;
    }
  }
}
{{< / highlight >}}

### A ServiceWorker

Creating a ServiceWorker was the most complex piece of this website. It took me about 1/3<sup>rd</sup> of the total development time, but it was worth learning.

I could have kept it simple. The "stale-while-revalidate" pattern outlined in {{< externallink "Google's Offline Cookbook" "https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook" >}} would have been enough. You might have picked up, I rarely do things the easy way.

Instead, there are three different cache patterns. The first load imports all assets. Then the ServiceWorker takes control.

Static assets are the simplest, they respond from the cache with a fallback to the network. That way the network isn't called until the cache is invalid.

###### Cache with network fallback

{{< highlight javascript >}}
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(normalizedUrl).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
{{< / highlight >}}

Pages have a more complex pattern, imitating HTTP's "stale-while-revalidate" policy. The user experiences an instant load while the resource updates for the next visit.

###### Stale-while-revalidate

{{< highlight javascript >}}
self.addEventListener('fetch', (event) => {
  const normalizedUrl = new URL(event.request.url);
  normalizedUrl.search = '';
  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(normalizedUrl).then((response) => {
        let fetchPromise = fetch(normalizedUrl).then((networkResponse) => {
          cache.put(normalizedUrl, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
{{< / highlight >}}

The pièce de résistance, a cache then update with network policy within static HTML. Keeping the homepage fresh.

The pattern goes like this.

{{< figure src="/images/cache-then-network.svg" title="Cache then network diagram" link="/images/cache-then-network.svg" target="blank" >}}

You can find the source code in the {{< externallink "repo" "https://github.com/joshuabradley012/joshbradley-hugo/tree/master/assets/js" >}}.


### AWS hosting

This is an S3 bucket served through Cloudfront routed through a Route53 domain. It sounds simple but learning AWS is intimidating. Their platform is dense and prickly.

Here is some helpful documentation:

1. {{< externallink "Domain names you can register with Route53" "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar-tld-list.html" >}}
2. {{< externallink "Routing Route53 to Cloudfront" "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html" >}}
3. {{< externallink "Serving a static S3 website with Cloudfront" "https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/" >}}
4. {{< externallink "Allowing directory paths with S3 and Cloudfront (without a Lambda)" "https://stevepapa.com/how-to-specify-a-default-root-object-for-static-website-subdirectories-on-aws-cloudfront/" >}}
5. Setting up the AWS CLI (for Hugo deployments) {{< externallink "install" "https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html" >}} and {{< externallink "credentials" "https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html" >}}
6. {{< externallink "Invalidating Cloudfront" "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html" >}}
7. {{< externallink "Setting cache control on all S3 items" "https://stackoverflow.com/questions/10435334/set-cache-control-for-entire-s3-bucket-automatically-using-bucket-policies" >}}

I also created an email with <abbr title="Simple Email Service">SES</abbr> that routes messages to my Gmail. An S3 bucket stores emails and a Lambda function sends them. {{< externallink "Daniel Lopez" "http://www.daniloaz.com/en/use-gmail-with-your-own-domain-for-free-thanks-to-amazon-ses-lambda/" >}} has a useful guide.

The only expense is my domain name. When I start to get traffic, I can scale for cheap.

## The result

This page gets a perfect 100 for performance in Chrome Lighthouse.

SEO and best practices are at 100, and it's a PWA. Accessibility scored a 93 because of the light grey used in meta data. If I were to add a contrast option, it would be a "perfect" website.

Chasing arbitrary numbers is pointless without purpose. This wasn't pointless. This website achieves everything I need and does it cleanly. The user experience is pristine. The typography is delightful. The structure is meaningful.

Good design is less design.
