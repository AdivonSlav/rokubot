const { getTrackAddEmbed } = require("../utils/embeds.js");

module.exports = {
	name: 'trackAdd',
	execute(msg, queue, track) {
		console.log(chalk.green(`(MUSIC): ${msg.author.name} has added ${track.title} to the queue`));
		msg.channel.send(getTrackAddEmbed(track))
	},
};