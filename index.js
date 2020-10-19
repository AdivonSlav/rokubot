// Importing required dependencies
const Discord = require('discord.js');
const {
    prefix,
    token,
} = require('./config.json');
const ytdl = require('ytdl-core');

// Queue where songs are saved
const queue = new Map();

// Creating the actual client and logging in with the bot token
const client = new Discord.Client();
client.login(process.env.NzY3Nzc5NDg4OTM4ODUyMzky.X424Xg.U9h0GfsJGPKKVZfxUVWM4Kov7YM);

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
    } else {
        message.channel.send("Enter a valid command bro.");
    }
});

// Checks if the user is in a voice chat and if the bot has the correct perms. If not, it outputs an error
async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send("Join the channel first.");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("I don't have the perms to talk or join bro.");
    }

    // Gets the song info and saves it into a song object using the ytdl library which gets it from a youtube link.
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    // Checks if the serverQueue is defined (music is playing) and if so, adds the song to the queue. If it's not then it creates it and tries to join the channel.
    if (!serverQueue) {
        //Creating the actual contract for the queue
        const queueContract = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
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
        serverQueue.songs.push();
        console.log(serverQueue.songs);
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
        play(guild, serverQueue.song[0]);
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



