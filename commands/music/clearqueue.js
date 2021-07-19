module.exports = {
    name: 'clearqueue',
    aliases: ['cq'],
	description: 'Clears the music queue',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) {
            return msg.channel.send("Nothing is currently playing!");
        }
        if (client.player.getQueue(msg).tracks.length == 1) {
            return msg.channel.send("There is no queue!");
        }

        client.player.clearQueue(msg);
        msg.react('❌');
        return msg.channel.send("Cleared the queue!");
	},
}