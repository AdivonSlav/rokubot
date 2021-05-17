const { Client } = require('discord.js');

const music = require('./music-functions.js');
const client = new Client({ disableEveryone: true});

// Console logging
client.on('warn', console.warn);
client.on('error', console.error);

client.on('ready', () => {
    console.log('Primed and ready!')
    client.user.setActivity('Baju', { type: 'LISTENING'})
});

client.on('disconnect', () => console.log('Disconnected, will reconnect...'));
client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {
    music.MusicModule(msg);
});


// The login token required by Discord
client.login(BOT_TOKEN);
