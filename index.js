const { Client } = require('discord.js');
const { TOKEN, PREFIX } = require('./config');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');

const client = new Client({ disableEveryone: true});
const queue = new Map();

// Console logging
client.on('warn', console.warn);
client.on('error', console.error);

client.on('ready', () => {
    console.log('Primed and ready!')
    client.user.setActivity('Halid Bešlić', { type: 'LISTENING'})
});

client.on('disconnect', () => console.log('Disconnected, will reconnect...'));
client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {

    // Prevent the bot from responding to itself, other bots or to commands without the correct prefix
    if (msg.author.bot)
        return undefined;

    if (!msg.content.startsWith(PREFIX))
        return undefined;

    const args = msg.content.split(' ');
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
        
        const songInfo = await ytdl.getInfo(args[1]) ;
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
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
            return msg.channel.send(`I\'ve added **${song.title}** to the queue!`);
        }

        return undefined;
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
        return undefined;
    }

    // If the skip command is used
    else if (msg.content.startsWith(`${PREFIX}skip`)) {

        if (!msg.member.voice.channel)
            return msg.channel.send(`You\'re not in a voice channel, sorry`);

        if (!serverQueue) 
            return msg.channel.send(`There is nothing playing currently so I can't skip`);

        serverQueue.connection.dispatcher.end();    
        return undefined;
    }

    return undefined;
});

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    
    if (!song)  {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    console.log(serverQueue.songs);

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on('finish', () => {
            console.log('song ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));

    dispatcher.setVolumeLogarithmic(5 / 5);
    serverQueue.textChannel.send(`Started playing: **${song.title}**`);
}

// The login token required by Discord
client.login(TOKEN);
