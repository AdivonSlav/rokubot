const { MessageEmbed } = require('discord.js');
const { PREFIX } = require("../../config.js");

module.exports = {
    name: 'help',
    alias: ['h'],
	description: 'List of commands',
    usage: '[command name]',
	execute(msg, client, args) {
        const data = [];
        const { commands } = msg.client;

        if (!args.length) {
            data.push(`**List of commands:**`);
            data.push(commands.map(command => command.name).join(', '));
            data.push(`Use **${PREFIX}help [command name]** to get info on a command`);

            return msg.author.send(data, { split: true })
                .then(() => {
                    if (msg.channel.type === 'dm') return;
                    msg.reply("Sent the commands to your DMs");
                })
                .catch(error => {
                    console.error(chalk.red((`(MUSIC): Could not send DM to ${msg.author.tag}, ` + error)));
                    msg.reply("Can't DM you the commands, make sure you don't have DMs disabled");
                })
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return msg.reply("That\'s not a valid command!");
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases)
            data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description)
            data.push(`**Description:** ${command.description}`);
        if (command.usage)
            data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

        msg.channel.send(data, { split: true });
    },
}