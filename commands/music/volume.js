const { getVolumeEmbed } = require("../../utils/embeds.js");

module.exports = {
    name: 'volume',
    aliases: ['vol'],
	description: 'Displays or sets the current volume',
    usage: "[]/[percentage]",
	execute(msg, client, args) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) {
            return msg.channel.send("Nothing is currently playing!");
        }

        var queue = client.player.getQueue(msg);

        if (args.length == 0) {
            return msg.channel.send(getVolumeEmbed(queue.volume));
        }
        if (args.length > 1) {
            return msg.channel.send("Only provide one argument (e.g. $volume 50)");
        }
        if (isNaN(args[0]) || isNaN(parseFloat(args[0]))) {
            return msg.channel.send("Only provide a number (e.g. $volume 50)");
        }

        var percentage = parseInt(args[0]);

        if (client.player.setVolume(msg, percentage)) {
            msg.channel.send(`Setting volume to ${percentage}%...`);
        }
    },
}