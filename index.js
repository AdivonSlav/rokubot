// Importing required dependencies
const Discord = require('discord.js');
const {
    prefix,
    token,
} = require('./config.json');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

// Queue where songs are saved and saves track info into a variable
const queue = new Map();
var trackInfo;

// Creating the actual client and logging in with the bot token
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

// Console logging when executing
client.once('ready', () => {
    console.log('Ready!');
   });
client.once('reconnecting', () => {
    console.log('Reconnecting!');
   });
client.once('disconnect', () => {
    console.log('Disconnect!');
   });

// Reading messages and checking which command to execute. Returning error message if no command is entered
client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}help`)) {
        help(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}info`)) {
        info(message, serverQueue, trackInfo);
    } 
    else {
        message.channel.send("Enter a valid command bro.");
    }
});

// Checks if the user is in a voice chat and if the bot has the correct perms. If not, it outputs an error
async function execute(message, serverQueue, trackInfo) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send("Join the channel first.");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("I don't have the perms to talk or join bro.");
    }

    // Gets song info from either URL or typed name and saves it into a song objects using ytdl from YouTube
    let song;
    if (ytdl.validateURL(args[1])) {
        const songInfo = await ytdl.getInfo(args[1]);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
        trackInfo = songInfo.videoDetails.title;
    } else { 
        const {videos} = await yts(args.slice(1).join(" "));
        if (!videos.length) return message.channel.send("No songs mate");
        song = {
            title: videos[0].title,
            url: videos[0].url
        };
    }

    // Checks if the serverQueue is defined (music is playing) and if so, adds the song to the queue. If it's not then it creates it and tries to join the channel.
    if (!serverQueue) {
        //Creating the actual contract for the queue
        const queueContract = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        // Setting the queue using the contract
        queue.set(message.guild.id, queueContract);
        // Pushing the song to the array
        queueContract.songs.push(song);

        try {
            // Trying to join the channel and save the connection into the object
            var connection = await voiceChannel.join();
            queueContract.connection = connection;
            // Calling the play function
            play(message.guild, queueContract.songs[0]);
        } catch (err) {
            // Outputting error if it fails to join the channel
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue`);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

// Checks if the user that typed the command is in the channel and if there's anything to skip.
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("Can't skip the music if you're not listening to it bro.");
    if (!serverQueue)
        return message.channel.send("Can't skip if there's nothing there.");
    serverQueue.connection.dispatcher.end();
}

// The skip command clears the song array, deletes the queue and leaves the channel.
function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("Can't stop the music if you're not listening to it bro.");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

// The help command lists all the available commands to the user
function help(message) {
    const helpwindow = new Discord.MessageEmbed()
    .setTitle('List of commands')
    .addFields(
        {name: 'General',
        value: "`*b$play* [URL/Title] (Searches YouTube for the entered title or URL and plays it)`"
        + "\n`*b$skip* (Skips the current track that is playing and moves to the next)`"
        + "\n`*b$stop* (Stops the bot and disconnects it from the channel)`"
        + "\n`*b$help* (Opens this beautiful window)`" 
        + "\n`*b$help* (Opens this beautiful window)`" 
        + "\n`*b$info* (Displays the current track info)`"
    }
    )
    message.channel.send(helpwindow);
}

function info(message, serverQueue, trackInfo) {
    if (!message.member.voice.channel)
        return message.channel.send("No peeking without being in there");
    if (!serverQueue)
        return message.channel.send("Nothing is playing");
    message.channel.send("`" + trackInfo + " is currently playing`");
}


