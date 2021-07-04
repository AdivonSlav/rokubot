# Roku 

Roku is a small project I started to start learning Javascript. It's a Discord music bot with the following functionalities currently implemented:

- Playing from URL or text input (from YouTube)
- Queue support with skip, pause, stop, resume and status commands
- Volume control
- Custom Discord embeds

Furthermore I've been working on integrating a modified version of my Mesh Scraper into Roku, so far it is able to scrape and post via a Discord webhook alongside the normal music functionalities.

If for some reason you want to build and test the bot code on your own, edit the config.js file accordingly. 

The bot needs the following dependencies:

```
common-tags, discord.js, ffmpeg, ffmpeg-static, node-opus, simple-youtube-api, ytdl-core, node-fetch
```

