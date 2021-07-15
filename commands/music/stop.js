module.exports = {
    name: 'stop',
	description: 'Stops song',
    usage: "[]",
	execute(msg, client) {
        if (!msg.member.voice.channel)
            return msg.channel.send('You\'re not in a voice channel, sorry');
        if (!client.player.isPlaying(msg)) 
            return msg.channel.send(`There is nothing playing currently so I can't stop`);

        if (client.player.stop(msg)) {
            msg.channel.send("Stopped playing...");
        }
        else {
            msg.channel.send("There was an error trying to stop");
            return null;
        }
	},
}