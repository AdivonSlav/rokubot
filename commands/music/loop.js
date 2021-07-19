module.exports = {
    name: 'loop',
    aliases: [''],
	description: 'Loops the current song or queue',
    usage: "[]",
	execute(msg, client) {
         if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) {
            return msg.channel.send("Nothing is currently playing!");
        }

        var queue = client.player.getQueue(msg);

        if (!queue.loopMode) {
            client.player.setLoopMode(msg, true);
            msg.react('🔄');
            return msg.channel.send("Looping turned on");
        }

        client.player.setLoopMode(msg, false);
        msg.react('🔄');
        return msg.channel.send("Looping turned off");
    },
}