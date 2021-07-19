const { getSongEmbed } = require("../utils/embeds.js");

module.exports = {
	name: 'trackStart',
	async execute(msg, track, client) {
		msg.channel.send(getSongEmbed(track))
	},
};