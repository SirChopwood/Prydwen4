---
title: "Rami Request Manager"
description: "A twitch panel, overlay and chatbot for managing chat based interaction, such as song requests for DJs."
tags:
  - "Solo"
  - "JS/Node"
thumbnail: "/images/projects/external/rrm.png"
timestamp: 1774995879
buttonTexts:
  - "Panel"
buttonLinks:
  - "https://louismayes.xyz/rrm_v2"
hidden: "false"
---

# Introduction
For a while, a streamer community I had been following were doing these weekly events. They involved going into a VR world based off the Just Dance games and dancing along to all the silly and wacky songs. These events grew rather popular, at least with everyone except copyright claim systems... hence the nickname "DMCA Friday". Originally the nights were handled by the channel moderators, processing messages as they dropped in and trying to run a mental list of requests. 

However, it was clear that it wasn't an ideal system. This is where I raised my hand and volunteered to create a small bot that could help automate the process. It should have been simple enough, take chat messages, add them to a list, recite list back. Surely that's all it'd take right?? Well here we are 4 years later with yet another rewrite under my belt... But hey! It's been fun! And every iteration has been superior to the last.

# Version 0.5
## The Discord Bot
::gallery{scrolling="false"}
![DJFry2.png](/images/projects/rrm/discordbot.png)
::

In the beginning, there was just a discord bot. It handled interfaces using emotes and long, channel filling messages. It worked at the time where I had no other way to communicate to people, but again was FAR from ideal. The one upside was that it proved the system worked, for users on both ends it was many magnitudes easier than before. But I knew we could do better.


# Version 1
## DMCA Queue Panel
::gallery{scrolling="false"}
![The Prototype](/images/projects/rrm/dmca.png)
::

Fast forward another year, after creating this website, and I create a static panel that's able to show what the bot's queuing. The implementation was awful, hard coded values, widescreen horizontal only, directly manipulating the DOM, ew! What this did provide was a method to put data to the screen without using a third party API, like Discord or Twitch chats.


# Version 2
## Rami Request Manager (RRM)
::gallery{scrolling="false"}
![A New Vue](/images/projects/rrm/rrm_v1.png)
::

With the latest iteration of my Website, I thought it would be best to update the system. I had recently rewritten the Twitch bot that handled processing the commands, so it made sense to actually process the requests and sessions on the website and treat it like any other API on the bot. 

This version made use of standard CRUD operations but also was still detached between any panel and the backend. The result was a panel that worked a lot more reliably, but even then had occasional disconnects, desyncs or bugs that caused it to fail. This held for long enough while I read up some more other approaches.


# Version 3
## RRM V2
::gallery{scrolling="false"}
![The Nuxt Step](/images/projects/rrm/rrm_v2.png)
::

Finally, we reach the newly released RRM V2, laid out a little differently after more consultation with the biggest users of the site. Fresh off the press, this version builds directly off the last with the backend being mostly the same, just with patches and fixes applied to allow proper processing of requests. Additionally, V2 allowed me to set up Durable Objects to connect to the panel and overlays, giving a significantly faster update speed using WebSockets to communicate. 

Lastly in this update I stripped away every extra layer of data handling I could on the client, instead generating the whole page straight from the internal cache, letting it update smoothly as soon as changes were applied. This has the incredibly useful side effect of allowing me to use existing Vue libraries or features to add quality of life features like drag reordering and animated transitions.