module.exports = {
    name: 'play',
    aliases: ['p'],
	description: 'Plays a track',
    usage: "[URL/Name]",
	execute(msg, client, args) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');

        client.player.play(msg, args.join(" "), true);
	},
}

