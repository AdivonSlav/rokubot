module.exports = {
    name: 'pause',
    aliases: ['ps'],
	description: 'Pauses the track',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg))
            return msg.channel.send("There is nothing playing currently so I can't pause");

        if (client.player.pause(msg)) {
            msg.channel.send("Pausing...");
            msg.react('⏸️');
        }
        else {
            msg.channel.send("There was a problem while pausing the track");
        }
	},
}