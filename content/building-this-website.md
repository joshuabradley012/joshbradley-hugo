---
title: "Building This Website"
seotitle: "Building a Static Website that Loads in 50ms"
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

This website is insanely fast. The homepage is only 9KB (after GZIP) and it loads in 50ms after being cached. To put that in perspective Google Analytics is 17.7KB, this {{< externallink "PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses for their heart animation is 10KB, and blinking takes 100-400ms.

There were sacrifices to achieving such extreme minification, but it embodies what websites could be in stark contrast with what they have become.

## Why speed matters

Reality has no latency. Things <em>feel</em> wrong when there is delay between our actions and their response. Speed is the most important aspect of user experience.

But as computers have become more powerful, they haven't gotten faster. They've been bloated.

In a {{< externallink "magnificent rant" "https://tonsky.me/blog/disenchantment/" >}} Nikkita Tonsky wrote:

> Windows 95 was 30MB. Today we have web pages heavier than that! Windows 10 is 4GB, which is 133 times as big. But is it 133 times as superior?

Frameworks like React address speed by controlling the DOM, but it comes at the cost of 100KB of Javascript, wasted CPU cycles, and complexity that is difficult to maintain.

Static HTML is the soul of the internet. It is ubiquitous, easy to understand, and easy for search engines to crawl. It is the ideal format for any website. Just take a look at {{< externallink "this motherfucking website" "https://motherfuckingwebsite.com/" >}}.

While I didnt go that extreme, this website is pretty close. And I love it.

## Design choices

There are no frameworks, webfonts, or libraries on this website. Everything was hand written and if it didn't directly improve the user experience, it wasn't included.

In particular, there are no web analytics on this page. If I really want to know my traffic and snoop IP addresses, I can check my server logs. But I'm not going to invade your privacy and inconcenience you with a script that feeds even more data to our Google overlord.

I was heavily inspired by Paul Graham, John Gruber's Daring Fireball, Seth Godin, Butterick's Practical Typography, and the New York Times. I hoped to capture some of their simplicity and mastery of typography.

This design is meant to last.

## The stack

1. <a href="#hugo">Hugo</a>
2. <a href="#static-assets">Static assets</a>
3. <a href="#custom-scss">Custom SCSS</a>
4. <a href="#minimal-javascript">Minimal Javascript</a>
5. <a href="#service-worker">A service worker</a>
6. <a href="#aws-hosting">AWS hosting</a>

Check out the {{< externallink "repo" "https://github.com/joshuabradley012/joshbradley-hugo" >}} (I think I'll turn it into a theme at some point).

<h3 id="hugo">Hugo</h3>

I chose Hugo because of the control and productivity it provides. I was able to create a minimal, semantic markup laden with {{< externallink "schema markup" "https://schema.org/" >}}.

My favorite feature has to be the ability to build any asset with it's templating language, and minify it! In this case I used it to build an array of cacheable pages for a service worker.

###### Array in service worker

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

I was also pleased to learn it came with a built in SCSS post processer and that the templating language was sufficiently powerful for dynamic rendering.

With Hugo's near-instant build process and shallow learning curve, I was able to complete the base of this website in one week.

<h3 id="static-assets">Static assets</h3>

I mentioned that I didn't use any webfonts. I lied. I created one with {{< externallink "Fontello" "http://fontello.com/" >}} for social media icons. With the `woff2` format it was only 1KB larger than SVG icons. But it comes with better extensibility, and they're easier to work with.

After handpicking the icons, the entire font is only 3.1KB. As compared to FontAwesome's 161KB (plus another 70-120KB for every font weight you include, and their CSS).

The logo is a single path SVG, made on a 16pt grid and minified with one decimal precision. The end result is 399B.

I went with Georgia for the body, Helvetica for headings and navigation, and Courier for code. These are all {{< externallink "websafe fonts" "https://www.cssfontstack.com/" >}} and don't require anything to load.

<h3 id="custom-scss">Custom SCSS</h3>

The layout is very simple, two containers with content inside. So I didn't need Bootstrap, just a few lines of CSS. I went with SCSS for better modularity, but wrote I it with the output in mind. Meaning I didn't get into nested selector hell.

There is a single media query, and as always updating the navigation to be mobile was the heaviest part of this build.

I also gave special attention to the typography. Using many shades of grey and consistent margins between elements, with double on top for headings.

Everything uses `rem` and `em` units so it responds to user settings and I can add a font size adjuster whenever I'd like without breaking the careful column widths.

The entire theme can be configured with just a few variables.

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

In total, this page loads 6.4KB of CSS (2.3KB after GZIP).

<h3 id="minimal-javascript">Minimal Javascript</h3>

The Javascript of this website is really composed of a nav toggle, and a service worker. If I dropped the service worker, this block is all there would be.

###### Nav Toggle Javascript

{{< highlight scss >}}
var navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});
{{< / highlight >}}

But I decided to learn about service workers, and make this website nearly instantaneous in the process.

<h3 id="sevice-worker">A service worker</h3>

Creaing a service worker was the most complex piece of this website. It took me about 33% of the total development time, but it was a fun challenge that taught me a lot.

I could have kept it easy with a "stale-while-revalidate" pattern as outlined in {{< externallink "Google's Offline Cookbook" "https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook" >}}. But you might have picked up, I rarely do things the easy way.

Instead I chose to have three different caching patterns for different use cases.

Static assets are the simplest, they respond from the cache after the service worker has finished loading. That way your network isn't wasted until I decide to update something.

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

Pages have a slightly more complex pattern, imitating a "stale-while-revalidate" pattern. Showing the cached response and updating the cahce in the background. That way the user gets instant load, but an updated resource the next time they visit.

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

And finally the true beast, a cache then update with network policy, within static HTML. The pattern goes like this.

1. Browser request
2. ServiceWorker returns cached response
3. Page posts message to ServiceWorker, telling it to use the network on the next load
4. Service worker responds with message saying it heard
5. Page makes fetch request
6. ServiceWorker updates cache and returns network response
7. Page updates with the network response

The code is heavy, but you can find it in the {{< externallink "repo" "https://github.com/joshuabradley012/joshbradley-hugo/tree/master/assets/js" >}}.


<h3 id="aws-hosting">AWS Hosting</h3>

This is a simple S3 bucket being served with Cloudfront masked by a domain in Route53. It sounds simple, but learning AWS is intimidating. Their documentation is dense and unfriendly.

