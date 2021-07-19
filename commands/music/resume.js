module.exports = {
    name: 'resume',
    aliases: ['rs'],
	description: 'Resumes the track',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg))
            return msg.channel.send("There is nothing playing currently so I can't resume");

        if (client.player.resume(msg)) {
            msg.channel.send("Resuming...");
            msg.react('▶️');
        }
        else {
            msg.channel.send("There was a problem while resuming the track");
        }
	},
}