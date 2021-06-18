const { MessageEmbed, Util } = require('discord.js');
const { PREFIX, YOUTUBE_API_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');  

const youtube = new YouTube(YOUTUBE_API_KEY);
const queue = new Map();

async function MusicModule(msg)  {
    // Prevent the bot from responding to itself, other bots or to commands without the correct prefix
    if (msg.author.bot)
        return undefined;

    if (!msg.content.startsWith(PREFIX))
        return undefined;

    const args = msg.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    const serverQueue = queue.get(msg.guild.id);

    // If the play command is used
    if (msg.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = msg.member.voice.channel;

        // Prevents a user who is not in the channel with the bot to use the command
        if (!voiceChannel)
            return msg.channel.send('Can\'t play music if you\'re not in a channel');

        // Takes the permissions the bot has in the server
        const permissions = voiceChannel.permissionsFor(msg.client.user);

        /*
        Throws the appropriate error when the bot does not have the perms to 
        join or speak in a voice channel
        */
        if (!permissions.has('CONNECT')) 
            return msg.channel.send('I can\'t connect, I probably don\'t have permission');
    
        if (!permissions.has('SPEAK'))
            return msg.channel.send('I can\'t speak in the channel, I probably don\'t have permission');
        
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();

            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true);
            }

            return msg.channel.send(`Playlist: **${playlist.title}** is added`);
        }

        else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 5);
                    let index = 1;
                    const selectionEmbed = new MessageEmbed()
                        .setTitle('Fetched songs')
                        .addField(`Songs:`, `${videos.map(video2 => `**${index++} -** ${video2.title}`).join(`\n`)}`, true)
                        .addField(`**Please select a song**`, `(1 - 5)`, false)
        
                    msg.channel.send(selectionEmbed);

                    try {
                        const filter = msg2 => msg2.content > 0 && msg2.content < 6;
                        var response = await msg.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ['time'] });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send("Nothing selected, cancelling selection!");
                    }

                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(error);
                    return msg.channel.send('I can\'t find a video by that name.');
                }
            }

            return handleVideo(video, msg, voiceChannel);
        }
    } 
    
    // If the stop command is used
    else if (msg.content.startsWith(`${PREFIX}stop`)) {

        // Prevents a user who is not in the channel to stop the bot 
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!serverQueue) 
            return msg.channel.send(`There is nothing playing currently so I can't stop`);

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        return msg.channel.send("Stopping song...");
    }

    // If the skip command is used
    else if (msg.content.startsWith(`${PREFIX}skip`)) {

        if (!msg.member.voice.channel)
            return msg.channel.send(`You\'re not in a voice channel, sorry`);
        if (!serverQueue) 
            return msg.channel.send(`There is nothing playing currently so I can't skip`);

        serverQueue.connection.dispatcher.end();    
        return msg.channel.send("Skipping song...");
    }

    // If the status command is used
    else if (msg.content.startsWith(`${PREFIX}status`)) {
        
        if (!serverQueue)
            return msg.channel.send(`There's nothing playing right now`);

        const songEmbed = new MessageEmbed()
            .setTitle("Status")
            .addField(`Playing`, `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`, true)
            .addField(`Length`, (serverQueue.songs[0].duration.hours == 0? ``:`${serverQueue.songs[0].duration.hours}:`) + `${serverQueue.songs[0].duration.minutes}:${serverQueue.songs[0].duration.seconds}`, true)
            .setImage(`${serverQueue.songs[0].thumbnail}`)

        return msg.channel.send(songEmbed);
    }

    // If the volume command is used
    else if(msg.content.startsWith(`${PREFIX}volume`)) {
        if (!msg.member.voice.channel)
            return msg.channel.send(`You\'re not in a voice channel, sorry`);
        if (!serverQueue)
            return msg.channel.send(`There's nothing playing right now`);
        if (!args[1]) 
            return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
        
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
        return msg.channel.send(`Setting volume to: **${args[1]}**`);
    }

    // If the queue command is used
    else if(msg.content.startsWith(`${PREFIX}queue`)) {
        if (!serverQueue)
            return msg.channel.send(`There's nothing playing right now`);

        const queueEmbed = new MessageEmbed()
            .setTitle('Current queue')
            .addField(`Songs:`, `${serverQueue.songs.map(song => `${song.title}`).join(`\n`)}`, true)
            .addField(`**Now playing:**`, `__${serverQueue.songs[0].title}__`, true)

        return msg.channel.send(queueEmbed);
    }

    //If the pause command is used
    else if(msg.content.startsWith(`${PREFIX}pause`)) {
        if (!msg.member.voice.channel)
            return msg.channel.send(`You\'re not in a voice channel, sorry`);
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            
            return msg.channel.send(`Pausing...`);
        }
        
        return msg.channel.send(`There's nothing playing right now`);
    }

    //If the resume command is used
    else if(msg.content.startsWith(`${PREFIX}resume`)) {
        if (!msg.member.voice.channel)
            return msg.channel.send(`You\'re not in a voice channel, sorry`);
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
                
            return msg.channel.send(`Resuming...`);
        }

        return msg.channel.send(`There's nothing playing right now`);
    }

    return undefined;
}

async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);

    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration,
        thumbnail: video.thumbnails.default.url
    }

        // If there is no queue, it creates one
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        // Maps the queue to the QueueConstruct
        queue.set(msg.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

        // Checks the connection attempt for errors and throws the appropriate error
        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(msg.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`I couldn\'t join the voice channel: ${error}`);
            queue.delete(msg.guild.id);
            return msg.channel.send(`I couldn\t't join the voice channel: ${error}`);
        }
    }

    else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        if (playlist)
            return undefined;
        else
            return msg.channel.send(`I\'ve added **${song.title}** to the queue!`);
    }

    return undefined;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    
    if (!song)  {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    console.log(serverQueue.songs);

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on('finish', reason => {
            if (reason === 'Stream is not generating quickly enough.') 
                console.log('Song ended.');
            else
                console.log(reason);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));

    dispatcher.setVolumeLogarithmic(5 / 5);

    const songEmbed = new MessageEmbed()
        .setTitle("Status")
        .addField(`Playing:`, `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`, true)
        .addField(`Length:`, (serverQueue.songs[0].duration.hours == 0? ``:`${serverQueue.songs[0].duration.hours}:`) + `${serverQueue.songs[0].duration.minutes}:${serverQueue.songs[0].duration.seconds}`, true)
        .setImage(`${serverQueue.songs[0].thumbnail}`)

    serverQueue.textChannel.send(songEmbed);
}

module.exports.MusicModule = MusicModule;