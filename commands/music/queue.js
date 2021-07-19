const { getQueueEmbed } = require("../../utils/embeds");

module.exports = {
    name: 'queue',
    aliases: ['q'],
	description: 'Lists the current queue',
    usage: "[]",
	execute(msg, client) {
         if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) {
            return msg.channel.send("Nothing is currently playing!");
        }

        var queue = client.player.getQueue(msg);

        if (queue.tracks.length == 0) {
            return msg.channel.send("There is no queue!");
        }

        msg.react('🗺️');
        return msg.channel.send(getQueueEmbed(queue));
    },
}