---
title: "Project Prydwen"
description: "My own custom portfolio website, lovingly crafted over the years."
tags:
  - "Solo"
  - "Open Source"
  - "JS/Node"
thumbnail: "/images/misc/banner.png"
timestamp: 1774995879
buttonTexts:
  - "V5 GitHub"
buttonLinks:
  - "https://github.com/SirChopwood/Prydwen4/tree/rrm-v2"
hidden: "false"
---

# Introduction
Originally I was going to create a portfolio while at university on a standardised platform, one of those generic website template builders.
However, I quickly found that they lacked the ability to properly express your creativity and constantly force you down specific design routes.
That combined with my general interest in programming lead me to create my own website, learning the different skills I'd need to pull off this task.

# Version 1
## The Prototype
::gallery{scrolling="false"}
![The Prototype](/images/projects/portfolio/version1.png)

![Project 1](/images/projects/portfolio/version1_agm.png)
::

This was my first attempt at creating some form of portfolio. It served the purpose for university however it was painfully created in almost pure HTML/CSS/JS and that was not going to cut it. I did at least make the smart move to start with [TailwindCSS](https://tailwindcss.com/), which meant rewriting would be a lot easier, a choice that I've since stuck with all the way to the current versions. Unfortunately, the technical debt would soon skyrocket if I didn't change my ways fast and at least add some modularity to the layout. 


Not to mention that the whole thing was being manually hosted on a small server I had, running the script directly in node. 


It also lacked ANY responsiveness on screens smaller than my laptop, which wasn't ideal. But if I had to be honest, the sidebar design (which was based on the documentation sites I was using) still stands strong. Though I will concede it is not the "Meta" for design. Perhaps one day I'll add a toggle to bring it back.


# Version 2
## A New Vue
::gallery{scrolling="false"}
![A New Vue](/images/projects/portfolio/version2.png)

![Project 2](/images/projects/portfolio/version2_agm.png)
::

So as soon as I got some free time, I looked into frameworks and found a simple one for frontends (as at the time that's all it did). 
I took [Vue](https://vuejs.org/) for a spin and managed to create a whole new design. This time looking far nearer to what I eventually settled with now, however as seen it had some rather obvious issues design wise. 


I can say, that the background in particular was removed almost immediately as it became too much of a distraction. 


This was also the point where I migrated the site over to a third party hosting site, in this case [GitHub Pages](https://docs.github.com/en/pages). Though due to that being static, it could only do so much and was quite an ache for the RRM project.


# Version 3
## The Nuxt Step
::gallery{scrolling="false"}
![The Nuxt Step](/images/projects/portfolio/version3.png)

![Project 3](/images/projects/portfolio/version3_agm.png)
::

At version 3, I finally set myself up with [Nuxt](https://nuxt.com/), providing a proper full stack framework to run the project from. Nuxt came with an out of the box solution for publishing the website to [Cloudflare Pages](https://pages.cloudflare.com/) (and later Workers). 


This was perfect to start, however soon after they had a major overhaul that forced me to migrate to my own pipeline for [Cloudflare Workers](https://workers.cloudflare.com/). Additionally, RRM had reached a point of development where WebSockets were needed via [Cloudflare's Durable Objects](https://developers.cloudflare.com/durable-objects/). Along with the migration to Cloudflare came a move from [MongoDB](https://www.mongodb.com/) to CF's D1 Database, allowing a MUCH faster read/write speed and the benefit of it being directly baked into the environment.


# Versions 4 & 5
## Smaller Increments

With versions 4 and 5 there were no real visual changes. The main project stayed the same, just with a few behind the scenes changes and updates.


This is the point where I can rather confidently say the project is in a Long Term Support state, which is good for my sanity and free time.


Version 5 specifically came along with the major rewrite of the RRM side of the side, which you can read more about [here](./rrm).