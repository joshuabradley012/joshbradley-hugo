---
title: "Implementing Adobe Analytics with Adobe Launch"
date: 2020-01-27T21:56:11-08:00
draft: true
description: "An advanced guide to implementing Adobe Analytics, starting with an SDR (solution design reference) template and ending with Adobe Launch publication."
summary: "An advanced guide to implementing Adobe Analytics with Adobe Launch using data elements, _satellite, and custom events."
type: "post"
categories:
- Analytics
tags:
- Adobe Analytics
---

Adobe Analytics Workspace is the most powerful analytics tool I have ever used. However, it was the most painful implementation I have ever experienced. I hope I can save you some pain with this guide.

## Planning with a Solution Design Reference

The foundation to a succsesful implementation is a plan. Mapping business needs to digital datapoints that you know where to capture and how. Doing this will ensure you are tracking everything you need, accurately.

It also provides documentation for data engineers and analysts on your team who will be working with this data. And makes implementation in Adobe Launch smoother as there will be less rework and less second guessing.

You can use this template as a starting point, it is a redacted version of my final implementation: {{< externallink "BRD-SDR Template" "https://docs.google.com/spreadsheets/d/1dHQw4Y1ThgnYr_dg3kFQvqR0ePucwFc15Ai5WOD2DiA/edit?usp=sharing" >}}

