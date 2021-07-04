const { Client } = require('discord.js');
const { MusicModule } = require('./music-functions.js');
const { Scraper } = require('./scraper.js');
const { BOT_TOKEN } = require('./config.js');

const client = new Client({ disableEveryone: true});

// Console logging
client.on('warn', console.warn);
client.on('error', console.error);

client.on('ready', () => {
    console.log('Primed and ready!')
    client.user.setActivity('Baju', { type: 'LISTENING'})

    
    try {
        (async() => {
            Scraper();
        }
        )();
    } catch (error) {
        console.log(error);
    }
});

client.on('disconnect', () => console.log('Disconnected, will reconnect...'));
client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {
    MusicModule(msg);
});

client.login(BOT_TOKEN);
