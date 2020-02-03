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

This website is insanely fast. It loads in 100ms and the homepage is only 9KB. For perspective:
* {{< externallink "Google Analytics" "https://www.google-analytics.com/analytics.js" >}} is 17.7KB
* {{< externallink "This PNG" "https://abs.twimg.com/responsive-web/web/heart_animation.5c9f8e84.png" >}} Twitter uses for their heart animation is 10KB

There were sacrifices made to achieve such extreme minification, but it embodies what websites could be in stark contrast to what they have become.

{{< highlight html >}}
<section id="main">
  <div>
   <h1 id="title">{{ .Title }}</h1>
    {{ range .Pages }}
        {{ .Render "summary"}}
    {{ end }}
  </div>
</section>
{{< /highlight >}}
