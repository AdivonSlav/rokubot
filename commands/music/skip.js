module.exports = {
    name: 'skip',
    aliases: ['s'],
	description: 'Skips the current track',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) 
            return msg.channel.send(`There is nothing playing currently so I can't stop`);

        if (client.player.skip(msg)) {
            msg.channel.send("Skipping song...");
            msg.react('⏭️');
        }
        else {
            msg.channel.send("Could not skip track");
        }
	},
}