const { Client } = require('discord.js');
const { TOKEN, PREFIX } = require('./config');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');

const client = new Client({ disableEveryone: true});

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
        
        // Checks the connection attempt for errors and throws the appropriate error
        try {
            var connection = await voiceChannel.join();
        } catch (error) {
            console.error(`I couldn\'t join the voice channel: ${error}`);
            return msg.channel.send(`I couldn\t join the voice channel: ${error}`);
        }

        // Takes the inserted URL via the play method of ytdl and plays the video
        const dispatcher = connection.play(ytdl(args[1]))
            .on('end', () => {
                console.log('song ended');
                voiceChannel.leave();
            })
            .on('error', () => {
                console.error(error);
            });

        // Sets the volume of the bot
        dispatcher.setVolumeLogarithmic(5 / 5);

    } 
    
    // If the stop command is used
    else if (msg.content.startsWith(`${PREFIX}stop`)) {

        // Prevents a user who is not in the channel to stop the bot 
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');

        msg.member.voice.channel.leave();
        return undefined;
    }
})

// The login token required by Discord
client.login(TOKEN);
