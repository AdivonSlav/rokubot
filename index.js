const { Client, Collection } = require('discord.js');
const { Scraper } = require('./scraper.js');
const { PREFIX, BOT_TOKEN } = require('./config.js');
const { Player } = require("discord-player");
const fs = require('fs');
const chalk = require('chalk');

const client = new Client({ disableEveryone: true});
const player = new Player(client);
client.commands = new Collection();
client.player = player;
chalk.enabled = true;

fs.readdirSync('./commands').forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));

    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    }
})

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    console.log(chalk.green(`(MAIN): Loading event ${file}`));
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.player.on(event.name, (...args) => event.execute(...args));
	}
}

/////////////////////////////////////////////////////////////////////

// Console logging
client.on('warn', console.warn);
client.on('error', console.error);

client.on('ready', () => {
    console.log(chalk.green('(MAIN): Primed and ready!'))
    client.user.setActivity('Baju', { type: 'LISTENING'})

    try {
        (async() => {
            Scraper();
        }
        )();
    } catch (error) {
        console.log(chalk.red(error));
    }
});

client.on('disconnect', () => console.log('Disconnected, will reconnect...'));
client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {
    // Prevent the bot from responding to itself, other bots or to commands without the correct prefix
    if (msg.author.bot)
        return null;

    if (!msg.content.startsWith(PREFIX))
        return null;

    const args = msg.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
        if (cmd) {
            cmd.execute(msg, client, args);
        }
    } catch (error) {
        console.error(chalk.red("(MAIN) " + error));
        msg.reply('There was an error trying to run that command.');
    }
});

client.login(BOT_TOKEN);
